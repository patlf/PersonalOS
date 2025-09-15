"use client";

import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
  moduleName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined') {
      // In a real app, you'd use Sentry or similar
      console.error('Error reported to monitoring service:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        moduleName: this.props.moduleName,
      });
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
    });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      const moduleName = this.props.moduleName || 'Application';

      return (
        <div className="flex h-full items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4">
            <div className="flex justify-center">
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">
                {moduleName} Error
              </h2>
              <p className="text-sm text-gray-600">
                Something went wrong in the {moduleName.toLowerCase()} module. 
                {canRetry ? ' You can try again or go back to the home page.' : ' Please refresh the page or contact support.'}
              </p>
            </div>

            {this.props.showDetails && this.state.error && (
              <details className="text-left">
                <summary className="text-sm font-medium text-gray-700 cursor-pointer hover:text-gray-900">
                  Error Details
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded-md text-xs font-mono text-gray-800 overflow-auto max-h-32">
                  <div className="font-semibold">Error:</div>
                  <div className="mb-2">{this.state.error.message}</div>
                  {this.state.error.stack && (
                    <>
                      <div className="font-semibold">Stack:</div>
                      <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-2 justify-center">
              {canRetry && (
                <Button
                  onClick={this.handleRetry}
                  variant="default"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again ({this.maxRetries - this.state.retryCount} left)
                </Button>
              )}
              
              <Button
                onClick={this.handleGoHome}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </div>

            {this.state.retryCount > 0 && (
              <p className="text-xs text-gray-500">
                Retry attempt {this.state.retryCount} of {this.maxRetries}
              </p>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Specialized error boundaries for different modules
export function TasksErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      moduleName="Tasks"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        // Module-specific error handling
        console.error('Tasks module error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function CalendarErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      moduleName="Calendar"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        console.error('Calendar module error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function AIErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      moduleName="AI Assistant"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        console.error('AI module error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

export function MailErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      moduleName="Mail"
      showDetails={process.env.NODE_ENV === 'development'}
      onError={(error, errorInfo) => {
        console.error('Mail module error:', error, errorInfo);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}