'use client';

import React, { useMemo } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { TaskCard } from './task-card';
import { TaskGhost } from './task-ghost';
import { DropZoneIndicator } from './drop-zone-indicator';
import { useEnhancedGhost } from '@/components/providers/enhanced-dnd-provider';
import { useTaskStore } from '@/lib/stores/task-store';
import { cn } from '@/lib/utils';

interface SortableTaskItemProps {
  task: Task;
  onClick?: () => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  className?: string;
  compact?: boolean;
  isOverdue?: boolean;
}

function SortableTaskItem({
  task,
  onClick,
  onToggleComplete,
  className,
  compact = false,
  isOverdue = false,
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id,
    data: {
      type: 'task',
      task,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none transform-gpu will-change-transform',
        isDragging && 'opacity-50 z-50'
      )}
      suppressHydrationWarning
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        onClick={onClick}
        onToggleComplete={onToggleComplete}
        className={className}
        compact={compact}
        draggable={true}
        isDragging={isDragging}
        isOverdue={isOverdue}
      />
    </div>
  );
}

interface UnifiedTaskContainerProps {
  tasks: Task[];
  containerId?: string;
  id?: string; // Alternative prop name used in some places
  onTaskClick?: (task: Task) => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  className?: string;
  compact?: boolean;
  title?: string;
  emptyMessage?: string;
  enableSorting?: boolean;
  isOverdueContainer?: boolean;
}

export function UnifiedTaskContainer({
  tasks,
  containerId,
  id,
  onTaskClick,
  onToggleComplete,
  className,
  compact = false,
  title,
  emptyMessage = "No tasks found",
  enableSorting = true,
  isOverdueContainer = false,
}: UnifiedTaskContainerProps) {
  // Use containerId or id, whichever is provided
  const actualContainerId = containerId || id || 'default-container';
  const { ghostPosition, activeTaskId } = useEnhancedGhost();
  const { tasks: allTasks } = useTaskStore();
  
  // Use the tasks passed directly to this container
  const containerTasks = tasks;
  
  // Filter out the currently dragged task
  const visibleTasks = useMemo(() => 
    containerTasks.filter(task => task.id !== activeTaskId),
    [containerTasks, activeTaskId]
  );
  
  // Check if we should show ghost in this container
  const shouldShowGhost = ghostPosition && ghostPosition.containerId === actualContainerId;
  
  // Ghost rendering logic
  

  

  
  // Get the active task for ghost display from global task list
  const activeTask = useMemo(() => 
    activeTaskId ? allTasks.find(t => t.id === activeTaskId) : null,
    [activeTaskId, allTasks]
  );



  // Memoized task IDs for SortableContext
  const taskIds = useMemo(() => 
    visibleTasks.map(task => task.id),
    [visibleTasks]
  );



  const content = (
    <div 
      className={cn('space-y-2 task-container', className)}
      data-container-id={actualContainerId}
    >
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground mb-3">
          {title} ({containerTasks.length})
        </h3>
      )}
      
      <DropZoneIndicator
        id={actualContainerId}
        compact={compact}
        showIndicator={visibleTasks.length === 0}
        label={visibleTasks.length === 0 ? emptyMessage : undefined}
      >
        <div className={cn("space-y-2", compact ? "min-h-[46px]" : "min-h-[100px]")}>
          {/* Show ghost for empty containers */}
          {shouldShowGhost && ghostPosition && visibleTasks.length === 0 && activeTask && (
            <div 
              key="ghost-empty"
              className="animate-in fade-in-0 slide-in-from-top-1 duration-200 ease-out"
            >
              <TaskGhost
                task={activeTask}
                compact={compact}
              />
            </div>
          )}
          
          {/* Render tasks with ghost positioning */}
          {visibleTasks.map((task, index) => {
            const items = [];
            
            // Add ghost element before this task if needed
            if (shouldShowGhost && ghostPosition && ghostPosition.index === index && activeTask) {
              items.push(
                <div 
                  key={`ghost-${index}`}
                  className="animate-in fade-in-0 slide-in-from-top-1 duration-200 ease-out mb-2"
                >
                  <TaskGhost
                    task={activeTask}
                    compact={compact}
                  />
                </div>
              );
            }
            
            // Add the actual task - always use SortableTaskItem for drag functionality
            items.push(
              <SortableTaskItem
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
                onToggleComplete={onToggleComplete}
                compact={compact}
                className="transform-gpu will-change-transform"
                isOverdue={isOverdueContainer}
              />
            );
            
            return items;
          }).flat()}
          
          {/* Add ghost at the end if needed */}
          {shouldShowGhost && ghostPosition && ghostPosition.index >= visibleTasks.length && visibleTasks.length > 0 && activeTask && (
            <div 
              key="ghost-end"
              className="animate-in fade-in-0 slide-in-from-top-1 duration-200 ease-out mt-2"
            >
              <TaskGhost
                task={activeTask}
                compact={compact}
              />
            </div>
          )}
        </div>
      </DropZoneIndicator>
    </div>
  );

  // Always wrap with SortableContext for drag functionality
  // The enableSorting prop controls reordering behavior in the drag handlers, not here
  return (
    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
      <div suppressHydrationWarning>
        {content}
      </div>
    </SortableContext>
  );
}