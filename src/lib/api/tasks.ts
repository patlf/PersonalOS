import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/lib/types';

// Helper function to parse dates safely, avoiding timezone issues
function parseDateSafely(dateString: string): Date {
  // If it's already a Date object, return it
  if (dateString instanceof Date) {
    const normalized = new Date(dateString);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }
  
  // If it's an ISO string (YYYY-MM-DDTHH:mm:ss.sssZ), parse it and normalize
  if (typeof dateString === 'string' && dateString.includes('T')) {
    const date = new Date(dateString);
    date.setHours(0, 0, 0, 0);
    return date;
  }
  
  // If it's a date-only string (YYYY-MM-DD), parse it in local timezone
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }
  
  // Fallback to normal Date parsing with normalization
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date;
}

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
    
    // Convert date strings back to Date objects, handling timezone properly
    return tasks.map((task: any) => ({
      ...task,
      scheduledDate: task.scheduledDate ? parseDateSafely(task.scheduledDate) : null,
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
    
    // Convert date strings back to Date objects, handling timezone properly
    return {
      ...task,
      scheduledDate: task.scheduledDate ? parseDateSafely(task.scheduledDate) : null,
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
    
    // Convert date strings back to Date objects, handling timezone properly
    return {
      ...task,
      scheduledDate: task.scheduledDate ? parseDateSafely(task.scheduledDate) : null,
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
    
    // Convert date strings back to Date objects, handling timezone properly
    return {
      ...task,
      scheduledDate: task.scheduledDate ? parseDateSafely(task.scheduledDate) : null,
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