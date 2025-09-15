'use client';

import React from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/lib/types';
import { TaskCard } from './task-card';
import { TaskGhost } from './task-ghost';
import { useGhostPosition } from '@/components/providers/dnd-provider';
import { cn } from '@/lib/utils';

interface SortableTaskItemProps {
  task: Task;
  onClick?: () => void;
  className?: string;
  compact?: boolean;
}

function SortableTaskItem({
  task,
  onClick,
  className,
  compact = false,
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
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none',
        isDragging && 'opacity-50 z-50'
      )}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        onClick={onClick}
        className={className}
        compact={compact}
        draggable={false} // Disable the task card's own dragging since we're using sortable
      />
    </div>
  );
}

interface SortableTaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  className?: string;
  compact?: boolean;
  containerId?: string;
}

export function SortableTaskList({
  tasks,
  onTaskClick,
  className,
  compact = false,
  containerId,
}: SortableTaskListProps) {
  const { ghostPosition, activeTaskId } = useGhostPosition();
  
  // Filter out the currently dragged task from display
  const visibleTasks = tasks.filter(task => task.id !== activeTaskId);
  const taskIds = visibleTasks.map(task => task.id);
  
  // Check if we should show ghost in this container
  const shouldShowGhost = ghostPosition && 
    containerId && 
    ghostPosition.containerId === containerId;
  
  // Get the active task for ghost display
  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;

  return (
    <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
      <div 
        className={cn('space-y-2', className)}
        data-container-id={containerId}
      >
        {visibleTasks.map((task, index) => {
          const items = [];
          
          // Add ghost element before this task if needed
          if (shouldShowGhost && ghostPosition.index === index && activeTask) {
            items.push(
              <div key="ghost" className="animate-in fade-in-0 duration-200">
                <TaskGhost
                  task={activeTask}
                  compact={compact}
                />
              </div>
            );
          }
          
          // Add the actual task
          items.push(
            <div
              key={task.id}
              className="animate-in slide-in-from-left-2 fade-in-0 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <SortableTaskItem
                task={task}
                onClick={() => onTaskClick?.(task)}
                className="text-xs"
                compact={compact}
              />
            </div>
          );
          
          return items;
        }).flat()}
        
        {/* Add ghost at the end if needed */}
        {shouldShowGhost && ghostPosition.index >= visibleTasks.length && activeTask && (
          <div key="ghost-end" className="animate-in fade-in-0 duration-200">
            <TaskGhost
              task={activeTask}
              compact={compact}
            />
          </div>
        )}
      </div>
    </SortableContext>
  );
}