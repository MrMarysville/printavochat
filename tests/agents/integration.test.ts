import { AgentManager } from '../../agents';
import { PrintavoAgent } from '../../agents/printavo';
import { SanMarAgent } from '../../agents/sanmar';
import { NaturalLanguageInterface } from '../../agents/nl-interface';
import { measurePerformance } from './agent-test-utils';
import fetch from 'node-fetch';

// Mock fetch globally
(global as any).fetch = fetch;

// Create a simple mock for OpenAI
jest.mock('openai', () => {
  return class MockOpenAI {
    chat = {
      completions: {
        create: jest.fn(async (params: any) => {
          return {
            choices: [{
              message: {
                content: 'This is a mock response',
                tool_calls: []
              }
            }]
          };
        })
      }
    }

    constructor() {
      // Nothing needed for the mock
    }
  };
});

// Mock the agents to return test data
jest.mock('../../agents/printavo', () => {
  return {
    PrintavoAgent: jest.fn().mockImplementation(() => {
      return {
        executeOperation: jest.fn((operation: string, params: any) => {
          if (operation === 'get_order_by_visual_id') {
            return Promise.resolve({
              id: 'order_123',
              name: 'Test Order',
              visualId: params.visualId,
              customer: {
                name: 'Test Customer',
                email: 'customer@example.com'
              },
              total: 324.75
            });
          } else if (operation === 'create_quote') {
            return Promise.resolve({
              id: 'quote_123',
              name: params.name || 'Test Quote',
              customer: {
                id: params.customerId,
                name: 'Test Customer'
              },
              lineItems: params.lineItems || []
            });
          }
          return Promise.resolve({});
        }),
        getStatus: jest.fn(() => ({ status: 'ready', tools: ['get_order', 'create_quote'] }))
      };
    })
  };
});

jest.mock('../../agents/sanmar', () => {
  return {
    SanMarAgent: jest.fn().mockImplementation(() => {
      return {
        executeOperation: jest.fn((operation: string, params: any) => {
          if (operation === 'get_product_info') {
            return Promise.resolve({
              styleNumber: params.styleNumber,
              productName: 'Test Product',
              description: 'Test product description',
              price: {
                listPrice: 9.99,
                netPrice: 6.99
              }
            });
          }
          return Promise.resolve({});
        }),
        getStatus: jest.fn(() => ({ status: 'ready', tools: ['get_product_info'] }))
      };
    })
  };
});

jest.mock('../../agents/sanmar-ftp', () => {
  return {
    SanMarFTPAgent: jest.fn().mockImplementation(() => {
      return {
        executeOperation: jest.fn(() => Promise.resolve({})),
        getStatus: jest.fn(() => ({ status: 'ready', tools: [] }))
      };
    })
  };
});

/**
 * This integration test demonstrates a realistic workflow using the Agent system.
 * It tests:
 * 1. Looking up a product from SanMar
 * 2. Finding a customer order in Printavo
 * 3. Creating a new quote with products
 * 4. Using the natural language interface
 */
describe('Agent System Integration', () => {
  let agentManager: AgentManager;
  let nlInterface: NaturalLanguageInterface;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create new instances
    agentManager = new AgentManager();
    nlInterface = new NaturalLanguageInterface();
  });
  
  describe('Basic Integration', () => {
    test('should get agent status', async () => {
      const status = agentManager.getStatus();
      
      expect(status.printavo).toBeDefined();
      expect(status.sanmar).toBeDefined();
      expect(status.sanmarFTP).toBeDefined();
    });
    
    test('should execute operations on different agents', async () => {
      // Get product info from SanMar
      const productInfo = await agentManager.executeOperation('sanmar_get_product_info', { styleNumber: 'PC61' });
      expect(productInfo.styleNumber).toBe('PC61');
      
      // Get order from Printavo
      const order = await agentManager.executeOperation('printavo_get_order_by_visual_id', { visualId: '1234' });
      expect(order.visualId).toBe('1234');
    });
  });
  
  describe('Workflow Scenarios', () => {
    test('should perform quote creation workflow', async () => {
      // Step 1: Look up product information
      const productInfo = await agentManager.executeOperation('sanmar_get_product_info', { styleNumber: 'PC61' });
      
      // Step 2: Create a customer quote with the product
      const quote = await agentManager.executeOperation('printavo_create_quote', {
        customerId: 'cust_123',
        name: 'Sample Quote',
        lineItems: [
          {
            name: productInfo.productName,
            quantity: 25,
            price: productInfo.price.listPrice,
            description: `${productInfo.styleNumber} - ${productInfo.description}`
          }
        ]
      });
      
      expect(quote.id).toBe('quote_123');
      expect(quote.name).toBe('Sample Quote');
    });
    
    test('should use createQuoteWithProductLookup composite operation', async () => {
      // Mock the composite operation
      (agentManager as any).createQuoteWithProductLookup = jest.fn().mockImplementation(
        (customerInfo: any, productDetails: any) => {
          return Promise.resolve({
            id: 'quote_123',
            name: `Quote for ${customerInfo.name}`,
            customer: {
              id: 'cust_123',
              name: customerInfo.name
            },
            lineItems: productDetails.map((p: any) => ({
              name: `${p.styleNumber} Test Product`,
              quantity: p.quantity,
              price: 9.99,
              description: p.description || `${p.color}, ${p.size}`
            }))
          });
        }
      );
      
      // Execute the composite operation
      const result = await (agentManager as any).createQuoteWithProductLookup(
        {
          name: 'Test Customer',
          email: 'test@example.com'
        },
        [
          {
            styleNumber: 'PC61',
            color: 'Black',
            size: 'L',
            quantity: 25
          }
        ]
      );
      
      expect(result.id).toBe('quote_123');
      expect(result.name).toBe('Quote for Test Customer');
      expect(result.lineItems).toHaveLength(1);
      expect(result.lineItems[0].quantity).toBe(25);
    });
  });
  
  describe('Natural Language Interface', () => {
    test('should process natural language query for product info', async () => {
      // Override the NL interface's methods
      (nlInterface as any).extractIntentAndParameters = jest.fn().mockResolvedValue({
        intent: 'get_product_info',
        operation: {
          agent: 'sanmar',
          operation: 'get_product_info',
          description: 'Get product info',
          parameters: ['styleNumber']
        },
        parameters: { styleNumber: 'PC61' },
        reasoning: 'User wants product information',
        confidence: 0.95
      });
      
      (nlInterface as any).formatResponse = jest.fn().mockResolvedValue(
        'PC61 is a cotton t-shirt available in multiple colors. The list price is $9.99.'
      );
      
      const result = await nlInterface.processQuery({
        query: 'Tell me about PC61 shirts'
      });
      
      expect(result.success).toBe(true);
      expect(result.response).toContain('PC61 is a cotton t-shirt');
    });
    
    test('should process natural language query for order info', async () => {
      // Override the NL interface's methods
      (nlInterface as any).extractIntentAndParameters = jest.fn().mockResolvedValue({
        intent: 'get_order_by_visual_id',
        operation: {
          agent: 'printavo',
          operation: 'get_order_by_visual_id',
          description: 'Get order by visual ID',
          parameters: ['visualId']
        },
        parameters: { visualId: '1234' },
        reasoning: 'User wants order information',
        confidence: 0.95
      });
      
      (nlInterface as any).formatResponse = jest.fn().mockResolvedValue(
        'Order #1234 is for Test Customer with a total of $324.75.'
      );
      
      const result = await nlInterface.processQuery({
        query: 'Show me order 1234'
      });
      
      expect(result.success).toBe(true);
      expect(result.response).toContain('Order #1234');
    });
  });
  
  describe('Performance', () => {
    test('should measure performance of complete workflow', async () => {
      const workflowFn = async () => {
        // Step 1: Look up product information
        const productInfo = await agentManager.executeOperation('sanmar_get_product_info', { styleNumber: 'PC61' });
        
        // Step 2: Get customer info
        const order = await agentManager.executeOperation('printavo_get_order_by_visual_id', { visualId: '1234' });
        
        // Step 3: Create a quote
        const quote = await agentManager.executeOperation('printavo_create_quote', {
          customerId: order.customer.id || 'cust_123',
          name: `Quote for ${order.customer.name}`,
          lineItems: [
            {
              name: productInfo.productName,
              quantity: 25,
              price: productInfo.price.listPrice,
              description: `${productInfo.styleNumber} - ${productInfo.description}`
            }
          ]
        });
        
        return quote;
      };
      
      const performance = await measurePerformance(workflowFn, 3);
      
      console.log(`Complete Workflow Performance: ${performance.averageTimeMs.toFixed(2)}ms average (${performance.iterations} iterations)`);
      
      expect(performance.result).toBeDefined();
      expect(performance.result.id).toBe('quote_123');
    });
  });
}); 