import { render, screen, fireEvent } from '@testing-library/react';
import { WeekView } from '../week-view';
import { CalendarEvent } from '@/lib/stores/calendar-store';
import { Task } from '@/lib/types';

const mockEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    description: 'Weekly team sync',
    startTime: new Date(2024, 0, 15, 9, 0), // Monday
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
    scheduledDate: new Date(2024, 0, 16), // Tuesday
    scheduledTime: '14:00',
    tags: ['development'],
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('WeekView', () => {
  const defaultProps = {
    date: new Date(2024, 0, 15), // Monday, January 15, 2024
    events: mockEvents,
    tasks: mockTasks,
  };

  it('renders week view with correct days', () => {
    render(<WeekView {...defaultProps} />);
    
    // Check that all weekdays are displayed
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('displays events in correct day and time', () => {
    render(<WeekView {...defaultProps} />);
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
  });

  it('displays tasks in correct day and time', () => {
    render(<WeekView {...defaultProps} />);
    
    expect(screen.getByText('Review Code')).toBeInTheDocument();
    expect(screen.getByText('60m')).toBeInTheDocument();
  });

  it('highlights today column', () => {
    const today = new Date();
    render(<WeekView {...defaultProps} date={today} />);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('calls onEventClick when event is clicked', () => {
    const onEventClick = vi.fn();
    render(<WeekView {...defaultProps} onEventClick={onEventClick} />);
    
    fireEvent.click(screen.getByText('Team Meeting'));
    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('calls onTaskClick when task is clicked', () => {
    const onTaskClick = vi.fn();
    render(<WeekView {...defaultProps} onTaskClick={onTaskClick} />);
    
    fireEvent.click(screen.getByText('Review Code'));
    expect(onTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('displays time labels correctly', () => {
    render(<WeekView {...defaultProps} />);
    
    expect(screen.getByText('9 AM')).toBeInTheDocument();
    expect(screen.getByText('2 PM')).toBeInTheDocument();
  });

  it('shows correct day numbers', () => {
    render(<WeekView {...defaultProps} />);
    
    // The week starting Monday Jan 15, 2024 should show 15, 16, 17, 18, 19, 20, 21
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('16')).toBeInTheDocument();
    expect(screen.getByText('17')).toBeInTheDocument();
  });
});