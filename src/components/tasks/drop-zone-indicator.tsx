'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, Target } from 'lucide-react';

interface DropZoneIndicatorProps {
  id: string;
  className?: string;
  children?: React.ReactNode;
  showIndicator?: boolean;
  label?: string;
  compact?: boolean;
}

export function DropZoneIndicator({
  id,
  className,
  children,
  showIndicator = true,
  label,
  compact = false,
}: DropZoneIndicatorProps) {
  // Remove the droppable functionality since DroppableArea handles it
  // const { isOver, setNodeRef } = useDroppable({
  //   id,
  //   data: {
  //     type: 'container',
  //     containerId: id,
  //   }
  // });

  return (
    <div
      data-container-id={id}
      className={cn(
        'relative transition-all duration-300 ease-out',
        // Minimum height based on compact mode
        compact ? 'min-h-[46px]' : 'min-h-[200px]',
        
        // For containers with content, ensure padding for ghost visibility
        'rounded-lg',
        compact ? 'pb-1' : 'pb-4', // Less padding for compact mode
        
        className
      )}
    >
      {children}
      
      {/* Empty state indicator */}
      {!children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={cn(
            'flex items-center gap-2 text-muted-foreground/60',
            compact ? 'text-xs' : 'text-sm'
          )}>
            <Plus className={cn(compact ? 'h-3 w-3' : 'h-4 w-4')} />
            <span>{label || 'Drop tasks here'}</span>
          </div>
        </div>
      )}
    </div>
  );
}