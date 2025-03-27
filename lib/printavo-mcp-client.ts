import { logger } from './logger';

/**
 * Printavo MCP Client
 * Handles interaction with the Printavo GraphQL MCP Server
 */
export class PrintavoMcpClient {
  private static instance: PrintavoMcpClient;

  private constructor() {
    logger.info('Initializing Printavo MCP Client');
  }

  /**
   * Get singleton instance of the client
   */
  public static getInstance(): PrintavoMcpClient {
    if (!PrintavoMcpClient.instance) {
      PrintavoMcpClient.instance = new PrintavoMcpClient();
    }
    return PrintavoMcpClient.instance;
  }

  /**
   * Get an order by its ID
   * @param orderId The ID of the order to retrieve
   */
  async getOrder(orderId: string) {
    try {
      logger.info(`[PrintavoMcpClient] Getting order with ID: ${orderId}`);
      
      // @ts-ignore - The global use_mcp_tool is added by Cursor.ai
      const result = await use_mcp_tool('mcp_printavo_graphql_mcp_server_get_order', {
        orderId
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error(`[PrintavoMcpClient] Error getting order: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: `Failed to get order with ID ${orderId}` }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  }

  /**
   * Get a customer by their ID
   * @param customerId The ID of the customer to retrieve
   */
  async getCustomer(customerId: string) {
    try {
      logger.info(`[PrintavoMcpClient] Getting customer with ID: ${customerId}`);
      
      // @ts-ignore - The global use_mcp_tool is added by Cursor.ai
      const result = await use_mcp_tool('mcp_printavo_graphql_mcp_server_get_customer', {
        customerId
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error(`[PrintavoMcpClient] Error getting customer: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: `Failed to get customer with ID ${customerId}` }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  }

  /**
   * Search for orders using a query string
   * @param query The search query string
   * @param limit Optional limit for the number of results to return (default: 10)
   */
  async searchOrders(query: string, limit: number = 10) {
    try {
      logger.info(`[PrintavoMcpClient] Searching orders with query: ${query}, limit: ${limit}`);
      
      // @ts-ignore - The global use_mcp_tool is added by Cursor.ai
      const result = await use_mcp_tool('mcp_printavo_graphql_mcp_server_search_orders', {
        query,
        limit
      });
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error(`[PrintavoMcpClient] Error searching orders: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: `Failed to search orders with query: ${query}` }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  }
}

// Export singleton instance
export const printavoMcpClient = PrintavoMcpClient.getInstance(); 