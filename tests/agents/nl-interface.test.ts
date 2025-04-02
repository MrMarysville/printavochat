import { NaturalLanguageInterface } from '../../agents/nl-interface';
import { AgentManager } from '../../agents';
import { measurePerformance } from './agent-test-utils';
import fetch from 'node-fetch';

// Mock fetch globally
(global as any).fetch = fetch;

// Mock the OpenAI client
jest.mock('openai', () => {
  return class MockOpenAI {
    chat = {
      completions: {
        create: jest.fn(async (params: any) => {
          // Identify what kind of query we're processing
          const userQuery = params.messages.find((m: any) => m.role === 'user')?.content || '';
          
          // For intent extraction (with response_format json)
          if (params.response_format?.type === 'json_object') {
            if (userQuery.includes('order 1234')) {
              return {
                choices: [{
                  message: {
                    content: JSON.stringify({
                      intent: 'get_order_by_visual_id',
                      parameters: { visualId: '1234' },
                      reasoning: 'The user is asking for an order by its visual ID number',
                      confidence: 0.95
                    })
                  }
                }]
              };
            } else if (userQuery.includes('product PC61')) {
              return {
                choices: [{
                  message: {
                    content: JSON.stringify({
                      intent: 'get_product_info',
                      parameters: { styleNumber: 'PC61' },
                      reasoning: 'The user is asking for product information by style number',
                      confidence: 0.92
                    })
                  }
                }]
              };
            } else {
              return {
                choices: [{
                  message: {
                    content: JSON.stringify({
                      intent: 'search_orders',
                      parameters: { query: userQuery },
                      reasoning: 'Defaulting to search as the intent is unclear',
                      confidence: 0.6
                    })
                  }
                }]
              };
            }
          } 
          // For response formatting
          else {
            if (userQuery.includes('order') && userQuery.includes('1234')) {
              return {
                choices: [{
                  message: {
                    content: 'Here are the details for order #1234: Test Order for Customer XYZ, created on March 31, 2023.'
                  }
                }]
              };
            } else if (userQuery.includes('product') && userQuery.includes('PC61')) {
              return {
                choices: [{
                  message: {
                    content: 'PC61 is the Essential T-Shirt by Port & Company. It\'s available in multiple colors and sizes, priced at $6.99 MSRP.'
                  }
                }]
              };
            } else {
              return {
                choices: [{
                  message: {
                    content: 'I\'ve searched for orders matching your query but couldn\'t find specific results.'
                  }
                }]
              };
            }
          }
        })
      }
    }

    constructor() {
      // Nothing needed for the mock
    }
  };
});

// Mock the AgentManager
jest.mock('../../agents', () => {
  return {
    AgentManager: jest.fn().mockImplementation(() => {
      return {
        executeOperation: jest.fn((operation: string, params: any) => {
          if (operation === 'printavo_get_order_by_visual_id' && params.visualId === '1234') {
            return Promise.resolve({
              id: 'order_123',
              visualId: '1234',
              name: 'Test Order',
              customer: {
                name: 'Customer XYZ',
                email: 'xyz@example.com'
              },
              createdAt: '2023-03-31T12:00:00Z',
              updatedAt: '2023-03-31T12:30:00Z',
              total: 324.75
            });
          } else if (operation === 'sanmar_get_product_info' && params.styleNumber === 'PC61') {
            return Promise.resolve({
              styleNumber: 'PC61',
              productName: 'Essential T-Shirt',
              description: 'Port & Company® - Essential T-Shirt. PC61',
              brand: 'Port & Company',
              price: {
                listPrice: 6.99,
                netPrice: 4.99
              }
            });
          } else {
            return Promise.resolve([]);
          }
        }),
        getStatus: jest.fn(() => ({
          printavo: { status: 'ready' },
          sanmar: { status: 'ready' },
          sanmarFTP: { status: 'ready' }
        }))
      };
    })
  };
});

describe('NaturalLanguageInterface', () => {
  let nlInterface: NaturalLanguageInterface;
  
  beforeEach(() => {
    nlInterface = new NaturalLanguageInterface();
  });
  
  describe('Basic Functionality', () => {
    test('should process order query successfully', async () => {
      const result = await nlInterface.processQuery({ query: 'Show me order 1234' });
      
      expect(result.success).toBe(true);
      expect(result.response).toContain('order #1234');
      expect(result.data).toBeDefined();
    });
    
    test('should process product query successfully', async () => {
      const result = await nlInterface.processQuery({ query: 'Get information about product PC61' });
      
      expect(result.success).toBe(true);
      expect(result.response).toContain('PC61');
      expect(result.response).toContain('Essential T-Shirt');
      expect(result.data).toBeDefined();
    });
    
    test('should handle ambiguous queries with low confidence', async () => {
      const result = await nlInterface.processQuery({ query: 'Tell me about something' });
      
      // This should either have success=false or return search results
      if (!result.success) {
        expect(result.response).toContain('not entirely sure');
      } else {
        expect(result.response).toContain('searched for orders');
      }
    });
  });
  
  describe('Performance', () => {
    test('should measure query processing performance', async () => {
      const performance = await measurePerformance(
        () => nlInterface.processQuery({ query: 'Show me order 1234' }),
        3 // 3 iterations
      );
      
      console.log(`NL Query Processing Performance: ${performance.averageTimeMs.toFixed(2)}ms average (${performance.iterations} iterations)`);
      expect(performance.result.success).toBe(true);
      // Mocks should be reasonably fast, even with the simulated delays
      expect(performance.averageTimeMs).toBeLessThan(1000);
    });
  });
  
  describe('Error Handling', () => {
    test('should handle API errors gracefully', async () => {
      // Force the AgentManager.executeOperation to throw an error
      const mockAgentManager = new AgentManager();
      (mockAgentManager.executeOperation as jest.Mock).mockRejectedValueOnce(new Error('API connection failed'));
      
      // Replace the nlInterface's agentManager with our mock
      (nlInterface as any).agentManager = mockAgentManager;
      
      const result = await nlInterface.processQuery({ query: 'Show me order 1234' });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('API connection failed');
    });
    
    test('should handle OpenAI errors gracefully', async () => {
      // Override the NL interface's extractIntentAndParameters method to throw an error
      (nlInterface as any).extractIntentAndParameters = jest.fn().mockRejectedValue(
        new Error('OpenAI API rate limit exceeded')
      );
      
      const result = await nlInterface.processQuery({ query: 'Show me order 1234' });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('OpenAI API rate limit exceeded');
    });
  });
}); 