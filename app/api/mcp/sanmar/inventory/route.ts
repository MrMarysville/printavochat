import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Compatibility route for MCP server SanMar inventory check endpoint
 * This handles old requests to /api/mcp/sanmar/inventory by forwarding them to the Agent API
 */
export async function GET(request: NextRequest) {
  try {
    // Get parameters from query
    const styleNumber = request.nextUrl.searchParams.get('style') || '';
    const color = request.nextUrl.searchParams.get('color') || '';
    const size = request.nextUrl.searchParams.get('size') || '';
    
    logger.info(`Legacy MCP endpoint accessed - redirecting to Agent API: /api/mcp/sanmar/inventory?style=${styleNumber}&color=${color}&size=${size}`);
    
    if (!styleNumber || !color) {
      return NextResponse.json(
        {
          success: false,
          error: 'Style number and color are required'
        },
        { status: 400 }
      );
    }
    
    // Use the Agent Service to check inventory
    const params = { styleNumber, color };
    if (size) {
      Object.assign(params, { size });
    }
    
    const result = await AgentService.checkSanmarInventory(params);
    
    if (!result.success) {
      logger.error(`Error in legacy route when checking SanMar inventory for style ${styleNumber}, color ${color}:`, result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || `Failed to check SanMar inventory for style ${styleNumber}, color ${color}`
        },
        { status: 500 }
      );
    }
    
    // Transform to match the expected format
    return NextResponse.json({
      inventory: result.data
    });
    
  } catch (error) {
    logger.error('Error in legacy MCP SanMar inventory compatibility route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 