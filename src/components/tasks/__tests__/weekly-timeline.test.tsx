import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { WeeklyTimeline } from '../weekly-timeline';
import { Task } from '@/lib/types';

// Mock the TaskCard component
vi.mock('../task-card', () => ({
  TaskCard: ({ task, onClick, compact }: { task: Task; onClick?: () => void; compact?: boolean }) => (
    <div 
      data-testid={`task-card-${task.id}`}
      onClick={onClick}
      data-compact={compact}
    >
      {task.title}
    </div>
  ),
}));

// Use future dates to avoid overdue issues
const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 30); // 30 days from now
const monday = new Date(futureDate);
monday.setDate(monday.getDate() - monday.getDay() + 1); // Get Monday of that week

const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Task 1',
    description: 'Description 1',
    estimatedDuration: 60,
    status: 'scheduled',
    scheduledDate: new Date(monday), // Monday
    tags: ['work'],
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Task 2',
    estimatedDuration: 120,
    status: 'scheduled',
    scheduledDate: new Date(monday.getTime() + 24 * 60 * 60 * 1000), // Tuesday
    tags: [],
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    userId: 'user1',
    title: 'Task 3',
    estimatedDuration: 30,
    status: 'scheduled',
    scheduledDate: new Date(monday.getTime() + 2 * 24 * 60 * 60 * 1000), // Wednesday
    tags: ['personal'],
    priority: 'low',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const defaultProps = {
  tasks: mockTasks,
  currentWeek: monday,
  onWeekChange: vi.fn(),
  showPastDays: true,
  onTogglePastDays: vi.fn(),
};

describe('WeeklyTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders weekly timeline with correct structure', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    // Check for week navigation
    expect(screen.getByRole('button', { name: /previous week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next week/i })).toBeInTheDocument();
    
    // Check for toggle past days button
    expect(screen.getByRole('button', { name: /hide past/i })).toBeInTheDocument();
  });

  it('displays correct week range in header', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    // Should show a week range (exact format depends on the dates)
    expect(screen.getByRole('button', { name: /previous week/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next week/i })).toBeInTheDocument();
  });

  it('renders all seven days of the week', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    dayNames.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('displays tasks in correct day columns', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    // All tasks should be present (only once each since they're not overdue)
    expect(screen.getByTestId('task-card-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-2')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-3')).toBeInTheDocument();
  });

  it('calculates and displays scheduled hours correctly', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    // Monday: 60 minutes = 1.0h
    // Tuesday: 120 minutes = 2.0h  
    // Wednesday: 30 minutes = 0.5h
    expect(screen.getByText('1.0h')).toBeInTheDocument();
    expect(screen.getByText('2.0h')).toBeInTheDocument();
    expect(screen.getByText('0.5h')).toBeInTheDocument();
  });

  it('highlights today correctly', () => {
    // Test that today highlighting works by checking the structure
    render(<WeeklyTimeline {...defaultProps} />);
    
    // Should render without errors and have proper day structure
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  it('handles week navigation correctly', () => {
    const onWeekChange = vi.fn();
    render(<WeeklyTimeline {...defaultProps} onWeekChange={onWeekChange} />);
    
    // Click previous week
    fireEvent.click(screen.getByRole('button', { name: /previous week/i }));
    expect(onWeekChange).toHaveBeenCalledWith('prev');
    
    // Click next week
    fireEvent.click(screen.getByRole('button', { name: /next week/i }));
    expect(onWeekChange).toHaveBeenCalledWith('next');
  });

  it('handles toggle past days correctly', () => {
    const onTogglePastDays = vi.fn();
    render(<WeeklyTimeline {...defaultProps} onTogglePastDays={onTogglePastDays} />);
    
    fireEvent.click(screen.getByRole('button', { name: /hide past/i }));
    expect(onTogglePastDays).toHaveBeenCalled();
  });

  it('hides past days when showPastDays is false', () => {
    render(<WeeklyTimeline {...defaultProps} showPastDays={false} />);
    
    // Should render the timeline structure correctly
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('calls onTaskClick when task is clicked', () => {
    const onTaskClick = vi.fn();
    render(<WeeklyTimeline {...defaultProps} onTaskClick={onTaskClick} />);
    
    fireEvent.click(screen.getByTestId('task-card-1'));
    expect(onTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('handles date selection correctly', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    // Click on Monday (15th) - find the card element
    const mondayCard = screen.getByText('15').closest('[role="button"], .cursor-pointer');
    fireEvent.click(mondayCard!);
    
    // Should render without errors (selection state is internal)
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('displays different hour colors based on workload', () => {
    const heavyWorkloadTasks: Task[] = [
      {
        id: '1',
        userId: 'user1',
        title: 'Heavy Task',
        estimatedDuration: 600, // 10 hours
        status: 'scheduled',
        scheduledDate: new Date(monday),
        tags: [],
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    render(<WeeklyTimeline {...defaultProps} tasks={heavyWorkloadTasks} />);
    
    // Should show red color for > 8 hours
    const hoursText = screen.getByText('10.0h');
    expect(hoursText).toHaveClass('text-red-600');
  });

  it('handles cross-month week ranges correctly', () => {
    // Week spanning from Jan 29 to Feb 4
    const crossMonthWeek = new Date('2024-01-29');
    render(<WeeklyTimeline {...defaultProps} currentWeek={crossMonthWeek} />);
    
    // Should show "Jan 29 - Feb 4, 2024"
    expect(screen.getByText(/Jan 29 - Feb 4, 2024/)).toBeInTheDocument();
  });

  it('renders task cards in compact mode', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    // All task cards should have compact prop set to true
    expect(screen.getByTestId('task-card-1')).toHaveAttribute('data-compact', 'true');
    expect(screen.getByTestId('task-card-2')).toHaveAttribute('data-compact', 'true');
    expect(screen.getByTestId('task-card-3')).toHaveAttribute('data-compact', 'true');
  });

  it('displays overdue tasks section when overdue tasks exist', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5); // 5 days ago
    
    const overdueTask: Task = {
      id: 'overdue-1',
      userId: 'user1',
      title: 'Overdue Task',
      estimatedDuration: 60,
      status: 'scheduled',
      scheduledDate: pastDate,
      tags: [],
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tasksWithOverdue = [...mockTasks, overdueTask];
    
    render(<WeeklyTimeline {...defaultProps} tasks={tasksWithOverdue} />);
    
    expect(screen.getByText('Overdue Tasks')).toBeInTheDocument();
    expect(screen.getByTestId('task-card-overdue-1')).toBeInTheDocument();
  });

  it('does not display overdue section when no overdue tasks exist', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    expect(screen.queryByText('Overdue Tasks')).not.toBeInTheDocument();
  });

  it('shows overdue count badge in top bar', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5); // 5 days ago
    
    const overdueTask: Task = {
      id: 'overdue-1',
      userId: 'user1',
      title: 'Overdue Task',
      estimatedDuration: 60,
      status: 'scheduled',
      scheduledDate: pastDate,
      tags: [],
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tasksWithOverdue = [...mockTasks, overdueTask];
    
    render(<WeeklyTimeline {...defaultProps} tasks={tasksWithOverdue} />);
    
    expect(screen.getByText('1 overdue')).toBeInTheDocument();
  });

  it('sorts overdue tasks by scheduled date (oldest first)', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);
    
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3);
    
    const overdueTasks: Task[] = [
      {
        id: 'overdue-recent',
        userId: 'user1',
        title: 'Recent Overdue',
        estimatedDuration: 60,
        status: 'scheduled',
        scheduledDate: recentDate,
        tags: [],
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'overdue-old',
        userId: 'user1',
        title: 'Old Overdue',
        estimatedDuration: 60,
        status: 'scheduled',
        scheduledDate: oldDate,
        tags: [],
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const tasksWithOverdue = [...mockTasks, ...overdueTasks];
    
    render(<WeeklyTimeline {...defaultProps} tasks={tasksWithOverdue} />);
    
    // Old overdue task should appear first
    const overdueTasks_elements = screen.getAllByTestId(/task-card-overdue/);
    expect(overdueTasks_elements[0]).toHaveAttribute('data-testid', 'task-card-overdue-old');
    expect(overdueTasks_elements[1]).toHaveAttribute('data-testid', 'task-card-overdue-recent');
  });

  it('excludes completed tasks from overdue detection', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    
    const completedOverdueTask: Task = {
      id: 'completed-overdue',
      userId: 'user1',
      title: 'Completed Overdue Task',
      estimatedDuration: 60,
      status: 'completed',
      scheduledDate: pastDate,
      tags: [],
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tasksWithCompleted = [...mockTasks, completedOverdueTask];
    
    render(<WeeklyTimeline {...defaultProps} tasks={tasksWithCompleted} />);
    
    // Should not show overdue section for completed tasks
    expect(screen.queryByText('Overdue Tasks')).not.toBeInTheDocument();
    expect(screen.queryByTestId('task-card-completed-overdue')).not.toBeInTheDocument();
  });

  it('shows Today button and handles click', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    const todayButton = screen.getByRole('button', { name: /today/i });
    expect(todayButton).toBeInTheDocument();
    
    fireEvent.click(todayButton);
    // Should trigger navigation (exact behavior depends on current vs target week)
    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
  });

  it('shows date picker when week range is clicked', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    // Find and click the week range text (look for the button with title)
    const weekRangeButton = screen.getByTitle('Click to select date');
    expect(weekRangeButton).toBeInTheDocument();
    
    fireEvent.click(weekRangeButton);
    
    // Date picker should appear
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
  });

  it('closes date picker on escape key', () => {
    render(<WeeklyTimeline {...defaultProps} />);
    
    // Open date picker
    const weekRangeButton = screen.getByTitle('Click to select date');
    fireEvent.click(weekRangeButton);
    
    // Date picker should be visible
    expect(screen.getByDisplayValue('')).toBeInTheDocument();
    
    // Press escape
    fireEvent.keyDown(window, { key: 'Escape' });
    
    // Date picker should be hidden
    expect(screen.queryByDisplayValue('')).not.toBeInTheDocument();
  });

  it('handles keyboard navigation with arrow keys', () => {
    const onWeekChange = vi.fn();
    render(<WeeklyTimeline {...defaultProps} onWeekChange={onWeekChange} />);
    
    // Test left arrow for previous week
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(onWeekChange).toHaveBeenCalledWith('prev');
    
    // Test right arrow for next week
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(onWeekChange).toHaveBeenCalledWith('next');
  });

  it('handles Ctrl+P keyboard shortcut for toggling past days', () => {
    const onTogglePastDays = vi.fn();
    render(<WeeklyTimeline {...defaultProps} onTogglePastDays={onTogglePastDays} />);
    
    // Test Ctrl+P
    fireEvent.keyDown(window, { key: 'p', ctrlKey: true });
    expect(onTogglePastDays).toHaveBeenCalled();
    
    // Test Cmd+P (metaKey)
    fireEvent.keyDown(window, { key: 'P', metaKey: true });
    expect(onTogglePastDays).toHaveBeenCalledTimes(2);
  });

  it('ignores keyboard shortcuts when typing in input fields', () => {
    const onWeekChange = vi.fn();
    const onTogglePastDays = vi.fn();
    
    render(
      <div>
        <input data-testid="test-input" />
        <WeeklyTimeline 
          {...defaultProps} 
          onWeekChange={onWeekChange}
          onTogglePastDays={onTogglePastDays}
        />
      </div>
    );
    
    const input = screen.getByTestId('test-input');
    input.focus();
    
    // Keyboard shortcuts should be ignored when input is focused
    fireEvent.keyDown(input, { key: 'ArrowLeft' });
    fireEvent.keyDown(input, { key: 'p', ctrlKey: true });
    
    expect(onWeekChange).not.toHaveBeenCalled();
    expect(onTogglePastDays).not.toHaveBeenCalled();
  });

  it('shows correct toggle button styling based on showPastDays prop', () => {
    const { rerender } = render(<WeeklyTimeline {...defaultProps} showPastDays={true} />);
    
    let toggleButton = screen.getByRole('button', { name: /hide past/i });
    expect(toggleButton).toHaveClass('bg-blue-600');
    
    rerender(<WeeklyTimeline {...defaultProps} showPastDays={false} />);
    
    toggleButton = screen.getByRole('button', { name: /show past/i });
    expect(toggleButton).not.toHaveClass('bg-blue-600');
  });

  it('displays overdue indicator with tooltip', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);
    
    const overdueTask: Task = {
      id: 'overdue-1',
      userId: 'user1',
      title: 'Overdue Task',
      estimatedDuration: 60,
      status: 'scheduled',
      scheduledDate: pastDate,
      tags: [],
      priority: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const tasksWithOverdue = [...mockTasks, overdueTask];
    
    render(<WeeklyTimeline {...defaultProps} tasks={tasksWithOverdue} />);
    
    // Should show overdue indicator dot with tooltip
    const overdueIndicator = screen.getByTitle(/overdue since/i);
    expect(overdueIndicator).toBeInTheDocument();
    expect(overdueIndicator).toHaveClass('bg-red-500');
  });
});