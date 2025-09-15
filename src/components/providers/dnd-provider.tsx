'use client';

import React from 'react';
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
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { DragOverlay as CustomDragOverlay } from '@/components/tasks/drag-overlay';
import { useTaskStore } from '@/lib/stores/task-store';
import { Task } from '@/lib/types';
import { parseDateFromId } from '@/lib/date-utils';

// Context for sharing ghost position with task lists
interface GhostPositionContextType {
  ghostPosition: { containerId: string; index: number } | null;
  activeTaskId: string | null;
}

const GhostPositionContext = React.createContext<GhostPositionContextType>({
  ghostPosition: null,
  activeTaskId: null,
});

export const useGhostPosition = () => React.useContext(GhostPositionContext);

interface DndProviderProps {
  children: React.ReactNode;
  onTaskMove?: (taskId: string, newDate: Date, newTime?: string) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskReorder?: (taskId: string, newIndex: number, dayDate: Date) => void;
}

export function DndProvider({ children, onTaskMove, onTaskUpdate, onTaskReorder }: DndProviderProps) {
  const { tasks } = useTaskStore();
  const [activeTask, setActiveTask] = React.useState<Task | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [ghostPosition, setGhostPosition] = React.useState<{
    containerId: string;
    index: number;
  } | null>(null);
  const [currentMouseY, setCurrentMouseY] = React.useState<number>(0);

  // Track mouse position during drag
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeTask) {
        setCurrentMouseY(e.clientY);
      }
    };

    if (activeTask) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [activeTask]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduced for more responsive dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom collision detection for better drop zone targeting
  const collisionDetection = React.useCallback((args: any) => {
    // First, let's see if there are any collisions with the pointer
    const pointerCollisions = pointerWithin(args);
    
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }

    // If no pointer collisions, fall back to closest center
    return closestCenter(args);
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
    setCurrentMouseY(0);
  };

  const calculateInsertionIndex = (
    containerId: string, 
    containerTasks: Task[], 
    clientY: number
  ): number => {
    // Try to find the container element
    const containerElement = document.querySelector(`[data-container-id="${containerId}"]`);
    if (!containerElement) {
      return containerTasks.length; // Default to end
    }

    // Get all task elements within the container
    const taskElements = Array.from(containerElement.querySelectorAll('[data-task-id]'));
    
    if (taskElements.length === 0) {
      return 0; // Insert at beginning if no tasks
    }

    // Find the insertion point based on mouse Y position
    for (let i = 0; i < taskElements.length; i++) {
      const taskElement = taskElements[i] as HTMLElement;
      const rect = taskElement.getBoundingClientRect();
      const taskMiddle = rect.top + rect.height / 2;
      
      if (clientY < taskMiddle) {
        return i; // Insert before this task
      }
    }
    
    return taskElements.length; // Insert at end
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over, active } = event;
    setOverId(over ? over.id as string : null);
    
    if (!over || !active) {
      setGhostPosition(null);
      return;
    }

    const overId = over.id as string;
    const activeId = active.id as string;

    // Handle different types of drop targets
    let targetContainerId = overId;
    
    // If dropping on a task, find its container
    if (tasks.find(t => t.id === overId)) {
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
            // Format date for day container ID
            const year = taskDate.getFullYear();
            const month = String(taskDate.getMonth() + 1).padStart(2, '0');
            const day = String(taskDate.getDate()).padStart(2, '0');
            targetContainerId = `day-${year}-${month}-${day}`;
          }
        }
      }
    }

    // Calculate ghost position for task lists
    if (targetContainerId.startsWith('day-') || targetContainerId === 'someday' || targetContainerId === 'overdue') {
      // Get tasks for this container
      let containerTasks: Task[] = [];
      
      if (targetContainerId === 'someday') {
        containerTasks = tasks.filter(task => task.status === 'someday' || (!task.scheduledDate && task.status !== 'completed'));
      } else if (targetContainerId === 'overdue') {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        containerTasks = tasks.filter(task => {
          if (!task.scheduledDate || task.status === 'completed') return false;
          const taskDate = new Date(task.scheduledDate);
          taskDate.setHours(0, 0, 0, 0);
          return taskDate < today;
        });
      } else if (targetContainerId.startsWith('day-')) {
        const dateString = targetContainerId.replace('day-', '');
        const targetDate = parseDateFromId(dateString);
        containerTasks = tasks.filter(task => {
          if (!task.scheduledDate) return false;
          const taskDate = new Date(task.scheduledDate);
          return taskDate.toDateString() === targetDate.toDateString() && task.status !== 'completed';
        });
      }

      // Filter out the currently dragged task
      containerTasks = containerTasks.filter(task => task.id !== activeId);

      // Calculate insertion index based on mouse position or task position
      let insertionIndex = containerTasks.length; // Default to end
      
      if (tasks.find(t => t.id === overId)) {
        // If dropping on a specific task, insert before it
        const targetTaskIndex = containerTasks.findIndex(t => t.id === overId);
        if (targetTaskIndex !== -1) {
          insertionIndex = targetTaskIndex;
        }
      } else {
        // Use current mouse position for container drops
        insertionIndex = calculateInsertionIndex(targetContainerId, containerTasks, currentMouseY);
      }

      setGhostPosition({
        containerId: targetContainerId,
        index: insertionIndex
      });
    } else {
      setGhostPosition(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setOverId(null);
    setGhostPosition(null);
    setCurrentMouseY(0);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Handle task reordering within the same container (sortable)
    if (taskId !== overId && tasks.find(t => t.id === overId)) {
      // This is a task being dropped on another task (reordering)
      const activeTask = tasks.find(t => t.id === taskId);
      const overTask = tasks.find(t => t.id === overId);
      
      if (activeTask && overTask && activeTask.scheduledDate && overTask.scheduledDate) {
        // Check if they're on the same day
        const activeDate = new Date(activeTask.scheduledDate);
        const overDate = new Date(overTask.scheduledDate);
        
        if (activeDate.toDateString() === overDate.toDateString()) {
          // Find the new index for the task
          const dayTasks = tasks.filter(task => 
            task.scheduledDate && 
            new Date(task.scheduledDate).toDateString() === activeDate.toDateString()
          );
          const newIndex = dayTasks.findIndex(t => t.id === overId);
          
          if (onTaskReorder && newIndex !== -1) {
            onTaskReorder(taskId, newIndex, activeDate);
            return; // Don't process other drop targets
          }
        }
      }
    }

    // Handle different drop targets
    if (overId === 'someday') {
      // Move task back to Someday
      if (onTaskUpdate) {
        onTaskUpdate(taskId, {
          status: 'someday',
          scheduledDate: undefined,
          scheduledTime: undefined,
        });
      }
    } else if (overId === 'overdue') {
      // Move task to overdue (this shouldn't normally happen via drag)
      if (onTaskUpdate) {
        onTaskUpdate(taskId, {
          status: 'scheduled',
        });
      }
    } else if (overId.startsWith('day-')) {
      // Extract date from day ID (format: day-YYYY-MM-DD)
      const dateString = overId.replace('day-', '');
      
      // Parse date using consistent utility function
      const targetDate = parseDateFromId(dateString);
      
      if (!isNaN(targetDate.getTime()) && onTaskMove) {
        onTaskMove(taskId, targetDate);
      }
    } else if (overId.startsWith('timeslot-')) {
      // Extract date and time from timeslot ID (format: timeslot-YYYY-MM-DD-HH:MM)
      const parts = overId.replace('timeslot-', '').split('-');
      if (parts.length >= 5) {
        const dateString = `${parts[0]}-${parts[1]}-${parts[2]}`;
        const timeString = `${parts[3]}:${parts[4]}`;
        
        const targetDate = parseDateFromId(dateString);
        
        if (!isNaN(targetDate.getTime()) && onTaskMove) {
          onTaskMove(taskId, targetDate, timeString);
        }
      }
    }
  };

  return (
    <GhostPositionContext.Provider value={{ 
      ghostPosition, 
      activeTaskId: activeTask?.id || null 
    }}>
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {children}
        <DragOverlay
          dropAnimation={null}
        >
          {activeTask ? (
            <CustomDragOverlay task={activeTask} />
          ) : null}
        </DragOverlay>
      </DndContext>
    </GhostPositionContext.Provider>
  );
}