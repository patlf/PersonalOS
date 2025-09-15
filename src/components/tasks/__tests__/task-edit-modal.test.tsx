import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TaskEditModal } from '../task-edit-modal';
import { Task } from '@/lib/types';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { beforeEach } from 'node:test';
import { describe } from 'node:test';

const mockTask: Task = {
  id: '1',
  userId: 'user1',
  title: 'Test Task',
  description: 'Test description',
  estimatedDuration: 60,
  status: 'someday',
  tags: ['test', 'important'],
  priority: 'medium',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockProps = {
  task: mockTask,
  isOpen: true,
  onClose: vi.fn(),
  onSave: vi.fn(),
  isLoading: false,
};

describe('TaskEditModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(<TaskEditModal {...mockProps} />);

    expect(screen.getByText('Edit Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<TaskEditModal {...mockProps} isOpen={false} />);

    expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
  });

  it('does not render when task is null', () => {
    render(<TaskEditModal {...mockProps} task={null} />);

    expect(screen.queryByText('Edit Task')).not.toBeInTheDocument();
  });

  it('populates form with task data', () => {
    render(<TaskEditModal {...mockProps} />);

    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('60')).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
    expect(screen.getByText('important')).toBeInTheDocument();
  });

  it('calls onSave with updated data when form is submitted', async () => {
    const user = userEvent.setup();
    render(<TaskEditModal {...mockProps} />);

    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);
    await user.type(titleInput, 'Updated Task');

    const saveButton = screen.getByText('Save Changes');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockProps.onSave).toHaveBeenCalledWith('1', expect.objectContaining({
        title: 'Updated Task',
        description: 'Test description',
        estimatedDuration: 60,
        priority: 'medium',
        status: 'someday',
        tags: ['test', 'important'],
      }));
    });
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<TaskEditModal {...mockProps} />);

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(mockProps.onClose).toHaveBeenCalled();
  });

  it('allows adding new tags', async () => {
    const user = userEvent.setup();
    render(<TaskEditModal {...mockProps} />);

    const tagInput = screen.getByPlaceholderText('Add a tag');
    await user.type(tagInput, 'newtag');

    const addButton = screen.getByText('Add');
    await user.click(addButton);

    expect(screen.getByText('newtag')).toBeInTheDocument();
  });

  it('allows removing tags', async () => {
    const user = userEvent.setup();
    render(<TaskEditModal {...mockProps} />);

    const testTag = screen.getByText('test');
    const removeButton = testTag.parentElement?.querySelector('button');
    
    if (removeButton) {
      await user.click(removeButton);
    }

    expect(screen.queryByText('test')).not.toBeInTheDocument();
  });

  it('prevents adding duplicate tags', async () => {
    const user = userEvent.setup();
    render(<TaskEditModal {...mockProps} />);

    const tagInput = screen.getByPlaceholderText('Add a tag');
    await user.type(tagInput, 'test');

    const addButton = screen.getByText('Add');
    await user.click(addButton);

    // Should still only have one 'test' tag
    const testTags = screen.getAllByText('test');
    expect(testTags).toHaveLength(1);
  });

  it('disables save button when title is empty', async () => {
    const user = userEvent.setup();
    render(<TaskEditModal {...mockProps} />);

    const titleInput = screen.getByDisplayValue('Test Task');
    await user.clear(titleInput);

    const saveButton = screen.getByText('Save Changes');
    expect(saveButton).toBeDisabled();
  });

  it('shows loading state when saving', () => {
    render(<TaskEditModal {...mockProps} isLoading={true} />);

    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('renders priority and status selects', async () => {
    render(<TaskEditModal {...mockProps} />);

    // Check that priority and status selects are rendered
    const comboboxes = screen.getAllByRole('combobox');
    expect(comboboxes).toHaveLength(2);
    
    // Check that labels are present
    expect(screen.getByText('Priority')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});