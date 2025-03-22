import { NextResponse } from 'next/server';
import { printavoService } from '@/lib/printavo-service';

export async function GET(request: Request) {
  try {
    // Extract query parameters
    const url = new URL(request.url);
    const operation = url.searchParams.get('operation') || 'getOrders';
    const id = url.searchParams.get('id');
    const limit = url.searchParams.get('limit') || '10';
    
    console.log(`Testing Printavo API with operation: ${operation}`);
    
    let result;
    
    // Execute the requested operation
    switch (operation) {
      case 'getOrders':
        result = await printavoService.getOrders({ limit: parseInt(limit) });
        break;
      case 'getOrder':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required for getOrder operation' }, { status: 400 });
        }
        result = await printavoService.getOrder(id);
        break;
      case 'getCustomers':
        result = await printavoService.getCustomers({ limit: parseInt(limit) });
        break;
      case 'getCustomer':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required for getCustomer operation' }, { status: 400 });
        }
        result = await printavoService.getCustomer(id);
        break;
      default:
        return NextResponse.json({ error: `Unsupported operation: ${operation}` }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      operation,
      result
    });
  } catch (error) {
    console.error('Printavo API test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}