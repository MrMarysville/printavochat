// Set up the necessary globals for Next.js
import { TextEncoder } from 'util';
// Use a proper mock for TextDecoder instead of assigning directly
global.TextEncoder = TextEncoder;
// @ts-ignore - Mocking TextDecoder for test environment
global.TextDecoder = function TextDecoder() {
  return {
    decode: () => ''
  };
};

// Mock fetch and Request/Response
global.fetch = jest.fn() as jest.Mock;
global.Request = jest.fn().mockImplementation((url, options) => ({
  url,
  options,
  headers: new Map(Object.entries(options?.headers || {})),
})) as unknown as typeof Request;

// Mock Response with proper structure
global.Response = jest.fn().mockImplementation((body, init) => ({
  body,
  ...init,
  json: async () => JSON.parse(body as string),
  text: async () => body as string,
  status: init?.status || 200,
  ok: (init?.status || 200) >= 200 && (init?.status || 200) < 300
})) as unknown as typeof Response;

// Add static methods required by the Response interface
// @ts-ignore - Adding static methods to mocked Response
global.Response.error = jest.fn(() => new Response(null, { status: 500 }));
// @ts-ignore - Adding static methods to mocked Response
global.Response.json = jest.fn((data) => new Response(JSON.stringify(data)));
// @ts-ignore - Adding static methods to mocked Response
global.Response.redirect = jest.fn((url, status) => new Response(null, { status: status || 302, headers: { Location: url.toString() } }));

import { NextRequest } from 'next/server';
import { POST } from '@/app/api/agent/route';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';
import { AgentStore } from '@/agents/agent-store'; 
import { supabase } from '@/lib/supabase-client';

// Mock dependencies
jest.mock('@/lib/agent-service', () => ({
  AgentService: {
    executeOperation: jest.fn()
  }
}));
jest.mock('@/lib/logger');
jest.mock('@/lib/supabase-client', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({
      data: {
        id: 'test-agent-id',
        name: 'Printavo Agent',
        assistant_id: 'asst_123456789',
        model: 'gpt-4o',
        is_active: true
      },
      error: null
    })
  }
}));
jest.mock('@/agents/agent-store', () => ({
  AgentStore: {
    getAgentByName: jest.fn().mockResolvedValue({
      id: 'test-agent-id',
      name: 'Printavo Agent',
      assistant_id: 'asst_123456789',
      model: 'gpt-4o',
      is_active: true
    })
  }
}));

describe('Agent API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle POST requests', async () => {
    // Create a mock request with proper implementation
    const req = {
      json: jest.fn().mockResolvedValue({ 
        operation: 'test_operation', 
        params: {} 
      })
    } as unknown as NextRequest;

    // Set up the mock return value
    (AgentService.executeOperation as jest.Mock).mockResolvedValue({ success: true });

    // Call the handler
    const response = await POST(req);
    
    // Verify the response
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual({ success: true });
    
    // Verify AgentService was called correctly
    expect(AgentService.executeOperation).toHaveBeenCalledWith('test_operation', {});
  });
  
  it('should fetch agent from Supabase when available', async () => {
    // Mock the operation that would trigger agent fetching
    const req = {
      json: jest.fn().mockResolvedValue({ 
        operation: 'get_agent', 
        params: { name: 'Printavo Agent' } 
      })
    } as unknown as NextRequest;

    // Set up agent service to call through to the agent store
    (AgentService.executeOperation as jest.Mock).mockImplementation(
      async (operation: string, params: any) => {
        if (operation === 'get_agent') {
          const agent = await AgentStore.getAgentByName(params.name);
          return { success: true, agent };
        }
        return { success: true };
      }
    );

    // Call the handler
    const response = await POST(req);
    
    // Verify the response
    expect(response.status).toBe(200);
    const responseData = await response.json();
    expect(responseData).toEqual({ 
      success: true, 
      agent: {
        id: 'test-agent-id',
        name: 'Printavo Agent',
        assistant_id: 'asst_123456789',
        model: 'gpt-4o',
        is_active: true
      } 
    });
    
    // Verify AgentStore was called correctly
    expect(AgentStore.getAgentByName).toHaveBeenCalledWith('Printavo Agent');
  });
});







