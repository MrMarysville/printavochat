import { NextRequest, NextResponse } from 'next/server';
import { nlInterface } from '@/agents/nl-interface';

/**
 * API route for natural language queries
 * This endpoint allows users to interact with the agent system using natural language.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { query, context } = await request.json();
    
    // Validate input
    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Process the natural language query
    const result = await nlInterface.processQuery({ query, context });
    
    // Return the result
    return NextResponse.json(result);
  } catch (error) {
    console.error('Natural language API error:', error);
    
    return NextResponse.json(
      {
        success: false,
        response: `I'm sorry, I couldn't process your request.`,
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
} 