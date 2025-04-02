/**
 * API Utilities
 * Centralized functions for API interaction
 */

import { logger } from '../logger';
import {
  PrintavoAPIError,
  PrintavoAuthenticationError,
  PrintavoNotFoundError,
  PrintavoRateLimitError,
  PrintavoValidationError
} from '../printavo-api';

// Conditionally import NextResponse to avoid "Request is not defined" errors in test environment
let NextResponse: any;
if (typeof window !== 'undefined' || process.env.NODE_ENV !== 'test') {
  // Only import in browser or non-test Node environments
  import('next/server').then((module) => {
    NextResponse = module.NextResponse;
  }).catch(() => {
    // Fallback for environments where next/server is not available
    NextResponse = {
      json: (data: any, options: any) => ({
        data,
        options,
        headers: new Map()
      })
    };
  });
} else {
  // Provide a mock for test environments
  NextResponse = {
    json: (data: any, options: any) => ({
      data,
      options,
      headers: new Map()
    })
  };
}

/**
 * Get the base Printavo API URL
 */
export function getBaseApiUrl(): string {
  const defaultUrl = "https://www.printavo.com/api/v2";
  let url = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || defaultUrl;
  url = url.trim();
  
  // Ensure URL has https:// prefix
  if (!url.startsWith('http')) {
    url = `https://${url}`;
  }
  
  // Remove trailing slash if present
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

/**
 * Get the full API endpoint for a specific path
 */
export function getApiEndpoint(path: string = ''): string {
  const baseUrl = getBaseApiUrl();
  
  // Ensure path starts with a slash if it's not empty
  if (path && !path.startsWith('/')) {
    path = `/${path}`;
  }
  
  return `${baseUrl}${path}`;
}

/**
 * Get the GraphQL endpoint
 */
export function getGraphQLEndpoint(): string {
  // GraphQL endpoint is the base URL + /graphql
  const baseUrl = getBaseApiUrl();
  return `${baseUrl}/graphql`;
}

/**
 * Get the API credentials for headers
 */
export function getApiCredentials(): { email: string; token: string } {
  return {
    email: process.env.NEXT_PUBLIC_PRINTAVO_EMAIL || '',
    token: process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || ''
  };
}

/**
 * Handle Printavo API errors consistently
 * Returns a properly formatted NextResponse with appropriate status code
 */
export function handlePrintavoAPIError(error: any): any {
  let statusCode = 500;
  let errorMessage = 'An unexpected error occurred';
  let additionalInfo = {};

  // Log the error for debugging
  logger.error('API Error:', error);

  if (error instanceof PrintavoAuthenticationError) {
    statusCode = error.statusCode || 401;
    errorMessage = error.message;
    additionalInfo = { type: 'authentication' };
  } else if (error instanceof PrintavoValidationError) {
    statusCode = error.statusCode || 400;
    errorMessage = error.message;
    additionalInfo = { type: 'validation' };
  } else if (error instanceof PrintavoNotFoundError) {
    statusCode = error.statusCode || 404;
    errorMessage = error.message;
    additionalInfo = { type: 'not_found' };
  } else if (error instanceof PrintavoRateLimitError) {
    statusCode = error.statusCode || 429;
    errorMessage = error.message;
    additionalInfo = { type: 'rate_limit' };
  } else if (error instanceof PrintavoAPIError) {
    statusCode = error.statusCode || 500;
    errorMessage = error.message;
    additionalInfo = { type: 'api_error' };
  } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
    statusCode = 400;
    errorMessage = 'Invalid JSON in parameters';
    additionalInfo = { type: 'json_parse_error' };
  } else if (error instanceof Error) {
    errorMessage = error.message;
    additionalInfo = { type: 'general_error' };
  }

  // Check if NextResponse is available
  if (NextResponse && NextResponse.json) {
    return NextResponse.json({ 
      success: false, 
      errors: [{ 
        message: errorMessage,
        ...additionalInfo
      }] 
    }, { 
      status: statusCode 
    });
  } else {
    // Fallback for environments where NextResponse is not available
    return { 
      data: {
        success: false, 
        errors: [{ 
          message: errorMessage,
          ...additionalInfo
        }]
      },
      status: statusCode
    };
  }
}

/**
 * A simple in-memory locking mechanism to prevent race conditions
 */
const apiLocks = new Map<string, boolean>();

/**
 * Execute a function with a lock to prevent race conditions
 * @param lockKey Unique key for the lock
 * @param fn Function to execute
 * @param timeout Timeout in ms (default: 10000)
 */
export async function withLock<T>(
  lockKey: string, 
  fn: () => Promise<T>,
  timeout: number = 10000
): Promise<T> {
  // Check if lock exists
  if (apiLocks.get(lockKey)) {
    logger.debug(`Lock ${lockKey} is active, waiting...`);
    
    // Wait for the lock to be released
    let waitCount = 0;
    while (apiLocks.get(lockKey) && waitCount < 10) {
      await new Promise(resolve => setTimeout(resolve, Math.min(100, timeout / 10)));
      waitCount++;
    }
    
    // If still locked after waiting, throw an error
    if (apiLocks.get(lockKey)) {
      logger.warn(`Lock ${lockKey} timed out after ${timeout}ms`);
      throw new Error(`Operation locked: ${lockKey}`);
    }
  }
  
  // Acquire lock
  apiLocks.set(lockKey, true);
  logger.debug(`Lock acquired: ${lockKey}`);
  
  try {
    // Execute the function
    const result = await fn();
    return result;
  } finally {
    // Release lock
    apiLocks.delete(lockKey);
    logger.debug(`Lock released: ${lockKey}`);
  }
} 