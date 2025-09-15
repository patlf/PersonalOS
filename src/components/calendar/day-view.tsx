'use client';

import { format, startOfDay, addHours, isSameHour, isToday } from 'date-fns';
import { CalendarEvent } from '@/lib/stores/calendar-store';
import { Task } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DayViewProps {
  date: Date;
  events: CalendarEvent[];
  tasks: Task[];
  onEventClick?: (event: CalendarEvent) => void;
  onTaskClick?: (task: Task) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export function DayView({
  date,
  events,
  tasks,
  onEventClick,
  onTaskClick,
  onTimeSlotClick,
}: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayStart = startOfDay(date);

  const getEventsForHour = (hour: number) => {
    const hourStart = addHours(dayStart, hour);
    return (events || []).filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return eventStart <= hourStart && eventEnd > hourStart;
    });
  };

  const getTasksForHour = (hour: number) => {
    return (tasks || []).filter(task => {
      if (!task.scheduledDate || !task.scheduledTime) return false;
      const taskDate = new Date(task.scheduledDate);
      const [taskHour] = task.scheduledTime.split(':').map(Number);
      return isSameHour(taskDate, date) && taskHour === hour;
    });
  };

  const formatEventTime = (event: CalendarEvent) => {
    const start = format(new Date(event.startTime), 'h:mm a');
    const end = format(new Date(event.endTime), 'h:mm a');
    return `${start} - ${end}`;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold">
          {format(date, 'EEEE, MMMM d, yyyy')}
        </h2>
        {isToday(date) && (
          <Badge variant="secondary" className="mt-1">
            Today
          </Badge>
        )}
      </div>

      {/* Time slots */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-1 divide-y divide-border">
          {hours.map((hour) => {
            const hourEvents = getEventsForHour(hour);
            const hourTasks = getTasksForHour(hour);
            const hasItems = hourEvents.length > 0 || hourTasks.length > 0;

            return (
              <div
                key={hour}
                className={cn(
                  "min-h-[60px] p-3 hover:bg-muted/50 cursor-pointer transition-colors",
                  hasItems && "bg-muted/20"
                )}
                onClick={() => onTimeSlotClick?.(date, hour)}
              >
                <div className="flex gap-4">
                  {/* Time label */}
                  <div className="w-16 text-sm text-muted-foreground font-medium">
                    {format(addHours(dayStart, hour), 'h a')}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    {/* Events */}
                    {hourEvents.map((event) => (
                      <Card
                        key={event.id}
                        className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick?.(event);
                        }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <Badge variant="outline" className="text-xs">
                              {event.source}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatEventTime(event)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span>{event.attendees.length} attendees</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}

                    {/* Tasks */}
                    {hourTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="p-3 cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-green-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTaskClick?.(task);
                        }}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{task.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {task.estimatedDuration}m
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}
                          {task.tags.length > 0 && (
                            <div className="flex gap-1 flex-wrap">
                              {task.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {task.tags.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{task.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}

                    {/* Empty state */}
                    {!hasItems && (
                      <div className="text-xs text-muted-foreground italic">
                        Click to add event or task
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}