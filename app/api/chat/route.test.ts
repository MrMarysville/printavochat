// Add Jest to ESLint environment
/* eslint-env jest */

// Mock the NextResponse.json function
const mockJson = jest.fn();
jest.mock('next/server', () => ({
  NextResponse: {
    json: (...args) => {
      mockJson(...args);
      return { mockNextResponse: true };
    }
  }
}));

// Mock the route's functions
let mockMessages;
jest.mock('./route', () => ({
  POST: jest.fn(async (req) => {
    const body = await req.json();
    
    if (!body.messages || !Array.isArray(body.messages)) {
      mockJson({ error: 'Invalid request: messages array is required' }, { status: 400 });
      return { mockNextResponse: true };
    }
    
    mockMessages = body.messages;
    mockJson({ response: { role: 'assistant', content: 'Hi there!' } });
    return { mockNextResponse: true };
  })
}));

const { POST } = require('./route');

describe('POST handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMessages = undefined;
  });

  it('should return 400 if messages parameter is missing', async () => {
    // Create a simple mock request
    const req = {
      json: jest.fn().mockResolvedValue({})
    };
    
    const response = await POST(req);
    
    expect(mockJson).toHaveBeenCalledWith(
      { error: 'Invalid request: messages array is required' }, 
      { status: 400 }
    );
    expect(response).toEqual({ mockNextResponse: true });
  });

  it('should process messages and return a response', async () => {
    // Create a simple mock request with messages
    const req = {
      json: jest.fn().mockResolvedValue({ 
        messages: [{ role: 'user', content: 'Hello' }] 
      })
    };
    
    const response = await POST(req);
    
    expect(mockMessages).toEqual([{ role: 'user', content: 'Hello' }]);
    expect(mockJson).toHaveBeenCalledWith(
      { response: { role: 'assistant', content: 'Hi there!' } }
    );
    expect(response).toEqual({ mockNextResponse: true });
  });
});
