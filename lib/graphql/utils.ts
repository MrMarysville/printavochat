import { DocumentNode } from 'graphql';
import { printavoClient } from './client';
import { PrintavoAPIError, PrintavoAuthenticationError, PrintavoNotFoundError, PrintavoRateLimitError, PrintavoValidationError } from './errors';

// Define the PrintavoAPIResponse type with the success property
export type PrintavoAPIResponse<T = any> = {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
  success?: boolean;
  error?: Error | PrintavoAPIError;
};

// Helper function to handle GraphQL errors
function handleGraphQLError(error: any): PrintavoAPIError {
  if (error.response?.errors) {
    const graphqlError = error.response.errors[0];
    const message = graphqlError.message || 'GraphQL error occurred';
    
    // Map GraphQL error codes to our custom error types
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return new PrintavoAuthenticationError(message);
    }
    if (message.includes('not found')) {
      return new PrintavoNotFoundError(message);
    }
    if (message.includes('rate limit')) {
      return new PrintavoRateLimitError(message);
    }
    if (message.includes('validation')) {
      return new PrintavoValidationError(message, graphqlError.extensions);
    }
    
    return new PrintavoAPIError(message, error.response.status, graphqlError.extensions?.code);
  }
  
  if (error.response?.status === 401) {
    return new PrintavoAuthenticationError('Invalid API credentials');
  }
  
  if (error.response?.status === 404) {
    return new PrintavoNotFoundError('Resource not found');
  }
  
  if (error.response?.status === 429) {
    return new PrintavoRateLimitError('Too many requests');
  }
  
  return new PrintavoAPIError(
    error.message || 'An unexpected error occurred',
    error.response?.status
  );
}

// Helper function to handle API errors (missing previously)
function handleAPIError(error: any, _message?: string): PrintavoAPIError {
  if (error instanceof PrintavoAPIError) {
    return error;
  }
  return handleGraphQLError(error);
}

// Query methods
async function query<T>(queryString: string | DocumentNode, variables?: Record<string, any>): Promise<PrintavoAPIResponse<T>> {
  try {
    const response = await printavoClient.request<T>(queryString, variables);
    return { data: response, success: true };
  } catch (error) {
    return { 
      data: undefined, 
      success: false, 
      error: handleGraphQLError(error),
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
    };
  }
}

// Mutation methods
async function mutate<T>(mutationString: string | DocumentNode, variables?: Record<string, any>): Promise<PrintavoAPIResponse<T>> {
  try {
    const response = await printavoClient.request<T>(mutationString, variables);
    return { data: response, success: true };
  } catch (error) {
    return { 
      data: undefined, 
      success: false, 
      error: handleGraphQLError(error),
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
    };
  }
}

// Delete methods
async function _deleteOperation<T>(mutationString: string | DocumentNode, variables?: Record<string, any>): Promise<PrintavoAPIResponse<T>> {
  return mutate<T>(mutationString, variables);
}

export { handleGraphQLError, handleAPIError, query, mutate, _deleteOperation };
