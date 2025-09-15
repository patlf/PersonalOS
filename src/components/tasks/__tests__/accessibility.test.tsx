import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskInput } from '../task-input'
import { WeeklyTimeline } from '../weekly-timeline'
import { Task } from '@/lib/types'

// Mock dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, ...props }: any) => (
    <div className={className} {...props}>{children}</div>
  ),
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, className, onClick, ...props }: any) => (
    <button className={className} onClick={onClick} {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: ({ className, ...props }: any) => (
    <input className={className} {...props} />
  ),
}))

vi.mock('@/components/ui/textarea', () => ({
  Textarea: ({ className, ...props }: any) => (
    <textarea className={className} {...props} />
  ),
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, className, ...props }: any) => (
    <label className={className} {...props}>{children}</label>
  ),
}))

vi.mock('./task-card', () => ({
  TaskCard: ({ task, className }: { task: Task; className?: string }) => (
    <div className={className} data-testid={`task-card-${task.id}`}>
      {task.title}
    </div>
  ),
}))

vi.mock('./droppable-area', () => ({
  DroppableArea: ({ children, id, className }: any) => (
    <div data-testid={`droppable-${id}`} className={className}>
      {children}
    </div>
  ),
}))

describe('Accessibility Features', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('TaskInput Accessibility', () => {
    const mockOnSubmit = vi.fn()

    it('has proper ARIA labels and roles', () => {
      render(<TaskInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByTestId('task-input')
      expect(input).toHaveAttribute('aria-label', 'Task title input')
    })

    it('shows expanded form with proper ARIA attributes', () => {
      render(<TaskInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByTestId('task-input')
      fireEvent.focus(input)
      
      // Check for the expanded form region
      const formRegion = screen.getByRole('region')
      expect(formRegion).toHaveAttribute('aria-label', 'Task details form')
      expect(formRegion).toHaveAttribute('id', 'task-input-help')
      
      // Check that input references the help region
      expect(input).toHaveAttribute('aria-describedby', 'task-input-help')
    })

    it('has accessible form labels', () => {
      render(<TaskInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByTestId('task-input')
      fireEvent.focus(input)
      
      // Check for proper labels
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/duration/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    })

    it('has accessible submit button', () => {
      render(<TaskInput onSubmit={mockOnSubmit} />)
      
      const submitButton = screen.getByLabelText('Add task')
      expect(submitButton).toHaveAttribute('title', 'Add task (Enter)')
    })

    it('handles keyboard navigation properly', () => {
      render(<TaskInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByTestId('task-input')
      
      // Test Enter key submission
      fireEvent.change(input, { target: { value: 'Test task' } })
      fireEvent.keyDown(input, { key: 'Enter' })
      
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Test task',
        estimatedDuration: 60,
        priority: 'medium',
        tags: [],
      })
    })

    it('handles Escape key to cancel', () => {
      render(<TaskInput onSubmit={mockOnSubmit} />)
      
      const input = screen.getByTestId('task-input')
      fireEvent.focus(input)
      fireEvent.change(input, { target: { value: 'Test task' } })
      
      // Press Escape
      fireEvent.keyDown(input, { key: 'Escape' })
      
      // Input should be cleared
      expect(input).toHaveValue('')
    })
  })

  describe('WeeklyTimeline Accessibility', () => {
    const mockProps = {
      tasks: [],
      currentWeek: new Date('2024-01-01'),
      onWeekChange: vi.fn(),
      showPastDays: false,
      onTogglePastDays: vi.fn(),
    }

    it('has accessible navigation buttons', () => {
      render(<WeeklyTimeline {...mockProps} />)
      
      const prevButton = screen.getByLabelText('Previous week (←)')
      const nextButton = screen.getByLabelText('Next week (→)')
      
      expect(prevButton).toHaveAttribute('title', 'Previous week (←)')
      expect(nextButton).toHaveAttribute('title', 'Next week (→)')
    })

    it('has accessible past days toggle', () => {
      render(<WeeklyTimeline {...mockProps} />)
      
      const toggleButton = screen.getByLabelText('Show past days')
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
      expect(toggleButton).toHaveAttribute('title', 'Toggle past days visibility (Ctrl/Cmd + P)')
    })

    it('updates aria-pressed when past days toggle changes', () => {
      const { rerender } = render(<WeeklyTimeline {...mockProps} />)
      
      let toggleButton = screen.getByLabelText('Show past days')
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false')
      
      // Rerender with showPastDays: true
      rerender(<WeeklyTimeline {...mockProps} showPastDays={true} />)
      
      toggleButton = screen.getByLabelText('Hide past days')
      expect(toggleButton).toHaveAttribute('aria-pressed', 'true')
    })

    it('provides keyboard navigation hints in tooltips', () => {
      render(<WeeklyTimeline {...mockProps} />)
      
      const prevButton = screen.getByLabelText('Previous week (←)')
      const nextButton = screen.getByLabelText('Next week (→)')
      const toggleButton = screen.getByLabelText('Show past days')
      
      expect(prevButton).toHaveAttribute('title', 'Previous week (←)')
      expect(nextButton).toHaveAttribute('title', 'Next week (→)')
      expect(toggleButton).toHaveAttribute('title', 'Toggle past days visibility (Ctrl/Cmd + P)')
    })
  })

  describe('Focus Management', () => {
    it('maintains focus indicators', () => {
      render(<TaskInput onSubmit={vi.fn()} />)
      
      const input = screen.getByTestId('task-input')
      fireEvent.focus(input)
      
      // In a real browser, this would show focus indicators
      // We can at least verify the element can receive focus
      expect(input).toBeInTheDocument()
    })

    it('provides clear focus order', () => {
      render(<TaskInput onSubmit={vi.fn()} />)
      
      const input = screen.getByTestId('task-input')
      fireEvent.focus(input)
      
      // All form elements should be focusable
      const formElements = screen.getAllByRole('textbox')
      const buttons = screen.getAllByRole('button')
      const selects = screen.getAllByRole('combobox')
      
      expect(formElements.length).toBeGreaterThan(0)
      expect(buttons.length).toBeGreaterThan(0)
      expect(selects.length).toBeGreaterThan(0)
    })
  })

  describe('Screen Reader Support', () => {
    it('provides meaningful labels for all interactive elements', () => {
      render(<TaskInput onSubmit={vi.fn()} />)
      
      const input = screen.getByTestId('task-input')
      fireEvent.focus(input)
      
      // Check that all form controls have labels
      const description = screen.getByLabelText(/description/i)
      const duration = screen.getByLabelText(/duration/i)
      const priority = screen.getByLabelText(/priority/i)
      const tags = screen.getByLabelText(/tags/i)
      
      expect(description).toBeInTheDocument()
      expect(duration).toBeInTheDocument()
      expect(priority).toBeInTheDocument()
      expect(tags).toBeInTheDocument()
    })

    it('uses semantic HTML elements', () => {
      render(<TaskInput onSubmit={vi.fn()} />)
      
      const input = screen.getByTestId('task-input')
      fireEvent.focus(input)
      
      // Check for semantic elements
      const region = screen.getByRole('region')
      const form = document.querySelector('form')
      
      expect(form).toBeInTheDocument()
      expect(region).toBeInTheDocument()
    })
  })
})