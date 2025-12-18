import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { itemsApi } from '@/api/items';
import type { Item, CreateItemData, ItemsQueryParams } from '@/api/items';
import { authApi } from '@/api/auth';
import { Button } from '@ui/button';
import { ItemCard } from '@/components/ItemCard';
import { ItemDialog } from '@/components/ItemDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import { Alert, AlertDescription } from '@ui/alert';
import { Input } from '@ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Plus, LogOut, Search } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';

export default function HomePage() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>();
  const [itemToDelete, setItemToDelete] = useState<Item | undefined>();
  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');

  // Parse query params
  const queryParams = useMemo<ItemsQueryParams>(() => {
    const statusParam = searchParams.get('status');
    const priorityParam = searchParams.get('priority');
    const sortByParam = searchParams.get('sortBy');
    const sortDirParam = searchParams.get('sortDir');

    return {
      page: Number(searchParams.get('page')) || 1,
      pageSize: 10,
      q: searchParams.get('q') || undefined,
      status: statusParam && ['todo', 'in_progress', 'done'].includes(statusParam) 
        ? (statusParam as 'todo' | 'in_progress' | 'done') 
        : undefined,
      priority: priorityParam && ['low', 'medium', 'high'].includes(priorityParam)
        ? (priorityParam as 'low' | 'medium' | 'high')
        : undefined,
      sortBy: sortByParam && ['createdAt', 'title', 'priority'].includes(sortByParam)
        ? (sortByParam as 'createdAt' | 'title' | 'priority')
        : 'createdAt',
      sortDir: sortDirParam && ['asc', 'desc'].includes(sortDirParam)
        ? (sortDirParam as 'asc' | 'desc')
        : 'desc',
    };
  }, [searchParams]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const newParams = new URLSearchParams(searchParams);
      if (searchInput) {
        newParams.set('q', searchInput);
      } else {
        newParams.delete('q');
      }
      newParams.set('page', '1');
      setSearchParams(newParams);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchParams, setSearchParams]);

  // Fetch items
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['items', queryParams],
    queryFn: () => itemsApi.getItems(queryParams),
  });

  // Create item mutation with optimistic update
  const createMutation = useMutation({
    mutationFn: itemsApi.createItem,
    onMutate: async (newItemData) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previousItems = queryClient.getQueryData(['items', queryParams]);

      // Optimistically add new item
      queryClient.setQueryData(['items', queryParams], (old: { items: Item[]; pagination: { total: number; page: number; pageSize: number; totalPages: number } } | undefined) => {
        if (!old) return old;
        const tempItem: Item = {
          id: Date.now(), // temporary ID
          userId: user!.id,
          title: newItemData.title,
          description: newItemData.description || null,
          status: newItemData.status || 'todo',
          priority: newItemData.priority || 'medium',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return {
          ...old,
          items: [tempItem, ...old.items],
          pagination: {
            ...old.pagination,
            total: old.pagination.total + 1,
          },
        };
      });

      return { previousItems };
    },
    onError: (_err, _newItem, context) => {
      queryClient.setQueryData(['items', queryParams], context?.previousItems);
      toast.error('Failed to create item');
    },
    onSuccess: () => {
      toast.success('Item created');
      setItemDialogOpen(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  // Update item mutation with optimistic update
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateItemData }) =>
      itemsApi.updateItem(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previousItems = queryClient.getQueryData(['items', queryParams]);

      // Optimistically update item
      queryClient.setQueryData(['items', queryParams], (old: { items: Item[]; pagination: { total: number; page: number; pageSize: number; totalPages: number } } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: Item) =>
            item.id === id
              ? { ...item, ...data, updatedAt: new Date().toISOString() }
              : item
          ),
        };
      });

      return { previousItems };
    },
    onError: (_err, _variables, context) => {
      queryClient.setQueryData(['items', queryParams], context?.previousItems);
      toast.error('Failed to update item');
    },
    onSuccess: () => {
      toast.success('Item updated');
      setItemDialogOpen(false);
      setSelectedItem(undefined);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  // Delete item mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: itemsApi.deleteItem,
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: ['items'] });
      const previousItems = queryClient.getQueryData(['items', queryParams]);

      // Optimistically remove item
      queryClient.setQueryData(['items', queryParams], (old: { items: Item[]; pagination: { total: number; page: number; pageSize: number; totalPages: number } } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item: Item) => item.id !== itemId),
          pagination: {
            ...old.pagination,
            total: old.pagination.total - 1,
          },
        };
      });

      return { previousItems };
    },
    onError: (_err, _itemId, context) => {
      queryClient.setQueryData(['items', queryParams], context?.previousItems);
      toast.error('Failed to delete item');
    },
    onSuccess: () => {
      toast.success('Item deleted');
      setDeleteDialogOpen(false);
      setItemToDelete(undefined);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      logout();
    },
  });

  const updateQueryParam = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleCreateItem = () => {
    setSelectedItem(undefined);
    setItemDialogOpen(true);
  };

  const handleEditItem = (item: Item) => {
    setSelectedItem(item);
    setItemDialogOpen(true);
  };

  const handleDeleteItem = (item: Item) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleSubmitItem = (data: CreateItemData) => {
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteMutation.mutate(itemToDelete.id);
    }
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">My Items</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </p>
          </div>
          <Button variant="outline" onClick={() => signOutMutation.mutate()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
                aria-label="Search items"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={queryParams.status || 'all'}
              onValueChange={(value) =>
                updateQueryParam('status', value === 'all' ? null : value)
              }
            >
              <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by status">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={queryParams.priority || 'all'}
              onValueChange={(value) =>
                updateQueryParam('priority', value === 'all' ? null : value)
              }
            >
              <SelectTrigger className="w-full md:w-[180px]" aria-label="Filter by priority">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${queryParams.sortBy}-${queryParams.sortDir}`}
              onValueChange={(value) => {
                const [sortBy, sortDir] = value.split('-');
                const newParams = new URLSearchParams(searchParams);
                newParams.set('sortBy', sortBy);
                newParams.set('sortDir', sortDir);
                newParams.set('page', '1');
                setSearchParams(newParams);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px]" aria-label="Sort items">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Newest</SelectItem>
                <SelectItem value="createdAt-asc">Oldest</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
                <SelectItem value="priority-desc">Priority High-Low</SelectItem>
                <SelectItem value="priority-asc">Priority Low-High</SelectItem>
              </SelectContent>
            </Select>

            {/* Create Button */}
            <Button onClick={handleCreateItem} className="whitespace-nowrap">
              <Plus className="mr-2 h-4 w-4" />
              Create Item
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12" role="status" aria-live="polite">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto" aria-hidden="true"></div>
            <p className="mt-4 text-muted-foreground">Loading items...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription className="flex items-center justify-between">
              <span>Failed to load items. Please try again.</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && data?.items.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border">
            <p className="text-lg font-semibold mb-2">No items yet</p>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first item
            </p>
            <Button onClick={handleCreateItem}>
              <Plus className="mr-2 h-4 w-4" />
              Create Item
            </Button>
          </div>
        )}

        {/* Items Grid */}
        {!isLoading && !error && data && data.items.length > 0 && (
          <>
            <div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              aria-busy={isLoading}
              role="region"
              aria-label="Items list"
            >
              {data.items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination.totalPages > 1 && (
              <nav 
                className="flex items-center justify-center gap-2"
                role="navigation"
                aria-label="Pagination"
              >
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(Math.max(1, queryParams.page! - 1))}
                  disabled={queryParams.page === 1}
                  aria-label="Go to previous page"
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground" aria-current="page">
                  Page {queryParams.page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(queryParams.page! + 1)}
                  disabled={queryParams.page! >= data.pagination.totalPages}
                  aria-label="Go to next page"
                >
                  Next
                </Button>
              </nav>
            )}
          </>
        )}
      </main>

      {/* Dialogs */}
      <ItemDialog
        open={itemDialogOpen}
        onOpenChange={setItemDialogOpen}
        onSubmit={handleSubmitItem}
        item={selectedItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        itemTitle={itemToDelete?.title}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
