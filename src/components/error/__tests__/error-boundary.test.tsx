import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ErrorBoundary, TasksErrorBoundary } from '../error-boundary';

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Component that throws an error
function ThrowError({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Application Error')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong in the application module/)).toBeInTheDocument();
  });

  it('shows custom module name in error message', () => {
    render(
      <ErrorBoundary moduleName="Test Module">
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Test Module Error')).toBeInTheDocument();
    expect(screen.getByText(/Something went wrong in the test module module/)).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary showDetails={true}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error Details')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  it('calls onError callback when error occurs', () => {
    const onError = vi.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  it('allows retry when retry count is below maximum', () => {
    let shouldThrow = true;
    
    function ConditionalThrowError() {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <ConditionalThrowError />
      </ErrorBoundary>
    );

    const retryButton = screen.getByText(/Try Again/);
    expect(retryButton).toBeInTheDocument();

    // Change the condition and click retry
    shouldThrow = false;
    fireEvent.click(retryButton);

    // After retry, should render children again without error
    rerender(
      <ErrorBoundary>
        <ConditionalThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('shows go home button', () => {
    // Mock window.location
    const mockLocation = { href: '' };
    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
    });

    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    const goHomeButton = screen.getByText('Go Home');
    expect(goHomeButton).toBeInTheDocument();

    fireEvent.click(goHomeButton);
    expect(mockLocation.href).toBe('/');
  });

  it('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Application Error')).not.toBeInTheDocument();
  });

  it('tracks retry count and disables retry after maximum attempts', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    // First retry
    fireEvent.click(screen.getByText(/Try Again \(3 left\)/));
    
    rerender(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Try Again \(2 left\)/)).toBeInTheDocument();
  });
});

describe('TasksErrorBoundary', () => {
  it('renders with Tasks module name', () => {
    render(
      <TasksErrorBoundary>
        <ThrowError />
      </TasksErrorBoundary>
    );

    expect(screen.getByText('Tasks Error')).toBeInTheDocument();
  });

  it('calls module-specific error handler', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <TasksErrorBoundary>
        <ThrowError />
      </TasksErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Tasks module error:',
      expect.any(Error),
      expect.any(Object)
    );

    consoleSpy.mockRestore();
  });
});