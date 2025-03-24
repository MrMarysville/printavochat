import { NextResponse } from 'next/server';
import { checkApiConnection } from '@/lib/printavo-api';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Check Printavo API connection
    const apiStatus = await checkApiConnection();
    
    // Return API connection status
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      printavoApi: {
        connected: apiStatus.connected,
        message: apiStatus.message,
        account: apiStatus.connected ? apiStatus.account : undefined
      }
    });
  } catch (error) {
    logger.error('Health check error:', error);
    
    // Always return 200 OK with error details in the response body
    // This ensures the client can always get information about the API status
    return NextResponse.json({
      status: 'ok', // Still return "ok" status for the health endpoint itself
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      printavoApi: {
        connected: false,
        message: 'API connection check failed with error'
      }
    });
  }
} 