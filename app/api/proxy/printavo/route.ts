import { NextRequest, NextResponse } from 'next/server';
import { logger } from '../../../../lib/logger';

const PRINTAVO_API_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    logger.info(`Proxying request to Printavo API: ${PRINTAVO_API_URL}`);
    
    const response = await fetch(PRINTAVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': process.env.PRINTAVO_EMAIL || process.env.NEXT_PUBLIC_PRINTAVO_EMAIL || '',
        'token': process.env.PRINTAVO_TOKEN || process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '',
      },
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      logger.error(`Printavo API error: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { success: false, error: `API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, email, token',
      }
    });
  } catch (error) {
    logger.error('Error in Printavo API proxy:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, email, token',
    }
  });
} 