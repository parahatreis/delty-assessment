import type { Item } from '@/api/items';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Button } from '@ui/button';
import { Pencil, Trash2 } from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

const statusColors = {
  todo: 'default',
  in_progress: 'secondary',
  done: 'outline',
} as const;

const priorityColors = {
  low: 'default',
  medium: 'secondary',
  high: 'destructive',
} as const;

export function ItemCard({ item, onEdit, onDelete }: ItemCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{item.title}</CardTitle>
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onEdit(item)}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(item)}
            className="h-8 w-8 text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {item.description && (
          <p className="text-sm text-muted-foreground">{item.description}</p>
        )}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={statusColors[item.status]}>
            {statusLabels[item.status]}
          </Badge>
          <Badge variant={priorityColors[item.priority]}>
            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Created: {new Date(item.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
