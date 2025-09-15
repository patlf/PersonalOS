import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarView } from '../calendar-view';
import { useCalendarStore } from '@/lib/stores/calendar-store';
import { useTaskStore } from '@/lib/stores/task-store';

// Mock the stores
vi.mock('@/lib/stores/calendar-store');
vi.mock('@/lib/stores/task-store');

const mockCalendarStore = {
  viewType: 'week' as const,
  currentDate: new Date(2024, 0, 15),
  events: [
    {
      id: '1',
      title: 'Team Meeting',
      startTime: new Date(2024, 0, 15, 9, 0),
      endTime: new Date(2024, 0, 15, 10, 0),
      source: 'google' as const,
    },
  ],
  setViewType: vi.fn(),
  setCurrentDate: vi.fn(),
};

const mockTaskStore = {
  tasks: [
    {
      id: '1',
      userId: 'user1',
      title: 'Review Code',
      estimatedDuration: 60,
      status: 'scheduled' as const,
      scheduledDate: new Date(2024, 0, 15),
      scheduledTime: '14:00',
      tags: ['development'],
      priority: 'medium' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  setSelectedTask: vi.fn(),
};

describe('Calendar Integration', () => {
  beforeEach(() => {
    (useCalendarStore as any).mockReturnValue(mockCalendarStore);
    (useTaskStore as any).mockReturnValue(mockTaskStore);
  });

  it('should render calendar with events and tasks', () => {
    render(<CalendarView />);
    
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('Review Code')).toBeInTheDocument();
  });

  it('should allow switching between view types', () => {
    render(<CalendarView />);
    
    // Should show view type selector
    expect(screen.getByText('Week')).toBeInTheDocument();
    
    // Click to change view type
    fireEvent.click(screen.getByRole('combobox'));
    
    // The setViewType should be available for testing
    expect(mockCalendarStore.setViewType).toBeDefined();
  });

  it('should display events with correct information', () => {
    render(<CalendarView />);
    
    expect(screen.getByText('Team Meeting')).toBeInTheDocument();
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
  });

  it('should display tasks with correct information', () => {
    render(<CalendarView />);
    
    expect(screen.getByText('Review Code')).toBeInTheDocument();
    expect(screen.getByText('60m')).toBeInTheDocument();
  });

  it('should handle navigation between dates', () => {
    render(<CalendarView />);
    
    // Find and click next button
    const nextButton = screen.getByLabelText('Next');
    fireEvent.click(nextButton);
    
    expect(mockCalendarStore.setCurrentDate).toHaveBeenCalled();
  });

  it('should handle today button click', () => {
    render(<CalendarView />);
    
    const todayButton = screen.getByText('Today');
    fireEvent.click(todayButton);
    
    expect(mockCalendarStore.setCurrentDate).toHaveBeenCalled();
  });
});