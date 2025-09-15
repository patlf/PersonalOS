"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  message?: string;
  showRetry?: boolean;
  showGoBack?: boolean;
  onGoBack?: () => void;
}

export function ErrorFallback({
  error,
  resetError,
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  showRetry = true,
  showGoBack = false,
  onGoBack,
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center p-8">
      <Card className="max-w-md w-full p-6 text-center space-y-4">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>

        {error && process.env.NODE_ENV === 'development' && (
          <details className="text-left">
            <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
              Error Details
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded-md text-xs font-mono text-gray-800 overflow-auto max-h-32">
              {error.message}
            </div>
          </details>
        )}

        <div className="flex gap-2 justify-center">
          {showRetry && resetError && (
            <Button
              onClick={resetError}
              variant="default"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          )}
          
          {showGoBack && (
            <Button
              onClick={onGoBack}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

// Specialized fallback components
export function TaskLoadingError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorFallback
      title="Failed to load tasks"
      message="We couldn't load your tasks. Please check your connection and try again."
      resetError={onRetry}
      showRetry={!!onRetry}
    />
  );
}

export function TaskSaveError({ onRetry, onCancel }: { onRetry?: () => void; onCancel?: () => void }) {
  return (
    <ErrorFallback
      title="Failed to save task"
      message="Your task couldn't be saved. Your changes are preserved locally."
      resetError={onRetry}
      showRetry={!!onRetry}
      showGoBack={!!onCancel}
      onGoBack={onCancel}
    />
  );
}

export function CalendarSyncError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorFallback
      title="Calendar sync failed"
      message="We couldn't sync your calendar. Some events may not be up to date."
      resetError={onRetry}
      showRetry={!!onRetry}
    />
  );
}

export function EmailSyncError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorFallback
      title="Email sync failed"
      message="We couldn't sync your emails. Some messages may not be up to date."
      resetError={onRetry}
      showRetry={!!onRetry}
    />
  );
}

export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorFallback
      title="Connection problem"
      message="Please check your internet connection and try again."
      resetError={onRetry}
      showRetry={!!onRetry}
    />
  );
}