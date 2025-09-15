import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TaskCard } from '../task-card';
import { Task } from '@/lib/types';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { expect } from '@playwright/test';
import { it } from 'node:test';
import { describe } from 'node:test';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  useDraggable: vi.fn(() => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    isDragging: false,
  })),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Translate: {
      toString: vi.fn(() => ''),
    },
  },
}));

const { useDraggable } = await import('@dnd-kit/core');

const mockTask: Task = {
  id: '1',
  userId: 'user1',
  title: 'Test Task',
  description: 'Test description',
  estimatedDuration: 60,
  status: 'someday',
  scheduledDate: null,
  scheduledTime: null,
  tags: ['work', 'urgent'],
  priority: 'high',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('TaskCard', () => {
  it('renders task information correctly', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('60m')).toBeInTheDocument();
    expect(screen.getByText('work')).toBeInTheDocument();
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument(); // lowercase due to capitalize class
  });

  it('applies correct priority styling', () => {
    const { rerender } = render(<TaskCard task={mockTask} />);
    
    // High priority should have destructive left border
    const highPriorityCard = screen.getByText('Test Task').closest('.group');
    expect(highPriorityCard).toHaveClass('border-l-destructive');
    
    // Test medium priority
    rerender(<TaskCard task={{ ...mockTask, priority: 'medium' }} />);
    const mediumPriorityCard = screen.getByText('Test Task').closest('.group');
    expect(mediumPriorityCard).toHaveClass('border-l-primary');
    
    // Test low priority
    rerender(<TaskCard task={{ ...mockTask, priority: 'low' }} />);
    const lowPriorityCard = screen.getByText('Test Task').closest('.group');
    expect(lowPriorityCard).toHaveClass('border-l-muted-foreground/30');
  });

  it('applies correct status text color', () => {
    const { rerender } = render(<TaskCard task={mockTask} />);
    
    // All task titles now use consistent card-foreground color
    expect(screen.getByText('Test Task')).toHaveClass('text-card-foreground');
    
    // Test that the styling is consistent across statuses
    rerender(<TaskCard task={{ ...mockTask, status: 'scheduled' }} />);
    expect(screen.getByText('Test Task')).toHaveClass('text-card-foreground');
    
    rerender(<TaskCard task={{ ...mockTask, status: 'completed' }} />);
    expect(screen.getByText('Test Task')).toHaveClass('text-card-foreground');
    
    rerender(<TaskCard task={{ ...mockTask, status: 'overdue' }} />);
    expect(screen.getByText('Test Task')).toHaveClass('text-card-foreground');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<TaskCard task={mockTask} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Test Task'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows dragging state correctly', () => {
    render(<TaskCard task={mockTask} isDragging={true} />);
    
    const card = screen.getByText('Test Task').closest('.group');
    expect(card).toHaveClass('opacity-50', 'rotate-1', 'scale-105', 'shadow-lg');
  });

  it('limits tag display and shows overflow count', () => {
    const taskWithManyTags = {
      ...mockTask,
      tags: ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'],
    };
    
    render(<TaskCard task={taskWithManyTags} />);
    
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
    expect(screen.getByText('+3')).toBeInTheDocument();
    expect(screen.queryByText('tag3')).not.toBeInTheDocument();
  });

  it('handles tasks without description', () => {
    const taskWithoutDescription = { ...mockTask, description: undefined };
    render(<TaskCard task={taskWithoutDescription} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('handles tasks without tags', () => {
    const taskWithoutTags = { ...mockTask, tags: [] };
    render(<TaskCard task={taskWithoutTags} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('work')).not.toBeInTheDocument();
  });

  it('handles zero duration tasks', () => {
    const taskWithZeroDuration = { ...mockTask, estimatedDuration: 0 };
    render(<TaskCard task={taskWithZeroDuration} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.queryByText('0m')).not.toBeInTheDocument();
  });

  it('sets up draggable functionality by default', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(useDraggable).toHaveBeenCalledWith({
      id: mockTask.id,
      disabled: false,
    });
  });

  it('can disable draggable functionality', () => {
    render(<TaskCard task={mockTask} draggable={false} />);
    
    expect(useDraggable).toHaveBeenCalledWith({
      id: mockTask.id,
      disabled: true,
    });
  });

  it('applies drag cursor styles when draggable', () => {
    const { container } = render(<TaskCard task={mockTask} draggable={true} />);
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-grab');
  });

  it('applies pointer cursor when not draggable', () => {
    const { container } = render(<TaskCard task={mockTask} draggable={false} />);
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('shows dragging state from useDraggable hook', () => {
    (useDraggable as any).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: true,
    });

    const { container } = render(<TaskCard task={mockTask} />);
    
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('opacity-50', 'rotate-1', 'scale-105', 'shadow-lg');
  });

  it('prevents click when dragging', () => {
    (useDraggable as any).mockReturnValue({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      isDragging: true,
    });

    const handleClick = vi.fn();
    render(<TaskCard task={mockTask} onClick={handleClick} />);
    
    fireEvent.click(screen.getByText('Test Task'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders in compact mode correctly', () => {
    render(<TaskCard task={mockTask} compact={true} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('60m')).toBeInTheDocument();
    // Description should not be shown in compact mode
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });
});