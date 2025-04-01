import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { PrintavoAgentClient } from '@/agents/agent-client';
import { nlInterface } from '@/agents/nl-interface';

export interface ChatMessage {
  id: string;
  content: string;
  role: string; 
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get the last user message
    const messages: ChatMessage[] = body.messages || [];
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    
    if (!lastUserMessage) {
      return NextResponse.json({
        message: "I don't see any messages to respond to. How can I help you?"
      });
    }
    
    // Check if we should use the new OpenAI Assistants API
    const useAssistantsApi = process.env.USE_OPENAI_ASSISTANTS === 'true';
    
    try {
      logger.info('Processing query:', lastUserMessage.content);
      
      if (useAssistantsApi) {
        // Process with OpenAI Assistants API
        logger.info('Using OpenAI Assistants API');
        
        // Get the thread ID from the request if available (for conversation continuity)
        const threadId = body.threadId || null;
        
        const client = new PrintavoAgentClient();
        
        // Initialize with existing thread if provided
        if (threadId) {
          client.threadId = threadId;
        } else {
          await client.initialize();
        }
        
        const response = await client.processQuery(lastUserMessage.content);
        
        return NextResponse.json({
          message: response,
          threadId: client.getThreadId(),
          agentProcessed: true
        });
      } else {
        // Process through legacy natural language interface
        logger.info('Using legacy NL interface');
        
        const agentResult = await nlInterface.processQuery({ 
          query: lastUserMessage.content,
          context: { messages: messages }
        });
        
        if (agentResult.success) {
          logger.info('Agent system successfully processed query');
          return NextResponse.json({
            message: agentResult.response,
            richData: agentResult.data ? {
              type: 'agent_response',
              content: agentResult.data
            } : undefined,
            agentProcessed: true
          });
        } else {
          // Handle agent failure without falling back to legacy system
          logger.error('Agent system failed to process query:', agentResult.error);
          
          return NextResponse.json({
            message: `I'm having trouble processing your request at the moment. ${agentResult.error || 'Please try again with a different query.'}`,
            error: agentResult.error
          });
        }
      }
    } catch (error) {
      logger.error('Error in agent processing:', error);
      
      // Return friendly error message
      return NextResponse.json({
        message: "I'm having trouble processing your request at the moment. Please try again in a moment.",
        error: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    logger.error('Error in chat API:', error);
    return NextResponse.json(
      {
        message: "Sorry, I encountered an error processing your request."
      },
      { status: 500 }
    );
  }
}
