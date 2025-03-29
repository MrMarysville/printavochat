import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * This endpoint is deprecated. Direct GraphQL access has been replaced with the Printavo MCP server.
 * Please use the appropriate API endpoints or the printavoService instead.
 */
export async function POST(request: Request) {
  logger.warn('Attempted to use deprecated GraphQL endpoint');
  
  return NextResponse.json(
    {
      error: 'Direct GraphQL access is no longer supported',
      message: 'This application now uses the Printavo MCP server for all Printavo operations. Please use the appropriate API endpoints instead.'
    },
    { status: 410 } // 410 Gone - indicates that the resource is no longer available
  );
}
