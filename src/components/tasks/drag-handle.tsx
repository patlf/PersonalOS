'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface DragHandleProps {
  className?: string;
  compact?: boolean;
  isDragging?: boolean;
  isActive?: boolean;
}

export function DragHandle({ 
  className, 
  compact = false, 
  isDragging = false,
  isActive = false 
}: DragHandleProps) {
  return (
    <div className={cn(
      'absolute left-1 top-1/2 -translate-y-1/2 flex items-center justify-center',
      'opacity-0 group-hover:opacity-100 transition-all duration-300',
      'cursor-grab active:cursor-grabbing',
      isDragging && 'opacity-100 cursor-grabbing',
      isActive && 'opacity-100',
      className
    )}>
      <div className={cn(
        'flex items-center justify-center rounded-sm',
        'bg-muted-foreground/10 hover:bg-muted-foreground/20',
        'transition-all duration-200',
        compact ? 'w-4 h-6' : 'w-5 h-8',
        isDragging && 'bg-blue-500/20 text-blue-600'
      )}>
        <GripVertical className={cn(
          'transition-all duration-200',
          compact ? 'h-3 w-3' : 'h-4 w-4',
          'text-muted-foreground/60 group-hover:text-muted-foreground',
          isDragging && 'text-blue-600 animate-pulse'
        )} />
      </div>
      
      {/* Drag hint tooltip */}
      <div className={cn(
        'absolute left-full ml-2 px-2 py-1 rounded text-xs',
        'bg-popover text-popover-foreground shadow-md border',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
        'pointer-events-none whitespace-nowrap z-50',
        'animate-in fade-in-0 slide-in-from-left-2 duration-200',
        isDragging && 'hidden'
      )}>
        Drag to move
      </div>
    </div>
  );
}