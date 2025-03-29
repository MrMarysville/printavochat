import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { printavoService } from '@/lib/printavo-service';
import { 
  PrintavoAPIError, 
  PrintavoAuthenticationError, 
  PrintavoValidationError,
  PrintavoNotFoundError,
  PrintavoRateLimitError
} from '@/lib/printavo-api';

export async function GET() {
  try {
    // Test connection to Printavo API
    logger.info('Testing connection to Printavo API');
    
    // Use the MCP client to get the current user
    // We'll use searchOrders with a small limit as a simple test
    const response = await printavoService.searchOrders({ query: '', first: 1 });
    
    if (!response.success || response.errors) {
      logger.error('Printavo connection test failed:', response.errors);
      return NextResponse.json({ 
        success: false, 
        errors: response.errors || [{ message: 'Failed to connect to Printavo API' }]
      }, { status: 500 });
    }
    
    logger.info('Printavo connection test successful');
    return NextResponse.json({ 
      success: true, 
      data: {
        message: 'Successfully connected to Printavo API',
        // Return basic info about the connection
        connectionInfo: {
          service: 'Printavo MCP Client',
          status: 'Connected'
        }
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
