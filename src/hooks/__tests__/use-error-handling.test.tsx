import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  useErrorHandling, 
  useTaskErrorHandling, 
  useCalendarErrorHandling,
  useEmailErrorHandling,
  useAIErrorHandling 
} from '../use-error-handling';
import { AppError, ERROR_CODES } from '@/lib/error-handling';

// Mock the error handling utilities
vi.mock('@/lib/error-handling', async () => {
  const actual = await vi.importActual('@/lib/error-handling');
  return {
    ...actual,
    showErrorToast: vi.fn(),
    withRetry: vi.fn((operation) => operation()),
    handleAPIError: vi.fn((error) => error instanceof AppError ? error : new AppError(error.message, 'UNKNOWN_ERROR')),
  };
});

describe('useErrorHandling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with no error', () => {
    const { result } = renderHook(() => useErrorHandling());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isRetrying).toBe(false);
  });

  it('handles errors and sets error state', () => {
    const { result } = renderHook(() => useErrorHandling());
    const testError = new Error('Test error');
    
    act(() => {
      result.current.handleError(testError);
    });
    
    expect(result.current.error).toBeInstanceOf(AppError);
    expect(result.current.error?.message).toBe('Test error');
  });

  it('clears error state', () => {
    const { result } = renderHook(() => useErrorHandling());
    
    act(() => {
      result.current.handleError(new Error('Test error'));
    });
    
    expect(result.current.error).not.toBeNull();
    
    act(() => {
      result.current.clearError();
    });
    
    expect(result.current.error).toBeNull();
  });

  it('calls onError callback when provided', () => {
    const onError = vi.fn();
    const { result } = renderHook(() => useErrorHandling({ onError }));
    const testError = new Error('Test error');
    
    act(() => {
      result.current.handleError(testError);
    });
    
    expect(onError).toHaveBeenCalledWith(expect.any(AppError));
  });

  it('executes operation with error handling', async () => {
    const { result } = renderHook(() => useErrorHandling());
    const operation = vi.fn().mockResolvedValue('success');
    
    let operationResult: any;
    await act(async () => {
      operationResult = await result.current.executeWithErrorHandling(operation);
    });
    
    expect(operationResult).toBe('success');
    expect(operation).toHaveBeenCalled();
    expect(result.current.error).toBeNull();
  });

  it('handles operation failure', async () => {
    const { result } = renderHook(() => useErrorHandling());
    const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));
    
    let operationResult: any;
    await act(async () => {
      operationResult = await result.current.executeWithErrorHandling(operation);
    });
    
    expect(operationResult).toBeNull();
    expect(result.current.error).toBeInstanceOf(AppError);
  });

  it('sets retry state during retry operation', async () => {
    const { result } = renderHook(() => useErrorHandling());
    const operation = vi.fn().mockResolvedValue('success');
    
    let operationPromise: Promise<any>;
    act(() => {
      operationPromise = result.current.executeWithRetry(operation);
    });
    
    expect(result.current.isRetrying).toBe(true);
    
    await act(async () => {
      await operationPromise;
    });
    
    expect(result.current.isRetrying).toBe(false);
  });

  it('disables toast when showToast is false', async () => {
    const { result } = renderHook(() => useErrorHandling({ showToast: false }));
    const { showErrorToast } = await import('@/lib/error-handling');
    
    act(() => {
      result.current.handleError(new Error('Test error'));
    });
    
    expect(showErrorToast).not.toHaveBeenCalled();
  });
});

describe('Specialized error handling hooks', () => {
  it('useTaskErrorHandling has correct configuration', () => {
    const { result } = renderHook(() => useTaskErrorHandling());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isRetrying).toBe(false);
  });

  it('useCalendarErrorHandling has correct configuration', () => {
    const { result } = renderHook(() => useCalendarErrorHandling());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isRetrying).toBe(false);
  });

  it('useEmailErrorHandling has correct configuration', () => {
    const { result } = renderHook(() => useEmailErrorHandling());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isRetrying).toBe(false);
  });

  it('useAIErrorHandling has correct configuration', () => {
    const { result } = renderHook(() => useAIErrorHandling());
    
    expect(result.current.error).toBeNull();
    expect(result.current.isRetrying).toBe(false);
  });

  it('all specialized hooks execute operations', async () => {
    const hooks = [
      useTaskErrorHandling,
      useCalendarErrorHandling,
      useEmailErrorHandling,
      useAIErrorHandling,
    ];

    for (const hook of hooks) {
      const { result } = renderHook(() => hook());
      const operation = vi.fn().mockResolvedValue('success');
      
      let operationResult: any;
      await act(async () => {
        operationResult = await result.current.executeWithErrorHandling(operation);
      });
      
      expect(operationResult).toBe('success');
      expect(operation).toHaveBeenCalled();
    }
  });
});