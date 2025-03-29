import { NextResponse } from 'next/server';
import { printavoService } from '@/lib/printavo-service';
import { logger } from '@/lib/logger';
import { 
  PrintavoAPIError, 
  PrintavoValidationError,
  PrintavoAuthenticationError,
  PrintavoNotFoundError,
  PrintavoRateLimitError
} from '@/lib/printavo-api';

// Types for endpoint configuration
interface EndpointParameter {
  name: string;
  required: boolean;
  type: string;
}

// Interface for mapping endpoints to configuration (for future use)
interface _EndpointConfig {
  parameters: EndpointParameter[];
  description: string;
}

// Helper function to validate required parameters
function validateRequiredParams(params: any, requiredParams: string[]) {
  const missingParams = requiredParams.filter(param => !params[param]);
  if (missingParams.length > 0) {
    throw new PrintavoValidationError(`Missing required parameters: ${missingParams.join(', ')}`, 400);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const params = searchParams.get('params');
    const visualId = searchParams.get('visualId');

    // Parse and validate parameters
    const parsedParams = params ? JSON.parse(params) : {};
    
    // Handle visual ID query specifically
    if (visualId) {
      logger.info(`Processing order query by visual ID: ${visualId}`);
      try {
        const response = await printavoService.getOrderByVisualId(visualId);
        logger.info(`Order lookup result for visual ID ${visualId}: ${response.success ? 'Success' : 'Failed'}`);
        
        if (!response.success) {
          logger.error(`Order lookup error for visual ID ${visualId}: Failed to find order`);
          return NextResponse.json(response, { status: 404 });
        }
        
        return NextResponse.json(response);
      } catch (error) {
        logger.error(`Exception in order lookup for visual ID ${visualId}: ${error instanceof Error ? error.message : String(error)}`);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({
          success: false,
          errors: [{ message: `Failed to find order with visual ID ${visualId}: ${errorMessage}` }]
        }, { status: 404 });
      }
    }
    
    // Check endpoint
    if (!endpoint) {
      return NextResponse.json({ 
        success: false, 
        errors: [{ message: 'Endpoint is required' }]
      }, { status: 400 });
    }

    // Handle different endpoint types
    let response;
    if (endpoint.startsWith('/order/')) {
      const orderId = endpoint.replace('/order/', '');
      response = await printavoService.getOrder(orderId);
    } else if (endpoint.startsWith('/orders')) {
      // Use searchOrders instead of getOrders
      response = await printavoService.searchOrders({ 
        query: parsedParams.query || '',
        first: parsedParams.limit || 10
      });
    } else if (endpoint.startsWith('/customer/')) {
      // Customer endpoint is not supported in MCP client
      logger.warn('Customer endpoint not supported in MCP client');
      return NextResponse.json({
        success: false,
        errors: [{ message: 'Customer endpoint not supported in MCP client' }]
      }, { status: 400 });
    } else if (endpoint.startsWith('/customers')) {
      // Customers endpoint is not supported in MCP client
      logger.warn('Customers endpoint not supported in MCP client');
      return NextResponse.json({
        success: false,
        errors: [{ message: 'Customers endpoint not supported in MCP client' }]
      }, { status: 400 });
    } else {
      // For any other endpoints, log warning and return error
      logger.warn(`Unrecognized endpoint: ${endpoint}`);
      return NextResponse.json({
        success: false,
        errors: [{ message: 'Invalid endpoint' }]
      }, { status: 400 });
    }
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error('Printavo API error:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred';
    
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
    } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
      statusCode = 400;
      errorMessage = 'Invalid JSON in parameters';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      success: false,
      errors: [{ message: errorMessage }]
    }, { status: statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, data } = body;

    if (!endpoint) {
      return NextResponse.json({ 
        success: false, 
        errors: [{ message: 'Endpoint is required' }]
      }, { status: 400 });
    }

    // Validate data exists
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        errors: [{ message: 'Request data is required' }]
      }, { status: 400 });
    }

    let response;
    
    // Handle different endpoints
    if (endpoint === '/order/status/update') {
      validateRequiredParams(data, ['orderId', 'statusId']);
      response = await printavoService.updateStatus(data.orderId, data.statusId);
    } else {
      // Most POST operations are not supported in the MCP client
      logger.warn(`Endpoint not supported in MCP client: ${endpoint}`);
      return NextResponse.json({
        success: false,
        errors: [{ message: `Endpoint not supported in MCP client: ${endpoint}` }]
      }, { status: 400 });
    }
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error('Printavo API error:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred';
    
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
    } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
      statusCode = 400;
      errorMessage = 'Invalid JSON in request body';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      success: false,
      errors: [{ message: errorMessage }]
    }, { status: statusCode });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    const id = searchParams.get('id');

    if (!endpoint) {
      return NextResponse.json({ 
        success: false, 
        errors: [{ message: 'Endpoint is required' }]
      }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        errors: [{ message: 'ID is required' }]
      }, { status: 400 });
    }

    // DELETE operations are not supported in the MCP client
    logger.warn(`DELETE endpoint not supported in MCP client: ${endpoint}`);
    return NextResponse.json({
      success: false,
      errors: [{ message: `DELETE endpoint not supported in MCP client: ${endpoint}` }]
    }, { status: 400 });
  } catch (error) {
    logger.error('Printavo API error:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred';
    
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
    } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
      statusCode = 400;
      errorMessage = 'Invalid JSON in parameters';
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      success: false,
      errors: [{ message: errorMessage }]
    }, { status: statusCode });
  }
}
