'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableAreaProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  disabled?: boolean;
}

export function DroppableArea({ 
  id, 
  children, 
  className, 
  activeClassName = 'ring-2 ring-blue-500/40 bg-blue-50/10 dark:bg-blue-950/10',
  disabled = false 
}: DroppableAreaProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      data-container-id={id}
      className={cn(
        'relative transition-all duration-200 ease-out',
        className
        // Removed the unwanted border effects when isOver
      )}
    >
      {children}
    </div>
  );
}