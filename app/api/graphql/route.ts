import { NextResponse } from 'next/server';
import { executeGraphQL } from '@/lib/printavo-api';
import { logger } from '@/lib/logger';

// Custom error types
class GraphQLValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GraphQLValidationError';
  }
}

class GraphQLExecutionError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'GraphQLExecutionError';
  }
}

export async function POST(request: Request) {
  try {
    // Validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      logger.error('Invalid JSON in request body');
      return NextResponse.json(
        { error: 'Invalid request body format' },
        { status: 400 }
      );
    }

    const { query, variables } = body;
    let { operationName } = body;

    // Validate required fields
    if (!query) {
      throw new GraphQLValidationError('Query is required');
    }

    if (typeof query !== 'string') {
      throw new GraphQLValidationError('Query must be a string');
    }

    // Validate variables if provided
    if (variables && typeof variables !== 'object') {
      throw new GraphQLValidationError('Variables must be an object');
    }

    // Validate operation name is provided and not empty
    if (!operationName || operationName.trim() === '') {
      logger.warn('Missing or empty operation name in GraphQL request');
      
      // Try to extract from query
      const operationMatch = query.match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)\b/i);
      if (operationMatch && operationMatch[1]) {
        operationName = operationMatch[1];
        logger.info(`Extracted operation name from query: ${operationName}`);
      } else {
        // Generate a hash-based operation name
        const queryHash = Math.abs(hashString(query)).toString(16).substring(0, 8);
        operationName = `GraphQLQuery_${queryHash}`;
        logger.warn(`Generated fallback operation name for query: ${operationName}`);
      }
    }

    logger.info('Processing GraphQL request', { operationName });
    
    try {
      const result = await executeGraphQL(query, variables || {}, operationName);
      
      // Check for GraphQL errors in the response
      if (result.errors) {
        logger.error('GraphQL execution errors:', result.errors);
        return NextResponse.json(
          { 
            error: 'GraphQL execution failed',
            details: result.errors
          },
          { status: 400 }
        );
      }

      return NextResponse.json(result);
    } catch (executionError) {
      logger.error('GraphQL execution error:', executionError);
      throw new GraphQLExecutionError(
        'Failed to execute GraphQL query',
        executionError
      );
    }
  } catch (error) {
    logger.error('GraphQL API error:', error);

    // Handle specific error types
    if (error instanceof GraphQLValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (error instanceof GraphQLExecutionError) {
      return NextResponse.json(
        { 
          error: error.message,
          details: error.originalError?.message
        },
        { status: 500 }
      );
    }

    // Handle network errors
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return NextResponse.json(
        { 
          error: 'Network error',
          details: 'Unable to connect to the GraphQL server'
        },
        { status: 503 }
      );
    }

    // Generic error handler
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}

// Simple string hash function
export function hashString(str: string): number {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  
  return hash;
} 