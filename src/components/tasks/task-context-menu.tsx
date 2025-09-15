'use client';

import { Task } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit, Copy, Trash2, Archive } from 'lucide-react';

interface TaskContextMenuProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDuplicate: (task: Task) => void;
  onDelete: (task: Task) => void;
  onSendToSomeday: (task: Task) => void;
  children?: React.ReactNode;
}

export function TaskContextMenu({
  task,
  onEdit,
  onDuplicate,
  onDelete,
  onSendToSomeday,
  children,
}: TaskContextMenuProps) {
  const handleEdit = (e: Event) => {
    e.preventDefault();
    onEdit(task);
  };

  const handleDuplicate = (e: Event) => {
    e.preventDefault();
    onDuplicate(task);
  };

  const handleDelete = (e: Event) => {
    e.preventDefault();
    onDelete(task);
  };

  const handleSendToSomeday = (e: Event) => {
    e.preventDefault();
    onSendToSomeday(task);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children || (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3 w-3" />
            <span className="sr-only">Open task menu</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onSelect={handleEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Task
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleSendToSomeday}>
          <Archive className="mr-2 h-4 w-4" />
          Send to Someday
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onSelect={handleDelete}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}