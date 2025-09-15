'use client';

import { Badge } from '@/components/ui/badge';
import { DroppableArea } from './droppable-area';
import { UnifiedTaskContainer } from './unified-task-container';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDateForId, isToday } from '@/lib/date-utils';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  tasks: Task[];
}

interface TimeBlockingSidebarProps {
  todayTasks: Task[];
  onTaskClick?: (task: Task) => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
  className?: string;
}

export function TimeBlockingSidebar({
  todayTasks,
  onTaskClick,
  onToggleComplete,
  className
}: TimeBlockingSidebarProps) {
  // Generate time slots for business hours (6 AM to 11 PM)
  const timeSlots: TimeSlot[] = [];
  for (let hour = 6; hour <= 23; hour++) {
    const timeString = `${hour.toString().padStart(2, '0')}:00`;

    // Find all tasks scheduled for this hour (any task with scheduledTime in this hour)
    const hourTasks = todayTasks.filter(task => {
      if (!task.scheduledTime) return false;
      const [taskHour] = task.scheduledTime.split(':').map(Number);
      return taskHour === hour;
    });

    timeSlots.push({
      time: timeString,
      hour,
      minute: 0,
      tasks: hourTasks,
    });
  }

  const formatTimeDisplay = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getTodayDateString = () => {
    return formatDateForId(new Date());
  };

  const today = new Date();

  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b border-border bg-card/50">
        <div className="flex items-center justify-between h-8">
          <h2 className="text-lg font-semibold text-foreground">Today&apos;s Schedule</h2>
          <div className="text-xs text-muted-foreground">
            {today.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Calendar Day View */}
      <div className="flex-1 overflow-auto bg-background">
        {timeSlots.map((slot) => {
          const slotId = `timeslot-${getTodayDateString()}-${slot.time.replace(':', '-')}`;
          const hasItems = slot.tasks.length > 0;

          return (
            <DroppableArea
              key={slot.time}
              id={slotId}
              className="border-b border-border/30 hover:bg-muted/30 transition-colors"
              activeClassName="bg-blue-50/50 dark:bg-blue-950/50"
            >
              <div className="flex min-h-[50px]">
                {/* Time label */}
                <div className="w-20 flex-shrink-0 p-3 text-right border-r border-border/30">
                  <div className="text-xs text-muted-foreground font-medium">
                    {formatTimeDisplay(slot.hour)}
                  </div>
                </div>

                {/* Content area */}
                <div className="flex-1 p-2 relative">
                  {/* Task blocks - Use UnifiedTaskContainer for drag functionality */}
                  {slot.tasks.length > 0 && (
                    <UnifiedTaskContainer
                      containerId={slotId}
                      tasks={slot.tasks}
                      onTaskClick={onTaskClick}
                      onToggleComplete={onToggleComplete}
                      enableSorting={false}
                      compact={true}
                      emptyMessage=""
                      className="space-y-1"
                    />
                  )}

                  {/* Empty state - invisible but maintains droppable area */}
                  {!hasItems && (
                    <div className="h-full min-h-[46px] w-full" />
                  )}
                </div>
              </div>
            </DroppableArea>
          );
        })}
      </div>
    </div>
  );
}