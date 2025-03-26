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
    logger.error('Error caught by ErrorBoundary:', error, errorInfo);
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
    const { error } = this.state;
    const { retryLabel = "Try Again" } = this.props;
    
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
          
          <div className="flex justify-center">
            <Button onClick={this.handleReset} className="bg-blue-600 hover:bg-blue-700">
              {retryLabel}
            </Button>
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
