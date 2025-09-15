'use client';

import { format, startOfWeek, addDays, addHours, isSameDay, isToday, startOfDay } from 'date-fns';
import { CalendarEvent } from '@/lib/stores/calendar-store';
import { Task } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  date: Date;
  events: CalendarEvent[];
  tasks: Task[];
  onEventClick?: (event: CalendarEvent) => void;
  onTaskClick?: (task: Task) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function WeekView({
  date,
  events,
  tasks,
  onEventClick,
  onTaskClick,
  onTimeSlotClick,
}: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday start
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    const hourStart = addHours(startOfDay(day), hour);
    return (events || []).filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return isSameDay(eventStart, day) && eventStart <= hourStart && eventEnd > hourStart;
    });
  };

  const getTasksForDayAndHour = (day: Date, hour: number) => {
    return (tasks || []).filter(task => {
      if (!task.scheduledDate || !task.scheduledTime) return false;
      const taskDate = new Date(task.scheduledDate);
      const [taskHour] = task.scheduledTime.split(':').map(Number);
      return isSameDay(taskDate, day) && taskHour === hour;
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Week header */}
      <div className="grid grid-cols-8 border-b border-border">
        <div className="p-3 border-r border-border">
          <div className="text-sm font-medium text-muted-foreground">Time</div>
        </div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "p-3 text-center border-r border-border last:border-r-0",
              isToday(day) && "bg-blue-50 dark:bg-blue-950/20"
            )}
          >
            <div className="text-sm font-medium">
              {format(day, 'EEE')}
            </div>
            <div className={cn(
              "text-lg font-semibold mt-1",
              isToday(day) && "text-blue-600 dark:text-blue-400"
            )}>
              {format(day, 'd')}
            </div>
            {isToday(day) && (
              <Badge variant="secondary" className="mt-1 text-xs">
                Today
              </Badge>
            )}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-8 divide-y divide-border">
          {hours.map((hour) => (
            <div key={hour} className="contents">
              {/* Time label */}
              <div className="p-2 border-r border-border bg-muted/20 text-center">
                <div className="text-xs text-muted-foreground font-medium">
                  {format(addHours(startOfDay(new Date()), hour), 'h a')}
                </div>
              </div>

              {/* Day columns */}
              {weekDays.map((day) => {
                const dayEvents = getEventsForDayAndHour(day, hour);
                const dayTasks = getTasksForDayAndHour(day, hour);
                const hasItems = dayEvents.length > 0 || dayTasks.length > 0;

                return (
                  <div
                    key={`${day.toISOString()}-${hour}`}
                    className={cn(
                      "min-h-[50px] p-1 border-r border-border last:border-r-0 hover:bg-muted/30 cursor-pointer transition-colors",
                      hasItems && "bg-muted/10",
                      isToday(day) && "bg-blue-50/50 dark:bg-blue-950/10"
                    )}
                    onClick={() => onTimeSlotClick?.(day, hour)}
                  >
                    <div className="space-y-1">
                      {/* Events */}
                      {dayEvents.map((event) => (
                        <Card
                          key={event.id}
                          className="p-1.5 cursor-pointer hover:shadow-sm transition-shadow border-l-2 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <div className="text-xs font-medium truncate">
                            {event.title}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" />
                            <span>{format(new Date(event.startTime), 'h:mm a')}</span>
                          </div>
                        </Card>
                      ))}

                      {/* Tasks */}
                      {dayTasks.map((task) => (
                        <Card
                          key={task.id}
                          className="p-1.5 cursor-pointer hover:shadow-sm transition-shadow border-l-2 border-l-green-500 bg-green-50 dark:bg-green-950/20"
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
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}