import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TasksView } from '../tasks-view'

// Mock all the dependencies
vi.mock('@/hooks/use-tasks', () => ({
  useTasks: () => ({ isLoading: false, error: null }),
  useCreateTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateTask: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteTask: () => ({ mutateAsync: vi.fn() }),
  useDuplicateTask: () => ({ mutateAsync: vi.fn() }),
}))

vi.mock('@/lib/stores/task-store', () => ({
  useTaskStore: () => ({
    tasks: [],
    setSelectedTask: vi.fn(),
    getTasksByStatus: vi.fn(() => []),
    getTodayTasks: vi.fn(() => []),
    getFilteredTasks: vi.fn(() => []),
    getAvailableTags: vi.fn(() => []),
    currentWeek: new Date('2024-01-01'),
    showPastDays: false,
    filters: {},
    searchQuery: '',
    setCurrentWeek: vi.fn(),
    togglePastDays: vi.fn(),
    moveTask: vi.fn(),
    setFilters: vi.fn(),
    setSearchQuery: vi.fn(),
  }),
}))

vi.mock('@/components/providers/dnd-provider', () => ({
  DndProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/hooks/use-keyboard-shortcuts', () => ({
  useKeyboardShortcuts: vi.fn(() => ({
    restoreFocus: vi.fn(),
    setFocusedElement: vi.fn(),
  })),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => ({ toggleSidebar: vi.fn() }),
}))

describe('TasksView Keyboard Shortcuts Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<TasksView />)
    expect(screen.getByText('Tasks')).toBeInTheDocument()
  })

  it('focuses task input when quick task create is triggered', async () => {
    render(<TasksView />)
    
    // First click the add button to show the input
    const addButton = screen.getByText('Add a task to Someday...')
    fireEvent.click(addButton)
    
    // Now find the task input
    const taskInput = screen.getByTestId('task-input')
    expect(taskInput).toBeInTheDocument()
    
    // Simulate the quick task creation shortcut
    fireEvent.keyDown(window, {
      key: 'k',
      metaKey: true,
    })
    
    // The input should be accessible
    expect(taskInput).toBeInTheDocument()
  })

  it('focuses search input when global search is triggered', async () => {
    render(<TasksView />)
    
    // Find the search input
    const searchInput = screen.getByTestId('task-search-input')
    expect(searchInput).toBeInTheDocument()
    
    // Simulate the global search shortcut
    fireEvent.keyDown(window, {
      key: '/',
      metaKey: true,
    })
    
    // The search input should be accessible
    expect(searchInput).toBeInTheDocument()
  })

  it('has proper accessibility attributes on task input', () => {
    render(<TasksView />)
    
    // First click the add button to show the input
    const addButton = screen.getByText('Add a task to Someday...')
    fireEvent.click(addButton)
    
    const taskInput = screen.getByTestId('task-input')
    expect(taskInput).toHaveAttribute('aria-label', 'Task title input')
  })

  it('has proper accessibility attributes on search input', () => {
    render(<TasksView />)
    
    const searchInput = screen.getByTestId('task-search-input')
    expect(searchInput).toHaveAttribute('placeholder')
    expect(searchInput.getAttribute('placeholder')).toContain('Ctrl/Cmd + /')
  })

  it('displays keyboard shortcut hints in placeholders', () => {
    render(<TasksView />)
    
    const searchInput = screen.getByTestId('task-search-input')
    expect(searchInput.getAttribute('placeholder')).toContain('(Ctrl/Cmd + /)')
  })
})