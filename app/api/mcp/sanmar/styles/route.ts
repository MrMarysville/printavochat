import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Compatibility route for MCP server SanMar styles list endpoint
 * This handles old requests to /api/mcp/sanmar/styles by forwarding them to the Agent API
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameter for category if present
    const category = request.nextUrl.searchParams.get('category') || '';
    logger.info(`Legacy MCP endpoint accessed - redirecting to Agent API: /api/mcp/sanmar/styles${category ? `?category=${category}` : ''}`);
    
    // Use the Agent Service to list styles
    const params = category ? { category } : {};
    const result = await AgentService.listSanmarStyles(params);
    
    if (!result.success) {
      logger.error('Error in legacy route when listing SanMar styles:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to list SanMar styles'
        },
        { status: 500 }
      );
    }
    
    // Transform to match the expected format
    return NextResponse.json({
      styles: result.data || []
    });
    
  } catch (error) {
    logger.error('Error in legacy MCP SanMar styles compatibility route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 