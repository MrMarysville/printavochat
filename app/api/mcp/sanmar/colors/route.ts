import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Compatibility route for MCP server SanMar colors endpoint
 * This handles old requests to /api/mcp/sanmar/colors by forwarding them to the Agent API
 */
export async function GET(request: NextRequest) {
  try {
    // Get style number from query parameter
    const styleNumber = request.nextUrl.searchParams.get('style') || '';
    logger.info(`Legacy MCP endpoint accessed - redirecting to Agent API: /api/mcp/sanmar/colors?style=${styleNumber}`);
    
    if (!styleNumber) {
      return NextResponse.json(
        {
          success: false,
          error: 'Style number is required'
        },
        { status: 400 }
      );
    }
    
    // Use the Agent Service to get colors for the style
    const result = await AgentService.getSanmarColors(styleNumber);
    
    if (!result.success) {
      logger.error(`Error in legacy route when getting SanMar colors for style ${styleNumber}:`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || `Failed to get SanMar colors for style ${styleNumber}`
        },
        { status: 500 }
      );
    }
    
    // Transform to match the expected format
    return NextResponse.json({
      colors: result.data || []
    });
    
  } catch (error) {
    logger.error('Error in legacy MCP SanMar colors compatibility route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 