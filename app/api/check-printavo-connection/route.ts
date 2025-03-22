import { NextResponse } from 'next/server';
import { printavoClient } from '@/lib/graphql-client';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    // Test connection to Printavo API
    const response = await printavoClient.query('/query/user', {});
    
    if (response.errors) {
      logger.error('Printavo connection test failed:', response.errors);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to connect to Printavo API',
        errors: response.errors
      }, { status: 500 });
    }
    
    logger.info('Printavo connection test successful');
    return NextResponse.json({ 
      success: true, 
      message: 'Successfully connected to Printavo API',
      user: response.data?.user
    });
  } catch (error) {
    logger.error('Printavo connection error:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error connecting to Printavo API'
    }, { status: 500 });
  }
}


