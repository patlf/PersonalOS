'use client';

import { Card } from "@/components/ui/card";
import { Task } from '@/lib/types';
import { Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodayCalendarColumnProps {
  todayTasks: Task[];
  onTaskClick: (task: Task) => void;
  isLoading?: boolean;
  className?: string;
}

export function TodayCalendarColumn({ 
  todayTasks, 
  onTaskClick, 
  isLoading = false,
  className 
}: TodayCalendarColumnProps) {
  const today = new Date();
  const todayFormatted = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  // Group tasks by time
  const scheduledTasks = todayTasks.filter(task => task.scheduledTime);
  const unscheduledTasks = todayTasks.filter(task => !task.scheduledTime);

  // Sort scheduled tasks by time
  const sortedScheduledTasks = scheduledTasks.sort((a, b) => {
    if (!a.scheduledTime || !b.scheduledTime) return 0;
    return a.scheduledTime.localeCompare(b.scheduledTime);
  });

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    try {
      const time = new Date(`1970-01-01T${timeString}`);
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } catch {
      return timeString;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20';
      case 'low':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20';
      default:
        return 'border-l-border bg-muted/50';
    }
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold text-foreground">Today's Calendar</h2>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground mb-4">{todayFormatted}</p>
        {isLoading ? (
          <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
        ) : todayTasks.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No tasks scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Scheduled Tasks */}
            {sortedScheduledTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Scheduled
                </h3>
                <div className="space-y-2">
                  {sortedScheduledTasks.map((task) => (
                    <Card
                      key={task.id}
                      className={cn(
                        'p-3 cursor-pointer hover:shadow-sm transition-shadow border-l-4',
                        getPriorityColor(task.priority)
                      )}
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground flex-shrink-0">
                          {formatTime(task.scheduledTime || null)}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-muted-foreground">
                          {task.estimatedDuration}min
                        </div>
                        {task.tags.length > 0 && (
                          <div className="flex gap-1">
                            {task.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{task.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Unscheduled Tasks */}
            {unscheduledTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Unscheduled
                </h3>
                <div className="space-y-2">
                  {unscheduledTasks.map((task) => (
                    <Card
                      key={task.id}
                      className={cn(
                        'p-3 cursor-pointer hover:shadow-sm transition-shadow border-l-4',
                        getPriorityColor(task.priority)
                      )}
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-muted-foreground">
                          {task.estimatedDuration}min
                        </div>
                        {task.tags.length > 0 && (
                          <div className="flex gap-1">
                            {task.tags.slice(0, 2).map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground"
                              >
                                {tag}
                              </span>
                            ))}
                            {task.tags.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{task.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}