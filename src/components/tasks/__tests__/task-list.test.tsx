import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { TaskList } from '../task-list';
import { DndProvider } from '@/components/providers/dnd-provider';

const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Description 1',
    estimatedDuration: 60,
    status: 'someday' as const,
    scheduledDate: null,
    scheduledTime: null,
    tags: ['work'],
    priority: 'medium' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Description 2',
    estimatedDuration: 30,
    status: 'scheduled' as const,
    scheduledDate: new Date('2025-01-13'),
    scheduledTime: '09:00',
    tags: ['personal'],
    priority: 'high' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: 'user1',
  },
];

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndProvider>
    {children}
  </DndProvider>
);

describe('TaskList Component', () => {
  const mockProps = {
    tasks: mockTasks,
    onTaskUpdate: vi.fn(),
    onTaskDelete: vi.fn(),
    onTaskDuplicate: vi.fn(),
    droppableId: 'test-list',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Requirement 3.1: Task display and management', () => {
    it('should render all provided tasks', () => {
      render(
        <TestWrapper>
          <TaskList {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    });

    it('should display task details correctly', () => {
      render(
        <TestWrapper>
          <TaskList {...mockProps} />
        </TestWrapper>
      );

      // Check for duration display
      expect(screen.getByText('60m')).toBeInTheDocument();
      expect(screen.getByText('30m')).toBeInTheDocument();

      // Check for tags
      expect(screen.getByText('work')).toBeInTheDocument();
      expect(screen.getByText('personal')).toBeInTheDocument();
    });

    it('should show priority indicators', () => {
      render(
        <TestWrapper>
          <TaskList {...mockProps} />
        </TestWrapper>
      );

      // High priority task should have visual indicator
      const highPriorityTask = screen.getByText('Test Task 2').closest('[data-testid="task-card"]');
      expect(highPriorityTask).toHaveClass(/priority-high/);
    });
  });

  describe('Task Interactions', () => {
    it('should handle task click events', () => {
      const mockOnTaskClick = vi.fn();
      
      render(
        <TestWrapper>
          <TaskList {...mockProps} onTaskClick={mockOnTaskClick} />
        </TestWrapper>
      );

      const taskCard = screen.getByText('Test Task 1').closest('[data-testid="task-card"]');
      fireEvent.click(taskCard!);

      expect(mockOnTaskClick).toHaveBeenCalledWith(mockTasks[0]);
    });

    it('should handle right-click context menu', () => {
      render(
        <TestWrapper>
          <TaskList {...mockProps} />
        </TestWrapper>
      );

      const taskCard = screen.getByText('Test Task 1').closest('[data-testid="task-card"]');
      fireEvent.contextMenu(taskCard!);

      // Context menu should appear
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Duplicate')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no tasks provided', () => {
      render(
        <TestWrapper>
          <TaskList {...mockProps} tasks={[]} />
        </TestWrapper>
      );

      expect(screen.getByText(/no tasks/i)).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading state when isLoading is true', () => {
      render(
        <TestWrapper>
          <TaskList {...mockProps} isLoading={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-list-loading')).toBeInTheDocument();
    });
  });

  describe('Drag and Drop Integration', () => {
    it('should make tasks draggable', () => {
      render(
        <TestWrapper>
          <TaskList {...mockProps} />
        </TestWrapper>
      );

      const taskCards = screen.getAllByTestId('task-card');
      taskCards.forEach(card => {
        expect(card).toHaveAttribute('draggable');
      });
    });

    it('should provide proper droppable area', () => {
      render(
        <TestWrapper>
          <TaskList {...mockProps} />
        </TestWrapper>
      );

      const droppableArea = screen.getByTestId('task-list-droppable');
      expect(droppableArea).toBeInTheDocument();
      expect(droppableArea).toHaveAttribute('data-droppable-id', 'test-list');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <TaskList {...mockProps} />
        </TestWrapper>
      );

      const taskList = screen.getByRole('list');
      expect(taskList).toHaveAttribute('aria-label', 'Task list');

      const taskItems = screen.getAllByRole('listitem');
      expect(taskItems).toHaveLength(mockTasks.length);
    });

    it('should support keyboard navigation', () => {
      render(
        <TestWrapper>
          <TaskList {...mockProps} />
        </TestWrapper>
      );

      const firstTask = screen.getAllByTestId('task-card')[0];
      firstTask.focus();

      // Should be focusable
      expect(firstTask).toHaveFocus();

      // Should support Enter key
      fireEvent.keyDown(firstTask, { key: 'Enter' });
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of tasks efficiently', () => {
      const largeTasks = Array.from({ length: 100 }, (_, i) => ({
        ...mockTasks[0],
        id: `task-${i}`,
        title: `Task ${i}`,
      }));

      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <TaskList {...mockProps} tasks={largeTasks} />
        </TestWrapper>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 100ms)
      expect(renderTime).toBeLessThan(100);
    });
  });
});