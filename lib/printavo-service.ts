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

class PrintavoService {
  private static instance: PrintavoService;
  private apiClient: EnhancedAPIClient;

  private constructor() {
    this.apiClient = EnhancedAPIClient.getInstance();
  }

  static getInstance(): PrintavoService {
    if (!PrintavoService.instance) {
      PrintavoService.instance = new PrintavoService();
    }
    return PrintavoService.instance;
  }

  async getOrder(id: string) {
    logger.info(`[PrintavoService] Getting order with ID: ${id}`);
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
