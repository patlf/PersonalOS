// Core types for the productivity platform

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  preferences: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  estimatedDuration: number; // in minutes
  status: 'someday' | 'scheduled' | 'completed' | 'overdue';
  scheduledDate?: Date;
  scheduledTime?: string;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  externalId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  source: 'internal' | 'google' | 'outlook' | 'icloud';
  attendees?: string[];
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailMessage {
  id: string;
  userId: string;
  externalId: string;
  threadId: string;
  subject: string;
  sender: EmailAddress;
  recipients: EmailAddress[];
  body: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  source: string;
  attachments: Attachment[];
  internalComments: InternalComment[];
  createdAt: Date;
}

export interface EmailAddress {
  email: string;
  name?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface InternalComment {
  id: string;
  content: string;
  author: User;
  timestamp: Date;
  emailId: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  metadata?: {
    actions?: AIAction[];
    references?: Reference[];
  };
}

export interface AIAction {
  type: 'create_task' | 'schedule_event' | 'summarize_emails';
  payload: unknown;
  status: 'pending' | 'completed' | 'failed';
}

export interface Reference {
  type: 'task' | 'event' | 'email';
  id: string;
  title: string;
}

export interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  isActive: boolean;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  task?: Task;
}

// Task-specific types
export interface CreateTaskInput {
  title: string;
  description?: string;
  estimatedDuration?: number;
  status?: Task['status'];
  scheduledDate?: Date;
  scheduledTime?: string;
  tags?: string[];
  priority?: Task['priority'];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: string;
}

export interface TaskFilters {
  status?: Task['status'][];
  priority?: Task['priority'][];
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface Mailbox {
  id: string;
  name: string;
  type: 'inbox' | 'sent' | 'drafts' | 'trash' | 'custom';
  unreadCount: number;
}

export interface CalendarService {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'icloud';
  isConnected: boolean;
  lastSync?: Date;
}

export interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  isConnected: boolean;
  lastSync?: Date;
}