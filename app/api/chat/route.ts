import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { processChatQuery } from '@/lib/chat-commands';
import { PrintavoOrder } from '@/lib/types';

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
    
    // Process the message to see if it's a Printavo-specific request
    const queryResult = await processChatQuery(lastUserMessage.content);
    
    if (queryResult.success) {
      // Return Printavo data response
      return NextResponse.json({
        message: queryResult.message,
        richData: queryResult.data ? {
          type: 'order',
          content: queryResult.data as PrintavoOrder
        } : undefined
      });
    }
    
    // Check if it might be a Printavo query but just not understood
    if (lastUserMessage.content.toLowerCase().includes('visual') || 
        lastUserMessage.content.toLowerCase().includes('order') ||
        lastUserMessage.content.toLowerCase().includes('invoice')) {
      // Return friendly error for Printavo queries we can't handle
      return NextResponse.json({
        message: queryResult.message
      });
    }
    
    // Handle non-Printavo messages with a generic response
    const defaultResponse = "I'm here to help you find information in Printavo. You can ask me things like 'find order 1234' or 'find order with visual ID 5'.";
    
    return NextResponse.json({
      message: defaultResponse
    });
    
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
