import { checkApiConnection } from '@/lib/printavo-api';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

export async function GET() {
  logger.info('Health check endpoint called');
  
  // Check API connectivity
  try {
    const printavoApiStatus = await checkApiConnection();
    
    logger.info(`Printavo API connection status: ${printavoApiStatus.connected ? 'Connected' : 'Not connected'}`);
    
    // Return status and timestamp
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      printavoApi: printavoApiStatus
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      printavoApi: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to check Printavo API connection'
      }
    }, { status: 500 });
  }
} 