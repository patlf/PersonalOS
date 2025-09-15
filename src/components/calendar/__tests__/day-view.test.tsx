import { render, screen, fireEvent } from '@testing-library/react';
import { DayView } from '../day-view';
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
    scheduledDate: new Date(2024, 0, 15),
    scheduledTime: '14:00',
    tags: ['development'],
    priority: 'high',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('DayView', () => {
  const defaultProps = {
    date: new Date(2024, 0, 15),
    events: mockEvents,
    tasks: mockTasks,
  };

  it('renders day view with correct date', () => {
    render(<DayView {...defaultProps} />);
    
    expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
  });

  it('displays events in correct time slots', () => {
    render(<DayView {...defaultProps} />);
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM - 10:00 AM')).toBeInTheDocument();
    expect(screen.getByText('Conference Room A')).toBeInTheDocument();
  });

  it('displays tasks in correct time slots', () => {
    render(<DayView {...defaultProps} />);
    
    expect(screen.getByText('Review Code')).toBeInTheDocument();
    expect(screen.getByText('60m')).toBeInTheDocument();
  });

  it('calls onEventClick when event is clicked', () => {
    const onEventClick = vi.fn();
    render(<DayView {...defaultProps} onEventClick={onEventClick} />);
    
    fireEvent.click(screen.getByText('Team Meeting'));
    expect(onEventClick).toHaveBeenCalledWith(mockEvents[0]);
  });

  it('calls onTaskClick when task is clicked', () => {
    const onTaskClick = vi.fn();
    render(<DayView {...defaultProps} onTaskClick={onTaskClick} />);
    
    fireEvent.click(screen.getByText('Review Code'));
    expect(onTaskClick).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('calls onTimeSlotClick when empty time slot is clicked', () => {
    const onTimeSlotClick = vi.fn();
    render(<DayView {...defaultProps} onTimeSlotClick={onTimeSlotClick} />);
    
    // Click on an empty time slot (8 AM)
    const timeSlot = screen.getByText('8 AM').closest('div');
    fireEvent.click(timeSlot!);
    
    expect(onTimeSlotClick).toHaveBeenCalledWith(defaultProps.date, 8);
  });

  it('shows today badge for current date', () => {
    const today = new Date();
    render(<DayView {...defaultProps} date={today} />);
    
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('displays task tags correctly', () => {
    render(<DayView {...defaultProps} />);
    
    expect(screen.getByText('development')).toBeInTheDocument();
  });

  it('shows event source badge', () => {
    render(<DayView {...defaultProps} />);
    
    expect(screen.getByText('google')).toBeInTheDocument();
  });
});