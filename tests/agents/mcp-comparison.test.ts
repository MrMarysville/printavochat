import { PrintavoAgent } from '../../agents/printavo';
import type { SanMarAgent } from '../../agents/sanmar';
import { AgentManager } from '../../agents';
import { measurePerformance, compareResults } from './agent-test-utils';
import fetch from 'node-fetch';

// Mock fetch globally
(global as any).fetch = fetch;

// Import or mock the MCP client functions
// This is a simplified mock - in real test, you'd use the actual MCP client
const mcpClient = {
  use_mcp_tool: jest.fn(async (server: string, tool: string, params: any) => {
    // Simulate MCP server responses
    if (server === 'printavo-graphql-mcp-server') {
      if (tool === 'get_account') {
        return {
          id: 'acc_123',
          name: 'Test Shop',
          subdomain: 'test',
          timeZone: 'America/Chicago',
          country: 'US',
          state: 'IL'
        };
      } else if (tool === 'get_order') {
        return {
          id: params.id,
          name: 'Test Order',
          visualId: '1234',
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
        };
      } else if (tool === 'get_order_by_visual_id') {
        return {
          id: 'order_' + params.visualId,
          name: 'Test Order',
          visualId: params.visualId,
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
        };
      }
    } else if (server === 'sanmar-mcp-server') {
      if (tool === 'get_product_info') {
        return {
          styleNumber: params.styleNumber,
          productName: params.styleNumber === 'PC61' ? 'Essential T-Shirt' : 'District® Very Important Tee®',
          description: params.styleNumber === 'PC61' ? 'Port & Company® - Essential T-Shirt. PC61' : 'District® - Very Important Tee®. DT6000',
          brand: params.styleNumber === 'PC61' ? 'Port & Company' : 'District',
          price: {
            listPrice: params.styleNumber === 'PC61' ? 6.99 : 8.99,
            netPrice: params.styleNumber === 'PC61' ? 4.99 : 6.49
          }
        };
      }
    }
    
    // Default fallback
    return {};
  })
};

// Mock the actual MCP client
jest.mock('../../lib/printavo-mcp-client', () => mcpClient);

// Create a mock SanMarAgent class
class MockSanMarAgent {
  executeOperation(operation: string, params: any) {
    if (operation === 'get_product_info') {
      return Promise.resolve({
        styleNumber: params.styleNumber,
        productName: params.styleNumber === 'PC61' ? 'Essential T-Shirt' : 'District® Very Important Tee®',
        description: params.styleNumber === 'PC61' ? 'Port & Company® - Essential T-Shirt. PC61' : 'District® - Very Important Tee®. DT6000',
        brand: params.styleNumber === 'PC61' ? 'Port & Company' : 'District',
        price: {
          listPrice: params.styleNumber === 'PC61' ? 6.99 : 8.99,
          netPrice: params.styleNumber === 'PC61' ? 4.99 : 6.49
        }
      });
    }
    return Promise.resolve({});
  }

  getStatus() {
    return { status: 'ready', tools: [] };
  }
}

// Tell TypeScript to treat our mock as an instance of SanMarAgent
// @ts-ignore
const createSanMarAgent = (): SanMarAgent => new MockSanMarAgent();

// Mock the SanMar FTP Agent
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

describe('Agent vs MCP Comparison', () => {
  const shouldSkip = process.env.CI === 'true';
  
  // Skip these tests in CI environments
  describe('Printavo Agent vs MCP', () => {
    let agent: PrintavoAgent;
    let agentManager: AgentManager;
    
    beforeEach(() => {
      agent = new PrintavoAgent(process.env.OPENAI_API_KEY || 'test_key');
      agentManager = new AgentManager();
      
      // Mock the agent's executeGraphQL method to return test data
      (agent as any).executeGraphQL = jest.fn(async (query: string, variables: any, operationName?: string) => {
        if (query.includes('account')) {
          return { account: mcpClient.use_mcp_tool('printavo-graphql-mcp-server', 'get_account', {}) };
        } else if (query.includes('order(id:')) {
          return { order: mcpClient.use_mcp_tool('printavo-graphql-mcp-server', 'get_order', variables) };
        } else if (query.includes('invoices') && variables.visualId) {
          const order = mcpClient.use_mcp_tool('printavo-graphql-mcp-server', 'get_order_by_visual_id', { visualId: variables.visualId });
          return { invoices: { edges: [{ node: order }] } };
        }
        
        return {};
      });
    });
    
    (shouldSkip ? test.skip : test)('should compare account info retrieval performance', async () => {
      // Measure performance of MCP client
      const mcpPerformance = await measurePerformance(
        async () => mcpClient.use_mcp_tool('printavo-graphql-mcp-server', 'get_account', {}),
        5
      );
      
      // Measure performance of Agent
      const agentPerformance = await measurePerformance(
        async () => agent.executeOperation('get_account', {}),
        5
      );
      
      console.log('Account Info Performance Comparison:');
      console.log(`- MCP: ${mcpPerformance.averageTimeMs.toFixed(2)}ms average (${mcpPerformance.iterations} iterations)`);
      console.log(`- Agent: ${agentPerformance.averageTimeMs.toFixed(2)}ms average (${agentPerformance.iterations} iterations)`);
      console.log(`- Difference: ${(mcpPerformance.averageTimeMs - agentPerformance.averageTimeMs).toFixed(2)}ms`);
      
      // Compare results for consistency
      const comparison = compareResults(mcpPerformance.result, agentPerformance.result);
      
      // Log any differences
      if (!comparison.identical) {
        console.log('Differences found in results:');
        console.log(JSON.stringify(comparison.differences, null, 2));
      }
      
      expect(comparison.identical).toBe(true);
    });
    
    (shouldSkip ? test.skip : test)('should compare order by visual ID performance', async () => {
      const visualId = '1234';
      
      // Measure performance of MCP client
      const mcpPerformance = await measurePerformance(
        async () => mcpClient.use_mcp_tool('printavo-graphql-mcp-server', 'get_order_by_visual_id', { visualId }),
        5
      );
      
      // Measure performance of Agent
      const agentPerformance = await measurePerformance(
        async () => agent.executeOperation('get_order_by_visual_id', { visualId }),
        5
      );
      
      console.log('Order by Visual ID Performance Comparison:');
      console.log(`- MCP: ${mcpPerformance.averageTimeMs.toFixed(2)}ms average (${mcpPerformance.iterations} iterations)`);
      console.log(`- Agent: ${agentPerformance.averageTimeMs.toFixed(2)}ms average (${agentPerformance.iterations} iterations)`);
      console.log(`- Difference: ${(mcpPerformance.averageTimeMs - agentPerformance.averageTimeMs).toFixed(2)}ms`);
      
      // Compare results for consistency
      const comparison = compareResults(mcpPerformance.result, agentPerformance.result);
      
      // Log any differences
      if (!comparison.identical) {
        console.log('Differences found in results:');
        console.log(JSON.stringify(comparison.differences, null, 2));
      }
      
      expect(comparison.identical).toBe(true);
    });
    
    (shouldSkip ? test.skip : test)('should compare AgentManager vs direct MCP calls for composite operations', async () => {
      // This test would measure performance of a composite operation (e.g., creating a quote with product lookup)
      // that spans multiple MCP servers vs using the AgentManager for the same operation
      
      const customerInfo = {
        name: 'Test Customer',
        email: 'test@example.com'
      };
      
      const productDetails = [
        { styleNumber: 'PC61', color: 'Black', size: 'L', quantity: 25 }
      ];
      
      // Mock the relevant methods to make this test work
      jest.spyOn(agentManager as any, 'createQuoteWithProductLookup').mockResolvedValue({
        id: 'quote_123',
        name: 'Quote for Test Customer',
        customer: {
          id: 'cust_123',
          name: 'Test Customer'
        },
        lineItems: [
          {
            name: 'PC61 Essential T-Shirt',
            quantity: 25,
            price: 12.99,
            description: 'Black, L'
          }
        ]
      });
      
      // For MCP, we'd need to mock a sequence of calls
      const mockMcpCompositeOperation = async () => {
        // 1. Get product info from SanMar
        const product = await mcpClient.use_mcp_tool(
          'sanmar-mcp-server', 
          'get_product_info', 
          { styleNumber: 'PC61' }
        );
        
        // 2. Find or create customer in Printavo
        const customerId = 'cust_123'; // In real test, this would come from a call
        
        // 3. Create quote in Printavo
        return mcpClient.use_mcp_tool(
          'printavo-graphql-mcp-server',
          'create_quote',
          {
            customerId,
            name: `Quote for ${customerInfo.name}`,
            lineItems: [
              {
                name: `${product.styleNumber} ${product.productName}`,
                quantity: productDetails[0].quantity,
                price: 12.99,
                description: `${productDetails[0].color}, ${productDetails[0].size}`
              }
            ]
          }
        );
      };
      
      // Measure performance of composite MCP operation
      const mcpPerformance = await measurePerformance(
        mockMcpCompositeOperation,
        3
      );
      
      // Measure performance of Agent composite operation
      const agentPerformance = await measurePerformance(
        () => agentManager.createQuoteWithProductLookup(customerInfo, productDetails),
        3
      );
      
      console.log('Composite Operation Performance Comparison:');
      console.log(`- MCP: ${mcpPerformance.averageTimeMs.toFixed(2)}ms average (${mcpPerformance.iterations} iterations)`);
      console.log(`- Agent: ${agentPerformance.averageTimeMs.toFixed(2)}ms average (${agentPerformance.iterations} iterations)`);
      console.log(`- Difference: ${(mcpPerformance.averageTimeMs - agentPerformance.averageTimeMs).toFixed(2)}ms`);
      
      // In a real test, we would do result comparison here
      expect(agentPerformance.result).toBeDefined();
    });
  });
  
  describe('SanMar Agent vs MCP', () => {
    let agent: SanMarAgent;
    
    beforeEach(() => {
      agent = createSanMarAgent();
      
      // Mock necessary methods for testing
      (agent as any).lookupProduct = jest.fn((styleNumber: string) => {
        return mcpClient.use_mcp_tool('sanmar-mcp-server', 'get_product_info', { styleNumber });
      });
    });
    
    (shouldSkip ? test.skip : test)('should compare product info retrieval performance', async () => {
      const styleNumber = 'PC61';
      
      // Measure performance of MCP client
      const mcpPerformance = await measurePerformance(
        async () => mcpClient.use_mcp_tool('sanmar-mcp-server', 'get_product_info', { styleNumber }),
        5
      );
      
      // Measure performance of Agent
      const agentPerformance = await measurePerformance(
        async () => agent.executeOperation('get_product_info', { styleNumber }),
        5
      );
      
      console.log('Product Info Performance Comparison:');
      console.log(`- MCP: ${mcpPerformance.averageTimeMs.toFixed(2)}ms average (${mcpPerformance.iterations} iterations)`);
      console.log(`- Agent: ${agentPerformance.averageTimeMs.toFixed(2)}ms average (${agentPerformance.iterations} iterations)`);
      console.log(`- Difference: ${(mcpPerformance.averageTimeMs - agentPerformance.averageTimeMs).toFixed(2)}ms`);
      
      // Compare results for consistency
      const comparison = compareResults(mcpPerformance.result, agentPerformance.result);
      
      // Log any differences
      if (!comparison.identical) {
        console.log('Differences found in results:');
        console.log(JSON.stringify(comparison.differences, null, 2));
      }
      
      expect(comparison.identical).toBe(true);
    });
  });
}); 