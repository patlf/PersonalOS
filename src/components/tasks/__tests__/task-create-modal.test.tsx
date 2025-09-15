import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { TaskCreateModal } from '../task-create-modal';

describe('TaskCreateModal', () => {
  const mockOnSubmit = vi.fn();
  const mockOnClose = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(<TaskCreateModal {...defaultProps} />);

    expect(screen.getByText('Add Task')).toBeInTheDocument();
    expect(screen.getByLabelText('Task name')).toBeInTheDocument();
    expect(screen.getByLabelText('When')).toBeInTheDocument();
    expect(screen.getByLabelText('Duration (minutes)')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<TaskCreateModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('Add Task')).not.toBeInTheDocument();
  });

  it('shows custom title when provided', () => {
    render(<TaskCreateModal {...defaultProps} title="Add task for Monday" />);

    expect(screen.getByText('Add task for Monday')).toBeInTheDocument();
  });

  it('prefills date when provided', () => {
    const testDate = new Date('2024-01-15');
    render(<TaskCreateModal {...defaultProps} prefilledDate={testDate} />);

    // The date should be selected in the dropdown
    expect(screen.getByDisplayValue('Monday, Jan 15')).toBeInTheDocument();
  });

  it('defaults to someday when title includes someday', () => {
    render(<TaskCreateModal {...defaultProps} title="Add task to Someday" />);

    // Should default to someday option
    expect(screen.getByDisplayValue('Someday')).toBeInTheDocument();
  });

  it('submits task with correct data', async () => {
    render(<TaskCreateModal {...defaultProps} />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText('Task name'), {
      target: { value: 'Test Task' }
    });

    // Submit the form
    fireEvent.click(screen.getByText('Add Task'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test Task',
        estimatedDuration: 30,
        scheduledDate: null,
        status: 'scheduled',
        priority: 'medium',
        tags: [],
      });
    });
  });

  it('calls onClose when cancel is clicked', () => {
    render(<TaskCreateModal {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables submit when task name is empty', () => {
    render(<TaskCreateModal {...defaultProps} />);

    const submitButton = screen.getByText('Add Task');
    expect(submitButton).toBeDisabled();
  });

  it('enables submit when task name is provided', () => {
    render(<TaskCreateModal {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Task name'), {
      target: { value: 'Test Task' }
    });

    const submitButton = screen.getByText('Add Task');
    expect(submitButton).not.toBeDisabled();
  });
});