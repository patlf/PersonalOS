'use client';

import React, { useCallback, useMemo, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { DragOverlay as CustomDragOverlay } from '@/components/tasks/drag-overlay';
import { useTaskStore } from '@/lib/stores/task-store';
import { Task } from '@/lib/types';
import { parseDateFromId, isSameDay } from '@/lib/date-utils';

// Enhanced context for global ghost positioning
interface EnhancedGhostContextType {
  ghostPosition: { containerId: string; index: number } | null;
  activeTaskId: string | null;
  isValidDropZone: (containerId: string) => boolean;
  getContainerTasks: (containerId: string) => Task[];
  didDragRef: React.MutableRefObject<boolean>;
}

const EnhancedGhostContext = React.createContext<EnhancedGhostContextType>({
  ghostPosition: null,
  activeTaskId: null,
  isValidDropZone: () => false,
  getContainerTasks: () => [],
  didDragRef: { current: false },
});

export const useEnhancedGhost = () => React.useContext(EnhancedGhostContext);

interface EnhancedDndProviderProps {
  children: React.ReactNode;
  onTaskMove?: (taskId: string, newDate: Date, newTime?: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskReorder?: (taskId: string, newIndex: number, dayDate: Date) => void;
}

export function EnhancedDndProvider({ 
  children, 
  onTaskMove, 
  onTaskUpdate, 
  onTaskReorder 
}: EnhancedDndProviderProps) {
  const { tasks } = useTaskStore();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [ghostPosition, setGhostPosition] = React.useState<{
    containerId: string;
    index: number;
  } | null>(null);
  
  // Refs for performance optimization
  const dragStartTimeRef = useRef<number>(0);
  const lastMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const didDragRef = useRef<boolean>(false);

  // Memoized container task getter for performance
  const getContainerTasks = useCallback((containerId: string): Task[] => {
    let result: Task[] = [];
    
    if (containerId === 'someday') {
      result = tasks.filter(task => 
        task.status === 'someday' || 
        (!task.scheduledDate && task.status !== 'completed')
      );
    } else if (containerId === 'overdue') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      result = tasks.filter(task => {
        if (!task.scheduledDate || task.status === 'completed' || task.status === 'someday') return false;
        const taskDate = new Date(task.scheduledDate);
        taskDate.setHours(0, 0, 0, 0);
        return taskDate < today;
      });
    } else if (containerId.startsWith('day-')) {
      const dateString = containerId.replace('day-', '');
      const targetDate = parseDateFromId(dateString);
      result = tasks.filter(task => {
        if (!task.scheduledDate || task.status === 'completed' || task.status === 'someday') return false;
        const taskDate = new Date(task.scheduledDate);
        return taskDate.toDateString() === targetDate.toDateString();
      });
    } else {
      result = [];
    }
    
    return result;
  }, [tasks]);

  // Memoized valid drop zone checker
  const isValidDropZone = useCallback((containerId: string): boolean => {
    return containerId === 'someday' || 
           containerId === 'overdue' || 
           containerId.startsWith('day-') || 
           containerId.startsWith('timeslot-');
  }, []);

  // Optimized sensors for responsive dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Small distance to prevent accidental drags
        delay: 100, // Small delay for better UX
        tolerance: 5, // Small tolerance for touch devices
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Simplified collision detection for better reliability
  const collisionDetection = useCallback((args: any) => {
    // First try pointer-based collision for immediate feedback
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // Fallback to rectangle intersection
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }

    // Final fallback to closest center
    return closestCenter(args);
  }, []);

  // Optimized insertion index calculation
  const calculateInsertionIndex = useCallback((
    containerId: string,
    containerTasks: Task[],
    pointerY: number
  ): number => {
    const containerElement = document.querySelector(`[data-container-id="${containerId}"]`);
    if (!containerElement) return containerTasks.length;

    const taskElements = Array.from(
      containerElement.querySelectorAll('[data-task-id]')
    ) as HTMLElement[];

    if (taskElements.length === 0) return 0;

    // Find the insertion point based on mouse position
    for (let i = 0; i < taskElements.length; i++) {
      const rect = taskElements[i].getBoundingClientRect();
      const midPoint = rect.top + rect.height / 2;
      
      if (pointerY < midPoint) {
        return i;
      }
    }

    // If we're below all elements, insert at the end
    return taskElements.length;
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    
    didDragRef.current = true;
    setActiveTask(task || null);
    setGhostPosition(null);
    dragStartTimeRef.current = Date.now();
    
    // Initialize mouse position
    lastMousePositionRef.current = { x: 0, y: 0 };
    
    // Add global mouse tracking for better ghost positioning
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };
    
    // Add touch tracking for mobile
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        lastMousePositionRef.current = { 
          x: e.touches[0].clientX, 
          y: e.touches[0].clientY 
        };
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    // Cleanup on drag end
    const cleanup = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
    };
    
    // Store cleanup function
    (window as any).__dndCleanup = cleanup;
  }, [tasks]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over, active } = event;
    
    if (!over || !active || !activeTask) {
      setGhostPosition(null);
      return;
    }

    const overId = over.id as string;
    const activeId = active.id as string;


    // Determine target container
    let targetContainerId = overId;
    
    // If dropping on a task, find its container
    const targetTask = tasks.find(t => t.id === overId);
    if (targetTask) {
      if (targetTask.status === 'someday' || (!targetTask.scheduledDate && targetTask.status !== 'completed')) {
        targetContainerId = 'someday';
      } else if (targetTask.scheduledDate) {
        const taskDate = new Date(targetTask.scheduledDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        taskDate.setHours(0, 0, 0, 0);
        
        if (taskDate < today) {
          targetContainerId = 'overdue';
        } else {
          const year = taskDate.getFullYear();
          const month = String(taskDate.getMonth() + 1).padStart(2, '0');
          const day = String(taskDate.getDate()).padStart(2, '0');
          targetContainerId = `day-${year}-${month}-${day}`;
        }
      }
    }

    // Only show ghost for valid drop zones
    if (!isValidDropZone(targetContainerId)) {
      setGhostPosition(null);
      return;
    }

    // Get container tasks (excluding the dragged task)
    // Note: We'll use a simplified approach - for day containers, we'll assume they can accept any task
    let containerTasks: Task[] = [];
    
    if (targetContainerId === 'someday') {
      containerTasks = getContainerTasks(targetContainerId).filter(task => task.id !== activeId);
    } else if (targetContainerId === 'overdue') {
      containerTasks = getContainerTasks(targetContainerId).filter(task => task.id !== activeId);
    } else if (targetContainerId.startsWith('day-')) {
      // For day containers, we need to match the WeeklyTimeline filtering logic exactly
      const dateString = targetContainerId.replace('day-', '');
      const targetDate = parseDateFromId(dateString);
      containerTasks = tasks.filter(task => {
        if (!task.scheduledDate || task.status === 'someday') return false;
        const taskDate = new Date(task.scheduledDate);
        // Use the same logic as WeeklyTimeline: isSameDay and not completed
        return isSameDay(taskDate, targetDate) && task.status !== 'completed' && task.id !== activeId;
      });
    } else if (targetContainerId.startsWith('timeslot-')) {
      // For timeslots, get tasks scheduled for that specific time
      const parts = targetContainerId.replace('timeslot-', '').split('-');
      if (parts.length >= 5) {
        const dateString = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const timeString = `${parts[3]}:${parts[4]}`;
        const targetDate = parseDateFromId(dateString);
        
        containerTasks = tasks.filter(task => {
          if (!task.scheduledDate || !task.scheduledTime || task.status === 'someday') return false;
          const taskDate = new Date(task.scheduledDate);
          return isSameDay(taskDate, targetDate) && task.scheduledTime === timeString && task.id !== activeId;
        });
      } else {
        containerTasks = [];
      }
    } else {
      containerTasks = [];
    }

    // Calculate insertion index
    let insertionIndex = containerTasks.length;
    
    if (targetTask && containerTasks.includes(targetTask)) {
      // Insert before the target task
      insertionIndex = containerTasks.findIndex(t => t.id === overId);
    } else if (containerTasks.length === 0) {
      // For empty containers, always show at index 0
      insertionIndex = 0;
    } else {
      // Use mouse position for container drops
      insertionIndex = calculateInsertionIndex(
        targetContainerId, 
        containerTasks, 
        lastMousePositionRef.current.y
      );
    }

    // Always update ghost position for better visual feedback
    const newGhostPosition = {
      containerId: targetContainerId,
      index: Math.max(0, insertionIndex)
    };
    
    // Only update if position actually changed to avoid unnecessary re-renders
    setGhostPosition(prev => {
      if (!prev || 
          prev.containerId !== newGhostPosition.containerId || 
          prev.index !== newGhostPosition.index) {

        return newGhostPosition;
      }
      return prev;
    });
  }, [activeTask, tasks, isValidDropZone, getContainerTasks, calculateInsertionIndex]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    // Cleanup
    setActiveTask(null);
    setGhostPosition(null);
    
    // Reset didDrag flag after a tick to prevent click after drop
    setTimeout(() => {
      didDragRef.current = false;
    }, 0);
    
    if ((window as any).__dndCleanup) {
      (window as any).__dndCleanup();
      delete (window as any).__dndCleanup;
    }

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Task reordering logic disabled - tasks will be placed where ghost shows
    // if (taskId !== overId && tasks.find(t => t.id === overId)) {
    //   // Reordering logic removed to prevent position jumping
    // }

    // Handle different drop targets
    if (overId === 'someday') {
      onTaskUpdate?.(taskId, {
        status: 'someday',
        scheduledDate: undefined,
        scheduledTime: undefined,
      });
    } else if (overId.startsWith('day-')) {
      const dateString = overId.replace('day-', '');
      const targetDate = parseDateFromId(dateString);
      
      if (!isNaN(targetDate.getTime())) {
        // For now, just move to the date - position will be determined by creation order
        // TODO: In the future, we could use ghostPosition.index to set exact position
        onTaskMove?.(taskId, targetDate);
      }
    } else if (overId.startsWith('timeslot-')) {
      const parts = overId.replace('timeslot-', '').split('-');
      if (parts.length >= 5) {
        const dateString = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const timeString = `${parts[3]}:${parts[4]}`;
        const targetDate = parseDateFromId(dateString);
        
        if (!isNaN(targetDate.getTime())) {
          onTaskMove?.(taskId, targetDate, timeString);
        }
      }
    }
  }, [tasks, getContainerTasks, onTaskReorder, onTaskUpdate, onTaskMove]);

  // Memoized context value for performance
  const contextValue = useMemo(() => ({
    ghostPosition,
    activeTaskId: activeTask?.id || null,
    isValidDropZone,
    getContainerTasks,
    didDragRef,
  }), [ghostPosition, activeTask?.id, isValidDropZone, getContainerTasks]);

  return (
    <EnhancedGhostContext.Provider value={contextValue}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay
          dropAnimation={null} // Disable drop animation to prevent flying effect
          style={{
            transformOrigin: '0 0',
          }}
        >
          {activeTask ? (
            <CustomDragOverlay task={activeTask} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </EnhancedGhostContext.Provider>
  );
}