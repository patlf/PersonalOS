import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CalendarIntegrationService } from '../calendar-integration';
import { useTaskStore } from '@/lib/stores/task-store';
import { useCalendarStore } from '@/lib/stores/calendar-store';
import { Task } from '@/lib/types';
import { CalendarEvent } from '@/lib/stores/calendar-store';

// Mock the stores
vi.mock('@/lib/stores/task-store');
vi.mock('@/lib/stores/calendar-store');

const mockTask: Task = {
  id: '1',
  userId: 'user1',
  title: 'Test Task',
  description: 'Test description',
  estimatedDuration: 60,
  status: 'scheduled',
  scheduledDate: new Date(2024, 0, 15),
  scheduledTime: '09:00',
  tags: ['test'],
  priority: 'medium',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEvent: CalendarEvent = {
  id: '1',
  title: 'Test Event',
  description: 'Test event description',
  startTime: new Date(2024, 0, 15, 10, 0),
  endTime: new Date(2024, 0, 15, 11, 0),
  source: 'google',
  attendees: ['test@example.com'],
  location: 'Conference Room',
};

describe('CalendarIntegrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scheduleTask', () => {
    it('should call moveTask with correct parameters', () => {
      const mockMoveTask = vi.fn();
      (useTaskStore.getState as any).mockReturnValue({
        moveTask: mockMoveTask,
      });

      const date = new Date(2024, 0, 15);
      const time = '09:00';

      CalendarIntegrationService.scheduleTask('task-1', { date, time });

      expect(mockMoveTask).toHaveBeenCalledWith('task-1', date, time);
    });
  });

  describe('convertEventToTask', () => {
    it('should convert calendar event to task', () => {
      const mockAddTask = vi.fn();
      (useTaskStore.getState as any).mockReturnValue({
        addTask: mockAddTask,
      });

      const result = CalendarIntegrationService.convertEventToTask(mockEvent);

      expect(mockAddTask).toHaveBeenCalled();
      expect(result.title).toBe(mockEvent.title);
      expect(result.description).toContain('Converted from google calendar event');
      expect(result.estimatedDuration).toBe(60); // 1 hour event
      expect(result.tags).toContain('google');
      expect(result.tags).toContain('calendar-import');
    });

    it('should use custom options when provided', () => {
      const mockAddTask = vi.fn();
      (useTaskStore.getState as any).mockReturnValue({
        addTask: mockAddTask,
      });

      const options = {
        estimatedDuration: 90,
        priority: 'high' as const,
        tags: ['custom-tag'],
      };

      const result = CalendarIntegrationService.convertEventToTask(mockEvent, options);

      expect(result.estimatedDuration).toBe(90);
      expect(result.priority).toBe('high');
      expect(result.tags).toEqual(['custom-tag']);
    });
  });

  describe('convertTaskToEvent', () => {
    it('should convert scheduled task to calendar event', () => {
      const mockAddEvent = vi.fn();
      (useCalendarStore.getState as any).mockReturnValue({
        addEvent: mockAddEvent,
      });

      const result = CalendarIntegrationService.convertTaskToEvent(mockTask);

      expect(mockAddEvent).toHaveBeenCalled();
      expect(result.title).toBe(mockTask.title);
      expect(result.description).toBe(mockTask.description);
      expect(result.source).toBe('internal');
    });

    it('should throw error for unscheduled task', () => {
      const unscheduledTask = { ...mockTask, scheduledDate: undefined };

      expect(() => {
        CalendarIntegrationService.convertTaskToEvent(unscheduledTask);
      }).toThrow('Task must be scheduled to convert to calendar event');
    });
  });

  describe('checkSchedulingConflicts', () => {
    beforeEach(() => {
      (useTaskStore.getState as any).mockReturnValue({
        getTasksByDate: () => [mockTask],
      });
      (useCalendarStore.getState as any).mockReturnValue({
        events: [mockEvent],
      });
    });

    it('should detect task conflicts', () => {
      const date = new Date(2024, 0, 15);
      const result = CalendarIntegrationService.checkSchedulingConflicts(
        date,
        '09:30', // Overlaps with task at 09:00
        30
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toEqual(mockTask);
    });

    it('should detect event conflicts', () => {
      const date = new Date(2024, 0, 15);
      const result = CalendarIntegrationService.checkSchedulingConflicts(
        date,
        '10:30', // Overlaps with event at 10:00-11:00
        30
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toEqual(mockEvent);
    });

    it('should return no conflicts for available time', () => {
      const date = new Date(2024, 0, 15);
      const result = CalendarIntegrationService.checkSchedulingConflicts(
        date,
        '12:00', // No conflicts at noon
        60
      );

      expect(result.hasConflict).toBe(false);
      expect(result.conflicts).toHaveLength(0);
    });
  });

  describe('findAvailableTimeSlots', () => {
    beforeEach(() => {
      (useTaskStore.getState as any).mockReturnValue({
        getTasksByDate: () => [mockTask], // Task at 09:00
      });
      (useCalendarStore.getState as any).mockReturnValue({
        events: [mockEvent], // Event at 10:00-11:00
      });
    });

    it('should return available time slots', () => {
      const date = new Date(2024, 0, 15);
      const availableSlots = CalendarIntegrationService.findAvailableTimeSlots(
        date,
        30, // 30 minute duration
        { start: 8, end: 12 } // 8 AM to 12 PM
      );

      expect(availableSlots).toBeInstanceOf(Array);
      expect(availableSlots.length).toBeGreaterThan(0);
      
      // Should not include conflicting times
      expect(availableSlots).not.toContain('09:00');
      expect(availableSlots).not.toContain('10:00');
      expect(availableSlots).not.toContain('10:30');
      
      // Should include available times
      expect(availableSlots).toContain('08:00');
      expect(availableSlots).toContain('11:30');
    });
  });

  describe('getCalendarStats', () => {
    beforeEach(() => {
      (useTaskStore.getState as any).mockReturnValue({
        tasks: [mockTask],
      });
      (useCalendarStore.getState as any).mockReturnValue({
        events: [mockEvent],
      });
    });

    it('should calculate calendar statistics', () => {
      const startDate = new Date(2024, 0, 1);
      const endDate = new Date(2024, 0, 31);
      
      const stats = CalendarIntegrationService.getCalendarStats(startDate, endDate);

      expect(stats.totalTasks).toBe(1);
      expect(stats.totalEvents).toBe(1);
      expect(stats.totalScheduledHours).toBe(1); // 60 minutes = 1 hour
      expect(stats.totalEventHours).toBe(1); // 1 hour event
      expect(stats.totalBusyHours).toBe(2); // 1 + 1 = 2 hours
      expect(stats.tasksInRange).toHaveLength(1);
      expect(stats.eventsInRange).toHaveLength(1);
    });
  });
});