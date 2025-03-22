import { NextResponse } from 'next/server';
import { printavoService } from '@/lib/printavo-service';
import { logger } from '@/lib/logger';
import { PrintavoAPIError, PrintavoValidationError } from '@/lib/graphql-client';

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
    throw new PrintavoValidationError(`Missing required parameters: ${missingParams.join(', ')}`);
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
      const response = await printavoService.getOrderByVisualId(visualId);
      return NextResponse.json(response);
    }
    
    // Check endpoint
    if (!endpoint) {
      return NextResponse.json({ 
        success: false, 
        error: 'Endpoint is required' 
      }, { status: 400 });
    }

    // Handle different endpoint types
    let response;
    if (endpoint.startsWith('/order/')) {
      const orderId = endpoint.replace('/order/', '');
      response = await printavoService.getOrder(orderId);
    } else if (endpoint.startsWith('/orders')) {
      response = await printavoService.getOrders(parsedParams);
    } else if (endpoint.startsWith('/customer/')) {
      const customerId = endpoint.replace('/customer/', '');
      response = await printavoService.getCustomer(customerId);
    } else if (endpoint.startsWith('/customers')) {
      response = await printavoService.getCustomers(parsedParams);
    } else {
      // For any other endpoints, log warning and return error
      logger.warn(`Unrecognized endpoint: ${endpoint}`);
      return NextResponse.json({
        success: false,
        error: 'Invalid endpoint'
      }, { status: 400 });
    }
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error('Printavo API error:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof PrintavoValidationError) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error instanceof PrintavoAPIError) {
      statusCode = error.statusCode || 500;
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
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
        error: 'Endpoint is required' 
      }, { status: 400 });
    }

    // Validate data exists
    if (!data) {
      return NextResponse.json({ 
        success: false, 
        error: 'Request data is required' 
      }, { status: 400 });
    }

    let response;
    
    // Handle different endpoints
    if (endpoint === '/quote/create') {
      response = await printavoService.createQuote(data);
    } else if (endpoint === '/order/status/update') {
      validateRequiredParams(data, ['orderId', 'statusId']);
      response = await printavoService.updateStatus(data.orderId, data.statusId);
    } else if (endpoint === '/fee/create') {
      validateRequiredParams(data, ['parentId', 'fee']);
      response = await printavoService.createFee(data.parentId, data.fee);
    } else if (endpoint === '/fee/update') {
      validateRequiredParams(data, ['id', 'fee']);
      response = await printavoService.updateFee(data.id, data.fee);
    } else if (endpoint === '/lineitemgroup/create') {
      validateRequiredParams(data, ['parentId', 'group']);
      response = await printavoService.createLineItemGroup(data.parentId, data.group);
    } else if (endpoint === '/lineitem/create') {
      validateRequiredParams(data, ['lineItemGroupId', 'item']);
      response = await printavoService.createLineItem(data.lineItemGroupId, data.item);
    } else if (endpoint === '/imprint/create') {
      validateRequiredParams(data, ['lineItemGroupId', 'imprint']);
      response = await printavoService.createImprint(data.lineItemGroupId, data.imprint);
    } else {
      // For any other endpoints, log warning and return error
      logger.warn(`Unrecognized endpoint: ${endpoint}`);
      return NextResponse.json({
        success: false,
        error: 'Invalid endpoint'
      }, { status: 400 });
    }
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error('Printavo API error:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof PrintavoValidationError) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error instanceof PrintavoAPIError) {
      statusCode = error.statusCode || 500;
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
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
        error: 'Endpoint is required' 
      }, { status: 400 });
    }

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        error: 'ID is required' 
      }, { status: 400 });
    }

    let response;
    
    if (endpoint === '/fee/delete') {
      response = await printavoService.deleteFee(id);
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid endpoint'
      }, { status: 400 });
    }
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error('Printavo API error:', error);
    
    let statusCode = 500;
    let errorMessage = 'An unexpected error occurred';
    
    if (error instanceof PrintavoValidationError) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error instanceof PrintavoAPIError) {
      statusCode = error.statusCode || 500;
      errorMessage = error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: statusCode });
  }
}
