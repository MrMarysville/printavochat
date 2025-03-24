import { PrintavoAPIResponse, PrintavoOrder } from '../lib/types';
import { searchOperations } from '../lib/graphql/operations/searchOperations';
import { logger } from '../lib/logger';

// Mock the logger
jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  }
}));

// Track all API calls for debugging
const apiCalls: {query: any, variables: any}[] = [];

// Mock the query function
jest.mock('../lib/graphql/utils', () => {
  const originalModule = jest.requireActual('../lib/graphql/utils');
  return {
    ...originalModule,
    query: jest.fn((query, variables) => {
      // Record the API call
      apiCalls.push({query: query.loc?.source?.body || query, variables});
      
      // For the Visual ID 9435 test, return mock data
      if (variables && (variables.visualId === '9435' || variables.query === '9435')) {
        return Promise.resolve({
          data: {
            orders: {
              edges: [{
                node: {
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
                  updatedAt: '2025-03-22T00:00:00Z',
                  total: 100.00,
                }
              }]
            }
          },
          success: true
        });
      }
      
      // Return empty results for other queries
      return Promise.resolve({
        data: {
          orders: { edges: [] },
          invoices: { edges: [] },
          quotes: { edges: [] }
        }
      });
    }),
    handleAPIError: originalModule.handleAPIError
  };
});

describe('Search Order with Visual ID 9435', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiCalls.length = 0; // Clear API calls array
  });
  
  it('should be able to find order with Visual ID 9435', async () => {
    // Try to find the order using the searchOrders operation
    const result = await searchOperations.searchOrders({ visualId: '9435' });
    
    // Log the API calls for debugging
    console.log('API Calls:', JSON.stringify(apiCalls, null, 2));
    
    // Verify results
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data?.length).toBeGreaterThan(0);
    
    // Verify that the order with Visual ID 9435 was found
    const order = result.data?.[0];
    expect(order).toBeDefined();
    expect(order?.visualId).toBe('9435');
  });
  
  it('should search using the chat widget pattern', async () => {
    // Mock the implementation of OrdersAPI.getOrderByVisualId
    const { OrdersAPI } = require('../lib/printavo-api');
    const originalGetOrderByVisualId = OrdersAPI.getOrderByVisualId;
    
    // Replace with a spy function that logs calls
    OrdersAPI.getOrderByVisualId = jest.fn(async (visualId) => {
      console.log(`OrdersAPI.getOrderByVisualId called with: ${visualId}`);
      const mockOrder = {
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
      };
      return mockOrder;
    });
    
    // Import and run the determineOperation function
    const { determineOperation } = require('../lib/operations');
    const mockContext = {
      lastOrderId: undefined,
      lastOrderType: undefined,
      lastCustomerId: undefined,
      lastSearchTerm: undefined,
      lastIntent: undefined,
    };
    const mockSentiment = {
      isUrgent: false,
      isConfused: false,
      isPositive: false,
      isNegative: false,
    };
    
    // Test the "show order 9435" pattern
    const input = 'show order 9435';
    const operation = determineOperation(input, mockContext, mockSentiment);
    console.log('Operation determined:', operation.name);
    
    // Execute the operation
    const operationResult = await operation.execute();
    console.log('Operation result:', JSON.stringify(operationResult, null, 2));
    
    // Restore the original function
    OrdersAPI.getOrderByVisualId = originalGetOrderByVisualId;
    
    // Verify the operation was processed correctly
    expect(operation.name).toBeDefined();
    expect(operationResult).toBeDefined();
    expect(operationResult.message).toBeDefined();
  });
}); 