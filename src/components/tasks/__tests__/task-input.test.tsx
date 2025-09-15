import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TaskInput } from '../task-input';


describe('TaskInput', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders with placeholder text', () => {
    render(<TaskInput onSubmit={mockOnSubmit} placeholder="Add a new task" />);
    
    expect(screen.getByPlaceholderText('Add a new task')).toBeInTheDocument();
  });

  it('expands form when input is focused', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.click(input);
    
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/duration/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tags/i)).toBeInTheDocument();
  });

  it('submits task with basic information', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.type(input, 'New task');
    await user.click(screen.getByRole('button', { name: 'Add task' }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New task',
      estimatedDuration: 60,
      priority: 'medium',
      tags: [],
    });
  });

  it('submits task with Enter key', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.type(input, 'New task{enter}');
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'New task',
      estimatedDuration: 60,
      priority: 'medium',
      tags: [],
    });
  });

  it('submits task with all fields filled', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    // Focus to expand form
    const input = screen.getByPlaceholderText('Add a task...');
    await user.click(input);
    
    // Fill in all fields
    await user.type(input, 'Complete task');
    await user.type(screen.getByLabelText(/description/i), 'Task description');
    await user.clear(screen.getByLabelText(/duration/i));
    await user.type(screen.getByLabelText(/duration/i), '90');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high');
    
    // Add tags
    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, 'work{enter}');
    await user.type(tagInput, 'urgent{enter}');
    
    // Submit
    await user.click(screen.getByRole('button', { name: 'Add Task' }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith({
      title: 'Complete task',
      description: 'Task description',
      estimatedDuration: 90,
      priority: 'high',
      tags: ['work', 'urgent'],
    });
  });

  it('prevents submission with empty title', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.click(input);
    await user.click(screen.getByRole('button', { name: 'Add Task' }));
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('trims whitespace from title', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.type(input, '  Trimmed task  ');
    await user.click(screen.getByRole('button', { name: 'Add task' }));
    
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Trimmed task',
      })
    );
  });

  it('resets form after submission but keeps it expanded', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.click(input);
    await user.type(input, 'Test task');
    await user.type(screen.getByLabelText(/description/i), 'Test description');
    await user.click(screen.getByRole('button', { name: 'Add Task' }));
    
    // Form should be reset but still expanded
    expect(input).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toHaveValue('');
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument(); // Still expanded
  });

  it('cancels form and collapses', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.click(input);
    await user.type(input, 'Test task');
    
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    
    expect(input).toHaveValue('');
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument();
  });

  it('handles Escape key to cancel', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.click(input);
    await user.type(input, 'Test task');
    await user.keyboard('{Escape}');
    
    expect(input).toHaveValue('');
    expect(screen.queryByLabelText(/description/i)).not.toBeInTheDocument();
  });

  it('adds and removes tags correctly', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.click(input);
    
    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, 'work{enter}');
    await user.type(tagInput, 'urgent{enter}');
    
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    
    // Remove a tag - now using X icon instead of × text
    const removeButtons = screen.getAllByRole('button').filter(button => 
      button.querySelector('svg')?.classList.contains('lucide-x')
    );
    await user.click(removeButtons[0]);
    
    expect(screen.queryByText('work')).not.toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
  });

  it('prevents duplicate tags', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.click(input);
    
    const tagInput = screen.getByLabelText(/tags/i);
    await user.type(tagInput, 'work{enter}');
    await user.type(tagInput, 'work{enter}');
    
    const workTags = screen.getAllByText('work');
    expect(workTags).toHaveLength(1);
  });

  it('focuses input when autoFocus is true', () => {
    render(<TaskInput onSubmit={mockOnSubmit} autoFocus />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    expect(input).toHaveFocus();
  });

  it('maintains focus after task submission for continuous entry', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    await user.type(input, 'First task{enter}');
    
    // Input should still have focus for continuous task entry
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
    
    // Should be able to immediately type another task
    await user.type(input, 'Second task{enter}');
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    expect(mockOnSubmit).toHaveBeenNthCalledWith(1, expect.objectContaining({
      title: 'First task'
    }));
    expect(mockOnSubmit).toHaveBeenNthCalledWith(2, expect.objectContaining({
      title: 'Second task'
    }));
  });

  it('applies custom className', () => {
    const { container } = render(
      <TaskInput onSubmit={mockOnSubmit} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('handles improved styling with rounded corners and better colors', async () => {
    const user = userEvent.setup();
    render(<TaskInput onSubmit={mockOnSubmit} />);
    
    const input = screen.getByPlaceholderText('Add a task...');
    expect(input).toHaveClass('rounded-xl');
    
    await user.click(input);
    
    // Check that expanded form container has proper styling
    const expandedFormContainer = screen.getByRole('button', { name: 'Add Task' }).closest('.space-y-4');
    expect(expandedFormContainer).toHaveClass('rounded-xl');
  });
});