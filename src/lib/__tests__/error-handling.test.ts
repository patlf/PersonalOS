import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  AppError, 
  ERROR_CODES, 
  withRetry, 
  handleAPIError, 
  getErrorMessage,
  OfflineManager,
  setupGlobalErrorHandling
} from '../error-handling';

describe('AppError', () => {
  it('creates error with code and status', () => {
    const error = new AppError('Test message', ERROR_CODES.TASK_CREATE_FAILED, 400);
    
    expect(error.message).toBe('Test message');
    expect(error.code).toBe(ERROR_CODES.TASK_CREATE_FAILED);
    expect(error.status).toBe(400);
    expect(error.name).toBe('AppError');
  });

  it('creates error with details', () => {
    const details = { field: 'title', reason: 'required' };
    const error = new AppError('Validation failed', ERROR_CODES.VALIDATION_ERROR, 400, details);
    
    expect(error.details).toEqual(details);
  });
});

describe('withRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('succeeds on first attempt', async () => {
    const operation = vi.fn().mockResolvedValue('success');
    
    const result = await withRetry(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually succeeds', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');
    
    const promise = withRetry(operation, { maxAttempts: 3, baseDelay: 100 });
    
    // Fast-forward through delays
    await vi.runAllTimersAsync();
    
    const result = await promise;
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('throws error after max attempts', async () => {
    const error = new Error('Persistent failure');
    const operation = vi.fn().mockRejectedValue(error);
    
    const promise = withRetry(operation, { maxAttempts: 2, baseDelay: 100 });
    
    await vi.runAllTimersAsync();
    
    await expect(promise).rejects.toThrow('Persistent failure');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('does not retry on auth errors', async () => {
    const error = new AppError('Unauthorized', ERROR_CODES.AUTH_INVALID, 401);
    const operation = vi.fn().mockRejectedValue(error);
    
    await expect(withRetry(operation)).rejects.toThrow('Unauthorized');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('uses exponential backoff', async () => {
    const operation = vi.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValue('success');
    
    const promise = withRetry(operation, { 
      maxAttempts: 3, 
      baseDelay: 100, 
      backoffFactor: 2 
    });
    
    // Check that delays increase exponentially
    const delays: number[] = [];
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = vi.fn((callback, delay) => {
      delays.push(delay);
      return originalSetTimeout(callback, 0);
    }) as any;
    
    await vi.runAllTimersAsync();
    await promise;
    
    expect(delays).toEqual([100, 200]); // 100 * 2^0, 100 * 2^1
    
    global.setTimeout = originalSetTimeout;
  });
});

describe('handleAPIError', () => {
  it('handles network errors', () => {
    const networkError = new TypeError('fetch failed');
    const result = handleAPIError(networkError);
    
    expect(result.code).toBe(ERROR_CODES.NETWORK_ERROR);
    expect(result.message).toContain('Network connection failed');
  });

  it('handles timeout errors', () => {
    const timeoutError = new Error('Request timeout');
    timeoutError.name = 'AbortError';
    const result = handleAPIError(timeoutError);
    
    expect(result.code).toBe(ERROR_CODES.TIMEOUT_ERROR);
    expect(result.message).toContain('Request timed out');
  });

  it('handles HTTP status errors', () => {
    const httpError = { status: 401, message: 'Unauthorized' };
    const result = handleAPIError(httpError);
    
    expect(result.code).toBe(ERROR_CODES.AUTH_EXPIRED);
    expect(result.status).toBe(401);
  });

  it('handles rate limiting', () => {
    const rateLimitError = { status: 429, message: 'Too many requests' };
    const result = handleAPIError(rateLimitError);
    
    expect(result.code).toBe(ERROR_CODES.AI_RATE_LIMITED);
    expect(result.status).toBe(429);
  });

  it('handles server errors', () => {
    const serverError = { status: 500, message: 'Internal server error' };
    const result = handleAPIError(serverError);
    
    expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
    expect(result.status).toBe(500);
  });

  it('passes through AppError instances', () => {
    const appError = new AppError('Custom error', ERROR_CODES.TASK_CREATE_FAILED);
    const result = handleAPIError(appError);
    
    expect(result).toBe(appError);
  });

  it('handles unknown errors', () => {
    const unknownError = new Error('Unknown error');
    const result = handleAPIError(unknownError);
    
    expect(result.code).toBe(ERROR_CODES.UNKNOWN_ERROR);
    expect(result.message).toBe('Unknown error');
  });
});

describe('getErrorMessage', () => {
  it('returns user-friendly messages for known error codes', () => {
    const networkError = new AppError('', ERROR_CODES.NETWORK_ERROR);
    expect(getErrorMessage(networkError)).toContain('Connection problem');
    
    const authError = new AppError('', ERROR_CODES.AUTH_EXPIRED);
    expect(getErrorMessage(authError)).toContain('session has expired');
    
    const taskError = new AppError('', ERROR_CODES.TASK_CREATE_FAILED);
    expect(getErrorMessage(taskError)).toContain('Failed to create task');
  });

  it('returns original message for validation errors', () => {
    const validationError = new AppError('Title is required', ERROR_CODES.VALIDATION_ERROR);
    expect(getErrorMessage(validationError)).toBe('Title is required');
  });

  it('returns default message for unknown errors', () => {
    const unknownError = new AppError('', ERROR_CODES.UNKNOWN_ERROR);
    expect(getErrorMessage(unknownError)).toContain('Something went wrong');
  });
});

describe('OfflineManager', () => {
  let offlineManager: OfflineManager;

  beforeEach(() => {
    // Reset singleton instance
    (OfflineManager as any).instance = undefined;
    offlineManager = OfflineManager.getInstance();
  });

  it('creates singleton instance', () => {
    const instance1 = OfflineManager.getInstance();
    const instance2 = OfflineManager.getInstance();
    
    expect(instance1).toBe(instance2);
  });

  it('tracks online status', () => {
    expect(offlineManager.getIsOnline()).toBe(true); // Default in test environment
  });

  it('adds and removes listeners', () => {
    const listener = vi.fn();
    const removeListener = offlineManager.addListener(listener);
    
    // Simulate going offline
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    window.dispatchEvent(new Event('offline'));
    
    expect(listener).toHaveBeenCalledWith(false);
    
    removeListener();
    
    // Simulate going online
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    window.dispatchEvent(new Event('online'));
    
    // Listener should not be called after removal
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('queues actions when offline', async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    
    // Create a new instance with offline status
    (OfflineManager as any).instance = undefined;
    Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
    offlineManager = OfflineManager.getInstance();
    
    await offlineManager.queueAction(action);
    
    // Action should not be executed immediately when offline
    expect(action).not.toHaveBeenCalled();
  });

  it('executes actions immediately when online', async () => {
    const action = vi.fn().mockResolvedValue(undefined);
    
    // Ensure we're online
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true });
    (OfflineManager as any).instance = undefined;
    offlineManager = OfflineManager.getInstance();
    
    await offlineManager.queueAction(action);
    
    expect(action).toHaveBeenCalled();
  });
});

describe('setupGlobalErrorHandling', () => {
  it('sets up global error handlers', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    
    setupGlobalErrorHandling();
    
    expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
    
    addEventListenerSpy.mockRestore();
  });
});