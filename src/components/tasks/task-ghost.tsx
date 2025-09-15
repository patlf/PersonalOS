'use client';

import React from 'react';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { cardStyles, badgeStyles, priorityStyles } from '@/lib/component-styles';
import { Clock } from 'lucide-react';

interface TaskGhostProps {
  task: Task;
  compact?: boolean;
  className?: string;
}

export function TaskGhost({ 
  task, 
  compact = false, 
  className
}: TaskGhostProps) {
  const priorityIndicators = {
    low: 'border-l-muted-foreground/30',
    medium: 'border-l-primary',
    high: 'border-l-destructive',
  };

  return (
    <div
      className={cn(
        cardStyles({ variant: 'default', padding: compact ? 'sm' : 'default' }),
        'relative border-l-4',
        priorityIndicators[task.priority],
        
        // Simple ghost styling - just reduced opacity, no colors
        'opacity-50',
        'pointer-events-none',
        
        className
      )}
    >
      <div className={cn(compact ? "space-y-1.5" : "space-y-3")}>
        {/* Task Title */}
        <div className="flex items-start justify-between gap-2">
          <h3 className={cn(
            "font-medium text-card-foreground leading-tight line-clamp-2 flex-1",
            compact ? "text-xs" : "text-sm"
          )}>
            {task.title}
          </h3>
        </div>
        
        {/* Task Description - hidden in compact mode */}
        {task.description && !compact && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Task Metadata */}
        <div className={cn(
          "flex items-center",
          compact ? "justify-center gap-1" : "justify-between"
        )}>
          {compact ? (
            // Compact layout - just duration
            task.estimatedDuration > 0 && (
              <div className={cn(badgeStyles({ variant: 'outline', size: 'sm' }), "gap-1 px-1.5 py-0.5")}>
                <Clock className="h-2.5 w-2.5" />
                <span>{task.estimatedDuration}m</span>
              </div>
            )
          ) : (
            <>
              <div className="flex items-center gap-3">
                {/* Duration Chip */}
                {task.estimatedDuration > 0 && (
                  <div className={cn(badgeStyles({ variant: 'outline', size: 'sm' }), "gap-1.5")}>
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
                        className={badgeStyles({ variant: 'secondary', size: 'sm' })}
                      >
                        {tag}
                      </span>
                    ))}
                    {task.tags.length > 2 && (
                      <span className={badgeStyles({ variant: 'outline', size: 'sm' })}>
                        +{task.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Priority Badge */}
              <div className={cn(
                badgeStyles({ size: 'sm' }),
                'capitalize',
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
}