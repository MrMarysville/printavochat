import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * API route handler to create a new OpenAI realtime voice session
 */
export async function POST(request: NextRequest) {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Parse the request body
    const body = await request.json();
    const modelName = body.model || 'gpt-4o-realtime-preview';
    
    logger.info(`Creating realtime session with model: ${modelName}`);

    try {
      // Create a session using the Realtime API
      const response = await fetch('https://api.openai.com/v1/audio/realtime/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'OpenAI-Beta': 'realtime-audio=v1'
        },
        body: JSON.stringify({
          model: modelName,
          // You can add other parameters like initial_prompt, response_format, etc.
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const sessionData = await response.json();
      
      // Return session information in our standard format
      return NextResponse.json({
        sessionId: sessionData.id,
        token: sessionData.token,
        expiresAt: sessionData.expires_at,
        url: sessionData.url,
      });
    } catch (apiError) {
      logger.error('OpenAI API error:', apiError);
      throw apiError; // Let the outer catch block handle this
    }
  } catch (error: any) {
    // Handle errors
    logger.error('Error creating realtime session:', error);
    
    // Determine the appropriate status code
    let statusCode = 500;
    let errorMessage = 'Failed to create realtime session';
    
    if (error.status === 401) {
      statusCode = 401;
      errorMessage = 'Invalid OpenAI API key';
    } else if (error.status === 400) {
      statusCode = 400;
      errorMessage = error.message || 'Bad request to OpenAI API';
    } else if (error.status === 429) {
      statusCode = 429;
      errorMessage = 'OpenAI API rate limit exceeded';
    }
    
    return NextResponse.json(
      { error: errorMessage, details: error.message },
      { status: statusCode }
    );
  }
}

// Increase the maximum payload size for this route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
}; 