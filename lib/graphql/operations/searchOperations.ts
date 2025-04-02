import { logger } from '../../logger';
import { AgentService } from '../../agent-service';

/**
 * Search operations using the Agent Service
 * Replaces the direct GraphQL calls with agent-based calls
 */

interface SearchResult<T> {
  success: boolean;
  data?: T[];
  error?: string;
}

/**
 * Search for orders with a query string or visual ID
 */
export async function searchOrders(params: { query?: string; visualId?: string }): Promise<SearchResult<any>> {
  try {
    logger.info(`[searchOperations] Searching orders via Agent with params:`, params);
    
    // Handle visual ID search differently from query search
    if (params.visualId) {
      // Use the specific method for visual ID search
      const result = await AgentService.getOrderByVisualId(params.visualId);
      
      if (result.success && result.data) {
        return {
          success: true,
          data: Array.isArray(result.data) ? result.data : [result.data]
        };
      } else {
        return {
          success: false,
          error: result.error || `No order found with Visual ID: ${params.visualId}`
        };
      }
    } else {
      // Use the general search method for query search
      const result = await AgentService.searchOrders(params.query || '');
      
      if (result.success && result.data) {
        return {
          success: true,
          data: Array.isArray(result.data) ? result.data : [result.data]
        };
      } else {
        return {
          success: false,
          error: result.error || 'No search results found'
        };
      }
    }
  } catch (error) {
    logger.error('[searchOperations] Error searching orders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Search for customers with a query string or email
 */
export async function searchCustomers(params: { query?: string; email?: string }): Promise<SearchResult<any>> {
  try {
    logger.info(`[searchOperations] Searching customers via Agent with params:`, params);
    
    // Since agent service doesn't have a direct searchCustomers method,
    // we'll build a composite operation
    const operation = params.email 
      ? 'printavo_get_customer_by_email' 
      : 'printavo_search_customers';
    
    const searchParams = params.email 
      ? { email: params.email } 
      : { query: params.query || '' };
      
    const result = await AgentService.executeOperation(operation, searchParams);
    
    if (result.success && result.data) {
      // Normalize to array
      const customers = Array.isArray(result.data) ? result.data : [result.data];
      
      return {
        success: true,
        data: customers.filter(Boolean) // Remove any null/undefined entries
      };
    } else {
      return {
        success: false,
        error: result.error || 'No customers found'
      };
    }
  } catch (error) {
    logger.error('[searchOperations] Error searching customers:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Export as an object for compatibility with existing code
export const searchOperations = {
  searchOrders,
  searchCustomers
}; 