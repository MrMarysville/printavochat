import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(request: NextRequest) {
  try {
    logger.info('Received transcription request');
    
    // Get form data with audio file
    const formData = await request.formData();
    const audioFile = formData.get('file') as File;
    const model = (formData.get('model') as string) || 'whisper-1';
    
    if (!audioFile) {
      logger.error('No audio file provided');
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }
    
    // Validate OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      logger.error('OpenAI API key is not set');
      return NextResponse.json({ error: 'OpenAI API key is not configured' }, { status: 500 });
    }
    
    logger.info(`Transcribing audio file of size ${audioFile.size} bytes using model ${model}`);
    
    // Create a temporary file
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `audio-${Date.now()}.webm`);
    
    // Write the file to disk
    const bytes = await audioFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(tempFilePath, buffer);
    
    // Create a File object that OpenAI can use
    const file = fs.createReadStream(tempFilePath);
    
    // Use OpenAI's audio transcription API
    const transcription = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1'
    });
    
    // Clean up the temporary file
    fs.unlinkSync(tempFilePath);
    
    logger.info('Audio transcription successful');
    
    // Return the transcribed text
    return NextResponse.json({
      text: transcription.text,
      success: true
    });
    
  } catch (error: any) {
    logger.error('Error transcribing audio:', error);
    
    // Determine appropriate error message and status
    let errorMessage = 'An error occurred while transcribing the audio';
    let statusCode = 500;
    
    if (error.status === 401) {
      errorMessage = 'Invalid OpenAI API key';
    } else if (error.status === 400) {
      errorMessage = error.message || 'Bad request to OpenAI API';
    } else if (error.status === 429) {
      errorMessage = 'Rate limit exceeded with OpenAI API';
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error.message
    }, { status: statusCode });
  }
}

// Set up appropriate body size limit for audio files
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 