import { PrintavoOrder } from '../../types';
import { PrintavoAPIResponse, query } from '../utils';
import { QUERIES } from '../queries';
import { quoteQueries } from '../queries/quoteQueries';
import { logger } from '../../logger';
import { handleAPIError } from '../utils';
import { PrintavoNotFoundError } from '../errors';
import cache from '../../cache';

// Get order by ID
export async function getOrder(id: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  // Generate a cache key for this order ID
  const cacheKey = `order_id_${id}`;
  
  // Check if we have a cached result
  const cachedResult = cache.get<PrintavoAPIResponse<PrintavoOrder>>(cacheKey);
  if (cachedResult) {
    logger.info(`Using cached result for order with ID: ${id}`);
    return cachedResult;
  }

  try {
    logger.info(`Fetching order with ID: ${id}`);
    const result = await query<{ order: PrintavoOrder }>(QUERIES.order, { id });
    
    if (!result.data?.order) {
      logger.warn(`Order not found with ID: ${id}`);
      return { 
        data: undefined,
        errors: [{ message: `Order not found with ID: ${id}` }],
        success: false, 
        error: new PrintavoNotFoundError(`Order not found with ID: ${id}`) 
      };
    }
    
    logger.info(`Successfully retrieved order: ${id}`);
    
    const response = { 
      data: result.data.order,
      success: true 
    };
    // Cache the successful result for 5 minutes
    cache.set(cacheKey, response);
    return response;
  } catch (error) {
    logger.error(`Error fetching order with ID ${id}:`, error);
    return {
      data: undefined,
      errors: [{ message: `Failed to fetch order with ID: ${id}` }],
      success: false,
      error: handleAPIError(error, `Failed to fetch order with ID: ${id}`)
    };
  }
}

// Get order by Visual ID with multi-tiered fallback approach
export async function getOrderByVisualId(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  // Generate a cache key for this visual ID
  const cacheKey = `order_visual_id_${visualId}`;
  
  // Check if we have a cached result
  const cachedResult = cache.get<PrintavoAPIResponse<PrintavoOrder>>(cacheKey);
  if (cachedResult) {
    logger.info(`Using cached result for order with Visual ID: ${visualId}`);
    return cachedResult;
  }

  try {
    logger.info(`Fetching order with Visual ID: ${visualId}`);
    
    // TIER 1: Try invoices endpoint (primary method)
    try {
      logger.info(`[TIER 1] Trying invoices endpoint for Visual ID: ${visualId}`);
      const result = await query<{ invoices: { edges: Array<{ node: PrintavoOrder }> } }>(
        QUERIES.orderByVisualId, 
        { query: visualId.trim(), first: 5 }
      );
      
      if (result.data?.invoices?.edges && result.data.invoices.edges.length > 0) {
        // Find an exact match for the visual ID
        const exactMatch = result.data.invoices.edges.find(
          edge => edge.node.visualId === visualId
        );
        
        if (exactMatch) {
          logger.info(`[TIER 1] Found exact match in invoices for Visual ID: ${visualId}`);
          const response = { 
            data: exactMatch.node,
            success: true 
          };
          cache.set(cacheKey, response);
          return response;
        }
        
        // If no exact match but we have results, use the first one
        logger.info(`[TIER 1] No exact match in invoices, using first result for Visual ID: ${visualId}`);
        const response = { 
          data: result.data.invoices.edges[0].node,
          success: true 
        };
        cache.set(cacheKey, response);
        return response;
      }
    } catch (error) {
      logger.warn(`[TIER 1] Error searching invoices for Visual ID ${visualId}:`, error);
      // Continue to next tier
    }
    
    // TIER 2: Try quotes endpoint (fallback)
    try {
      logger.info(`[TIER 2] Trying quotes endpoint for Visual ID: ${visualId}`);
      const result = await query<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>(
        quoteQueries.searchQuotesByVisualId,
        { query: visualId.trim(), first: 5 }
      );
      
      if (result.data?.quotes?.edges && result.data.quotes.edges.length > 0) {
        // Find an exact match for the visual ID
        const exactMatch = result.data.quotes.edges.find(
          edge => edge.node.visualId === visualId
        );
        
        if (exactMatch) {
          logger.info(`[TIER 2] Found exact match in quotes for Visual ID: ${visualId}`);
          const response = { 
            data: exactMatch.node,
            success: true 
          };
          cache.set(cacheKey, response);
          return response;
        }
        
        // If no exact match but we have results, use the first one
        logger.info(`[TIER 2] No exact match in quotes, using first result for Visual ID: ${visualId}`);
        const response = { 
          data: result.data.quotes.edges[0].node,
          success: true 
        };
        cache.set(cacheKey, response);
        return response;
      }
    } catch (error) {
      logger.warn(`[TIER 2] Error searching quotes for Visual ID ${visualId}:`, error);
      // Continue to next tier
    }
    
    // TIER 3: Try orders endpoint (last resort)
    try {
      logger.info(`[TIER 3] Trying orders endpoint for Visual ID: ${visualId}`);
      const result = await query<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>(
        QUERIES.orders, 
        { query: visualId.trim(), first: 5 }
      );
      
      if (result.data?.orders?.edges && result.data.orders.edges.length > 0) {
        // Find an exact match for the visual ID
        const exactMatch = result.data.orders.edges.find(
          edge => edge.node.visualId === visualId
        );
        
        if (exactMatch) {
          logger.info(`[TIER 3] Found exact match in orders for Visual ID: ${visualId}`);
          const response = { 
            data: exactMatch.node,
            success: true 
          };
          cache.set(cacheKey, response);
          return response;
        }
        
        // If no exact match but we have results, use the first one
        logger.info(`[TIER 3] No exact match in orders, using first result for Visual ID: ${visualId}`);
        const response = { 
          data: result.data.orders.edges[0].node,
          success: true 
        };
        cache.set(cacheKey, response);
        return response;
      }
    } catch (error) {
      logger.warn(`[TIER 3] Error searching orders for Visual ID ${visualId}:`, error);
      // Continue to error handling
    }
    
    // If we get here, we didn't find anything in any of the tiers
    logger.warn(`No orders found with Visual ID: ${visualId} after trying all endpoints`);
    return { 
      data: undefined,
      errors: [{ message: `Order not found with Visual ID: ${visualId}` }],
      success: false, 
      error: new PrintavoNotFoundError(`Order not found with Visual ID: ${visualId}`) 
    };
  } catch (error) {
    logger.error(`Error fetching order with Visual ID ${visualId}:`, error);
    return {
      data: undefined,
      errors: [{ message: `Failed to fetch order with Visual ID: ${visualId}` }],
      success: false,
      error: handleAPIError(error, `Failed to fetch order with Visual ID: ${visualId}`)
    };
  }
}

// Search orders with optional filters including Visual ID filter
export async function searchOrders(params: {
  query?: string;
  visualId?: string;
  first?: number;
  inProductionAfter?: string;
  inProductionBefore?: string;
  statusIds?: string[];
  sortOn?: string;
} = {}): Promise<PrintavoAPIResponse<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>> {
  try {
    // If searching by Visual ID, try that first
    if (params.visualId) {
      logger.info(`Searching orders with Visual ID filter: ${params.visualId}`);
      const visualIdResult = await getOrderByVisualId(params.visualId);
      if (visualIdResult.success && visualIdResult.data) {
        return {
          data: {
            orders: {
              edges: [{
                node: visualIdResult.data
              }]
            }
          },
          success: true
        };
      }
    }

    // Generate a cache key based on the search parameters
    const cacheKey = `search_orders_${JSON.stringify(params)}`;
    
    // Check if we have a cached result
    const cachedResult = cache.get<PrintavoAPIResponse<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>>(cacheKey);
    if (cachedResult) {
      logger.info(`Using cached result for orders search with params: ${JSON.stringify(params)}`);
      return cachedResult;
    }
    
    const searchQuery = params.query || '';
    logger.info(`Searching orders with query: "${searchQuery}"`);
    
    // Try first with invoices endpoint (documented and preferred)
    try {
      const result = await query<{ invoices: { edges: Array<{ node: PrintavoOrder }> } }>(
        QUERIES.invoices || QUERIES.orderByVisualId, 
        { query: params.query, first: params.first || 10 }
      );
      
      if (result.data?.invoices?.edges && result.data.invoices.edges.length > 0) {
        return { 
          data: { orders: { edges: result.data.invoices.edges } },
          success: true 
        };
      }
    } catch (error) {
      logger.warn(`Error searching invoices, falling back to quotes: ${error instanceof Error ? error.message : String(error)}`);
      // Continue to next method
    }
    
    // Fallback to using the orders endpoint (undocumented)
    const fallbackResult = await query<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>(
      QUERIES.orders, 
      { query: params.query, first: params.first || 10 }
    );
    
    if (!fallbackResult.data?.orders) {
      return { 
        data: undefined,
        errors: [{ message: `No orders found matching query: ${searchQuery}` }],
        success: false, 
        error: new PrintavoNotFoundError(`No orders found matching query: ${searchQuery}`) 
      };
    }
    
    const response = { 
      data: fallbackResult.data,
      success: true 
    };
    
    // Cache the successful result for 2 minutes (shorter TTL for search results)
    cache.set(cacheKey, response, 120000);
    return response;
  } catch (error) {
    logger.error(`Error searching orders:`, error);
    return {
      data: undefined,
      errors: [{ message: `Failed to search orders with query: ${params.query || ''}` }],
      success: false,
      error: handleAPIError(error, `Failed to search orders with query: ${params.query || ''}`)
    };
  }
}

export async function getDueOrders(params: {
  first?: number;
  statusIds?: string[];
  sortOn?: string;
} = {}): Promise<PrintavoAPIResponse<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>> {
  const now = new Date().toISOString();
  return searchOrders({ ...params, inProductionBefore: now });
}

// Export all order operations
export const orderOperations = {
  getOrder,
  getOrderByVisualId,
  searchOrders,
  getDueOrders,
};
