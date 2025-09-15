import { useState, useCallback } from 'react';
import { AppError, handleAPIError, showErrorToast, withRetry, RetryConfig } from '@/lib/error-handling';

interface UseErrorHandlingOptions {
  showToast?: boolean;
  retryConfig?: Partial<RetryConfig>;
  onError?: (error: AppError) => void;
}

export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const [error, setError] = useState<AppError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleError = useCallback((error: any) => {
    const appError = handleAPIError(error);
    setError(appError);
    
    if (options.showToast !== false) {
      showErrorToast(appError);
    }
    
    options.onError?.(appError);
    
    return appError;
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    customRetryConfig?: Partial<RetryConfig>
  ): Promise<T | null> => {
    try {
      clearError();
      
      const retryConfig = { ...options.retryConfig, ...customRetryConfig };
      const result = await withRetry(operation, retryConfig);
      
      return result;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [handleError, clearError, options.retryConfig]);

  const executeWithRetry = useCallback(async <T>(
    operation: () => Promise<T>,
    retryConfig?: Partial<RetryConfig>
  ): Promise<T | null> => {
    setIsRetrying(true);
    try {
      const result = await executeWithErrorHandling(operation, retryConfig);
      return result;
    } finally {
      setIsRetrying(false);
    }
  }, [executeWithErrorHandling]);

  return {
    error,
    isRetrying,
    handleError,
    clearError,
    executeWithErrorHandling,
    executeWithRetry,
  };
}

// Specialized hooks for different modules
export function useTaskErrorHandling() {
  return useErrorHandling({
    showToast: true,
    retryConfig: {
      maxAttempts: 3,
      baseDelay: 1000,
    },
  });
}

export function useCalendarErrorHandling() {
  return useErrorHandling({
    showToast: true,
    retryConfig: {
      maxAttempts: 2,
      baseDelay: 2000,
    },
  });
}

export function useEmailErrorHandling() {
  return useErrorHandling({
    showToast: true,
    retryConfig: {
      maxAttempts: 2,
      baseDelay: 2000,
    },
  });
}

export function useAIErrorHandling() {
  return useErrorHandling({
    showToast: true,
    retryConfig: {
      maxAttempts: 1, // Don't retry AI requests automatically
      baseDelay: 0,
    },
  });
}