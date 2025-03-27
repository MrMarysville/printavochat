import { NextResponse } from 'next/server';
import { printavoMcpClient } from '@/lib/printavo-mcp-client';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || 'test';
    
    logger.info(`Testing Printavo MCP client search with query: ${query}`);
    
    const result = await printavoMcpClient.searchOrders(query);
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error) {
    logger.error('Printavo MCP test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
