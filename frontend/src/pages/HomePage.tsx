import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { itemsApi } from '@/api/items';
import type { Item, CreateItemData } from '@/api/items';
import { authApi } from '@/api/auth';
import { Button } from '@ui/button';
import { ItemCard } from '@/components/ItemCard';
import { ItemDialog } from '@/components/ItemDialog';
import { DeleteDialog } from '@/components/DeleteDialog';
import { Alert, AlertDescription } from '@ui/alert';
import { Plus, LogOut } from 'lucide-react';

export default function HomePage() {
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [page, setPage] = useState(1);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | undefined>();
  const [itemToDelete, setItemToDelete] = useState<Item | undefined>();

  // Fetch items
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['items', page],
    queryFn: () => itemsApi.getItems(page, 10),
  });

  // Create item mutation
  const createMutation = useMutation({
    mutationFn: itemsApi.createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setItemDialogOpen(false);
    },
  });

  // Update item mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateItemData }) =>
      itemsApi.updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setItemDialogOpen(false);
      setSelectedItem(undefined);
    },
  });

  // Delete item mutation
  const deleteMutation = useMutation({
    mutationFn: itemsApi.deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setDeleteDialogOpen(false);
      setItemToDelete(undefined);
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: authApi.signOut,
    onSuccess: () => {
      logout();
    },
  });

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
        {/* Create Button */}
        <div className="mb-6">
          <Button onClick={handleCreateItem}>
            <Plus className="mr-2 h-4 w-4" />
            Create Item
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {page} of {data.pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.pagination.totalPages}
                >
                  Next
                </Button>
              </div>
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
