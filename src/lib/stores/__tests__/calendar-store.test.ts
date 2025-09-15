import { describe, it, expect, beforeEach } from 'vitest';
import { useCalendarStore } from '../calendar-store';

describe('Calendar Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCalendarStore.setState({
      events: [],
      viewType: 'week',
      currentDate: new Date('2024-01-15'),
      connectedServices: [],
    });
  });

  it('should initialize with default values', () => {
    const state = useCalendarStore.getState();
    
    expect(state.events).toEqual([]);
    expect(state.viewType).toBe('week');
    expect(state.connectedServices).toEqual([]);
    expect(state.currentDate).toBeInstanceOf(Date);
  });

  it('should set view type', () => {
    const { setViewType } = useCalendarStore.getState();
    
    setViewType('day');
    expect(useCalendarStore.getState().viewType).toBe('day');
    
    setViewType('month');
    expect(useCalendarStore.getState().viewType).toBe('month');
  });

  it('should set current date', () => {
    const { setCurrentDate } = useCalendarStore.getState();
    const newDate = new Date('2024-02-20');
    
    setCurrentDate(newDate);
    expect(useCalendarStore.getState().currentDate).toEqual(newDate);
  });

  it('should add event', () => {
    const { addEvent } = useCalendarStore.getState();
    const eventData = {
      title: 'Test Event',
      description: 'Test Description',
      startTime: new Date('2024-01-15T10:00:00'),
      endTime: new Date('2024-01-15T11:00:00'),
      source: 'internal' as const,
    };
    
    addEvent(eventData);
    
    const state = useCalendarStore.getState();
    expect(state.events).toHaveLength(1);
    expect(state.events[0]).toMatchObject(eventData);
    expect(state.events[0].id).toBeDefined();
  });

  it('should update event', () => {
    const { addEvent, updateEvent } = useCalendarStore.getState();
    
    // Add an event first
    addEvent({
      title: 'Original Title',
      startTime: new Date('2024-01-15T10:00:00'),
      endTime: new Date('2024-01-15T11:00:00'),
      source: 'internal',
    });
    
    const eventId = useCalendarStore.getState().events[0].id;
    
    // Update the event
    updateEvent(eventId, { title: 'Updated Title' });
    
    const state = useCalendarStore.getState();
    expect(state.events[0].title).toBe('Updated Title');
  });

  it('should handle sync calendars placeholder', async () => {
    const { syncCalendars } = useCalendarStore.getState();
    
    // Should not throw error
    await expect(syncCalendars()).resolves.toBeUndefined();
  });
});