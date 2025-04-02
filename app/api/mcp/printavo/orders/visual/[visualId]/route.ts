import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Compatibility route for MCP server order by Visual ID endpoint
 * This handles old requests to /api/mcp/printavo/orders/visual/:visualId by forwarding them to the Agent API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { visualId: string } }
) {
  try {
    const visualId = params.visualId;
    logger.info(`Legacy MCP endpoint accessed - redirecting to Agent API: /api/mcp/printavo/orders/visual/${visualId}`);
    
    // Use the Agent Service to get the order by visual ID
    const result = await AgentService.getOrderByVisualId(visualId);
    
    if (!result.success) {
      logger.error(`Error in legacy route when getting order by visual ID ${visualId}:`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || `Failed to fetch order with visual ID ${visualId}`
        },
        { status: 500 }
      );
    }
    
    // Transform to match the expected format
    return NextResponse.json({
      order: result.data
    });
    
  } catch (error) {
    logger.error('Error in legacy MCP visual ID compatibility route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 