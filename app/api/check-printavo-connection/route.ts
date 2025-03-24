import { NextResponse } from 'next/server';
import { query } from '@/lib/graphql';
import { logger } from '@/lib/logger';
import { 
  PrintavoAPIError, 
  PrintavoAuthenticationError, 
  PrintavoValidationError,
  PrintavoNotFoundError,
  PrintavoRateLimitError
} from '@/lib/printavo-api';

interface UserResponse {
  user: {
    id: string;
    name?: string;
    email?: string;
  };
}

export async function GET() {
  try {
    // Test connection to Printavo API
    logger.info('Testing connection to Printavo API');
    const response = await query<UserResponse>('/query/user', {});
    
    if (response.errors) {
      logger.error('Printavo connection test failed:', response.errors);
      return NextResponse.json({ 
        success: false, 
        errors: response.errors.map(error => ({ message: error.message }))
      }, { status: 500 });
    }
    
    logger.info('Printavo connection test successful');
    return NextResponse.json({ 
      success: true, 
      data: {
        message: 'Successfully connected to Printavo API',
        user: response.data?.user
      }
    });
  } catch (error) {
    logger.error('Printavo connection error:', error);
    
    let statusCode = 500;
    let errorMessage = 'Unknown error connecting to Printavo API';
    
    if (error instanceof PrintavoAuthenticationError) {
      statusCode = error.statusCode || 401;
      errorMessage = error.message;
    } else if (error instanceof PrintavoValidationError) {
      statusCode = error.statusCode || 400;
      errorMessage = error.message;
    } else if (error instanceof PrintavoNotFoundError) {
      statusCode = error.statusCode || 404;
      errorMessage = error.message;
    } else if (error instanceof PrintavoRateLimitError) {
      statusCode = error.statusCode || 429;
      errorMessage = error.message;
    } else if (error instanceof PrintavoAPIError) {
      statusCode = error.statusCode || 500;
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ success: false, errors: [{ message: errorMessage }] }, 
      { status: statusCode });
  }
}

