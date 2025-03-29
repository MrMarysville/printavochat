// Remove unused imports related to direct GraphQL calls
// Remove updateStatus import from operations/quotes
// Remove StatusesAPI import
import { PrintavoOrder, PrintavoAPIResponse } from './types'; // Corrected import path
// Remove createQuote import from operations/quotes
// Removed incorrect import: import { PrintavoAPIResponse } from './graphql/utils';
import { logger } from './logger';
// createQuote import was already removed in the previous step, this block is just for context matching
import {
  PrintavoAuthenticationError, // Keep for error handling if needed
  PrintavoValidationError // Keep for error handling if needed
} from './printavo-api';
import { printavoMcpClient } from './printavo-mcp-client'; // Keep MCP client

class PrintavoService {
  private static instance: PrintavoService;
  // Remove apiClient if no longer needed
  // private apiClient: EnhancedAPIClient;
  // Remove useMcpClient flag as it's always true now
  // private useMcpClient: boolean = true;

  private constructor() {
    // Remove apiClient initialization
    // this.apiClient = EnhancedAPIClient.getInstance();
    logger.info(`PrintavoService initialized, relying solely on MCP client.`);
  }

  static getInstance(): PrintavoService {
    if (!PrintavoService.instance) {
      PrintavoService.instance = new PrintavoService();
    }
    return PrintavoService.instance;
  }

  async getOrder(id: string): Promise<PrintavoAPIResponse<any>> {
    logger.info(`[PrintavoService] Getting order with ID via MCP: ${id}`);
    // Directly call MCP client, no fallback
    return await printavoMcpClient.getOrder(id);
  }

  async getOrderByVisualId(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    logger.info(`[PrintavoService] Getting order by Visual ID via MCP: ${visualId}`);
    // Use MCP search and find the specific order
    const mcpResult = await printavoMcpClient.searchOrders(visualId, 5); // Search limit 5

    // Check for errors first
    if (mcpResult.errors && mcpResult.errors.length > 0) {
      logger.warn(`MCP client search for visual ID ${visualId} failed: ${JSON.stringify(mcpResult.errors)}`);
      return { errors: mcpResult.errors };
    }

    // Check if data exists and is an array
    if (mcpResult.data && Array.isArray(mcpResult.data)) {
      const order = mcpResult.data.find((o: PrintavoOrder) => o.visualId === visualId);
      if (order) {
        // Success case: return only data
        return { data: order };
      }
    }

    // If MCP search succeeded but didn't find the exact visual ID
    logger.warn(`MCP client could not find exact match for visual ID ${visualId}. Result: ${JSON.stringify(mcpResult)}`);
    return {
      // Return an error indicating not found
      errors: [{ message: `Order with visual ID ${visualId} not found via MCP.` }]
    };
  }

  async searchOrders(params: {
    query?: string;
    first?: number;
    // statusIds, sortOn, sortDescending might not be supported by MCP searchOrders tool directly
  } = {}): Promise<PrintavoAPIResponse<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>> {
    logger.info(`[PrintavoService] Searching orders via MCP with query: ${params.query}`);

    if (!params.query) {
        logger.warn("SearchOrders called without a query parameter.");
        // Return empty data structure for no query
        return { data: { quotes: { edges: [] } } };
    }

    // Directly call MCP client searchOrders
    const mcpResult = await printavoMcpClient.searchOrders(params.query, params.first || 10);

    // Check for errors first
    if (mcpResult.errors && mcpResult.errors.length > 0) {
       logger.error(`MCP client search failed: ${JSON.stringify(mcpResult.errors)}`);
       return { errors: mcpResult.errors, data: { quotes: { edges: [] } } }; // Return errors and empty data structure
    }

    // If no errors, transform the result
    return {
      data: {
        quotes: {
          // Ensure data exists and is an array before mapping
          edges: (mcpResult.data && Array.isArray(mcpResult.data) ? mcpResult.data : []).map((order: PrintavoOrder) => ({ node: order }))
        }
      }
    }
  }

  async createCustomer(input: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    companyName?: string;
  }): Promise<PrintavoAPIResponse<any>> {
    logger.info(`[PrintavoService] Creating customer via MCP`);
    try {
      // Basic validation
      if (!input.firstName || !input.lastName) {
        throw new PrintavoValidationError('First name and last name are required to create a customer', 400);
      }
      // @ts-ignore - Assume global use_mcp_tool exists
      const result = await use_mcp_tool('printavo-graphql-mcp-server', 'create_customer', input);
      // Assuming result is the created customer data or throws on MCP error
      return { data: result };
    } catch (error: any) { // Add type annotation
      logger.error(`MCP Error creating customer: ${error instanceof Error ? error.message : String(error)}`);
      // Construct error response
      const message = error instanceof PrintavoValidationError ? error.message : 'Failed to create customer via MCP';
      return {
        errors: [{ message: message }]
      };
    }
  }

  async getCustomers(params: {
    query?: string;
    first?: number;
  } = {}): Promise<PrintavoAPIResponse<{ customers: { edges: Array<{ node: any }> } }>> {
    logger.info(`[PrintavoService] Getting customers via MCP with query: ${params.query}`);
    try {
      // @ts-ignore - Assume global use_mcp_tool exists
      const result = await use_mcp_tool('printavo-graphql-mcp-server', 'search_customers', {
        query: params.query || '', // Pass query, default to empty string if undefined
        limit: params.first || 10 // Pass limit
      });

      // Assuming result is an array of customer nodes or throws on MCP error
      // Transform the result to match the expected GraphQL-like structure
      const edges = Array.isArray(result) ? result.map((customer: any) => ({ node: customer })) : [];

      return {
        data: {
          customers: {
            edges: edges
          }
        }
      };
    } catch (error: any) { // Add type annotation
      logger.error(`MCP Error getting customers: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Failed to get customers via MCP' }],
        data: { customers: { edges: [] } } // Ensure data structure matches on error
      };
    }
  }


  // Keep createQuote, updateStatus, getStatuses as they might use different mechanisms
  // or dedicated MCP tools not covered by the generic get/search methods.
  async createQuote(input: any): Promise<PrintavoAPIResponse<any>> {
    logger.info(`[PrintavoService] Creating quote via MCP`);
    try {
      // Validate required fields (keep validation)
      if (!input.customerId && (!input.customerName || !input.customerEmail)) {
        throw new PrintavoValidationError(
          'Either customerId or both customerName and customerEmail are required',
          400
        );
      }
       if (!input.statusId) {
         // Add validation for other required fields based on the MCP tool schema if necessary
         throw new PrintavoValidationError('Missing required statusId for creating quote', 400);
       }

      // Directly call MCP client create_quote tool
      // @ts-ignore - Assume global use_mcp_tool exists
      const result = await use_mcp_tool('printavo-graphql-mcp-server', 'create_quote', input); // Corrected tool name

      // Assuming the MCP tool returns the created quote object or throws on MCP error
      return { data: result };
    } catch (error: any) { // Add type annotation
      logger.error(`MCP Error creating quote: ${error instanceof Error ? error.message : String(error)}`);
      // Handle potential validation errors from the MCP tool/server itself
      const message = error instanceof PrintavoValidationError ? error.message : 'Failed to create quote via MCP';
      return {
        errors: [{ message: message }]
      };
    }
  }

  async updateStatus(orderId: string, statusId: string): Promise<PrintavoAPIResponse<any>> {
    logger.info(`[PrintavoService] Updating status for order ${orderId} to ${statusId} via MCP`);
    try {
      // Directly call MCP client update_status tool
      // @ts-ignore - Assume global use_mcp_tool exists
      const result = await use_mcp_tool('printavo-graphql-mcp-server', 'update_status', { // Corrected tool name
        parentId: orderId,
        statusId: statusId
      });
      // Assuming the MCP tool returns the updated object or throws on MCP error
      return { data: result };
    } catch (error: any) { // Add type annotation
      logger.error(`MCP Error updating status: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: `Failed to update status for order ${orderId}` }]
      };
    }
  }

  async getStatuses(type?: 'INVOICE' | 'QUOTE' | 'TASK'): Promise<PrintavoAPIResponse<any>> {
    logger.info(`[PrintavoService] Getting available statuses via MCP for type: ${type || 'all'}`);
    try {
       // Directly call MCP client list_statuses tool
      // @ts-ignore - Assume global use_mcp_tool exists
      const result = await use_mcp_tool('printavo-graphql-mcp-server', 'list_statuses', { // Corrected tool name
         type: type, // Pass optional type filter
         limit: 200 // Use 'limit' based on typical MCP tool naming
       });
       // Assuming the MCP tool returns the status data or throws on MCP error
       return { data: result };
    } catch (error: any) { // Add type annotation
      logger.error(`MCP Error getting statuses: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Failed to get statuses' }]
      };
    }
  }

  async getPaymentTerms(): Promise<PrintavoAPIResponse<{ paymentTerms: Array<{ id: string; name: string; description?: string }> }>> {
    logger.info(`[PrintavoService] Getting payment terms via MCP`);
    try {
      // @ts-ignore - Assume global use_mcp_tool exists
      const result = await use_mcp_tool('printavo-graphql-mcp-server', 'list_payment_terms', {
        limit: 50 // Get a reasonable number of terms
      });

      // Assuming the MCP tool returns an object containing an array of payment terms, or throws on MCP error
      // Adjust the path (e.g., result.paymentTerms) based on the actual tool response structure
      const paymentTerms = (result && result.paymentTerms && Array.isArray(result.paymentTerms)) ? result.paymentTerms : []; // Safer check

      return {
        data: { paymentTerms: paymentTerms }
      };
    } catch (error: any) { // Add type annotation
      logger.error(`MCP Error getting payment terms: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Failed to get payment terms via MCP' }],
        data: { paymentTerms: [] } // Ensure data structure matches on error
      };
    }
  }

  // Remove setUseMcpClient method
  // setUseMcpClient(use: boolean) { ... }
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
