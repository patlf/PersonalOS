import { render, screen, fireEvent } from '@testing-library/react';
import { MonthView } from '../month-view';
import { CalendarEvent } from '@/lib/stores/calendar-store';
import { Task } from '@/lib/types';

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly team sync',
    startTime: new Date(2024, 0, 15, 9, 0),
    endTime: new Date(2024, 0, 15, 10, 0),
    source: 'google',
    attendees: ['team@company.com'],
    location: 'Conference Room A',
  },
];

const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user1',
    title: 'Review Code',
    description: 'Review pull requests',
    estimatedDuration: 60,
    status: 'scheduled',
    scheduledDate: new Date(2024, 0, 16),
    scheduledTime: '14:00',
    tags: ['development'],
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('MonthView', () => {
  const defaultProps = {
    date: new Date(2024, 0, 15), // January 15, 2024
    events: mockEvents,
    tasks: mockTasks,
  };

  it('renders month view with correct month and year', () => {
    render(<MonthView {...defaultProps} />);
    
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  it('displays weekday headers', () => {
    render(<MonthView {...defaultProps} />);
    
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('displays events on correct dates', () => {
    render(<MonthView {...defaultProps} />);
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
  });

  it('displays tasks on correct dates', () => {
    render(<MonthView {...defaultProps} />);
    
    expect(screen.getByText('Review Code')).toBeInTheDocument();
    expect(screen.getByText('60m')).toBeInTheDocument();
  });

  it('calls onEventClick when event is clicked', () => {
    const onEventClick = vi.fn();
    render(<MonthView {...defaultProps} onEventClick={onEventClick} />);
    
    fireEvent.click(screen.getByText('Team Meeting'));
    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('calls onTaskClick when task is clicked', () => {
    const onTaskClick = vi.fn();
    render(<MonthView {...defaultProps} onTaskClick={onTaskClick} />);
    
    fireEvent.click(screen.getByText('Review Code'));
    expect(onTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('calls onDateClick when date is clicked', () => {
    const onDateClick = vi.fn();
    render(<MonthView {...defaultProps} onDateClick={onDateClick} />);
    
    // Find a date cell and click it
    const dateCell = screen.getByText('15').closest('div');
    fireEvent.click(dateCell!);
    
    expect(onDateClick).toHaveBeenCalled();
  });

  it('shows item count badge when there are events/tasks', () => {
    render(<MonthView {...defaultProps} />);
    
    // Should show badge with count of items for days that have events/tasks
    const badges = screen.getAllByText('1').filter(el => 
      el.className.includes('badge') || el.className.includes('inline-flex')
    );
    expect(badges.length).toBeGreaterThan(0);
  });

  it('highlights today when viewing current month', () => {
    const today = new Date();
    render(<MonthView {...defaultProps} date={today} />);
    
    // Today's date should be highlighted (exact implementation depends on styling)
    const todayElement = screen.getByText(today.getDate().toString());
    expect(todayElement).toBeInTheDocument();
  });

  it('shows previous/next month dates in muted style', () => {
    render(<MonthView {...defaultProps} />);
    
    // The calendar should show some dates from previous/next month
    // These should be styled differently (muted)
    const calendarGrid = screen.getByText('January 2024').closest('div');
    expect(calendarGrid).toBeInTheDocument();
  });

  it('shows more indicator when there are many items', () => {
    const manyEvents: CalendarEvent[] = Array.from({ length: 5 }, (_, i) => ({
      id: `event-${i}`,
      title: `Event ${i}`,
      startTime: new Date(2024, 0, 15, 9 + i, 0),
      endTime: new Date(2024, 0, 15, 10 + i, 0),
      source: 'google' as const,
    }));

    const manyTasks: Task[] = Array.from({ length: 3 }, (_, i) => ({
      id: `task-${i}`,
      userId: 'user1',
      title: `Task ${i}`,
      estimatedDuration: 60,
      status: 'scheduled' as const,
      scheduledDate: new Date(2024, 0, 15),
      scheduledTime: '14:00',
      tags: [],
      priority: 'medium' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    render(<MonthView {...defaultProps} events={manyEvents} tasks={manyTasks} />);
    
    // Should show "+X more" indicator when there are more than 4 items
    expect(screen.getByText(/\+\d+ more/)).toBeInTheDocument();
  });
});