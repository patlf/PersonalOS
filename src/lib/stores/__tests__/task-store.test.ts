import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useTaskStore } from '../task-store';
import { Task } from '@/lib/types';

const mockTask: Task = {
  id: '1',
  userId: 'user1',
  title: 'Test Task',
  description: 'Test description',
  estimatedDuration: 60,
  status: 'someday',
  scheduledDate: undefined,
  scheduledTime: undefined,
  tags: ['work'],
  priority: 'medium',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockScheduledTask: Task = {
  ...mockTask,
  id: '2',
  title: 'Scheduled Task',
  status: 'scheduled',
  scheduledDate: new Date('2024-01-15'),
  scheduledTime: '09:00',
};

// Removed mockOverdueTask since we create it inline in the test

describe('useTaskStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useTaskStore());
    act(() => {
      result.current.setTasks([]);
      result.current.setCurrentWeek(new Date('2024-01-15'));
      result.current.setSelectedTask(undefined);
      result.current.setFilters({});
      result.current.setLoading(false);
      result.current.setError(undefined);
    });
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const { result } = renderHook(() => useTaskStore());
      
      expect(result.current.tasks).toEqual([]);
      expect(result.current.showPastDays).toBe(false);
      expect(result.current.selectedTask).toBeUndefined();
      expect(result.current.filters).toEqual({});
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('setTasks', () => {
    it('sets tasks correctly', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.setTasks([mockTask]);
      });
      
      expect(result.current.tasks).toEqual([mockTask]);
    });
  });

  describe('addTask', () => {
    it('adds a task to the store', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.addTask(mockTask);
      });
      
      expect(result.current.tasks).toContain(mockTask);
    });

    it('adds multiple tasks', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.addTask(mockTask);
        result.current.addTask(mockScheduledTask);
      });
      
      expect(result.current.tasks).toHaveLength(2);
      expect(result.current.tasks).toContain(mockTask);
      expect(result.current.tasks).toContain(mockScheduledTask);
    });
  });

  describe('updateTask', () => {
    it('updates an existing task', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.addTask(mockTask);
        result.current.updateTask('1', { title: 'Updated Task' });
      });
      
      const updatedTask = result.current.tasks.find(t => t.id === '1');
      expect(updatedTask?.title).toBe('Updated Task');
    });

    it('does not affect other tasks', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.addTask(mockTask);
        result.current.addTask(mockScheduledTask);
        result.current.updateTask('1', { title: 'Updated Task' });
      });
      
      const unchangedTask = result.current.tasks.find(t => t.id === '2');
      expect(unchangedTask?.title).toBe('Scheduled Task');
    });
  });

  describe('deleteTask', () => {
    it('removes a task from the store', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.addTask(mockTask);
        result.current.deleteTask('1');
      });
      
      expect(result.current.tasks).toHaveLength(0);
    });

    it('clears selected task if it is deleted', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.addTask(mockTask);
        result.current.setSelectedTask(mockTask);
        result.current.deleteTask('1');
      });
      
      expect(result.current.selectedTask).toBeUndefined();
    });

    it('does not clear selected task if different task is deleted', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.addTask(mockTask);
        result.current.addTask(mockScheduledTask);
        result.current.setSelectedTask(mockTask);
        result.current.deleteTask('2');
      });
      
      expect(result.current.selectedTask).toBe(mockTask);
    });
  });

  describe('moveTask', () => {
    it('moves a task to a new date and time', () => {
      const { result } = renderHook(() => useTaskStore());
      const newDate = new Date('2024-01-20');
      const newTime = '14:00';
      
      act(() => {
        result.current.addTask(mockTask);
        result.current.moveTask('1', newDate, newTime);
      });
      
      const movedTask = result.current.tasks.find(t => t.id === '1');
      expect(movedTask?.scheduledDate).toEqual(newDate);
      expect(movedTask?.scheduledTime).toBe(newTime);
      expect(movedTask?.status).toBe('scheduled');
    });

    it('moves a task to a new date without time', () => {
      const { result } = renderHook(() => useTaskStore());
      const newDate = new Date('2024-01-20');
      
      act(() => {
        result.current.addTask(mockTask);
        result.current.moveTask('1', newDate);
      });
      
      const movedTask = result.current.tasks.find(t => t.id === '1');
      expect(movedTask?.scheduledDate).toEqual(newDate);
      expect(movedTask?.scheduledTime).toBeUndefined();
      expect(movedTask?.status).toBe('scheduled');
    });

    it('updates existing scheduled task to new date and time', () => {
      const { result } = renderHook(() => useTaskStore());
      const newDate = new Date('2024-01-25');
      const newTime = '16:30';
      
      act(() => {
        result.current.addTask(mockScheduledTask);
        result.current.moveTask('2', newDate, newTime);
      });
      
      const movedTask = result.current.tasks.find(t => t.id === '2');
      expect(movedTask?.scheduledDate).toEqual(newDate);
      expect(movedTask?.scheduledTime).toBe(newTime);
      expect(movedTask?.status).toBe('scheduled');
    });

    it('handles moving non-existent task gracefully', () => {
      const { result } = renderHook(() => useTaskStore());
      const newDate = new Date('2024-01-20');
      
      act(() => {
        result.current.moveTask('non-existent', newDate);
      });
      
      // Should not throw error and tasks should remain unchanged
      expect(result.current.tasks).toHaveLength(0);
    });
  });

  describe('togglePastDays', () => {
    it('toggles showPastDays state', () => {
      const { result } = renderHook(() => useTaskStore());
      
      expect(result.current.showPastDays).toBe(false);
      
      act(() => {
        result.current.togglePastDays();
      });
      
      expect(result.current.showPastDays).toBe(true);
      
      act(() => {
        result.current.togglePastDays();
      });
      
      expect(result.current.showPastDays).toBe(false);
    });
  });

  describe('setCurrentWeek', () => {
    it('sets the current week', () => {
      const { result } = renderHook(() => useTaskStore());
      const newWeek = new Date('2024-02-01');
      
      act(() => {
        result.current.setCurrentWeek(newWeek);
      });
      
      expect(result.current.currentWeek).toEqual(newWeek);
    });
  });

  describe('getTasksByStatus', () => {
    it('returns tasks filtered by status', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.addTask(mockTask); // someday
        result.current.addTask(mockScheduledTask); // scheduled
      });
      
      const somedayTasks = result.current.getTasksByStatus('someday');
      const scheduledTasks = result.current.getTasksByStatus('scheduled');
      
      expect(somedayTasks).toHaveLength(1);
      expect(somedayTasks[0].title).toBe('Test Task');
      expect(scheduledTasks).toHaveLength(1);
      expect(scheduledTasks[0].title).toBe('Scheduled Task');
    });
  });

  describe('getTasksByDate', () => {
    it('returns tasks scheduled for a specific date', () => {
      const { result } = renderHook(() => useTaskStore());
      const targetDate = new Date('2024-01-15');
      
      act(() => {
        result.current.addTask(mockTask); // no scheduled date
        result.current.addTask(mockScheduledTask); // scheduled for 2024-01-15
      });
      
      const tasksForDate = result.current.getTasksByDate(targetDate);
      
      expect(tasksForDate).toHaveLength(1);
      expect(tasksForDate[0].title).toBe('Scheduled Task');
    });
  });

  describe('getOverdueTasks', () => {
    it('returns overdue tasks', () => {
      const { result } = renderHook(() => useTaskStore());
      
      // Mock current date to be after the overdue task date
      const originalDate = Date;
      const mockNow = new Date('2024-01-20');
      global.Date = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(mockNow); // Current date is after overdue task
          } else {
            super(...args);
          }
        }
        static now() {
          return mockNow.getTime();
        }
      } as any;
      
      // Create overdue task with past date
      const overdueTask = {
        ...mockTask,
        id: '3',
        title: 'Overdue Task',
        status: 'scheduled' as const,
        scheduledDate: new Date('2024-01-01'), // Past date
      };
      
      // Create future task that won't be overdue
      const futureTask = {
        ...mockTask,
        id: '4',
        title: 'Future Task',
        status: 'scheduled' as const,
        scheduledDate: new Date('2024-01-25'), // Future date
      };
      
      act(() => {
        result.current.addTask(mockTask); // no scheduled date
        result.current.addTask(futureTask); // future date (2024-01-25)
        result.current.addTask(overdueTask); // past date (2024-01-01)
      });
      
      const overdueTasks = result.current.getOverdueTasks();
      
      // Remove debug logs
      
      expect(overdueTasks).toHaveLength(1);
      expect(overdueTasks[0].title).toBe('Overdue Task');
      
      // Restore original Date
      global.Date = originalDate;
    });

    it('excludes completed tasks from overdue', () => {
      const { result } = renderHook(() => useTaskStore());
      const completedOverdueTask = { 
        ...mockTask,
        id: '4',
        title: 'Completed Overdue Task',
        status: 'completed' as const,
        scheduledDate: new Date('2024-01-01'), // Past date
      };
      
      // Mock current date
      const originalDate = Date;
      const mockNow = new Date('2024-01-20');
      global.Date = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(mockNow);
          } else {
            super(...args);
          }
        }
        static now() {
          return mockNow.getTime();
        }
      } as any;
      
      act(() => {
        result.current.addTask(completedOverdueTask);
      });
      
      const overdueTasks = result.current.getOverdueTasks();
      
      expect(overdueTasks).toHaveLength(0);
      
      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('getTodayTasks', () => {
    it('returns tasks scheduled for today', () => {
      const { result } = renderHook(() => useTaskStore());
      
      // Mock today's date
      const originalDate = Date;
      const today = new Date('2024-01-15');
      global.Date = class extends Date {
        constructor(...args: any[]) {
          if (args.length === 0) {
            super(today);
          } else {
            super(...args);
          }
        }
      } as any;
      
      act(() => {
        result.current.addTask(mockTask); // no scheduled date
        result.current.addTask(mockScheduledTask); // scheduled for today
      });
      
      const todayTasks = result.current.getTodayTasks();
      
      expect(todayTasks).toHaveLength(1);
      expect(todayTasks[0].title).toBe('Scheduled Task');
      
      // Restore original Date
      global.Date = originalDate;
    });
  });

  describe('error and loading states', () => {
    it('manages loading state', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.isLoading).toBe(true);
      
      act(() => {
        result.current.setLoading(false);
      });
      
      expect(result.current.isLoading).toBe(false);
    });

    it('manages error state', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.setError('Something went wrong');
      });
      
      expect(result.current.error).toBe('Something went wrong');
      
      act(() => {
        result.current.setError(undefined);
      });
      
      expect(result.current.error).toBeUndefined();
    });
  });

  describe('filters', () => {
    it('manages filter state', () => {
      const { result } = renderHook(() => useTaskStore());
      
      act(() => {
        result.current.setFilters({ status: ['someday'], priority: ['high'] });
      });
      
      expect(result.current.filters).toEqual({
        status: ['someday'],
        priority: ['high'],
      });
      
      act(() => {
        result.current.setFilters({ tags: ['work'] });
      });
      
      expect(result.current.filters).toEqual({
        status: ['someday'],
        priority: ['high'],
        tags: ['work'],
      });
    });
  });
});