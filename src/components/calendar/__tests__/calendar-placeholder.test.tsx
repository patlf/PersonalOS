import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalendarPlaceholder } from '../calendar-placeholder';

describe('CalendarPlaceholder', () => {
  it('should render coming soon message', () => {
    render(<CalendarPlaceholder />);
    
    expect(screen.getByText('Calendar Coming Soon')).toBeInTheDocument();
    expect(screen.getByText(/We're building a powerful calendar integration/)).toBeInTheDocument();
  });

  it('should display feature list', () => {
    render(<CalendarPlaceholder />);
    
    expect(screen.getByText('Sync with Google, Outlook, and iCloud calendars')).toBeInTheDocument();
    expect(screen.getByText('Drag tasks directly into calendar time slots')).toBeInTheDocument();
    expect(screen.getByText('View tasks and events together in one place')).toBeInTheDocument();
    expect(screen.getByText('Day, week, and month view options')).toBeInTheDocument();
  });

  it('should show expected availability timeline', () => {
    render(<CalendarPlaceholder />);
    
    expect(screen.getByText('Expected availability: Q2 2025')).toBeInTheDocument();
  });

  it('should mention navigation functionality', () => {
    render(<CalendarPlaceholder />);
    
    expect(screen.getByText(/The navigation and view controls above are fully functional/)).toBeInTheDocument();
  });

  it('should have proper structure', () => {
    render(<CalendarPlaceholder />);
    
    // Check that the component renders without errors
    expect(screen.getByText('Calendar Coming Soon')).toBeInTheDocument();
  });
});