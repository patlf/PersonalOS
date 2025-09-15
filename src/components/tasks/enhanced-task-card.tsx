'use client';

import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Clock, Check } from 'lucide-react';
import React, { memo, useMemo } from 'react';
import { cardStyles, badgeStyles, priorityStyles } from '@/lib/component-styles';
import { useEnhancedGhost } from '@/components/providers/enhanced-dnd-provider';

interface EnhancedTaskCardProps {
  task: Task;
  onClick?: () => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  className?: string;
  isDragging?: boolean;
  compact?: boolean;
  draggable?: boolean;
}

const EnhancedTaskCardComponent = memo(function EnhancedTaskCard({ 
  task, 
  onClick, 
  onToggleComplete,
  className, 
  isDragging = false, 
  compact = false, 
  draggable = true,
}: EnhancedTaskCardProps) {
  const priorityIndicators = useMemo(() => ({
    low: 'border-l-muted-foreground/30',
    medium: 'border-l-primary',
    high: 'border-l-destructive',
  }), []);

  const { didDragRef } = useEnhancedGhost();
  const isCompleted = task.status === 'completed';

  // Handle click with didDrag protection
  const handleClick = () => {
    if (didDragRef.current) return; // Ignore click after drag
    if (onClick) onClick();
  };

  // Handle completion toggle
  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (onToggleComplete) {
      onToggleComplete(task.id, !isCompleted);
    }
  };

  return (
    <div
      data-task-id={task.id}
      className={cn(
        cardStyles({ variant: 'task', padding: compact ? 'xs' : 'sm' }),
        'group relative transform-gpu will-change-transform',
        priorityIndicators[task.priority],
        
        // Base transitions - smooth and responsive
        'transition-all duration-300 ease-out',
        
        // Simple dragging state
        isDragging && 'opacity-50',
        
        // Completed task styling
        isCompleted && [
          'opacity-60',
          'bg-muted/50',
          'border-muted-foreground/30'
        ],
        
        // Whole card is draggable and clickable
        draggable && !isCompleted && [
          'cursor-grab active:cursor-grabbing',
          'hover:shadow-md hover:scale-[1.01]',
          'hover:-translate-y-0.5',
          'select-none' // Prevent text selection
        ],
        
        // Click states for non-draggable
        !draggable && onClick && [
          'cursor-pointer',
          'hover:shadow-md hover:scale-[1.01]',
          'hover:-translate-y-0.5'
        ],
        
        className
      )}
      onClick={handleClick}
    >
      
      <div className={cn(compact ? "space-y-1.5" : "space-y-3")}>
        {/* Task Title with Completion Toggle */}
        <div className="flex items-start gap-2">
          {/* Completion Checkbox */}
          <button
            onClick={handleToggleComplete}
            className={cn(
              "flex-shrink-0 mt-0.5 w-4 h-4 rounded-full border-2 transition-all duration-200 hover:scale-110",
              "flex items-center justify-center",
              isCompleted 
                ? "bg-green-500 border-green-500 text-white hover:bg-green-600" 
                : "border-muted-foreground/40 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950"
            )}
            title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            {isCompleted && <Check className="w-2.5 h-2.5" />}
          </button>
          
          <h3 className={cn(
            "font-medium text-card-foreground leading-tight line-clamp-2 flex-1 transition-colors duration-200",
            isCompleted && "text-muted-foreground",
            isDragging && "text-muted-foreground",
            compact ? "text-xs" : "text-sm"
          )}>
            {task.title}
          </h3>
        </div>
        
        {/* Task Description - hidden in compact mode */}
        {task.description && !compact && (
          <p className={cn(
            "text-xs text-muted-foreground line-clamp-2 leading-relaxed transition-opacity duration-200 ml-6",
            isCompleted && "opacity-50",
            isDragging && "opacity-60"
          )}>
            {task.description}
          </p>
        )}

        {/* Task Metadata */}
        <div className={cn(
          "flex items-center transition-opacity duration-200",
          compact ? "justify-center gap-1" : "justify-between ml-6",
          isDragging && "opacity-70",
          isCompleted && "opacity-50"
        )}>
          {compact ? (
            // Compact layout - just duration
            task.estimatedDuration > 0 && (
              <div className={cn(
                badgeStyles({ variant: 'outline', size: 'sm' }), 
                "gap-1 px-1.5 py-0.5"
              )}>
                <Clock className="h-2.5 w-2.5" />
                <span className="font-mono text-[10px]">{task.estimatedDuration}m</span>
              </div>
            )
          ) : (
            <>
              <div className="flex items-center gap-3">
                {/* Duration Chip */}
                {task.estimatedDuration > 0 && (
                  <div className={cn(
                    badgeStyles({ variant: 'outline', size: 'sm' }), 
                    "gap-1.5 transition-all duration-200"
                  )}>
                    <Clock className="h-3 w-3" />
                    <span>{task.estimatedDuration}m</span>
                  </div>
                )}
                
                {/* Tags */}
                {task.tags.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {task.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          badgeStyles({ variant: 'secondary', size: 'sm' }),
                          "transition-all duration-200"
                        )}
                      >
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 2 && (
                      <span className={cn(
                        badgeStyles({ variant: 'outline', size: 'sm' }),
                        "transition-all duration-200"
                      )}>
                        +{task.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Priority Badge */}
              <div className={cn(
                badgeStyles({ size: 'sm' }),
                'capitalize transition-all duration-200',
                priorityStyles[task.priority].badge
              )}>
                {task.priority}
              </div>
            </>
          )}
        </div>
      </div>
      


    </div>
  );
});

export { EnhancedTaskCardComponent as EnhancedTaskCard };