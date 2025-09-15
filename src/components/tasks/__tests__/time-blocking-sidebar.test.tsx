import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TimeBlockingSidebar } from '../time-blocking-sidebar';
import { Task } from '@/lib/types';

// Mock components
vi.mock('../task-card', () => ({
  TaskCard: ({ task, onClick, compact, draggable }: any) => (
    <div 
      data-testid={`task-card-${task.id}`}
      data-compact={compact}
      data-draggable={draggable}
      onClick={onClick}
    >
      {task.title}
    </div>
  ),
}));

vi.mock('../droppable-area', () => ({
  DroppableArea: ({ id, children, className }: any) => (
    <div data-testid={`droppable-${id}`} className={className}>
      {children}
    </div>
  ),
}));

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Morning Task',
    description: 'Task scheduled for 9 AM',
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
    title: 'Afternoon Task',
    description: 'Task scheduled for 2 PM',
    estimatedDuration: 30,
    status: 'scheduled',
    scheduledDate: new Date(),
    scheduledTime: '14:00',
    tags: [],
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    title: 'Unscheduled Task',
    description: 'Task without specific time',
    estimatedDuration: 45,
    status: 'scheduled',
    scheduledDate: new Date(),
    tags: [],
    priority: 'low',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('TimeBlockingSidebar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the sidebar title', () => {
    render(<TimeBlockingSidebar todayTasks={[]} />);
    
    expect(screen.getByText("Today's Schedule")).toBeInTheDocument();
  });

  it('generates time slots from 8 AM to 8 PM', () => {
    render(<TimeBlockingSidebar todayTasks={[]} />);
    
    // Check for first time slot
    expect(screen.getByText('8:00 AM')).toBeInTheDocument();
    // Check for last time slot
    expect(screen.getByText('8:00 PM')).toBeInTheDocument();
    // Check for a middle time slot
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
    // Check for 30-minute increment
    expect(screen.getByText('8:30 AM')).toBeInTheDocument();
  });

  it('displays scheduled tasks in correct time slots', () => {
    render(<TimeBlockingSidebar todayTasks={mockTasks} />);
    
    expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-2')).toBeInTheDocument();
    expect(screen.getByText('Morning Task')).toBeInTheDocument();
    expect(screen.getByText('Afternoon Task')).toBeInTheDocument();
  });

  it('shows available slots for empty time periods', () => {
    render(<TimeBlockingSidebar todayTasks={[]} />);
    
    const availableSlots = screen.getAllByText('Available');
    expect(availableSlots.length).toBeGreaterThan(0);
  });

  it('displays unscheduled tasks section when present', () => {
    render(<TimeBlockingSidebar todayTasks={mockTasks} />);
    
    expect(screen.getByText('Unscheduled Today')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-3')).toBeInTheDocument();
    expect(screen.getByText('Unscheduled Task')).toBeInTheDocument();
  });

  it('does not show unscheduled section when all tasks are scheduled', () => {
    const scheduledTasks = mockTasks.filter(task => task.scheduledTime);
    render(<TimeBlockingSidebar todayTasks={scheduledTasks} />);
    
    expect(screen.queryByText('Unscheduled Today')).not.toBeInTheDocument();
  });

  it('creates droppable areas for each time slot', () => {
    render(<TimeBlockingSidebar todayTasks={[]} />);
    
    // Should have droppable areas for time slots
    const today = new Date().toISOString().split('T')[0];
    expect(screen.getByTestId(`droppable-timeslot-${today}-08:00`)).toBeInTheDocument();
    expect(screen.getByTestId(`droppable-timeslot-${today}-09:00`)).toBeInTheDocument();
  });

  it('handles task click events', () => {
    const handleTaskClick = vi.fn();
    render(<TimeBlockingSidebar todayTasks={mockTasks} onTaskClick={handleTaskClick} />);
    
    const taskCard = screen.getByTestId('task-card-1');
    taskCard.click();
    
    expect(handleTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('sets task cards as non-draggable in time slots', () => {
    render(<TimeBlockingSidebar todayTasks={mockTasks} />);
    
    const taskCard = screen.getByTestId('task-card-1');
    expect(taskCard).toHaveAttribute('data-draggable', 'false');
  });

  it('sets task cards as compact in time slots', () => {
    render(<TimeBlockingSidebar todayTasks={mockTasks} />);
    
    const taskCard = screen.getByTestId('task-card-1');
    expect(taskCard).toHaveAttribute('data-compact', 'true');
  });

  it('applies custom className', () => {
    render(<TimeBlockingSidebar todayTasks={[]} className="custom-class" />);
    
    const sidebar = screen.getByText("Today's Schedule").closest('.custom-class');
    expect(sidebar).toBeInTheDocument();
  });

  it('formats time display correctly', () => {
    render(<TimeBlockingSidebar todayTasks={[]} />);
    
    // Test AM times
    expect(screen.getByText('8:00 AM')).toBeInTheDocument();
    expect(screen.getByText('11:30 AM')).toBeInTheDocument();
    
    // Test PM times
    expect(screen.getByText('1:00 PM')).toBeInTheDocument();
    expect(screen.getByText('6:30 PM')).toBeInTheDocument();
    
    // Test noon
    expect(screen.getByText('12:00 PM')).toBeInTheDocument();
  });
});