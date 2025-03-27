"use client";

import React from 'react';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
  onReset?: () => void;
  retryLabel?: string;
  apiErrorFallback?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  isApiError: boolean;
}

/**
 * An enhanced error boundary component that:
 * 1. Catches errors in child components
 * 2. Displays a user-friendly error message
 * 3. Logs detailed error information
 * 4. Provides retry functionality
 * 5. Has special handling for API errors
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isApiError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Check if this appears to be an API error
    const isApiError = 
      error.message.includes('API') || 
      error.message.includes('network') ||
      error.message.includes('GraphQL') ||
      error.message.includes('request failed') ||
      error.message.includes('rate limit') ||
      error.message.includes('429') ||
      error.message.includes('fetch');
    
    return { 
      hasError: true,
      error,
      isApiError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({ errorInfo });
    
    // Enhanced error logging with more context
    const errorContext = {
      componentStack: errorInfo.componentStack,
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      timestamp: new Date().toISOString(),
      errorType: error.name,
      errorStackLines: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack trace
    };
    
    logger.error('Error caught by ErrorBoundary:', error, errorContext);
    
    // In development, log the full error to console for easier debugging
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      console.groupCollapsed('%c🚨 React Error Boundary Caught Error', 'color: #ff0000; font-weight: bold;');
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleReset = (): void => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      isApiError: false
    });
    
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  renderApiErrorFallback(): React.ReactNode {
    const { error, errorInfo } = this.state;
    const { retryLabel = "Try Again" } = this.props;
    const isDev = process.env.NODE_ENV === 'development';
    
    return (
      <Card className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h3 className="text-xl font-bold text-center text-gray-800">
            Connection Error
          </h3>
          
          <div className="text-gray-600 text-center">
            <p className="mb-2">
              We couldn&apos;t connect to the Printavo API. This might be due to:
            </p>
            <ul className="text-sm list-disc list-inside mb-4 text-left">
              <li>Network connectivity issues</li>
              <li>API rate limiting</li>
              <li>Printavo service unavailability</li>
              <li>Authentication problems</li>
            </ul>
            <p className="text-sm text-red-600 mb-4">
              {error?.message || "Unknown error occurred"}
            </p>
          </div>
          
          {/* Developer details (only in development mode) */}
          {isDev && (
            <details className="border p-2 rounded-md mb-4 text-xs text-left">
              <summary className="cursor-pointer font-medium">Developer Details</summary>
              <div className="mt-2 border-t pt-2">
                <p className="font-bold">Error Name:</p>
                <pre className="bg-gray-100 p-1 rounded">{error?.name}</pre>
                
                <p className="font-bold mt-2">Error Message:</p>
                <pre className="bg-gray-100 p-1 rounded overflow-x-auto">{error?.message}</pre>
                
                <p className="font-bold mt-2">Stack Trace:</p>
                <pre className="bg-gray-100 p-1 rounded overflow-x-auto text-[10px] max-h-40 overflow-y-auto">
                  {error?.stack}
                </pre>
                
                <p className="font-bold mt-2">Component Stack:</p>
                <pre className="bg-gray-100 p-1 rounded overflow-x-auto text-[10px] max-h-40 overflow-y-auto">
                  {errorInfo?.componentStack}
                </pre>
              </div>
            </details>
          )}
          
          <div className="flex justify-center space-x-2">
            <Button onClick={this.handleReset} className="bg-blue-600 hover:bg-blue-700">
              {retryLabel}
            </Button>
            {isDev && (
              <Button 
                onClick={() => console.log('Error Details:', { error, errorInfo })} 
                variant="outline" 
                className="border-gray-300"
              >
                Log Details
              </Button>
            )}
          </div>
        </div>
      </Card>
    );
  }

  render(): React.ReactNode {
    const { hasError, isApiError } = this.state;
    const { children, fallback, apiErrorFallback = true } = this.props;
    
    if (!hasError) {
      return children;
    }
    
    // Use API error fallback if this is an API error and apiErrorFallback is enabled
    if (isApiError && apiErrorFallback) {
      return this.renderApiErrorFallback();
    }
    
    // Use custom fallback if provided, otherwise use API error fallback as default
    if (fallback) {
      return fallback;
    }
    
    return this.renderApiErrorFallback();
  }
}

/**
 * ErrorBoundaryWrapper is a convenient function component wrapper 
 * for the ErrorBoundary class component
 */
export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryProps> = (props) => {
  return <ErrorBoundary {...props} />;
};

export default ErrorBoundary;
