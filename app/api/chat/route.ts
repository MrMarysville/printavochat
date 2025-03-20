import { NextResponse } from 'next/server';
import { processWithGPT } from '@/lib/openai-client';
import { createCompleteQuote } from '@/lib/graphql-client';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.messages) {
      return NextResponse.json(
        { error: "Missing required parameter: 'messages'." },
        { status: 400 }
      );
    }

    // Process the messages with GPT
    const result = await processWithGPT(body.messages);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API request error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}