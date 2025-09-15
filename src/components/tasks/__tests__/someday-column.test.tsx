import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { SomedayColumn } from '../someday-column';
import { Task } from '@/lib/types';

// Mock the UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className} data-testid="card">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, ...props }: React.ComponentProps<'button'>) => (
    <button onClick={onClick} className={className} {...props}>
      {children}
    </button>
  ),
}));

// Mock the TaskInput and TaskList components
interface MockTaskInputProps {
  onSubmit: (task: { title: string; status: string }) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

vi.mock('../task-input', () => ({
  TaskInput: ({ onSubmit, placeholder, autoFocus }: MockTaskInputProps) => (
    <div data-testid="task-input">
      <input 
        placeholder={placeholder}
        autoFocus={autoFocus}
        data-testid="task-input-field"
        onChange={(e) => {
          if (e.target.value) {
            onSubmit({ title: e.target.value, status: 'someday' });
          }
        }}
      />
    </div>
  ),
}));

interface MockTaskListProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  emptyMessage?: string;
}

vi.mock('../task-list', () => ({
  TaskList: ({ tasks, onTaskClick, emptyMessage }: MockTaskListProps) => (
    <div data-testid="task-list">
      {tasks.length === 0 ? (
        <div data-testid="empty-message">{emptyMessage}</div>
      ) : (
        tasks.map((task: Task) => (
          <div 
            key={task.id} 
            data-testid={`task-${task.id}`}
            onClick={() => onTaskClick(task)}
          >
            {task.title}
          </div>
        ))
      )}
    </div>
  ),
}));

const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Test Task 1',
    description: 'Test description',
    estimatedDuration: 60,
    status: 'someday',
    tags: ['test'],
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    title: 'Test Task 2',
    estimatedDuration: 30,
    status: 'someday',
    tags: [],
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('SomedayColumn', () => {
  const mockOnCreateTask = vi.fn();
  const mockOnTaskClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders expanded column with tasks', () => {
    render(
      <SomedayColumn
        tasks={mockTasks}
        onCreateTask={mockOnCreateTask}
        onTaskClick={mockOnTaskClick}
      />
    );

    expect(screen.getByText('Someday')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // Task count
    expect(screen.getByTestId('task-list')).toBeInTheDocument();
    expect(screen.getByTestId('task-1')).toBeInTheDocument();
    expect(screen.getByTestId('task-2')).toBeInTheDocument();
  });

  it('renders empty state when no tasks', () => {
    render(
      <SomedayColumn
        tasks={[]}
        onCreateTask={mockOnCreateTask}
        onTaskClick={mockOnTaskClick}
      />
    );

    expect(screen.getByText('Someday')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument(); // Task count
    expect(screen.getByTestId('empty-message')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <SomedayColumn
        tasks={[]}
        onCreateTask={mockOnCreateTask}
        onTaskClick={mockOnTaskClick}
        isLoading={true}
      />
    );

    expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
  });

  it('can collapse and expand', () => {
    render(
      <SomedayColumn
        tasks={mockTasks}
        onCreateTask={mockOnCreateTask}
        onTaskClick={mockOnTaskClick}
      />
    );

    // Find all buttons and get the collapse button (should be the last one in the header)
    const buttons = screen.getAllByRole('button');
    const collapseButton = buttons.find(button => 
      button.querySelector('svg')?.classList.contains('lucide-chevron-left')
    );
    
    expect(collapseButton).toBeInTheDocument();
    fireEvent.click(collapseButton!);

    // Should show collapsed state
    expect(screen.getByText('Someday (2)')).toBeInTheDocument();
    
    // Find and click the expand button (should now be chevron-right)
    const expandButton = screen.getByRole('button');
    fireEvent.click(expandButton);

    // Should show expanded state again
    expect(screen.getByText('Someday')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows task input when plus button is clicked', () => {
    render(
      <SomedayColumn
        tasks={[]}
        onCreateTask={mockOnCreateTask}
        onTaskClick={mockOnTaskClick}
      />
    );

    // Initially should show the quick add button
    expect(screen.getByText('Add a task to Someday...')).toBeInTheDocument();
    
    // Click the quick add button
    fireEvent.click(screen.getByText('Add a task to Someday...'));
    
    // Should show the task input
    expect(screen.getByTestId('task-input')).toBeInTheDocument();
  });

  it('calls onCreateTask when task is submitted', async () => {
    render(
      <SomedayColumn
        tasks={[]}
        onCreateTask={mockOnCreateTask}
        onTaskClick={mockOnTaskClick}
      />
    );

    // Show the task input
    fireEvent.click(screen.getByText('Add a task to Someday...'));
    
    // Submit a task
    const input = screen.getByTestId('task-input-field');
    fireEvent.change(input, { target: { value: 'New Task' } });

    await waitFor(() => {
      expect(mockOnCreateTask).toHaveBeenCalledWith({
        title: 'New Task',
        status: 'someday'
      });
    });
  });

  it('calls onTaskClick when task is clicked', () => {
    render(
      <SomedayColumn
        tasks={mockTasks}
        onCreateTask={mockOnCreateTask}
        onTaskClick={mockOnTaskClick}
      />
    );

    fireEvent.click(screen.getByTestId('task-1'));
    
    expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('applies custom className', () => {
    const { container } = render(
      <SomedayColumn
        tasks={[]}
        onCreateTask={mockOnCreateTask}
        onTaskClick={mockOnTaskClick}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});