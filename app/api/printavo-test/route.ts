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
        // Use searchOrders instead of getOrders
        result = await printavoService.searchOrders({ query: '', first: parseInt(limit) });
        break;
      case 'getOrder':
        if (!id) {
          return NextResponse.json({ error: 'ID parameter required for getOrder operation' }, { status: 400 });
        }
        result = await printavoService.getOrder(id);
        break;
      case 'getCustomers':
        // This method might not exist in the MCP client, so we'll handle it differently
        return NextResponse.json({ 
          success: false, 
          error: 'getCustomers operation is not supported in the MCP client. Use searchOrders instead.' 
        }, { status: 400 });
        break;
      case 'getCustomer':
        // This method might not exist in the MCP client, so we'll handle it differently
        return NextResponse.json({ 
          success: false, 
          error: 'getCustomer operation is not supported in the MCP client. Use searchOrders instead.' 
        }, { status: 400 });
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
