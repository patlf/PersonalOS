import { create } from 'zustand';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  source: 'internal' | 'google' | 'outlook' | 'icloud';
  attendees?: string[];
  location?: string;
}

export interface CalendarService {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'icloud';
  isConnected: boolean;
  lastSync?: Date;
}

export interface CalendarStore {
  events: CalendarEvent[];
  viewType: 'day' | 'week' | 'month';
  currentDate: Date;
  connectedServices: CalendarService[];
  
  // Actions
  syncCalendars: () => Promise<void>;
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  setViewType: (type: 'day' | 'week' | 'month') => void;
  setCurrentDate: (date: Date) => void;
}

export const useCalendarStore = create<CalendarStore>((set) => ({
  events: [
    // Sample events for demonstration
    {
      id: '1',
      title: 'Team Standup',
      description: 'Daily team standup meeting',
      startTime: new Date(new Date().setHours(9, 0, 0, 0)),
      endTime: new Date(new Date().setHours(9, 30, 0, 0)),
      source: 'google',
      attendees: ['team@company.com'],
      location: 'Conference Room A',
    },
    {
      id: '2',
      title: 'Product Review',
      description: 'Weekly product review session',
      startTime: new Date(new Date().setHours(14, 0, 0, 0)),
      endTime: new Date(new Date().setHours(15, 30, 0, 0)),
      source: 'outlook',
      attendees: ['product@company.com'],
    },
    {
      id: '3',
      title: 'Client Call',
      description: 'Call with important client',
      startTime: new Date(new Date(Date.now() + 24 * 60 * 60 * 1000).setHours(10, 0, 0, 0)),
      endTime: new Date(new Date(Date.now() + 24 * 60 * 60 * 1000).setHours(11, 0, 0, 0)),
      source: 'internal',
      location: 'Zoom',
    },
  ],
  viewType: 'week',
  currentDate: new Date(),
  connectedServices: [],

  syncCalendars: async () => {
    // Placeholder for calendar sync functionality
    console.log('Calendar sync not yet implemented');
  },

  addEvent: (event) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: crypto.randomUUID(),
    };
    set((state) => ({
      events: [...state.events, newEvent],
    }));
  },

  updateEvent: (id, updates) => {
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...updates } : event
      ),
    }));
  },

  setViewType: (viewType) => {
    set({ viewType });
  },

  setCurrentDate: (currentDate) => {
    set({ currentDate });
  },
}));