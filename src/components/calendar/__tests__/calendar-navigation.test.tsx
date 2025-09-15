import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CalendarNavigation } from '../calendar-navigation';

describe('CalendarNavigation', () => {
  const mockProps = {
    viewType: 'week' as const,
    currentDate: new Date('2024-01-15'),
    onViewTypeChange: vi.fn(),
    onDateChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render calendar navigation with title', () => {
    render(<CalendarNavigation {...mockProps} />);
    
    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('should display correct date range for week view', () => {
    render(<CalendarNavigation {...mockProps} />);
    
    // Should show week range (Monday to Sunday)
    expect(screen.getByText(/Jan 15 - Jan 21, 2024/)).toBeInTheDocument();
  });

  it('should display correct date for day view', () => {
    render(
      <CalendarNavigation 
        {...mockProps} 
        viewType="day" 
      />
    );
    
    expect(screen.getByText('Monday, January 15, 2024')).toBeInTheDocument();
  });

  it('should display correct date for month view', () => {
    render(
      <CalendarNavigation 
        {...mockProps} 
        viewType="month" 
      />
    );
    
    expect(screen.getByText('January 2024')).toBeInTheDocument();
  });

  it('should call onDateChange when Today button is clicked', () => {
    render(<CalendarNavigation {...mockProps} />);
    
    fireEvent.click(screen.getByText('Today'));
    
    expect(mockProps.onDateChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('should call onDateChange when previous button is clicked', () => {
    render(<CalendarNavigation {...mockProps} />);
    
    const prevButton = screen.getByRole('button', { name: 'Previous' });
    fireEvent.click(prevButton);
    
    expect(mockProps.onDateChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('should call onDateChange when next button is clicked', () => {
    render(<CalendarNavigation {...mockProps} />);
    
    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);
    
    expect(mockProps.onDateChange).toHaveBeenCalledWith(expect.any(Date));
  });

  it('should show view type selector with current value', () => {
    render(<CalendarNavigation {...mockProps} />);
    
    expect(screen.getByText('Week')).toBeInTheDocument();
  });

  it('should navigate correctly for different view types', () => {
    const { rerender } = render(<CalendarNavigation {...mockProps} />);
    
    // Test week navigation
    const nextButton = screen.getByRole('button', { name: 'Next' });
    fireEvent.click(nextButton);
    
    expect(mockProps.onDateChange).toHaveBeenCalledWith(
      new Date('2024-01-22') // One week later
    );
    
    // Test day navigation
    mockProps.onDateChange.mockClear();
    rerender(<CalendarNavigation {...mockProps} viewType="day" />);
    
    fireEvent.click(nextButton);
    expect(mockProps.onDateChange).toHaveBeenCalledWith(
      new Date('2024-01-16') // One day later
    );
    
    // Test month navigation
    mockProps.onDateChange.mockClear();
    rerender(<CalendarNavigation {...mockProps} viewType="month" />);
    
    fireEvent.click(nextButton);
    expect(mockProps.onDateChange).toHaveBeenCalledWith(
      new Date('2024-02-15') // One month later
    );
  });
});