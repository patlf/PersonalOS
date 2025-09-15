import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { 
  ErrorFallback, 
  TaskLoadingError, 
  TaskSaveError, 
  CalendarSyncError,
  EmailSyncError,
  NetworkError 
} from '../error-fallback';

describe('ErrorFallback', () => {
  it('renders with default props', () => {
    render(<ErrorFallback />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
  });

  it('renders with custom title and message', () => {
    render(
      <ErrorFallback
        title="Custom Error"
        message="Custom error message"
      />
    );

    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('shows retry button when resetError is provided', () => {
    const resetError = vi.fn();

    render(<ErrorFallback resetError={resetError} />);

    const retryButton = screen.getByText('Try Again');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(resetError).toHaveBeenCalled();
  });

  it('hides retry button when showRetry is false', () => {
    const resetError = vi.fn();

    render(<ErrorFallback resetError={resetError} showRetry={false} />);

    expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
  });

  it('shows go back button when enabled', () => {
    const onGoBack = vi.fn();

    render(<ErrorFallback showGoBack={true} onGoBack={onGoBack} />);

    const goBackButton = screen.getByText('Go Back');
    expect(goBackButton).toBeInTheDocument();

    fireEvent.click(goBackButton);
    expect(onGoBack).toHaveBeenCalled();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Test error message');

    render(<ErrorFallback error={error} />);

    expect(screen.getByText('Error Details')).toBeInTheDocument();
    
    // Click to expand details
    fireEvent.click(screen.getByText('Error Details'));
    expect(screen.getByText('Test error message')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Test error message');

    render(<ErrorFallback error={error} />);

    expect(screen.queryByText('Error Details')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('TaskLoadingError', () => {
  it('renders task-specific error message', () => {
    render(<TaskLoadingError />);

    expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    expect(screen.getByText(/We couldn't load your tasks/)).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = vi.fn();

    render(<TaskLoadingError onRetry={onRetry} />);

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalled();
  });
});

describe('TaskSaveError', () => {
  it('renders task save error message', () => {
    render(<TaskSaveError />);

    expect(screen.getByText('Failed to save task')).toBeInTheDocument();
    expect(screen.getByText(/Your task couldn't be saved/)).toBeInTheDocument();
  });

  it('shows both retry and cancel buttons when provided', () => {
    const onRetry = vi.fn();
    const onCancel = vi.fn();

    render(<TaskSaveError onRetry={onRetry} onCancel={onCancel} />);

    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Go Back')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Try Again'));
    expect(onRetry).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Go Back'));
    expect(onCancel).toHaveBeenCalled();
  });
});

describe('CalendarSyncError', () => {
  it('renders calendar sync error message', () => {
    render(<CalendarSyncError />);

    expect(screen.getByText('Calendar sync failed')).toBeInTheDocument();
    expect(screen.getByText(/We couldn't sync your calendar/)).toBeInTheDocument();
  });
});

describe('EmailSyncError', () => {
  it('renders email sync error message', () => {
    render(<EmailSyncError />);

    expect(screen.getByText('Email sync failed')).toBeInTheDocument();
    expect(screen.getByText(/We couldn't sync your emails/)).toBeInTheDocument();
  });
});

describe('NetworkError', () => {
  it('renders network error message', () => {
    render(<NetworkError />);

    expect(screen.getByText('Connection problem')).toBeInTheDocument();
    expect(screen.getByText(/Please check your internet connection/)).toBeInTheDocument();
  });
});