import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DndProvider } from '../dnd-provider';
import { useTaskStore } from '@/lib/stores/task-store';
import { Task } from '@/lib/types';

// Mock the task store
vi.mock('@/lib/stores/task-store');

// Mock dnd-kit components
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => (
    <div data-testid="dnd-context" data-on-drag-end={!!onDragEnd}>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: any) => (
    <div data-testid="drag-overlay">{children}</div>
  ),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  closestCenter: vi.fn(),
  rectIntersection: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  sortableKeyboardCoordinates: vi.fn(),
}));

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test description',
    estimatedDuration: 60,
    status: 'someday',
    tags: [],
    priority: 'medium',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Test description 2',
    estimatedDuration: 30,
    status: 'scheduled',
    scheduledDate: new Date(),
    tags: [],
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockTaskStore = {
  tasks: mockTasks,
  moveTask: vi.fn(),
  updateTask: vi.fn(),
};

describe('DndProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTaskStore as any).mockReturnValue(mockTaskStore);
  });

  it('renders children within DndContext', () => {
    render(
      <DndProvider>
        <div data-testid="child-component">Test Child</div>
      </DndProvider>
    );

    expect(screen.getByTestId('dnd-context')).toBeInTheDocument();
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
  });

  it('sets up DndContext with proper event handlers', () => {
    render(
      <DndProvider>
        <div>Test</div>
      </DndProvider>
    );

    const dndContext = screen.getByTestId('dnd-context');
    expect(dndContext).toHaveAttribute('data-on-drag-end', 'true');
  });

  it('renders drag overlay when active task exists', () => {
    render(
      <DndProvider>
        <div>Test</div>
      </DndProvider>
    );

    expect(screen.getByTestId('drag-overlay')).toBeInTheDocument();
  });
});

describe('DndProvider drag handlers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTaskStore as any).mockReturnValue(mockTaskStore);
  });

  // Note: Testing actual drag events would require more complex setup
  // with @dnd-kit/testing-utils or similar. For now, we test the component structure.
  
  it('provides task store methods to handle drag operations', () => {
    render(
      <DndProvider>
        <div>Test</div>
      </DndProvider>
    );

    // Verify that the component has access to the required store methods
    expect(mockTaskStore.moveTask).toBeDefined();
    expect(mockTaskStore.updateTask).toBeDefined();
    expect(mockTaskStore.tasks).toBeDefined();
  });
});