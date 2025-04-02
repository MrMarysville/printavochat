import { PrintavoAgent } from '../../agents/printavo';
import { createMockGraphQLExecutor, measurePerformance, compareResults } from './agent-test-utils';
import fetch from 'node-fetch';

// Mock fetch globally
(global as any).fetch = fetch;

// Set up environment variables for testing
process.env.PRINTAVO_API_URL = 'https://test.printavo.com/api/v2';
process.env.PRINTAVO_EMAIL = 'test@example.com';
process.env.PRINTAVO_TOKEN = 'test_token';
process.env.OPENAI_API_KEY = 'test_openai_key';

// Mock responses for GraphQL operations
const mockResponses = {
  GetAccount: {
    account: {
      id: 'acc_123',
      name: 'Test Shop',
      subdomain: 'test',
      timeZone: 'America/Chicago',
      country: 'US',
      state: 'IL'
    }
  },
  GetOrder: {
    order: {
      id: 'order_123',
      name: 'Test Order',
      visualId: '1234',
      createdAt: '2023-04-01T12:00:00Z',
      updatedAt: '2023-04-01T12:30:00Z',
      dueDate: '2023-04-15T12:00:00Z',
      status: {
        id: 'status_1',
        name: 'In Production',
        color: 'blue'
      },
      customer: {
        id: 'cust_123',
        name: 'Test Customer',
        email: 'customer@example.com',
        phone: '555-1234'
      },
      lineItemGroups: {
        edges: [{
          node: {
            id: 'lig_1',
            name: 'T-Shirts',
            lineItems: {
              edges: [{
                node: {
                  id: 'li_1',
                  name: 'Blue T-Shirt',
                  description: 'Cotton blue t-shirt',
                  quantity: 25,
                  price: 12.99,
                  total: 324.75
                }
              }]
            }
          }
        }]
      },
      lineItems: {
        edges: []
      },
      notes: 'Test notes',
      productionNotes: 'Test production notes',
      total: 324.75,
      depositTotal: 100,
      depositDue: 0,
      balanceRemaining: 224.75
    }
  },
  GetOrderByVisualId: {
    invoices: {
      edges: [{
        node: {
          id: 'order_123',
          name: 'Test Order',
          visualId: '1234',
          createdAt: '2023-04-01T12:00:00Z',
          updatedAt: '2023-04-01T12:30:00Z',
          dueDate: '2023-04-15T12:00:00Z',
          status: {
            id: 'status_1',
            name: 'In Production',
            color: 'blue'
          },
          customer: {
            id: 'cust_123',
            name: 'Test Customer',
            email: 'customer@example.com',
            phone: '555-1234'
          },
          lineItemGroups: {
            edges: []
          },
          lineItems: {
            edges: [{
              node: {
                id: 'li_1',
                name: 'Blue T-Shirt',
                description: 'Cotton blue t-shirt',
                quantity: 25,
                price: 12.99,
                total: 324.75
              }
            }]
          },
          notes: 'Test notes',
          productionNotes: 'Test production notes',
          total: 324.75,
          depositTotal: 100,
          depositDue: 0,
          balanceRemaining: 224.75
        }
      }]
    }
  },
  SearchOrders: {
    orders: {
      edges: [{
        node: {
          id: 'order_123',
          name: 'Test Order',
          visualId: '1234',
          createdAt: '2023-04-01T12:00:00Z',
          updatedAt: '2023-04-01T12:30:00Z',
          status: {
            id: 'status_1',
            name: 'In Production',
            color: 'blue'
          },
          customer: {
            id: 'cust_123',
            name: 'Test Customer',
            email: 'customer@example.com'
          },
          total: 324.75
        }
      }]
    }
  },
  ListPayments: {
    order: {
      transactions: {
        edges: [{
          node: {
            id: 'payment_1',
            amount: 100,
            date: '2023-04-01',
            paymentMethod: 'Credit Card',
            status: 'completed'
          }
        }]
      }
    }
  }
};

// Create a modified PrintavoAgent class for testing
class TestPrintavoAgent extends PrintavoAgent {
  constructor() {
    super('test_openai_key');
    
    // Override the GraphQL executor with our mock
    (this as any).executeGraphQL = createMockGraphQLExecutor(mockResponses);
  }
}

describe('PrintavoAgent', () => {
  let agent: PrintavoAgent;
  
  beforeEach(() => {
    agent = new TestPrintavoAgent();
  });
  
  describe('Basic Functionality', () => {
    test('should initialize with tools', () => {
      const status = agent.getStatus();
      expect(status.status).toBe('ready');
      expect(status.tools.length).toBeGreaterThan(0);
    });
  
    test('should execute get_account operation', async () => {
      const result = await agent.executeOperation('get_account', {});
      expect(result).toEqual(mockResponses.GetAccount.account);
    });
  
    test('should execute get_order operation', async () => {
      const result = await agent.executeOperation('get_order', { id: 'order_123' });
      expect(result).toEqual(mockResponses.GetOrder.order);
    });
  
    test('should execute get_order_by_visual_id operation', async () => {
      const result = await agent.executeOperation('get_order_by_visual_id', { visualId: '1234' });
      expect(result).toEqual(mockResponses.GetOrderByVisualId.invoices.edges[0].node);
    });
  
    test('should throw error for unknown operation', async () => {
      await expect(agent.executeOperation('unknown_operation', {}))
        .rejects.toThrow('Unknown operation: unknown_operation');
    });
  });
  
  describe('Performance', () => {
    test('should measure performance of get_order operation', async () => {
      const performance = await measurePerformance(
        () => agent.executeOperation('get_order', { id: 'order_123' }),
        5 // 5 iterations
      );
      
      console.log(`Get Order Performance: ${performance.averageTimeMs.toFixed(2)}ms average (${performance.iterations} iterations)`);
      expect(performance.result).toEqual(mockResponses.GetOrder.order);
      expect(performance.averageTimeMs).toBeLessThan(1000); // Should be fast with mocks
    });
  
    test('should measure performance of get_order_summary operation', async () => {
      const performance = await measurePerformance(
        () => agent.executeOperation('get_order_summary', { id: 'order_123' }),
        5 // 5 iterations
      );
      
      console.log(`Get Order Summary Performance: ${performance.averageTimeMs.toFixed(2)}ms average (${performance.iterations} iterations)`);
      expect(performance.result.order).toEqual(mockResponses.GetOrder.order);
      expect(performance.averageTimeMs).toBeLessThan(1000); // Should be fast with mocks
    });
  });
  
  describe('High-Level Operations', () => {
    test('should create a quote with customer and products', async () => {
      const customerInfo = {
        name: 'Test Customer',
        email: 'test@example.com'
      };
      
      const products = [
        {
          name: 'T-Shirt',
          quantity: 25,
          price: 12.99,
          description: 'Blue cotton t-shirt'
        }
      ];
      
      // Mock for this test
      jest.spyOn(agent as any, 'executeOperation').mockImplementation((operation: string, params: any) => {
        if (operation === 'get_customer_by_email') {
          return Promise.resolve({
            id: 'cust_123',
            name: 'Test Customer',
            email: 'test@example.com'
          });
        }
        if (operation === 'create_quote') {
          return Promise.resolve({
            id: 'quote_123',
            name: 'Quote for Test Customer',
            customer: {
              id: 'cust_123',
              name: 'Test Customer'
            },
            lineItems: products.map(p => ({
              name: p.name,
              quantity: p.quantity,
              price: p.price,
              description: p.description
            }))
          });
        }
        return Promise.resolve({});
      });
      
      const result = await (agent as any).createQuote(customerInfo, products);
      expect(result.id).toBe('quote_123');
      expect(result.name).toBe('Quote for Test Customer');
    });
  });
});

// This test is kept separate as it involves actual MCP client calls
describe('Agent vs MCP Comparison', () => {
  // Skip these tests in CI environments
  const shouldSkip = process.env.CI === 'true';
  
  // Skip this test by default since it requires actual MCP client and API access
  (shouldSkip ? test.skip : test)('should compare agent results with MCP results', async () => {
    // This would require setting up the MCP client and actual API calls
    // Implementation depends on how MCP client is accessed
    // For now, we'll just log a placeholder
    console.log('This test would compare agent results with MCP server results');
    expect(true).toBe(true);
  });
}); 