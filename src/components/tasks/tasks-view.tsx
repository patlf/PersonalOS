"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { SomedayColumn } from './someday-column';
import { WeeklyTimeline, WeeklyTimelineRef } from './weekly-timeline';
import { TimeBlockingSidebar } from './time-blocking-sidebar';
import { TaskModal } from './task-modal';
import { EnhancedDndProvider } from '@/components/providers/enhanced-dnd-provider';
import { TasksErrorBoundary } from '@/components/error/error-boundary';
import { TaskLoadingError } from '@/components/error/error-fallback';
import { useTaskStore } from '@/lib/stores/task-store';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useDuplicateTask } from '@/hooks/use-tasks';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useTaskCreateModal } from '@/hooks/use-task-create-modal';
import { useTaskErrorHandling } from '@/hooks/use-error-handling';
import { CreateTaskInput, Task, UpdateTaskInput } from '@/lib/types';
import { showErrorToast, showSuccessToast } from '@/lib/error-handling';
import { isToday } from '@/lib/date-utils';
import { Search, Filter, Plus } from 'lucide-react';

export function TasksView() {
  const { 
    setSelectedTask, 
    getTodayTasks,
    getFilteredTasks,
    currentWeek,
    showPastDays,
    setCurrentWeek,
    togglePastDays,
    error: storeError,
    clearError,
  } = useTaskStore();
  
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<'create' | 'edit'>('create');
  const [isClient, setIsClient] = useState(false);
  const { executeWithErrorHandling } = useTaskErrorHandling();
  const weeklyTimelineRef = useRef<WeeklyTimelineRef>(null);

  // Ensure DND only renders on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { isLoading, error: queryError } = useTasks();
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const duplicateTaskMutation = useDuplicateTask();

  // Combine errors from different sources
  const error = storeError || queryError;

  const filteredTasks = getFilteredTasks();
  
  // Get all tasks for someday column (including overdue and someday tasks)
  const somedayTasks = filteredTasks.filter(task => {
    if (task.status === 'completed') return false;
    
    // Include someday tasks
    if (task.status === 'someday' || (!task.scheduledDate && task.status !== 'completed')) {
      return true;
    }
    
    // Include overdue tasks
    if (task.scheduledDate && task.status !== 'someday') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = new Date(task.scheduledDate);
      taskDate.setHours(0, 0, 0, 0);
      return taskDate < today;
    }
    
    return false;
  });
  // Get today's tasks for the calendar - include all tasks scheduled for today
  const todayTasks = getTodayTasks().filter(task => task.status !== 'completed');

  // Update editing task when the task data changes (e.g., completion status)
  React.useEffect(() => {
    if (editingTask && isTaskModalOpen) {
      const updatedTask = filteredTasks.find(task => task.id === editingTask.id);
      if (updatedTask) {
        setEditingTask(updatedTask);
      }
    }
  }, [filteredTasks, editingTask?.id, isTaskModalOpen]);

  const handleCreateTask = async (input: CreateTaskInput) => {
    const result = await executeWithErrorHandling(async () => {
      await createTaskMutation.mutateAsync(input);
      showSuccessToast('Task created successfully');
    });
    
    if (!result) {
      showErrorToast(new Error('Failed to create task'));
    }
  };

  // Handle task creation from modal
  const handleCreateTaskFromModal = async (input: CreateTaskInput) => {
    const result = await executeWithErrorHandling(async () => {
      await createTaskMutation.mutateAsync(input);
      showSuccessToast('Task created successfully');
    });
    
    if (result) {
      setIsTaskModalOpen(false);
    }
  };

  // Task creation modal
  const {
    isOpen: isCreateModalOpen,
    prefilledDate,
    modalTitle,
    openModal: openCreateModalOriginal,
    closeModal: closeCreateModal,
  } = useTaskCreateModal({ onCreateTask: handleCreateTaskFromModal });

  const openCreateModal = (date?: Date, title?: string) => {
    setTaskModalMode('create');
    setEditingTask(null);
    setIsTaskModalOpen(true);
    openCreateModalOriginal(date, title);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditingTask(task);
    setTaskModalMode('edit');
    setIsTaskModalOpen(true);
  };

  const handleWeekChange = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    if (direction === 'prev') {
      newWeek.setDate(newWeek.getDate() - 1); // Move one day back
    } else {
      newWeek.setDate(newWeek.getDate() + 1); // Move one day forward
    }
    setCurrentWeek(newWeek);
  };

  const goToToday = () => {
    // Use the WeeklyTimeline's goToToday function
    weeklyTimelineRef.current?.goToToday();
  };



  const handleTaskMove = async (taskId: string, newDate: Date, newTime?: string) => {
    console.log('🚀 handleTaskMove called:', { taskId, newDate, newTime });
    await executeWithErrorHandling(async () => {
      // Check if task is being moved to past date (overdue)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const taskDate = new Date(newDate);
      taskDate.setHours(0, 0, 0, 0);
      
      // If moving to today's schedule with a specific time, always use today's date
      if (newTime) {
        console.log('📅 Using today\'s date for timeslot');
        // Always use today when scheduling to a specific time
        newDate = new Date();
        newDate.setHours(0, 0, 0, 0);
      }
      
      const updateData = {
        scheduledDate: newDate,
        scheduledTime: newTime,
        status: 'scheduled' as const,
      };
      
      console.log('💾 Updating task with:', updateData);
      
      await updateTaskMutation.mutateAsync({
        id: taskId,
        input: updateData,
      });
      
      console.log('✅ Task update successful');
      
      if (newTime) {
        showSuccessToast(`Task scheduled for ${newTime} today`);
      } else if (taskDate < today) {
        showSuccessToast('Task moved to overdue');
      } else {
        showSuccessToast('Task scheduled successfully');
      }
    });
  };

  const handleTaskReorder = async (taskId: string, _newIndex: number, dayDate: Date) => {
    await executeWithErrorHandling(async () => {
      // For now, we'll just update the task's order field if it exists
      // In a real implementation, you might want to add an 'order' field to tasks
      await updateTaskMutation.mutateAsync({
        id: taskId,
        input: {
          // You could add an order field here if needed
          scheduledDate: dayDate, // Ensure it stays on the same day
        },
      });
      showSuccessToast('Task reordered');
    });
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<UpdateTaskInput>) => {
    await executeWithErrorHandling(async () => {
      await updateTaskMutation.mutateAsync({ id: taskId, input: updates });
      showSuccessToast('Task updated successfully');
    });
  };

  const handleToggleComplete = async (taskId: string, completed: boolean) => {
    await executeWithErrorHandling(async () => {
      // Find the current task to preserve its scheduled date
      const currentTask = filteredTasks.find(task => task.id === taskId);
      
      let updateInput: Partial<UpdateTaskInput>;
      
      if (completed) {
        // When completing a task, move it to today and mark as completed
        const today = new Date();
        updateInput = {
          status: 'completed',
          scheduledDate: today,
          // Preserve scheduled time if it exists
          scheduledTime: currentTask?.scheduledTime
        };
      } else {
        // When uncompleting, restore to appropriate status based on scheduled date
        let newStatus: Task['status'];
        if (currentTask?.scheduledDate) {
          newStatus = 'scheduled';
        } else {
          newStatus = 'someday';
        }
        
        updateInput = {
          status: newStatus
          // Keep the current scheduledDate and scheduledTime
        };
      }
      
      await updateTaskMutation.mutateAsync({ 
        id: taskId, 
        input: updateInput
      });
      showSuccessToast(completed ? 'Task completed!' : 'Task marked as incomplete');
    });
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setTaskModalMode('edit');
    setIsTaskModalOpen(true);
  };

  const handleTaskSave = async (taskId: string, updates: Partial<UpdateTaskInput>) => {
    const result = await executeWithErrorHandling(async () => {
      await updateTaskMutation.mutateAsync({ id: taskId, input: updates });
      showSuccessToast('Task updated successfully');
    });
    
    if (result) {
      setEditingTask(null);
      setIsTaskModalOpen(false);
    }
  };

  const handleTaskDuplicate = async (task: Task) => {
    await executeWithErrorHandling(async () => {
      await duplicateTaskMutation.mutateAsync(task);
      showSuccessToast('Task duplicated successfully');
    });
  };

  const handleTaskDelete = async (task: Task) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await executeWithErrorHandling(async () => {
        await deleteTaskMutation.mutateAsync(task.id);
        showSuccessToast('Task deleted successfully');
      });
    }
  };

  const handleSendToSomeday = async (task: Task) => {
    await executeWithErrorHandling(async () => {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        input: {
          status: 'someday',
          scheduledDate: undefined,
          scheduledTime: undefined,
        },
      });
      showSuccessToast('Task moved to Someday');
    });
  };

  const handleQuickTaskCreate = () => {
    // Open the task creation modal instead of focusing on someday input
    openCreateModal();
  };

  const handleGlobalSearch = () => {
    // Focus on the search input in the task search filter
    const searchInput = document.querySelector('[data-testid="task-search-input"]') as HTMLInputElement;
    if (searchInput) {
      searchInput.focus();
      searchInput.select(); // Select all text for easy replacement
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Enable keyboard shortcuts for task management
  useKeyboardShortcuts({
    enableTaskShortcuts: true,
    enableWeekNavigation: true,
    onQuickTaskCreate: handleQuickTaskCreate,
    onTogglePastDays: togglePastDays,
    onWeekChange: handleWeekChange,
    onGlobalSearch: handleGlobalSearch,
  });

  if (error) {
    return (
      <TaskLoadingError 
        onRetry={() => {
          clearError();
          window.location.reload();
        }} 
      />
    );
  }

  // Show loading state until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="flex h-full bg-muted/30">
        <div className="w-80 border-r border-border bg-card/50 h-full animate-pulse">
          <div className="p-4 space-y-4">
            <div className="h-6 bg-muted rounded"></div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col min-w-0 h-full">
          <div className="p-4 border-b border-border bg-card/50">
            <div className="h-6 bg-muted rounded w-32"></div>
          </div>
          <div className="flex-1 p-4">
            <div className="grid grid-cols-7 gap-4 h-full">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-32 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-80 border-l border-border bg-card/50 h-full animate-pulse">
          <div className="p-4 space-y-4">
            <div className="h-6 bg-muted rounded"></div>
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-8 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <TasksErrorBoundary>
      <EnhancedDndProvider 
        onTaskMove={handleTaskMove} 
        onTaskUpdate={handleTaskUpdate} 
        onTaskReorder={handleTaskReorder}
      >
        <div className="flex h-full bg-muted/30">
          {/* Column 1: Someday */}
          <div className="w-80 border-r border-border bg-card/50 h-full">
            <SomedayColumn
              tasks={somedayTasks}
              onOpenCreateModal={openCreateModal}
              onTaskClick={handleTaskClick}
              onToggleComplete={handleToggleComplete}
              isLoading={isLoading}
            />
          </div>

          {/* Column 2: Tasks */}
          <div className="flex-1 flex flex-col min-w-0 h-full">
            {/* Header */}
            <div className="p-4 border-b border-border bg-card/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-foreground">Timeline</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openCreateModal()}
                    className="flex items-center gap-2 text-xs px-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950 dark:hover:text-blue-400 dark:hover:border-blue-800"
                    title="Add Task (⌘K)"
                  >
                    <Plus className="h-3 w-3" />
                    Add Task
                    <span className="text-xs text-muted-foreground ml-1">⌘K</span>
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <Filter className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  

                  
                  {/* Today Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="text-xs px-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-950 dark:hover:text-blue-400 dark:hover:border-blue-800"
                  >
                    Today
                  </Button>
                  
                  {/* Scroll Hint */}
                  <div className="text-xs text-muted-foreground hidden lg:block">
                    Scroll to navigate
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks Content */}
            <div className="flex-1 min-w-0">
              <WeeklyTimeline
                ref={weeklyTimelineRef}
                tasks={filteredTasks}
                currentWeek={currentWeek}
                onWeekChange={handleWeekChange}
                onTaskMove={handleTaskMove}
                onTaskReorder={handleTaskReorder}
                onOpenCreateModal={openCreateModal}
                onToggleComplete={handleToggleComplete}
                showPastDays={showPastDays}
                onTogglePastDays={togglePastDays}
                onTaskClick={handleTaskClick}
                hideNavigation={true}
                onGoToToday={goToToday}
              />
            </div>
          </div>

          {/* Column 3: Time Blocking Sidebar */}
          <div className="w-80 border-l border-border bg-card/50 h-full">
            <TimeBlockingSidebar
              todayTasks={todayTasks}
              onTaskClick={handleTaskClick}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        </div>

        {/* Unified Task Modal */}
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
            closeCreateModal();
          }}
          task={taskModalMode === 'edit' ? editingTask : null}
          onSubmit={taskModalMode === 'create' ? handleCreateTaskFromModal : undefined}
          onSave={taskModalMode === 'edit' ? handleTaskSave : undefined}
          onToggleComplete={handleToggleComplete}
          onDuplicate={handleTaskDuplicate}
          onDelete={handleTaskDelete}
          onSendToSomeday={handleSendToSomeday}
          prefilledDate={prefilledDate}
          title={modalTitle}
          isLoading={updateTaskMutation.isPending || createTaskMutation.isPending}
        />
      </EnhancedDndProvider>
    </TasksErrorBoundary>
  );
}