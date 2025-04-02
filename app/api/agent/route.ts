https://bqruwlcgwzljlsjmpamv.supabase.coimport { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { printavoService } from '@/lib/printavo-service'; // Correctly import the singleton instance
import { PrintavoAgentClient } from '@/agents/agent-client';

// Remove unnecessary instantiation, use the imported singleton directly

/**
 * API route for the agent system.
 * Provides access to all agent functionality through a single endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Use 'let' for operation as it might be reassigned
    let { operation, params, useToolChoice, isAssistantMessage } = body; 

    logger.info(`Agent API called with operation: ${operation}`, { useToolChoice, isAssistantMessage });

    // Handle assistant message creation (v2 feature)
    if (isAssistantMessage) {
      try {
        const client = new PrintavoAgentClient();
        await client.initialize();
        
        let messageId;
        
        switch (operation) {
          case 'add_assistant_message': {
            const { content } = params || {};
            if (!content) {
              return NextResponse.json(
                { error: 'Message content is required' },
                { status: 400 }
              );
            }
            messageId = await client.addAssistantMessage(content);
            break;
          }
          
          case 'add_order_summary': {
            const { order } = params || {};
            if (!order || !order.id) {
              return NextResponse.json(
                { error: 'Valid order data is required' },
                { status: 400 }
              );
            }
            messageId = await client.addOrderSummary(order);
            break;
          }
          
          default:
            return NextResponse.json(
              { 
                success: false,
                error: `Unknown assistant message operation: ${operation}` 
              },
              { status: 400 }
            );
        }
        
        return NextResponse.json({
          success: true,
          data: {
            messageId,
            threadId: client.getThreadId()
          },
          assistantMessageCreated: true
        });
      } catch (error) {
        logger.error('Error in agent API route with assistant message:', error);
        return NextResponse.json(
          { 
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            assistantMessageCreated: false
          },
          { status: 500 }
        );
      }
    }

    // If useToolChoice is true, use the new v2 directed tool approach
    if (useToolChoice) {
      try {
        const client = new PrintavoAgentClient();
        await client.initialize();
        
        let result;
        
        // Handle different directed tool operations
        switch (operation) {
          case 'printavo_get_order_by_visual_id': {
            const { visualId } = params || {};
            if (!visualId) {
              return NextResponse.json(
                { error: 'Visual ID is required' },
                { status: 400 }
              );
            }
            result = await client.getOrderByVisualId(visualId);
            break;
          }
          
          // Add other directed tool operations as needed
          
          default:
            // For other operations, just use the operation name and params
            if (!operation.includes('_')) {
              // Add printavo_ prefix if not present
              operation = `printavo_${operation}`;
            }
            
            result = await client.processQuery(
              `Execute ${operation}`,
              { name: operation, arguments: params }
            );
        }
        
        return NextResponse.json({
          success: true,
          data: result,
          usedToolChoice: true
        });
      } catch (error) {
        logger.error('Error in agent API route with tool choice:', error);
        return NextResponse.json(
          { 
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            usedToolChoice: true
          },
          { status: 500 }
        );
      }
    }

    // Original implementation for backward compatibility
    switch (operation) {
      // Example of how to use the imported singleton (assuming listOrders exists)
      /* 
      case 'printavo_list_orders': {
        const { first = 10, after, sortOn = 'CREATED_AT_DESC' } = params || {};
        // Use the imported printavoService directly
        const result = await printavoService.listOrders({ first, after, sortOn }); 
        
        return NextResponse.json({
          success: true,
      */
      // Add other operations as needed - the original switch case seems incomplete or outdated
      // based on the PrintavoService content read earlier.
      // For now, just keep the default case.
      
      default:
        // Corrected default case: return an error for unknown operations
        return NextResponse.json(
          { 
            success: false,
            error: `Unknown operation in legacy mode: ${operation}` 
          },
          { status: 400 }
        );
    } // End of the legacy switch statement
  } catch (error) { // This catch corresponds to the main try block
    logger.error('Error in agent API route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * Get the status of all agents.
 */
export async function GET() {
  try {
    // Get agent status
    return NextResponse.json({ 
      success: true, 
      status: {
        openaiAssistants: {
          enabled: process.env.USE_OPENAI_ASSISTANTS === 'true',
          assistantId: process.env.PRINTAVO_ASSISTANT_ID,
          v2Enabled: true,
          toolChoiceEnabled: true
        }
      }
    });
  } catch (error) {
    console.error('Agent status error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message 
      },
      { status: 500 }
    );
  }
}
