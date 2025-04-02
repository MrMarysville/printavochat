import { PrintavoOrder, PrintavoAPIResponse } from './types';
import { logger } from './logger';
import { AgentService } from './agent-service';

class PrintavoService {
  private static instance: PrintavoService;

  private constructor() {
    logger.info(`PrintavoService initialized using Agent SDK exclusively.`);
  }

  static getInstance(): PrintavoService {
    if (!PrintavoService.instance) {
      PrintavoService.instance = new PrintavoService();
    }
    return PrintavoService.instance;
  }

  async getOrder(id: string): Promise<PrintavoAPIResponse<any>> {
    logger.info(`[PrintavoService] Getting order with ID via Agent: ${id}`);
    
    try {
      const result = await AgentService.getOrder(id);
      
      if (!result.success) {
        return {
          errors: [{ message: result.error || 'Unknown error occurred' }]
        };
      }
      
      return {
        data: result.data
      };
    } catch (error) {
      logger.error(`Error getting order: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Failed to get order' }]
      };
    }
  }

  async getOrderByVisualId(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    logger.info(`[PrintavoService] Getting order by Visual ID via Agent: ${visualId}`);
    
    try {
      const result = await AgentService.getOrderByVisualId(visualId);
      
      if (!result.success) {
        return {
          errors: [{ message: result.error || `Order with visual ID ${visualId} not found.` }]
        };
      }
      
      return {
        data: result.data
      };
    } catch (error) {
      logger.error(`Error getting order by visual ID: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Failed to get order by visual ID' }]
      };
    }
  }

  async searchOrders(params: {
    query?: string;
    first?: number;
  } = {}): Promise<PrintavoAPIResponse<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>> {
    logger.info(`[PrintavoService] Searching orders via Agent with query: ${params.query}`);

    if (!params.query) {
        logger.warn("SearchOrders called without a query parameter.");
        // Return empty data structure for no query
        return { data: { quotes: { edges: [] } } };
    }

    try {
      const result = await AgentService.searchOrders(params.query);
      
      if (!result.success) {
        return {
          errors: [{ message: result.error || 'Can\'t retrieve data' }],
          success: false,
          data: undefined
        };
      }
      
      // Transform the result to match the expected structure
      return {
        data: {
          quotes: {
            edges: Array.isArray(result.data) 
              ? result.data.map((order: PrintavoOrder) => ({ node: order })) 
              : []
          }
        }
      };
    } catch (error) {
      logger.error(`Error searching orders: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Can\'t retrieve data' }],
        success: false,
        data: undefined
      };
    }
  }

  async createCustomer(input: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    companyName?: string;
  }): Promise<PrintavoAPIResponse<any>> {
    logger.info(`[PrintavoService] Creating customer via Agent`);
    
    try {
      // Basic validation
      if (!input.firstName || !input.lastName) {
        return {
          errors: [{ message: 'First name and last name are required to create a customer' }]
        };
      }
      
      const result = await AgentService.createCustomer(input);
      
      if (!result.success) {
        return {
          errors: [{ message: result.error || 'Failed to create customer' }]
        };
      }
      
      return {
        data: result.data
      };
    } catch (error) {
      logger.error(`Error creating customer: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Failed to create customer' }]
      };
    }
  }

  async getCustomers(params: {
    query?: string;
    first?: number;
  } = {}): Promise<PrintavoAPIResponse<{ customers: { edges: Array<{ node: any }> } }>> {
    logger.info(`[PrintavoService] Getting customers via Agent with query: ${params.query}`);
    
    try {
      // Use the search_customers operation from AgentService
      const result = await AgentService.executeOperation('printavo_search_customers', {
        query: params.query || '',
        first: params.first || 10
      });
      
      if (!result.success) {
        return {
          errors: [{ message: result.error || 'Failed to get customers' }],
          data: { customers: { edges: [] } }
        };
      }
      
      // Transform the result to match the expected structure
      const edges = Array.isArray(result.data) 
        ? result.data.map((customer: any) => ({ node: customer })) 
        : [];
      
      return {
        data: {
          customers: {
            edges: edges
          }
        }
      };
    } catch (error) {
      logger.error(`Error getting customers: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Failed to get customers' }],
        data: { customers: { edges: [] } }
      };
    }
  }

  async createQuote(input: any): Promise<PrintavoAPIResponse<any>> {
    logger.info(`[PrintavoService] Creating quote via Agent`);
    
    try {
      // Validate required fields
      if (!input.customerId && (!input.customerName || !input.customerEmail)) {
        return {
          errors: [{ message: 'Either customerId or both customerName and customerEmail are required' }]
        };
      }
      
      if (!input.statusId) {
        return {
          errors: [{ message: 'Missing required statusId for creating quote' }]
        };
      }
      
      const result = await AgentService.createQuote(input);
      
      if (!result.success) {
        return {
          errors: [{ message: result.error || 'Failed to create quote' }]
        };
      }
      
      return {
        data: result.data
      };
    } catch (error) {
      logger.error(`Error creating quote: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Failed to create quote' }]
      };
    }
  }

  async updateStatus(orderId: string, statusId: string): Promise<PrintavoAPIResponse<any>> {
    logger.info(`[PrintavoService] Updating status for order ${orderId} to ${statusId} via Agent`);
    
    try {
      const result = await AgentService.updateStatus(orderId, statusId);
      
      if (!result.success) {
        return {
          errors: [{ message: result.error || `Failed to update status for order ${orderId}` }]
        };
      }
      
      return {
        data: result.data
      };
    } catch (error) {
      logger.error(`Error updating status: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: `Failed to update status for order ${orderId}` }]
      };
    }
  }

  async getStatuses(type?: 'INVOICE' | 'QUOTE' | 'TASK'): Promise<PrintavoAPIResponse<any>> {
    logger.info(`[PrintavoService] Getting available statuses via Agent for type: ${type || 'all'}`);
    
    try {
      // Use the list_statuses operation from AgentService
      const result = await AgentService.executeOperation('printavo_list_statuses', {
        type: type
      });
      
      if (!result.success) {
        return {
          errors: [{ message: result.error || 'Failed to get statuses' }]
        };
      }
      
      return {
        data: result.data
      };
    } catch (error) {
      logger.error(`Error getting statuses: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Failed to get statuses' }]
      };
    }
  }

  async getPaymentTerms(): Promise<PrintavoAPIResponse<{ paymentTerms: Array<{ id: string; name: string; description?: string }> }>> {
    logger.info(`[PrintavoService] Getting payment terms via Agent`);
    
    try {
      // Use the list_payment_terms operation from AgentService
      const result = await AgentService.executeOperation('printavo_list_payment_terms', {
        limit: 50
      });
      
      if (!result.success) {
        return {
          errors: [{ message: result.error || 'Failed to get payment terms' }],
          data: { paymentTerms: [] }
        };
      }
      
      // Ensure the data structure matches what's expected
      const paymentTerms = (result.data && result.data.paymentTerms && Array.isArray(result.data.paymentTerms)) 
        ? result.data.paymentTerms 
        : [];
      
      return {
        data: { paymentTerms: paymentTerms }
      };
    } catch (error) {
      logger.error(`Error getting payment terms: ${error instanceof Error ? error.message : String(error)}`);
      return {
        errors: [{ message: 'Failed to get payment terms' }],
        data: { paymentTerms: [] }
      };
    }
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
