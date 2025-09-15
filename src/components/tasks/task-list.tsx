'use client';

import { Task } from '@/lib/types';
import { TaskCard } from './task-card';
import { TaskGhost } from './task-ghost';
import { useGhostPosition } from '@/components/providers/dnd-provider';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  title?: string;
  emptyMessage?: string;
  onTaskClick?: (task: Task) => void;
  className?: string;
  containerId?: string;
  compact?: boolean;
}

export function TaskList({ 
  tasks, 
  title, 
  emptyMessage = "No tasks found",
  onTaskClick,
  className,
  containerId,
  compact = false
}: TaskListProps) {
  const { ghostPosition, activeTaskId } = useGhostPosition();
  
  // Filter out the currently dragged task from display
  const visibleTasks = tasks.filter(task => task.id !== activeTaskId);
  
  // Check if we should show ghost in this container
  const shouldShowGhost = ghostPosition && 
    containerId && 
    ghostPosition.containerId === containerId;
  
  // Get the active task for ghost display
  const activeTask = activeTaskId ? tasks.find(t => t.id === activeTaskId) : null;
  return (
    <div className={cn('space-y-3', className)}>
      {title && (
        <h3 className="text-sm font-medium text-muted-foreground">
          {title} ({tasks.length})
        </h3>
      )}
      
      {visibleTasks.length === 0 && !shouldShowGhost ? (
        <div className="rounded-lg border-2 border-dashed border-muted p-6 text-center">
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      ) : (
        <div 
          className="space-y-2"
          data-container-id={containerId}
        >
          {visibleTasks.map((task, index) => {
            const items = [];
            
            // Add ghost element before this task if needed
            if (shouldShowGhost && ghostPosition.index === index && activeTask) {
              items.push(
                <TaskGhost
                  key="ghost"
                  task={activeTask}
                  compact={compact}
                />
              );
            }
            
            // Add the actual task
            items.push(
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
                compact={compact}
              />
            );
            
            return items;
          }).flat()}
          
          {/* Add ghost at the end if needed */}
          {shouldShowGhost && ghostPosition.index >= visibleTasks.length && activeTask && (
            <TaskGhost
              key="ghost-end"
              task={activeTask}
              compact={compact}
            />
          )}
        </div>
      )}
    </div>
  );
}