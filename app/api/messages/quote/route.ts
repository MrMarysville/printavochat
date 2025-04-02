import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Specialized API route for quote creation through the chat interface
 * This handles requests to /api/messages/quote
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract quote data from the request
    const { quoteData, customerId, messages } = body;
    
    logger.info('Creating quote through specialized endpoint');
    
    // Validate the request
    if (!quoteData) {
      return NextResponse.json({
        success: false,
        error: 'Quote data is required'
      }, { status: 400 });
    }
    
    try {
      // Use the Agent Service to create a quote
      const result = await AgentService.createQuote({
        customerId: customerId || quoteData.customerId,
        lineItems: quoteData.lineItems || [],
        notes: quoteData.notes,
        settings: quoteData.settings || {}
      });
      
      if (!result.success) {
        logger.error('Error creating quote in specialized endpoint:', result.error);
        return NextResponse.json({
          success: false,
          error: result.error || 'Failed to create quote',
          message: `I'm having trouble creating your quote. ${result.error || 'Please try again.'}`
        }, { status: 500 });
      }
      
      // Return successful response with quote data
      return NextResponse.json({
        success: true,
        message: `Quote #${result.data.visualId || result.data.id} has been created successfully!`,
        richData: {
          type: 'quote',
          content: result.data
        },
        quoteId: result.data.id,
        visualId: result.data.visualId
      });
    } catch (error) {
      logger.error('Error in specialized quote creation endpoint:', error);
      return NextResponse.json({
        success: false,
        error: (error as Error).message || 'Unknown error creating quote',
        message: "I'm having trouble creating your quote. Please try again."
      }, { status: 500 });
    }
  } catch (error) {
    logger.error('Error in quote API:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Sorry, I encountered an error processing your quote request."
      },
      { status: 500 }
    );
  }
} 