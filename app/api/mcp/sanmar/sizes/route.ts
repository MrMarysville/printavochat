import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Compatibility route for MCP server SanMar sizes endpoint
 * This handles old requests to /api/mcp/sanmar/sizes by forwarding them to the Agent API
 */
export async function GET(request: NextRequest) {
  try {
    // Get parameters from query
    const styleNumber = request.nextUrl.searchParams.get('style') || '';
    const color = request.nextUrl.searchParams.get('color') || '';
    
    logger.info(`Legacy MCP endpoint accessed - redirecting to Agent API: /api/mcp/sanmar/sizes?style=${styleNumber}&color=${color}`);
    
    if (!styleNumber || !color) {
      return NextResponse.json(
        {
          success: false,
          error: 'Style number and color are required'
        },
        { status: 400 }
      );
    }
    
    // Use the Agent Service to get sizes
    const result = await AgentService.getSanmarSizes({ styleNumber, color });
    
    if (!result.success) {
      logger.error(`Error in legacy route when getting SanMar sizes for style ${styleNumber}, color ${color}:`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || `Failed to get SanMar sizes for style ${styleNumber}, color ${color}`
        },
        { status: 500 }
      );
    }
    
    // Transform to match the expected format
    return NextResponse.json({
      sizes: result.data || []
    });
    
  } catch (error) {
    logger.error('Error in legacy MCP SanMar sizes compatibility route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 