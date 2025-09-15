'use client';

import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday 
} from 'date-fns';
import { CalendarEvent } from '@/lib/stores/calendar-store';
import { Task } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  date: Date;
  events: CalendarEvent[];
  tasks: Task[];
  onEventClick?: (event: CalendarEvent) => void;
  onTaskClick?: (task: Task) => void;
  onDateClick?: (date: Date) => void;
}

export function MonthView({
  date,
  events,
  tasks,
  onEventClick,
  onTaskClick,
  onDateClick,
}: MonthViewProps) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = [];
  let currentDay = calendarStart;
  
  while (currentDay <= calendarEnd) {
    days.push(currentDay);
    currentDay = addDays(currentDay, 1);
  }

  const getEventsForDay = (day: Date) => {
    return (events || []).filter(event => 
      isSameDay(new Date(event.startTime), day)
    );
  };

  const getTasksForDay = (day: Date) => {
    return (tasks || []).filter(task => 
      task.scheduledDate && isSameDay(new Date(task.scheduledDate), day)
    );
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="flex flex-col h-full">
      {/* Month header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          {format(date, 'MMMM yyyy')}
        </h2>
      </div>

      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {weekDays.map((day) => (
          <div key={day} className="p-3 text-center border-r border-border last:border-r-0">
            <div className="text-sm font-medium text-muted-foreground">
              {day}
            </div>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 divide-x divide-border">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day);
          const dayTasks = getTasksForDay(day);
          const isCurrentMonth = isSameMonth(day, date);
          const isCurrentDay = isToday(day);
          const hasItems = dayEvents.length > 0 || dayTasks.length > 0;

          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[120px] p-2 border-b border-border cursor-pointer hover:bg-muted/30 transition-colors",
                !isCurrentMonth && "bg-muted/20 text-muted-foreground",
                isCurrentDay && "bg-blue-50 dark:bg-blue-950/20",
                hasItems && "bg-muted/10"
              )}
              onClick={() => onDateClick?.(day)}
            >
              {/* Date number */}
              <div className="flex items-center justify-between mb-2">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrentDay && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                )}>
                  {format(day, 'd')}
                </span>
                {hasItems && (
                  <Badge variant="secondary" className="text-xs">
                    {dayEvents.length + dayTasks.length}
                  </Badge>
                )}
              </div>

              {/* Events and tasks */}
              <div className="space-y-1">
                {/* Events (max 2 visible) */}
                {dayEvents.slice(0, 2).map((event) => (
                  <Card
                    key={event.id}
                    className="p-1 cursor-pointer hover:shadow-sm transition-shadow border-l-2 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick?.(event);
                    }}
                  >
                    <div className="text-xs font-medium truncate">
                      {event.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.startTime), 'h:mm a')}
                    </div>
                  </Card>
                ))}

                {/* Tasks (max 2 visible) */}
                {dayTasks.slice(0, 2).map((task) => (
                  <Card
                    key={task.id}
                    className="p-1 cursor-pointer hover:shadow-sm transition-shadow border-l-2 border-l-green-500 bg-green-50 dark:bg-green-950/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskClick?.(task);
                    }}
                  >
                    <div className="text-xs font-medium truncate">
                      {task.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {task.estimatedDuration}m
                    </div>
                  </Card>
                ))}

                {/* Show more indicator */}
                {(dayEvents.length + dayTasks.length) > 4 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{(dayEvents.length + dayTasks.length) - 4} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}