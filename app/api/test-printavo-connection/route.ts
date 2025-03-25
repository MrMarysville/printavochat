import { NextResponse } from 'next/server';
import { printavoService } from '@/lib/printavo-service';
import { logger } from '@/lib/logger';

export async function GET(request: Request) {
  try {
    // Get visual ID from query parameters
    const { searchParams } = new URL(request.url);
    const visualId = searchParams.get('visualId') || '9435';

    logger.info(`[TestEndpoint] Running Printavo connection test with visual ID: ${visualId}`);
    
    // Log environment variables for debugging (without exposing credentials)
    const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL;
    if (apiUrl) {
      logger.info(`[TestEndpoint] API URL is configured: ${apiUrl}`);
    } else {
      logger.error('[TestEndpoint] API URL is not configured');
    }
    
    const token = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
    if (token) {
      logger.info(`[TestEndpoint] API Token is configured (${token.length} characters)`);
    } else {
      logger.error('[TestEndpoint] API Token is not configured');
    }

    // Try to get order by visual ID
    const result = await printavoService.getOrderByVisualId(visualId);
    
    if (result.success && result.data) {
      logger.info(`[TestEndpoint] Successfully retrieved order with visual ID: ${visualId}`);
      return NextResponse.json({
        success: true,
        message: `Successfully retrieved order with visual ID: ${visualId}`,
        orderDetails: {
          id: result.data.id,
          visualId: result.data.visualId,
          name: result.data.name || result.data.nickname,
          customer: result.data.customer?.name || result.data.contact?.fullName,
          status: result.data.status?.name,
          total: result.data.total,
          createdAt: result.data.createdAt
        }
      });
    } else {
      // Extract error information safely
      let errorMessage = 'Unknown error occurred';
      
      if ('error' in result && result.error) {
        errorMessage = result.error instanceof Error ? result.error.message : String(result.error);
      }
      
      logger.error(`[TestEndpoint] Failed to retrieve order: ${errorMessage}`);
      
      return NextResponse.json({
        success: false,
        message: `Failed to retrieve order with visual ID: ${visualId}`,
        error: errorMessage
      }, { status: 404 });
    }
  } catch (error) {
    logger.error('[TestEndpoint] Connection test failed with error:', error);
    return NextResponse.json({
      success: false,
      message: 'Printavo connection test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 