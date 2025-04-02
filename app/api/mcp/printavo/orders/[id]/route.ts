import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Compatibility route for MCP server order by ID endpoint
 * This handles old requests to /api/mcp/printavo/orders/:id by forwarding them to the Agent API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    logger.info(`Legacy MCP endpoint accessed - redirecting to Agent API: /api/mcp/printavo/orders/${id}`);
    
    // Use the Agent Service to get the order
    const result = await AgentService.getOrder(id);
    
    if (!result.success) {
      logger.error(`Error in legacy route when getting order ${id}:`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || `Failed to fetch order ${id}`
        },
        { status: 500 }
      );
    }
    
    // Transform to match the expected format
    return NextResponse.json({
      order: result.data
    });
    
  } catch (error) {
    logger.error('Error in legacy MCP order compatibility route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 