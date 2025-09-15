import { toast } from 'sonner';

export interface APIError extends Error {
  code: string;
  status?: number;
  details?: any;
}

export class AppError extends Error implements APIError {
  code: string;
  status?: number;
  details?: any;

  constructor(message: string, code: string, status?: number, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Error codes for different types of failures
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Authentication errors
  AUTH_EXPIRED: 'AUTH_EXPIRED',
  AUTH_INVALID: 'AUTH_INVALID',
  
  // Task management errors
  TASK_CREATE_FAILED: 'TASK_CREATE_FAILED',
  TASK_UPDATE_FAILED: 'TASK_UPDATE_FAILED',
  TASK_DELETE_FAILED: 'TASK_DELETE_FAILED',
  TASK_LOAD_FAILED: 'TASK_LOAD_FAILED',
  
  // Calendar errors
  CALENDAR_SYNC_FAILED: 'CALENDAR_SYNC_FAILED',
  CALENDAR_AUTH_EXPIRED: 'CALENDAR_AUTH_EXPIRED',
  
  // Email errors
  EMAIL_SYNC_FAILED: 'EMAIL_SYNC_FAILED',
  EMAIL_AUTH_EXPIRED: 'EMAIL_AUTH_EXPIRED',
  
  // AI errors
  AI_REQUEST_FAILED: 'AI_REQUEST_FAILED',
  AI_RATE_LIMITED: 'AI_RATE_LIMITED',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Retry configuration
export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

// Retry mechanism with exponential backoff
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxAttempts, baseDelay, maxDelay, backoffFactor } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config,
  };

  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain error types
      if (error instanceof AppError) {
        if (error.code === ERROR_CODES.AUTH_INVALID || 
            error.code === ERROR_CODES.VALIDATION_ERROR ||
            error.status === 400 || 
            error.status === 401 || 
            error.status === 403) {
          throw error;
        }
      }
      
      // If this was the last attempt, throw the error
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      
      console.warn(`Operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms:`, error);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// Error handler for API responses
export function handleAPIError(error: any): AppError {
  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new AppError(
      'Network connection failed. Please check your internet connection.',
      ERROR_CODES.NETWORK_ERROR
    );
  }
  
  // Handle timeout errors
  if (error.name === 'AbortError' || error.message.includes('timeout')) {
    return new AppError(
      'Request timed out. Please try again.',
      ERROR_CODES.TIMEOUT_ERROR
    );
  }
  
  // Handle HTTP errors
  if (error.status) {
    switch (error.status) {
      case 401:
        return new AppError(
          'Your session has expired. Please sign in again.',
          ERROR_CODES.AUTH_EXPIRED,
          401
        );
      case 403:
        return new AppError(
          'You don\'t have permission to perform this action.',
          ERROR_CODES.AUTH_INVALID,
          403
        );
      case 404:
        return new AppError(
          'The requested resource was not found.',
          ERROR_CODES.UNKNOWN_ERROR,
          404
        );
      case 429:
        return new AppError(
          'Too many requests. Please wait a moment and try again.',
          ERROR_CODES.AI_RATE_LIMITED,
          429
        );
      case 500:
      case 502:
      case 503:
      case 504:
        return new AppError(
          'Server error. Please try again in a few moments.',
          ERROR_CODES.UNKNOWN_ERROR,
          error.status
        );
      default:
        return new AppError(
          error.message || 'An unexpected error occurred.',
          ERROR_CODES.UNKNOWN_ERROR,
          error.status
        );
    }
  }
  
  // Handle known error types
  if (error instanceof AppError) {
    return error;
  }
  
  // Default error handling
  return new AppError(
    error.message || 'An unexpected error occurred.',
    ERROR_CODES.UNKNOWN_ERROR
  );
}

// User-friendly error messages
export function getErrorMessage(error: AppError): string {
  switch (error.code) {
    case ERROR_CODES.NETWORK_ERROR:
      return 'Connection problem. Please check your internet and try again.';
    case ERROR_CODES.TIMEOUT_ERROR:
      return 'Request timed out. Please try again.';
    case ERROR_CODES.AUTH_EXPIRED:
      return 'Your session has expired. Please sign in again.';
    case ERROR_CODES.AUTH_INVALID:
      return 'Authentication failed. Please sign in again.';
    case ERROR_CODES.TASK_CREATE_FAILED:
      return 'Failed to create task. Please try again.';
    case ERROR_CODES.TASK_UPDATE_FAILED:
      return 'Failed to update task. Please try again.';
    case ERROR_CODES.TASK_DELETE_FAILED:
      return 'Failed to delete task. Please try again.';
    case ERROR_CODES.TASK_LOAD_FAILED:
      return 'Failed to load tasks. Please refresh the page.';
    case ERROR_CODES.CALENDAR_SYNC_FAILED:
      return 'Calendar sync failed. Some events may not be up to date.';
    case ERROR_CODES.EMAIL_SYNC_FAILED:
      return 'Email sync failed. Some messages may not be up to date.';
    case ERROR_CODES.AI_REQUEST_FAILED:
      return 'AI request failed. Please try again.';
    case ERROR_CODES.AI_RATE_LIMITED:
      return 'Too many AI requests. Please wait a moment.';
    case ERROR_CODES.VALIDATION_ERROR:
      return error.message || 'Invalid input. Please check your data.';
    default:
      return error.message || 'Something went wrong. Please try again.';
  }
}

// Toast notification helpers
export function showErrorToast(error: Error | AppError) {
  const appError = error instanceof AppError ? error : handleAPIError(error);
  const message = getErrorMessage(appError);
  
  toast.error(message, {
    description: process.env.NODE_ENV === 'development' ? appError.code : undefined,
    action: appError.code === ERROR_CODES.AUTH_EXPIRED ? {
      label: 'Sign In',
      onClick: () => window.location.href = '/auth/signin',
    } : undefined,
  });
}

export function showSuccessToast(message: string) {
  toast.success(message);
}

export function showInfoToast(message: string) {
  toast.info(message);
}

// Offline handling
export class OfflineManager {
  private static instance: OfflineManager;
  private isOnline = navigator.onLine;
  private pendingActions: Array<() => Promise<void>> = [];
  private listeners: Array<(isOnline: boolean) => void> = [];

  static getInstance(): OfflineManager {
    if (!OfflineManager.instance) {
      OfflineManager.instance = new OfflineManager();
    }
    return OfflineManager.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notifyListeners();
    this.syncPendingActions();
    showInfoToast('Connection restored. Syncing data...');
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notifyListeners();
    showInfoToast('You\'re offline. Changes will sync when connection is restored.');
  };

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  public addListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public queueAction(action: () => Promise<void>) {
    if (this.isOnline) {
      return action();
    } else {
      this.pendingActions.push(action);
      return Promise.resolve();
    }
  }

  private async syncPendingActions() {
    const actions = [...this.pendingActions];
    this.pendingActions = [];

    for (const action of actions) {
      try {
        await action();
      } catch (error) {
        console.error('Failed to sync pending action:', error);
        // Re-queue failed actions
        this.pendingActions.push(action);
      }
    }

    if (this.pendingActions.length === 0) {
      showSuccessToast('All changes synced successfully.');
    }
  }
}

// Global error handler
export function setupGlobalErrorHandling() {
  if (typeof window !== 'undefined') {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Prevent the default browser error handling
      event.preventDefault();
      
      // Show user-friendly error message
      const error = handleAPIError(event.reason);
      showErrorToast(error);
    });

    // Handle global JavaScript errors
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      
      const error = handleAPIError(event.error);
      showErrorToast(error);
    });
  }
}