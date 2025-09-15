import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { TasksAPI } from '@/lib/api/tasks';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/lib/types';
import { useTaskStore } from '@/lib/stores/task-store';
import { AppError } from '@/lib/error-handling';

const TASKS_QUERY_KEY = 'tasks';

export function useTasks(filters?: TaskFilters) {
  const { setTasks, setLoading, setError } = useTaskStore();

  const query = useQuery({
    queryKey: [TASKS_QUERY_KEY, filters],
    queryFn: () => TasksAPI.getTasks(filters),
  });

  // Handle side effects
  React.useEffect(() => {
    if (query.data) {
      setTasks(query.data);
      setError(undefined);
    }
    if (query.error) {
      setError(new AppError(query.error.message, 'FETCH_ERROR'));
    }
    setLoading(query.isLoading);
  }, [query.data, query.error, query.isLoading, setTasks, setError, setLoading]);

  return query;
}

export function useTask(id: string) {
  return useQuery({
    queryKey: [TASKS_QUERY_KEY, id],
    queryFn: () => TasksAPI.getTask(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const { addTask } = useTaskStore();

  return useMutation({
    mutationFn: TasksAPI.createTask,
    onSuccess: (newTask) => {
      // Update the store
      addTask(newTask);
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error('Failed to create task:', error);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const { updateTask } = useTaskStore();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<UpdateTaskInput> }) =>
      TasksAPI.updateTask(id, input),
    onSuccess: (updatedTask) => {
      // Update the store
      updateTask(updatedTask.id, updatedTask);
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error('Failed to update task:', error);
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const { deleteTask } = useTaskStore();

  return useMutation({
    mutationFn: TasksAPI.deleteTask,
    onSuccess: (_, taskId) => {
      // Update the store
      deleteTask(taskId);
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete task:', error);
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();
  const { moveTask } = useTaskStore();

  return useMutation({
    mutationFn: ({ id, newDate, newTime }: { id: string; newDate: Date; newTime?: string }) =>
      TasksAPI.moveTask(id, newDate, newTime),
    onSuccess: (updatedTask) => {
      // Update the store
      moveTask(updatedTask.id, updatedTask.scheduledDate!, updatedTask.scheduledTime || undefined);
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error('Failed to move task:', error);
    },
  });
}

export function useDuplicateTask() {
  const queryClient = useQueryClient();
  const { addTask } = useTaskStore();

  return useMutation({
    mutationFn: TasksAPI.duplicateTask,
    onSuccess: (duplicatedTask) => {
      // Update the store
      addTask(duplicatedTask);
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY] });
    },
    onError: (error: Error) => {
      console.error('Failed to duplicate task:', error);
    },
  });
}