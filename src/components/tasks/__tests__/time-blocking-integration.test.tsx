import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DndProvider } from '@/components/providers/dnd-provider';
import { TimeBlockingSidebar } from '../time-blocking-sidebar';
import { TasksView } from '../tasks-view';
import { Task } from '@/lib/types';
import { useTaskStore } from '@/lib/stores/task-store';

// Mock the task store
vi.mock('@/lib/stores/task-store', () => ({
  useTaskStore: vi.fn(),
}));

// Mock the hooks
vi.mock('@/hooks/use-tasks', () => ({
  useTasks: () => ({ isLoading: false, error: null }),
  useCreateTask: () => ({ mutateAsync: vi.fn() }),
}));

// Mock components that aren't directly tested
vi.mock('../someday-column', () => ({
  SomedayColumn: ({ tasks }: any) => (
    <div data-testid="someday-column">
      Someday Column ({tasks.length} tasks)
    </div>
  ),
}));

// Mock the DroppableArea to include the test-id
vi.mock('../droppable-area', () => ({
  DroppableArea: ({ id, children, className }: any) => (
    <div data-testid={`droppable-${id}`} className={className}>
      {children}
    </div>
  ),
}));

// Mock TaskCard to include draggable attribute
vi.mock('../task-card', () => ({
  TaskCard: ({ task, onClick, compact, draggable = true }: any) => (
    <div 
      data-testid={`task-card-${task.id}`}
      data-compact={compact}
      data-draggable={draggable}
      onClick={onClick}
    >
      {task.title}
      {task.estimatedDuration && <span>{task.estimatedDuration}m</span>}
    </div>
  ),
}));

const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user-1',
    title: 'Task 1',
    description: 'First task',
    estimatedDuration: 60,
    status: 'scheduled',
    scheduledDate: new Date(),
    scheduledTime: '09:00',
    tags: [],
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user-1',
    title: 'Task 2',
    description: 'Second task',
    estimatedDuration: 30,
    status: 'scheduled',
    scheduledDate: new Date(),
    tags: [],
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'user-1',
    title: 'Task 3',
    description: 'Third task',
    estimatedDuration: 45,
    status: 'someday',
    tags: [],
    priority: 'low',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockTaskStore = {
  tasks: mockTasks,
  currentWeek: new Date(),
  showPastDays: false,
  selectedTask: undefined,
  filters: {},
  isLoading: false,
  error: undefined,
  setTasks: vi.fn(),
  addTask: vi.fn(),
  updateTask: vi.fn(),
  deleteTask: vi.fn(),
  moveTask: vi.fn(),
  setCurrentWeek: vi.fn(),
  togglePastDays: vi.fn(),
  setSelectedTask: vi.fn(),
  setFilters: vi.fn(),
  setLoading: vi.fn(),
  setError: vi.fn(),
  getTasksByStatus: vi.fn((status) => mockTasks.filter(t => t.status === status)),
  getTasksByDate: vi.fn((date) => {
    const dateString = date.toISOString().split('T')[0];
    return mockTasks.filter(task => {
      if (!task.scheduledDate) return false;
      const taskDateString = task.scheduledDate.toISOString().split('T')[0];
      return taskDateString === dateString;
    });
  }),
  getOverdueTasks: vi.fn(() => []),
  getTodayTasks: vi.fn(() => mockTasks.filter(t => t.scheduledDate && t.scheduledDate.toDateString() === new Date().toDateString())),
};

describe('Time-blocking Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTaskStore as any).mockReturnValue(mockTaskStore);
  });

  describe('Requirement 3.1: Tasks view displays all components', () => {
    it('should display Someday column, weekly timeline, and time-blocking sidebar', () => {
      render(<TasksView />);
      
      // Check that all three main components are present
      expect(screen.getByTestId('someday-column')).toBeInTheDocument();
      expect(screen.getByText("Today's Schedule")).toBeInTheDocument(); // Time-blocking sidebar
      expect(screen.getByText('Tasks')).toBeInTheDocument(); // Main header
      
      // Check for weekly timeline elements
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();
    });
  });

  describe('Requirement 3.5: Time-blocking sidebar drag-and-drop', () => {
    it('should create droppable areas for each time slot', () => {
      const todayTasks = mockTasks.filter(t => t.scheduledDate && t.scheduledDate.toDateString() === new Date().toDateString());
      
      render(
        <DndProvider>
          <TimeBlockingSidebar todayTasks={todayTasks} />
        </DndProvider>
      );
      
      // Check that time slots are created as droppable areas
      const today = new Date().toISOString().split('T')[0];
      const timeSlot8AM = screen.getByTestId(`droppable-timeslot-${today}-08:00`);
      const timeSlot9AM = screen.getByTestId(`droppable-timeslot-${today}-09:00`);
      const timeSlot2PM = screen.getByTestId(`droppable-timeslot-${today}-14:00`);
      
      expect(timeSlot8AM).toBeInTheDocument();
      expect(timeSlot9AM).toBeInTheDocument();
      expect(timeSlot2PM).toBeInTheDocument();
    });

    it('should display tasks in correct time slots', () => {
      const todayTasks = mockTasks.filter(t => t.scheduledDate && t.scheduledDate.toDateString() === new Date().toDateString());
      
      render(
        <DndProvider>
          <TimeBlockingSidebar todayTasks={todayTasks} />
        </DndProvider>
      );
      
      // Task 1 should be in the 9:00 AM slot
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    });

    it('should show unscheduled tasks in separate section', () => {
      const todayTasks = mockTasks.filter(t => t.scheduledDate && t.scheduledDate.toDateString() === new Date().toDateString());
      
      render(
        <DndProvider>
          <TimeBlockingSidebar todayTasks={todayTasks} />
        </DndProvider>
      );
      
      // Task 2 has no scheduledTime, so should be in unscheduled section
      expect(screen.getByText('Unscheduled Today')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  describe('Requirement 3.7: Weekly timeline shows scheduled hours', () => {
    it('should display scheduled hours count for each day', () => {
      render(<TasksView />);
      
      // The weekly timeline should show hours count
      // Since we have tasks with durations, we should see hour counts
      const hourElements = screen.getAllByText(/\d+\.\d+h/);
      expect(hourElements.length).toBeGreaterThan(0);
    });

    it('should calculate hours correctly based on task durations', () => {
      const testTasks: Task[] = [
        {
          ...mockTasks[0],
          scheduledDate: new Date(),
          estimatedDuration: 60, // 1 hour
        },
        {
          ...mockTasks[1],
          scheduledDate: new Date(),
          estimatedDuration: 30, // 0.5 hours
        },
      ];

      const customStore = {
        ...mockTaskStore,
        tasks: testTasks,
        getTodayTasks: vi.fn(() => testTasks),
        getTasksByDate: vi.fn(() => testTasks),
      };

      (useTaskStore as any).mockReturnValue(customStore);

      render(<TasksView />);
      
      // Should show 1.5h total for today (1 + 0.5 hours)
      expect(screen.getByText('1.5h')).toBeInTheDocument();
    });
  });

  describe('Time slot visual indicators', () => {
    it('should show available slots when no task is scheduled', () => {
      render(
        <DndProvider>
          <TimeBlockingSidebar todayTasks={[]} />
        </DndProvider>
      );
      
      const availableSlots = screen.getAllByText('Available');
      expect(availableSlots.length).toBeGreaterThan(0);
    });

    it('should format time display correctly', () => {
      render(
        <DndProvider>
          <TimeBlockingSidebar todayTasks={[]} />
        </DndProvider>
      );
      
      // Check various time formats
      expect(screen.getByText('8:00 AM')).toBeInTheDocument();
      expect(screen.getByText('12:00 PM')).toBeInTheDocument();
      expect(screen.getByText('1:00 PM')).toBeInTheDocument();
      expect(screen.getByText('8:00 PM')).toBeInTheDocument();
      expect(screen.getByText('8:30 AM')).toBeInTheDocument();
    });

    it('should generate 30-minute increments from 8 AM to 8 PM', () => {
      render(
        <DndProvider>
          <TimeBlockingSidebar todayTasks={[]} />
        </DndProvider>
      );
      
      // Should have 26 time slots (8 AM to 8 PM inclusive in 30-minute increments)
      // 8:00, 8:30, 9:00, 9:30, ..., 7:30, 8:00 PM = 26 slots
      const timeSlots = screen.getAllByText(/\d{1,2}:\d{2} (AM|PM)/);
      expect(timeSlots).toHaveLength(26);
    });
  });

  describe('Task duration display', () => {
    it('should display task duration in compact format', () => {
      const todayTasks = mockTasks.filter(t => t.scheduledDate && t.scheduledDate.toDateString() === new Date().toDateString());
      
      render(
        <DndProvider>
          <TimeBlockingSidebar todayTasks={todayTasks} />
        </DndProvider>
      );
      
      // Should show duration chips for tasks
      expect(screen.getByText('60m')).toBeInTheDocument(); // Task 1 duration
    });
  });

  describe('Task interactions', () => {
    it('should handle task click events', () => {
      const handleTaskClick = vi.fn();
      const todayTasks = mockTasks.filter(t => t.scheduledDate && t.scheduledDate.toDateString() === new Date().toDateString());
      
      render(
        <DndProvider>
          <TimeBlockingSidebar todayTasks={todayTasks} onTaskClick={handleTaskClick} />
        </DndProvider>
      );
      
      const taskElement = screen.getByText('Task 1');
      fireEvent.click(taskElement);
      
      expect(handleTaskClick).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should set scheduled tasks as non-draggable in time slots', () => {
      const todayTasks = mockTasks.filter(t => t.scheduledDate && t.scheduledDate.toDateString() === new Date().toDateString());
      
      render(
        <DndProvider>
          <TimeBlockingSidebar todayTasks={todayTasks} />
        </DndProvider>
      );
      
      // Tasks in time slots should not be draggable (to prevent conflicts)
      const taskCard = screen.getByTestId('task-card-1');
      expect(taskCard).toHaveAttribute('data-draggable', 'false');
    });
  });
});