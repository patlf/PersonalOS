import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TaskContextMenu } from '../task-context-menu';
import { Task } from '@/lib/types';

const mockTask: Task = {
  id: '1',
  userId: 'user1',
  title: 'Test Task',
  description: 'Test description',
  estimatedDuration: 60,
  status: 'someday',
  tags: ['test'],
  priority: 'medium',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockHandlers = {
  onEdit: vi.fn(),
  onDuplicate: vi.fn(),
  onDelete: vi.fn(),
  onSendToSomeday: vi.fn(),
};

describe('TaskContextMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders context menu trigger', () => {
    render(
      <TaskContextMenu task={mockTask} {...mockHandlers}>
        <button>Menu</button>
      </TaskContextMenu>
    );

    expect(screen.getByText('Menu')).toBeInTheDocument();
  });

  it('opens menu when trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskContextMenu task={mockTask} {...mockHandlers}>
        <button>Menu</button>
      </TaskContextMenu>
    );

    await user.click(screen.getByText('Menu'));

    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });
    expect(screen.getByText('Duplicate')).toBeInTheDocument();
    expect(screen.getByText('Send to Someday')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onEdit when Edit Task is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskContextMenu task={mockTask} {...mockHandlers}>
        <button>Menu</button>
      </TaskContextMenu>
    );

    await user.click(screen.getByText('Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Edit Task')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Edit Task'));

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDuplicate when Duplicate is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskContextMenu task={mockTask} {...mockHandlers}>
        <button>Menu</button>
      </TaskContextMenu>
    );

    await user.click(screen.getByText('Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Duplicate'));

    expect(mockHandlers.onDuplicate).toHaveBeenCalledWith(mockTask);
  });

  it('calls onSendToSomeday when Send to Someday is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskContextMenu task={mockTask} {...mockHandlers}>
        <button>Menu</button>
      </TaskContextMenu>
    );

    await user.click(screen.getByText('Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Send to Someday')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Send to Someday'));

    expect(mockHandlers.onSendToSomeday).toHaveBeenCalledWith(mockTask);
  });

  it('calls onDelete when Delete is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TaskContextMenu task={mockTask} {...mockHandlers}>
        <button>Menu</button>
      </TaskContextMenu>
    );

    await user.click(screen.getByText('Menu'));
    
    await waitFor(() => {
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('Delete'));

    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTask);
  });

  it('renders default trigger when no children provided', () => {
    render(<TaskContextMenu task={mockTask} {...mockHandlers} />);

    expect(screen.getByRole('button', { name: /open task menu/i })).toBeInTheDocument();
  });
});