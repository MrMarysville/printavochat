import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Compatibility route for MCP server search orders endpoint
 * This handles old requests to /api/mcp/printavo/orders/search by forwarding them to the Agent API
 */
export async function GET(request: NextRequest) {
  try {
    // Get search term from query parameters
    const searchTerm = request.nextUrl.searchParams.get('q') || '';
    logger.info(`Legacy MCP endpoint accessed - redirecting to Agent API: /api/mcp/printavo/orders/search?q=${searchTerm}`);
    
    // Use the Agent Service to search orders
    const result = await AgentService.searchOrders(searchTerm);
    
    if (!result.success) {
      logger.error(`Error in legacy search route when searching for "${searchTerm}":`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || `Failed to search orders with term "${searchTerm}"`
        },
        { status: 500 }
      );
    }
    
    // Transform to match the expected format
    return NextResponse.json({
      orders: result.data || []
    });
    
  } catch (error) {
    logger.error('Error in legacy MCP search compatibility route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 