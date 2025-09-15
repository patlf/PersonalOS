import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/lib/types';
import { measurePerformance } from '@/lib/performance';
import { AppError, ERROR_CODES } from '@/lib/error-handling';

interface TaskStore {
  // State
  tasks: Task[];
  currentWeek: Date;
  showPastDays: boolean;
  selectedTask?: Task;
  filters: TaskFilters;
  searchQuery: string;
  isLoading: boolean;
  error?: AppError;
  lastSyncTime?: Date;
  pendingActions: Array<{ id: string; action: () => Promise<void>; retryCount: number }>;

  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newDate: Date, newTime?: string) => void;
  moveTaskToSomeday: (id: string) => void;
  setCurrentWeek: (date: Date) => void;
  togglePastDays: () => void;
  setSelectedTask: (task?: Task) => void;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error?: AppError) => void;
  clearError: () => void;
  addPendingAction: (id: string, action: () => Promise<void>) => void;
  removePendingAction: (id: string) => void;
  retryPendingActions: () => Promise<void>;
  setLastSyncTime: (time: Date) => void;
  
  // Computed getters
  getTasksByStatus: (status: Task['status']) => Task[];
  getTasksByDate: (date: Date) => Task[];
  getOverdueTasks: () => Task[];
  getTodayTasks: () => Task[];
  getSomedayTasks: () => Task[];
  getFilteredTasks: () => Task[];
  getAvailableTags: () => string[];
}

export const useTaskStore = create<TaskStore>()(
  devtools(
    (set, get) => ({
      // Initial state - with sample tasks for testing
      tasks: [
        {
          id: 'task-1',
          userId: 'user-1',
          title: 'Sample Task 1',
          description: 'This is a sample task for testing drag and drop',
          estimatedDuration: 30,
          status: 'someday' as const,
          tags: ['test', 'sample'],
          priority: 'medium' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-2',
          userId: 'user-1',
          title: 'Sample Task 2',
          description: 'Another sample task',
          estimatedDuration: 45,
          status: 'someday' as const,
          tags: ['test'],
          priority: 'high' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'task-3',
          userId: 'user-1',
          title: 'Scheduled Task',
          description: 'A task scheduled for today',
          estimatedDuration: 60,
          status: 'scheduled' as const,
          scheduledDate: new Date(),
          scheduledTime: '10:00',
          tags: ['work'],
          priority: 'low' as const,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      currentWeek: new Date(),
      showPastDays: false,
      selectedTask: undefined,
      filters: {},
      searchQuery: '',
      isLoading: false,
      error: undefined,
      lastSyncTime: undefined,
      pendingActions: [],

      // Actions
      setTasks: (tasks) => set({ tasks }),

      addTask: (task) =>
        set((state) => {
          try {
            return {
              tasks: [...state.tasks, task],
              error: undefined,
            };
          } catch (error) {
            return {
              ...state,
              error: new AppError(
                'Failed to add task to local state',
                ERROR_CODES.TASK_CREATE_FAILED
              ),
            };
          }
        }),

      updateTask: (id, updates) =>
        set((state) => {
          try {
            const taskExists = state.tasks.some(task => task.id === id);
            if (!taskExists) {
              return {
                ...state,
                error: new AppError(
                  'Task not found',
                  ERROR_CODES.TASK_UPDATE_FAILED
                ),
              };
            }
            
            return {
              tasks: state.tasks.map((task) =>
                task.id === id ? { ...task, ...updates } : task
              ),
              error: undefined,
            };
          } catch (error) {
            return {
              ...state,
              error: new AppError(
                'Failed to update task in local state',
                ERROR_CODES.TASK_UPDATE_FAILED
              ),
            };
          }
        }),

      deleteTask: (id) =>
        set((state) => {
          try {
            const taskExists = state.tasks.some(task => task.id === id);
            if (!taskExists) {
              return {
                ...state,
                error: new AppError(
                  'Task not found',
                  ERROR_CODES.TASK_DELETE_FAILED
                ),
              };
            }
            
            return {
              tasks: state.tasks.filter((task) => task.id !== id),
              selectedTask: state.selectedTask?.id === id ? undefined : state.selectedTask,
              error: undefined,
            };
          } catch (error) {
            return {
              ...state,
              error: new AppError(
                'Failed to delete task from local state',
                ERROR_CODES.TASK_DELETE_FAILED
              ),
            };
          }
        }),

      moveTask: (id, newDate, newTime) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  scheduledDate: newDate,
                  scheduledTime: newTime,
                  status: newDate ? 'scheduled' as const : 'someday' as const,
                }
              : task
          ),
        })),

      moveTaskToSomeday: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  scheduledDate: undefined,
                  scheduledTime: undefined,
                  status: 'someday' as const,
                }
              : task
          ),
        })),

      setCurrentWeek: (date) => set({ currentWeek: date }),

      togglePastDays: () =>
        set((state) => ({ showPastDays: !state.showPastDays })),

      setSelectedTask: (task) => set({ selectedTask: task }),

      setFilters: (filters) =>
        set((state) => ({ filters: { ...state.filters, ...filters } })),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearError: () => set({ error: undefined }),

      addPendingAction: (id, action) =>
        set((state) => ({
          pendingActions: [
            ...state.pendingActions.filter(p => p.id !== id),
            { id, action, retryCount: 0 },
          ],
        })),

      removePendingAction: (id) =>
        set((state) => ({
          pendingActions: state.pendingActions.filter(p => p.id !== id),
        })),

      retryPendingActions: async () => {
        const { pendingActions } = get();
        const maxRetries = 3;
        
        for (const pendingAction of pendingActions) {
          try {
            await pendingAction.action();
            get().removePendingAction(pendingAction.id);
          } catch (error) {
            if (pendingAction.retryCount < maxRetries) {
              set((state) => ({
                pendingActions: state.pendingActions.map(p =>
                  p.id === pendingAction.id
                    ? { ...p, retryCount: p.retryCount + 1 }
                    : p
                ),
              }));
            } else {
              get().removePendingAction(pendingAction.id);
              console.error(`Failed to retry action ${pendingAction.id} after ${maxRetries} attempts:`, error);
            }
          }
        }
      },

      setLastSyncTime: (time) => set({ lastSyncTime: time }),

      // Computed getters with performance monitoring
      getTasksByStatus: measurePerformance((status) => {
        const { tasks } = get();
        return tasks.filter((task) => task.status === status);
      }, 'task-store-getTasksByStatus', 'render'),

      getTasksByDate: measurePerformance((date) => {
        const { tasks } = get();
        const dateString = date.toISOString().split('T')[0];
        return tasks.filter((task) => {
          if (!task.scheduledDate) return false;
          const taskDateString = task.scheduledDate.toISOString().split('T')[0];
          return taskDateString === dateString;
        });
      }, 'task-store-getTasksByDate', 'render'),

      getOverdueTasks: measurePerformance(() => {
        const { tasks } = get();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return tasks.filter((task) => {
          if (!task.scheduledDate || task.status === 'completed' || task.status === 'someday') return false;
          const taskDate = new Date(task.scheduledDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate < today;
        });
      }, 'task-store-getOverdueTasks', 'render'),

      getTodayTasks: measurePerformance(() => {
        const { getTasksByDate } = get();
        return getTasksByDate(new Date());
      }, 'task-store-getTodayTasks', 'render'),

      getSomedayTasks: measurePerformance(() => {
        const { tasks } = get();
        return tasks.filter((task) => (task.status === 'someday' || !task.scheduledDate) && task.status !== 'completed');
      }, 'task-store-getSomedayTasks', 'render'),

      getFilteredTasks: measurePerformance(() => {
        const { tasks, filters, searchQuery } = get();
        
        let filteredTasks = tasks;

        // Apply search query
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(query) ||
            task.description?.toLowerCase().includes(query) ||
            task.tags.some(tag => tag.toLowerCase().includes(query))
          );
        }

        // Apply status filter
        if (filters.status && filters.status.length > 0) {
          filteredTasks = filteredTasks.filter(task =>
            filters.status!.includes(task.status)
          );
        }

        // Apply priority filter
        if (filters.priority && filters.priority.length > 0) {
          filteredTasks = filteredTasks.filter(task =>
            filters.priority!.includes(task.priority)
          );
        }

        // Apply tags filter
        if (filters.tags && filters.tags.length > 0) {
          filteredTasks = filteredTasks.filter(task =>
            filters.tags!.some(tag => task.tags.includes(tag))
          );
        }

        return filteredTasks;
      }, 'task-store-getFilteredTasks', 'render'),

      getAvailableTags: measurePerformance(() => {
        const { tasks } = get();
        const allTags = tasks.flatMap(task => task.tags);
        return Array.from(new Set(allTags)).sort();
      }, 'task-store-getAvailableTags', 'render'),
    }),
    {
      name: 'task-store',
    }
  )
);