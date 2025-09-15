import { Task } from '@/lib/types';
import { CalendarEvent } from '@/lib/stores/calendar-store';
import { useTaskStore } from '@/lib/stores/task-store';
import { useCalendarStore } from '@/lib/stores/calendar-store';

export interface TaskSchedulingOptions {
  date: Date;
  time?: string;
  duration?: number;
}

export interface EventToTaskOptions {
  estimatedDuration?: number;
  priority?: Task['priority'];
  tags?: string[];
}

/**
 * Service for integrating tasks with calendar functionality
 */
export class CalendarIntegrationService {
  /**
   * Schedule a task to a specific date and time
   */
  static scheduleTask(taskId: string, options: TaskSchedulingOptions): void {
    const { moveTask } = useTaskStore.getState();
    const { date, time } = options;
    
    moveTask(taskId, date, time);
  }

  /**
   * Convert a calendar event to a task
   */
  static convertEventToTask(event: CalendarEvent, options: EventToTaskOptions = {}): Task {
    const { addTask } = useTaskStore.getState();
    
    const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      userId: '', // Will be set by the store
      title: event.title,
      description: event.description ? `${event.description} (Converted from ${event.source} calendar event)` : `Converted from ${event.source} calendar event`,
      estimatedDuration: options.estimatedDuration || this.calculateDurationFromEvent(event),
      status: 'someday',
      scheduledDate: undefined,
      scheduledTime: undefined,
      tags: options.tags || [event.source, 'calendar-import'],
      priority: options.priority || 'medium',
    };

    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      userId: '', // Will be set properly in real implementation
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    addTask(newTask);
    return newTask;
  }

  /**
   * Convert a task to a calendar event
   */
  static convertTaskToEvent(task: Task): CalendarEvent {
    const { addEvent } = useCalendarStore.getState();
    
    if (!task.scheduledDate || !task.scheduledTime) {
      throw new Error('Task must be scheduled to convert to calendar event');
    }

    const [hours, minutes] = task.scheduledTime.split(':').map(Number);
    const startTime = new Date(task.scheduledDate);
    startTime.setHours(hours, minutes, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + task.estimatedDuration);

    const event: Omit<CalendarEvent, 'id'> = {
      title: task.title,
      description: task.description,
      startTime,
      endTime,
      source: 'internal',
      attendees: [],
      location: undefined,
    };

    addEvent(event);
    return { ...event, id: crypto.randomUUID() };
  }

  /**
   * Get tasks scheduled for a specific date
   */
  static getTasksForDate(date: Date): Task[] {
    const { getTasksByDate } = useTaskStore.getState();
    return getTasksByDate(date);
  }

  /**
   * Get events for a specific date
   */
  static getEventsForDate(date: Date): CalendarEvent[] {
    const { events } = useCalendarStore.getState();
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === date.toDateString();
    });
  }

  /**
   * Check for scheduling conflicts
   */
  static checkSchedulingConflicts(
    date: Date, 
    startTime: string, 
    duration: number
  ): { hasConflict: boolean; conflicts: (Task | CalendarEvent)[] } {
    const tasks = this.getTasksForDate(date);
    const events = this.getEventsForDate(date);
    
    const [hours, minutes] = startTime.split(':').map(Number);
    const proposedStart = new Date(date);
    proposedStart.setHours(hours, minutes, 0, 0);
    
    const proposedEnd = new Date(proposedStart);
    proposedEnd.setMinutes(proposedEnd.getMinutes() + duration);

    const conflicts: (Task | CalendarEvent)[] = [];

    // Check task conflicts
    tasks.forEach(task => {
      if (task.scheduledTime) {
        const [taskHours, taskMinutes] = task.scheduledTime.split(':').map(Number);
        const taskStart = new Date(date);
        taskStart.setHours(taskHours, taskMinutes, 0, 0);
        
        const taskEnd = new Date(taskStart);
        taskEnd.setMinutes(taskEnd.getMinutes() + task.estimatedDuration);

        if (this.timeRangesOverlap(proposedStart, proposedEnd, taskStart, taskEnd)) {
          conflicts.push(task);
        }
      }
    });

    // Check event conflicts
    events.forEach(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);

      if (this.timeRangesOverlap(proposedStart, proposedEnd, eventStart, eventEnd)) {
        conflicts.push(event);
      }
    });

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Find available time slots for a given date and duration
   */
  static findAvailableTimeSlots(
    date: Date, 
    duration: number, 
    workingHours: { start: number; end: number } = { start: 8, end: 18 }
  ): string[] {
    const availableSlots: string[] = [];
    const { start, end } = workingHours;

    for (let hour = start; hour < end; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const { hasConflict } = this.checkSchedulingConflicts(date, timeString, duration);
        
        if (!hasConflict) {
          // Check if the entire duration fits within working hours
          const slotEnd = new Date(date);
          slotEnd.setHours(hour, minute + duration, 0, 0);
          
          if (slotEnd.getHours() <= end) {
            availableSlots.push(timeString);
          }
        }
      }
    }

    return availableSlots;
  }

  /**
   * Calculate estimated duration from a calendar event
   */
  private static calculateDurationFromEvent(event: CalendarEvent): number {
    const start = new Date(event.startTime);
    const end = new Date(event.endTime);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60)); // Duration in minutes
  }

  /**
   * Check if two time ranges overlap
   */
  private static timeRangesOverlap(
    start1: Date, 
    end1: Date, 
    start2: Date, 
    end2: Date
  ): boolean {
    return start1 < end2 && end1 > start2;
  }

  /**
   * Get calendar statistics for a date range
   */
  static getCalendarStats(startDate: Date, endDate: Date) {
    const { tasks } = useTaskStore.getState();
    const { events } = useCalendarStore.getState();

    const tasksInRange = tasks.filter(task => {
      if (!task.scheduledDate) return false;
      const taskDate = new Date(task.scheduledDate);
      return taskDate >= startDate && taskDate <= endDate;
    });

    const eventsInRange = events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate >= startDate && eventDate <= endDate;
    });

    const totalScheduledMinutes = tasksInRange.reduce(
      (total, task) => total + task.estimatedDuration, 
      0
    );

    const totalEventMinutes = eventsInRange.reduce((total, event) => {
      const duration = new Date(event.endTime).getTime() - new Date(event.startTime).getTime();
      return total + Math.round(duration / (1000 * 60));
    }, 0);

    return {
      totalTasks: tasksInRange.length,
      totalEvents: eventsInRange.length,
      totalScheduledHours: Math.round(totalScheduledMinutes / 60 * 10) / 10,
      totalEventHours: Math.round(totalEventMinutes / 60 * 10) / 10,
      totalBusyHours: Math.round((totalScheduledMinutes + totalEventMinutes) / 60 * 10) / 10,
      tasksInRange,
      eventsInRange,
    };
  }
}