/// <reference types="jest" />

import { POST } from './route';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}));

describe('POST handler', () => {
  it('should return 400 if messages parameter is missing', async () => {
    const req = {
      json: async () => ({}),
    } as Request;

    const response = await POST(req);

    expect(response).toEqual({
      data: { error: "Missing required parameter: 'messages'." },
      options: { status: 400 },
    });
  });

  it('should process messages and return a response', async () => {
    const req = {
      json: async () => ({ messages: [{ role: 'user', content: 'Hello' }] }),
    } as Request;

    const mockProcessWithGPT = jest.fn().mockResolvedValue({ role: 'assistant', content: 'Hi there!' });
    jest.mock('@/lib/openai-client', () => ({ processWithGPT: mockProcessWithGPT }));

    const response = await POST(req);

    expect(mockProcessWithGPT).toHaveBeenCalledWith([{ role: 'user', content: 'Hello' }]);
    expect(response).toEqual({
      data: { response: { role: 'assistant', content: 'Hi there!' } },
    });
  });
});