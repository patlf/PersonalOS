import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { DroppableArea } from '../droppable-area';
import { DndProvider } from '@/components/providers/dnd-provider';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <DndProvider>
    {children}
  </DndProvider>
);

describe('DroppableArea Component', () => {
  const mockProps = {
    id: 'test-droppable',
    onDrop: vi.fn(),
    children: <div>Droppable content</div>,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Functionality', () => {
    it('should render children content', () => {
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Droppable content')).toBeInTheDocument();
    });

    it('should have proper droppable attributes', () => {
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      expect(droppableElement).toHaveAttribute('data-droppable-id', 'test-droppable');
    });
  });

  describe('Drop Indicators', () => {
    it('should show drop indicator when dragging over', () => {
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      
      // Simulate drag over
      fireEvent.dragOver(droppableElement);
      
      expect(droppableElement).toHaveClass(/drop-indicator/);
    });

    it('should hide drop indicator when drag leaves', () => {
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      
      // Simulate drag over then leave
      fireEvent.dragOver(droppableElement);
      fireEvent.dragLeave(droppableElement);
      
      expect(droppableElement).not.toHaveClass(/drop-indicator/);
    });
  });

  describe('Drop Handling', () => {
    it('should call onDrop when item is dropped', () => {
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      
      // Simulate drop event
      fireEvent.drop(droppableElement, {
        dataTransfer: {
          getData: () => JSON.stringify({ id: 'task-1', type: 'task' }),
        },
      });

      expect(mockProps.onDrop).toHaveBeenCalled();
    });

    it('should prevent default drop behavior', () => {
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      const dropEvent = new Event('drop', { bubbles: true });
      const preventDefaultSpy = vi.spyOn(dropEvent, 'preventDefault');
      
      fireEvent(droppableElement, dropEvent);
      
      expect(preventDefaultSpy).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      expect(droppableElement).toHaveAttribute('role', 'region');
      expect(droppableElement).toHaveAttribute('aria-label');
    });

    it('should announce drop zones to screen readers', () => {
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} acceptsType="task" />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      expect(droppableElement).toHaveAttribute('aria-label', expect.stringContaining('task'));
    });
  });

  describe('Visual States', () => {
    it('should apply different styles based on drop state', () => {
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      
      // Default state
      expect(droppableElement).toHaveClass(/droppable-default/);
      
      // Drag over state
      fireEvent.dragOver(droppableElement);
      expect(droppableElement).toHaveClass(/droppable-active/);
    });

    it('should show different indicators for different drop types', () => {
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} acceptsType="task" />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      expect(droppableElement).toHaveAttribute('data-accepts-type', 'task');
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid drop data gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <TestWrapper>
          <DroppableArea {...mockProps} />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      
      // Simulate drop with invalid data
      fireEvent.drop(droppableElement, {
        dataTransfer: {
          getData: () => 'invalid-json',
        },
      });

      // Should not crash and should log error
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle missing onDrop callback', () => {
      render(
        <TestWrapper>
          <DroppableArea id="test" children={<div>Content</div>} />
        </TestWrapper>
      );

      const droppableElement = screen.getByTestId('droppable-area');
      
      // Should not crash when dropping without onDrop callback
      expect(() => {
        fireEvent.drop(droppableElement);
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();
      
      const TestComponent = () => {
        renderSpy();
        return (
          <DroppableArea {...mockProps} />
        );
      };

      const { rerender } = render(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Initial render
      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same props
      rerender(
        <TestWrapper>
          <TestComponent />
        </TestWrapper>
      );

      // Should use memoization to prevent unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });
  });
});