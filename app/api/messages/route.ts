import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * API route for processing message-based interactions, including quote creation
 * This handles requests to /api/messages, which is used by the chat interface
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract key information from the request
    const { messages, action, quoteData, customerId } = body;
    
    // Validate the request
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request: messages array is required' 
        },
        { status: 400 }
      );
    }
    
    // Get the last user message
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    
    if (!lastUserMessage) {
      return NextResponse.json({
        success: false,
        message: "I don't see any messages to respond to. How can I help you?"
      });
    }
    
    logger.info(`Processing message request with action: ${action || 'none'}`);
    
    // Handle different actions
    if (action === 'create_quote') {
      logger.info('Creating quote from chat interface');
      
      if (!quoteData) {
        return NextResponse.json({
          success: false,
          error: 'Quote data is required for create_quote action'
        }, { status: 400 });
      }
      
      try {
        // Use the Agent Service to create a quote
        const result = await AgentService.createQuote({
          customerId: customerId || quoteData.customerId,
          lineItems: quoteData.lineItems,
          notes: quoteData.notes,
          settings: quoteData.settings
        });
        
        if (!result.success) {
          logger.error('Error creating quote:', result.error);
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
          }
        });
      } catch (error) {
        logger.error('Error in quote creation:', error);
        return NextResponse.json({
          success: false,
          error: (error as Error).message || 'Unknown error creating quote',
          message: "I'm having trouble creating your quote. Please try again."
        }, { status: 500 });
      }
    } else {
      // Process regular message with NL interface
      try {
        const result = await AgentService.processNaturalLanguage({
          query: lastUserMessage.content,
          context: { messages }
        });
        
        if (!result.success) {
          logger.error('Error processing message with NL interface:', result.error);
          return NextResponse.json({
            success: false,
            message: `I'm having trouble understanding that. ${result.error || 'Please try again with a different phrase.'}`,
            error: result.error
          }, { status: 500 });
        }
        
        // Return the NL processing result
        return NextResponse.json({
          success: true,
          message: result.data.response,
          richData: result.data.data ? {
            type: result.data.type || 'agent_response',
            content: result.data.data
          } : undefined
        });
      } catch (error) {
        logger.error('Error in NL message processing:', error);
        return NextResponse.json({
          success: false,
          message: "I'm having trouble processing your message. Please try again.",
          error: (error as Error).message || 'Unknown error'
        }, { status: 500 });
      }
    }
  } catch (error) {
    logger.error('Error in messages API:', error);
    return NextResponse.json(
      {
        success: false,
        message: "Sorry, I encountered an error processing your request."
      },
      { status: 500 }
    );
  }
} 