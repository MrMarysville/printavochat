import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * API route for validating quote data before final submission
 * This handles requests to /api/messages/quote/validate
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract quote data from the request
    const { quoteData, customerId } = body;
    
    logger.info('Validating quote data before submission');
    
    if (!quoteData) {
      return NextResponse.json({
        success: false,
        error: 'Quote data is required for validation'
      }, { status: 400 });
    }
    
    try {
      // Use the Agent Service to validate the quote
      const result = await AgentService.validateQuote({
        customerId: customerId || quoteData.customerId,
        lineItems: quoteData.lineItems || [],
        notes: quoteData.notes,
        settings: quoteData.settings || {}
      });
      
      if (!result.success) {
        logger.warn('Quote validation failed:', result.error);
        return NextResponse.json({
          success: false,
          error: result.error || 'Quote validation failed',
          validationErrors: result.data?.errors || [],
          message: 'The quote has validation issues that need to be resolved before it can be submitted.'
        }, { status: 400 });
      }
      
      // Return successful validation response
      return NextResponse.json({
        success: true,
        message: 'Quote data is valid and ready for submission',
        validatedData: result.data
      });
    } catch (error) {
      logger.error('Error in quote validation:', error);
      return NextResponse.json({
        success: false,
        error: (error as Error).message || 'Unknown error validating quote',
        message: "I'm having trouble validating your quote data. Please try again."
      }, { status: 500 });
    }
  } catch (error) {
    logger.error('Error in quote validation API:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Sorry, I encountered an error validating your quote request."
      },
      { status: 500 }
    );
  }
} 