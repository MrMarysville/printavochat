import { NextRequest } from 'next/server';
import { OrdersAPI, PrintavoAPIError } from '../lib/printavo-api';

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data) => ({
      json: async () => data
    }))
  }
}));

// Mock the logger
jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }
}));

// Mock the PrintavoAPIError
jest.mock('../lib/printavo-api', () => ({
  OrdersAPI: {
    getOrderByVisualId: jest.fn(),
    getOrder: jest.fn(),
    getOrders: jest.fn(),
  },
  CustomersAPI: {
    getCustomers: jest.fn(),
  },
  ProductsAPI: {
    getProducts: jest.fn(),
  },
  PrintavoAPIError: class PrintavoAPIError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.name = 'PrintavoAPIError';
      this.statusCode = statusCode;
    }
  }
}));

const mockUser = { 
  id: 'user-123', 
  content: 'show order 9435', 
  role: 'user', 
  timestamp: new Date().toISOString() 
};

describe('Chat API Visual ID Search', () => {
  let POST;
  
  beforeAll(async () => {
    // Dynamically import the POST handler to avoid "Request is not defined" error in tests
    const module = await import('../app/api/chat/route');
    POST = module.POST;
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should handle "show order 9435" as a Visual ID search', async () => {
    // Mock the OrdersAPI.getOrderByVisualId to return data
    (OrdersAPI.getOrderByVisualId as jest.Mock).mockResolvedValueOnce({
      id: 'INV-1234',
      visualId: '9435',
      name: 'Test Order',
      status: {
        id: '1',
        name: 'In Progress',
      },
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
      },
      createdAt: '2025-03-22T00:00:00Z',
      total: 100.00,
    });
    
    // Create a mock request
    const req = {
      json: jest.fn().mockResolvedValueOnce({
        messages: [mockUser]
      })
    };
    
    // Call the POST handler
    const response = await POST(req as unknown as NextRequest);
    const responseData = await response.json();
    
    // Check if the getOrderByVisualId was called with the correct visual ID
    expect(OrdersAPI.getOrderByVisualId).toHaveBeenCalledWith('9435');
    
    // Check if the response contains a reference to the order
    expect(responseData).toBeDefined();
    expect(responseData.message).toBeDefined();
    expect(responseData.message).toContain('Visual ID #9435');
    expect(responseData.richData).toBeDefined();
    expect(responseData.richData.type).toBe('order');
  });
  
  it('should handle error when order with Visual ID 9435 is not found', async () => {
    // Mock the OrdersAPI.getOrderByVisualId to return null (no order found)
    (OrdersAPI.getOrderByVisualId as jest.Mock).mockResolvedValueOnce(null);
    
    // Create a mock request
    const req = {
      json: jest.fn().mockResolvedValueOnce({
        messages: [mockUser]
      })
    };
    
    // Call the POST handler
    const response = await POST(req as unknown as NextRequest);
    const responseData = await response.json();
    
    // Check that we get an error response with the right message
    expect(responseData).toBeDefined();
    expect(responseData.message).toBeDefined();
    expect(responseData.message).toContain('couldn\'t find');
    expect(responseData.message).toContain('9435');
  });
}); 