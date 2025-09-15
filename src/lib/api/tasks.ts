import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/lib/types';

const API_BASE = '/api/tasks';

export class TasksAPI {
  static async getTasks(filters?: TaskFilters): Promise<Task[]> {
    const params = new URLSearchParams();
    
    if (filters?.status && filters.status.length > 0) {
      params.append('status', filters.status[0]); // For now, support single status
    }
    
    if (filters?.priority && filters.priority.length > 0) {
      params.append('priority', filters.priority[0]); // For now, support single priority
    }
    
    if (filters?.tags && filters.tags.length > 0) {
      params.append('tags', filters.tags.join(','));
    }

    const url = params.toString() ? `${API_BASE}?${params}` : API_BASE;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tasks: ${response.statusText}`);
    }
    
    const tasks = await response.json();
    
    // Convert date strings back to Date objects
    return tasks.map((task: any) => ({
      ...task,
      scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    }));
  }

  static async getTask(id: string): Promise<Task> {
    const response = await fetch(`${API_BASE}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch task: ${response.statusText}`);
    }
    
    const task = await response.json();
    
    // Convert date strings back to Date objects
    return {
      ...task,
      scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    };
  }

  static async createTask(input: CreateTaskInput): Promise<Task> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create task');
    }
    
    const task = await response.json();
    
    // Convert date strings back to Date objects
    return {
      ...task,
      scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    };
  }

  static async updateTask(id: string, input: Partial<UpdateTaskInput>): Promise<Task> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update task');
    }
    
    const task = await response.json();
    
    // Convert date strings back to Date objects
    return {
      ...task,
      scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : null,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
    };
  }

  static async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete task');
    }
  }

  static async moveTask(id: string, newDate: Date, newTime?: string): Promise<Task> {
    return this.updateTask(id, {
      scheduledDate: newDate,
      scheduledTime: newTime,
      status: 'scheduled',
    });
  }

  static async duplicateTask(task: Task): Promise<Task> {
    const duplicateInput: CreateTaskInput = {
      title: `${task.title} (Copy)`,
      description: task.description,
      estimatedDuration: task.estimatedDuration,
      priority: task.priority,
      tags: [...task.tags],
      status: 'someday', // Always create duplicates in someday
    };
    
    return this.createTask(duplicateInput);
  }
}