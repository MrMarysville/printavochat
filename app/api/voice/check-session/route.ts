import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * API route handler to check if a realtime voice session is still valid
 * 
 * This will check with OpenAI if the session exists and is still valid,
 * and return the session info if it is.
 */
export async function GET(request: NextRequest) {
  // Extract sessionId from query parameters
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('sessionId');
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }
  
  try {
    logger.info(`Checking session validity for session ID: ${sessionId}`);
    
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OpenAI API key not configured');
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }
    
    // Check the session with OpenAI Realtime API
    const response = await fetch(`https://api.openai.com/v1/audio/realtime/sessions/${sessionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'OpenAI-Beta': 'realtime-audio=v1'
      }
    });
    
    if (!response.ok) {
      // If the session doesn't exist or has expired, OpenAI will return an error
      if (response.status === 404) {
        logger.info(`Session ${sessionId} not found or expired`);
        return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 });
      }
      
      const errorText = await response.text();
      logger.error(`Error checking session: ${errorText}`);
      return NextResponse.json({ error: 'Error checking session' }, { status: response.status });
    }
    
    // Session is valid, get the details
    const sessionData = await response.json();
    
    return NextResponse.json({
      sessionId: sessionData.id,
      token: sessionData.token,
      expiresAt: sessionData.expires_at,
      url: sessionData.url
    });
  } catch (error: any) {
    logger.error('Error checking session:', error);
    
    return NextResponse.json(
      { error: 'Failed to check session', details: error.message },
      { status: 500 }
    );
  }
} 