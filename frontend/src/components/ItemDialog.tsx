import { useState, useEffect, useRef } from 'react';
import type { Item, CreateItemData } from '@/api/items';
import { Button } from '@ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@ui/select';

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateItemData) => void;
  item?: Item;
  isLoading?: boolean;
}

function ItemDialogContent({ onSubmit, item, isLoading, onOpenChange }: Omit<ItemDialogProps, 'open'>) {
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [status, setStatus] = useState<'todo' | 'in_progress' | 'done'>(item?.status || 'todo');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>(item?.priority || 'medium');
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input when mounted
  useEffect(() => {
    setTimeout(() => {
      titleInputRef.current?.focus();
    }, 0);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description: description || undefined,
      status,
      priority,
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{item ? 'Edit Item' : 'Create New Item'}</DialogTitle>
        <DialogDescription>
          {item ? 'Update the details of your item.' : 'Add a new item to your list.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading}>
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              ref={titleInputRef}
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Enter item title"
              aria-required="true"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter item description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(val: 'todo' | 'in_progress' | 'done') => setStatus(val)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(val: 'low' | 'medium' | 'high') => setPriority(val)}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : item ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
    </>
  );
}

export function ItemDialog({ open, onOpenChange, onSubmit, item, isLoading }: ItemDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <ItemDialogContent 
          key={item?.id ?? 'new'} 
          onSubmit={onSubmit} 
          item={item} 
          isLoading={isLoading}
          onOpenChange={onOpenChange}
        />
      </DialogContent>
    </Dialog>
  );
}
