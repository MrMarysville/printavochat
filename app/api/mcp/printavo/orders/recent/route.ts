import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Compatibility route for MCP server endpoint
 * This handles old requests to /api/mcp/printavo/orders/recent by forwarding them to the Agent API
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('Legacy MCP endpoint accessed - redirecting to Agent API: /api/mcp/printavo/orders/recent');
    
    // Use the Agent Service to get orders
    const result = await AgentService.listOrders(10);
    
    if (!result.success) {
      logger.error('Error in legacy route when forwarding to Agent API:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch orders'
        },
        { status: 500 }
      );
    }
    
    // Transform the response to match the old format
    // The old format likely returned { orders: [...] }
    return NextResponse.json({
      orders: result.data?.orders || []
    });
    
  } catch (error) {
    logger.error('Error in legacy MCP compatibility route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 