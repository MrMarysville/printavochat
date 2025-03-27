import { PrintavoOrder } from './types';
import { PrintavoAPIResponse } from './graphql/utils';
import { EnhancedAPIClient } from './graphql/enhanced-api-client';
import { logger } from './logger';
import { getOrder } from './graphql/operations/orders';
import { createQuote, updateStatus } from './graphql/operations/quotes';
import { StatusesAPI } from './statuses-api';
import {
  PrintavoAuthenticationError,
  PrintavoValidationError
} from './printavo-api';
import { printavoMcpClient } from './printavo-mcp-client';

class PrintavoService {
  private static instance: PrintavoService;
  private apiClient: EnhancedAPIClient;
  private useMcpClient: boolean = true;

  private constructor() {
    this.apiClient = EnhancedAPIClient.getInstance();
    
    // Check if we should use the MCP client or direct API
    this.useMcpClient = process.env.USE_PRINTAVO_MCP !== 'false';
    logger.info(`PrintavoService initialized, using MCP client: ${this.useMcpClient}`);
  }

  static getInstance(): PrintavoService {
    if (!PrintavoService.instance) {
      PrintavoService.instance = new PrintavoService();
    }
    return PrintavoService.instance;
  }

  async getOrder(id: string) {
    logger.info(`[PrintavoService] Getting order with ID: ${id}`);
    
    if (this.useMcpClient) {
      try {
        const mcpResult = await printavoMcpClient.getOrder(id);
        if (mcpResult.success) {
          return mcpResult;
        }
        logger.warn(`MCP client failed, falling back to direct API: ${JSON.stringify(mcpResult.errors)}`);
      } catch (error) {
        logger.warn(`MCP client error, falling back to direct API: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Fall back to direct API
    try {
      const result = await getOrder(id);
      return result;
    } catch (error) {
      logger.error(`Error in getOrder: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: `Failed to get order with ID ${id}` }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  }

  async getOrderByVisualId(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    logger.info(`Getting order by Visual ID: ${visualId}`);
    
    if (this.useMcpClient) {
      try {
        // Use the search functionality to find by visual ID
        const mcpResult = await printavoMcpClient.searchOrders(visualId);
        if (mcpResult.success) {
          // If we have results that match the visual ID, return the first one
          if (mcpResult.data && Array.isArray(mcpResult.data)) {
            const order = mcpResult.data.find(order => order.visualId === visualId);
            if (order) {
              return {
                success: true,
                data: order
              };
            }
          }
        }
        logger.warn(`MCP client failed for visual ID, falling back to direct API: ${JSON.stringify(mcpResult.errors)}`);
      } catch (error) {
        logger.warn(`MCP client error for visual ID, falling back to direct API: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Fall back to direct API
    return await this.apiClient.getOrder(visualId);
  }

  async searchOrders(params: {
    query?: string;
    first?: number;
    statusIds?: string[];
    sortOn?: string;
    sortDescending?: boolean;
  } = {}): Promise<PrintavoAPIResponse<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>> {
    logger.info(`Searching orders with params: ${JSON.stringify(params)}`);
    
    if (this.useMcpClient && params.query) {
      try {
        const mcpResult = await printavoMcpClient.searchOrders(params.query, params.first || 10);
        if (mcpResult.success) {
          // Transform the result to match the expected format
          return {
            success: true,
            data: {
              quotes: {
                edges: (mcpResult.data || []).map(order => ({ node: order }))
              }
            }
          };
        }
        logger.warn(`MCP client failed for search, falling back to direct API: ${JSON.stringify(mcpResult.errors)}`);
      } catch (error) {
        logger.warn(`MCP client error for search, falling back to direct API: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Fall back to direct API
    return await this.apiClient.searchOrders(params);
  }

  async createQuote(input: any) {
    logger.info(`[PrintavoService] Creating quote`);
    try {
      // Validate required fields
      if (!input.customerId && (!input.customerName || !input.customerEmail)) {
        throw new PrintavoValidationError(
          'Either customerId or customerName+customerEmail is required',
          400
        );
      }
      return createQuote(input);
    } catch (error) {
      logger.error(`Error in createQuote: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: 'Failed to create quote' }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  }

  async updateStatus(orderId: string, statusId: string) {
    logger.info(`[PrintavoService] Updating status for order ${orderId} to ${statusId}`);
    try {
      return await updateStatus(orderId, statusId);
    } catch (error) {
      logger.error(`Error updating status: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: `Failed to update status for order ${orderId}` }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  }

  async getStatuses() {
    logger.info(`[PrintavoService] Getting available statuses`);
    try {
      const result = await StatusesAPI.getStatuses();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      logger.error(`Error getting statuses: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: 'Failed to get statuses' }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  }
  
  /**
   * Set whether to use the MCP client or direct API
   * @param use Whether to use the MCP client (true) or direct API (false)
   */
  setUseMcpClient(use: boolean) {
    this.useMcpClient = use;
    logger.info(`PrintavoService updated, using MCP client: ${this.useMcpClient}`);
  }
}

// Export singleton instance
export const printavoService = PrintavoService.getInstance();

// Helper function to return default payment terms
export function getDefaultPaymentTerms() {
  return {
    id: 'default',
    name: 'Default Payment Terms',
    description: '50% deposit required to begin production. Remaining balance due upon completion.',
    depositRequired: true,
    depositPercentage: 50
  };
}
