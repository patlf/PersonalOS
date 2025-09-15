'use client';

import { DroppableArea } from './droppable-area';
import { TaskCard } from './task-card';
import { Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { formatDateForId } from '@/lib/date-utils';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo } from 'react';

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  tasks: Task[];
}

interface DraggableTimeSlotTaskProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
  onToggleComplete?: (taskId: string, completed: boolean) => void;
}

function DraggableTimeSlotTask({ task, onTaskClick, onToggleComplete }: DraggableTimeSlotTaskProps) {
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
    transition: isDragging ? 'none' : (transition || 'transform 200ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'touch-none transform-gpu will-change-transform task-card-hover',
        isDragging 
          ? 'opacity-30 z-50 animate-drag-lift' 
          : 'opacity-100 hover:shadow-sm'
      )}
      data-task-id={task.id}
      {...attributes}
      {...listeners}
    >
      <TaskCard
        task={task}
        onClick={() => onTaskClick?.(task)}
        onToggleComplete={onToggleComplete}
        compact={true}
        className="transform-gpu will-change-transform"
        draggable={true}
        isDragging={isDragging}
      />
    </div>
  );
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
  const formatTimeDisplay = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

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
          const todayDateString = getTodayDateString();
          const slotId = `timeslot-${todayDateString}-${slot.time.replace(':', '-')}`;
          
          // Create task IDs for SortableContext
          const taskIds = useMemo(() => slot.tasks.map(task => task.id), [slot.tasks]);

          return (
            <div 
              key={slot.time}
              className="border-b border-border/30 hover:bg-muted/30 transition-colors"
            >
              <div className="flex min-h-[50px]">
                {/* Time label */}
                <div className="w-20 flex-shrink-0 p-3 text-right border-r border-border/30">
                  <div className="text-xs text-muted-foreground font-medium">
                    {formatTimeDisplay(slot.hour)}
                  </div>
                </div>

                {/* Content area - Use DroppableArea directly around the content */}
                <DroppableArea
                  id={slotId}
                  className="flex-1 p-2 relative min-h-[46px] transition-all duration-200"
                  activeClassName="bg-blue-50/70 dark:bg-blue-950/70 ring-1 ring-blue-200 dark:ring-blue-800"
                >
                  <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                    <div className="space-y-1 task-container" data-container-id={slotId}>
                      {/* Render draggable tasks with smooth animations */}
                      {slot.tasks.map((task, index) => (
                        <div
                          key={task.id}
                          className="task-item animate-in fade-in-0 slide-in-from-top-1 duration-200"
                          style={{ animationDelay: `${index * 30}ms` }}
                        >
                          <DraggableTimeSlotTask
                            task={task}
                            onTaskClick={onTaskClick}
                            onToggleComplete={onToggleComplete}
                          />
                        </div>
                      ))}
                      
                      {/* Empty state indicator */}
                      {slot.tasks.length === 0 && (
                        <div className="flex items-center justify-center h-[46px] text-xs text-muted-foreground/60 transition-all duration-200 hover:text-muted-foreground/80">
                          <span className="px-2 py-1 rounded-md border border-dashed border-muted-foreground/20 hover:border-muted-foreground/40 transition-colors">
                            Drop task here
                          </span>
                        </div>
                      )}
                    </div>
                  </SortableContext>
                </DroppableArea>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}