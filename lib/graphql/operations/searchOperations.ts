import { PrintavoOrder, PrintavoCustomer } from '../../types';
import { PrintavoAPIResponse, query } from '../utils';
import { searchQueries } from '../queries/searchQueries';
import { logger } from '../../logger';
import { handleAPIError } from '../utils';
import { PrintavoNotFoundError, PrintavoAPIError } from '../errors';
import cache from '../../cache';

interface SearchParams {
  query?: string;
  visualId?: string;
  first?: number;
  after?: string;
  before?: string;
  statusIds?: string[];
  inProductionAfter?: string;
  inProductionBefore?: string;
  sortOn?: string;
  sortDescending?: boolean;
}

interface CustomerSearchParams {
  query?: string;
  first?: number;
  after?: string;
  before?: string;
  sortOn?: string;
  sortDescending?: boolean;
  primaryOnly?: boolean;
}

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

interface OrderEdge {
  cursor: string;
  node: PrintavoOrder;
}

interface CustomerEdge {
  cursor: string;
  node: PrintavoCustomer;
}

interface OrderSearchResponse {
  orders: {
    edges: OrderEdge[];
    pageInfo: PageInfo;
    totalCount: number;
  };
}

interface CustomerSearchResponse {
  customers: {
    edges: CustomerEdge[];
    pageInfo: PageInfo;
    totalCount: number;
  };
}

// Unified search function that handles all order types
export async function searchOrders(params: SearchParams): Promise<PrintavoAPIResponse<PrintavoOrder[]>> {
  const cacheKey = `search_orders_${JSON.stringify(params)}`;
  const cachedResult = cache.get<PrintavoAPIResponse<PrintavoOrder[]>>(cacheKey);
  
  if (cachedResult) {
    logger.info(`Using cached result for order search with params: ${JSON.stringify(params)}`);
    return cachedResult;
  }

  try {
    // If searching by Visual ID, use the optimized query
    if (params.visualId) {
      logger.info(`Performing visual ID search for: ${params.visualId}`);
      try {
        const result = await query<OrderSearchResponse>(searchQueries.visualIdSearch, { visualId: params.visualId });
        
        if (!result.data?.orders?.edges?.length) {
          logger.warn(`No orders found with Visual ID: ${params.visualId}`);
          return {
            data: [],
            success: false,
            error: new PrintavoNotFoundError(`No orders found with Visual ID: ${params.visualId}`),
            errors: [{ message: `No orders found with Visual ID: ${params.visualId}` }]
          };
        }

        const orders = result.data.orders.edges.map((edge: OrderEdge) => edge.node);
        const response = { data: orders, success: true };
        cache.set(cacheKey, response, 300000); // Cache for 5 minutes
        return response;
      } catch (error) {
        // If we get a 404 error, just return an empty result instead of throwing
        if (error instanceof PrintavoNotFoundError || 
            (error instanceof PrintavoAPIError && error._statusCode === 404)) {
          logger.warn(`API returned 404 for Visual ID search: ${params.visualId}`);
          return {
            data: [],
            success: false,
            error: new PrintavoNotFoundError(`No orders found with Visual ID: ${params.visualId}`),
            errors: [{ message: `No orders found with Visual ID: ${params.visualId}` }]
          };
        }
        // For other errors, rethrow
        throw error;
      }
    }

    // Otherwise use the full unified search
    logger.info(`Performing unified order search with params: ${JSON.stringify(params)}`);
    const result = await query<OrderSearchResponse>(searchQueries.unifiedOrderSearch, params);

    if (!result.data?.orders?.edges?.length) {
      return {
        data: [],
        success: false,
        error: new PrintavoNotFoundError(`No orders found matching search criteria`),
        errors: [{ message: 'No orders found matching search criteria' }]
      };
    }

    const orders = result.data.orders.edges.map((edge: OrderEdge) => edge.node);
    const response = {
      data: orders,
      success: true,
      pageInfo: result.data.orders.pageInfo,
      totalCount: result.data.orders.totalCount
    };

    // Cache search results for a shorter time (2 minutes)
    cache.set(cacheKey, response, 120000);
    return response;

  } catch (error) {
    logger.error('Error in searchOrders:', error);
    return {
      data: [],
      success: false,
      error: handleAPIError(error),
      errors: [{ message: 'Failed to search orders' }]
    };
  }
}

// Unified customer search function
export async function searchCustomers(params: CustomerSearchParams): Promise<PrintavoAPIResponse<PrintavoCustomer[]>> {
  const cacheKey = `search_customers_${JSON.stringify(params)}`;
  const cachedResult = cache.get<PrintavoAPIResponse<PrintavoCustomer[]>>(cacheKey);
  
  if (cachedResult) {
    logger.info(`Using cached result for customer search with params: ${JSON.stringify(params)}`);
    return cachedResult;
  }

  try {
    logger.info(`Performing customer search with params: ${JSON.stringify(params)}`);
    const result = await query<CustomerSearchResponse>(searchQueries.customerSearch, params);

    if (!result.data?.customers?.edges?.length) {
      return {
        data: [],
        success: false,
        error: new PrintavoNotFoundError('No customers found matching search criteria'),
        errors: [{ message: 'No customers found matching search criteria' }]
      };
    }

    const customers = result.data.customers.edges.map((edge: CustomerEdge) => edge.node);
    const response = {
      data: customers,
      success: true,
      pageInfo: result.data.customers.pageInfo,
      totalCount: result.data.customers.totalCount
    };

    // Cache customer search results for 2 minutes
    cache.set(cacheKey, response, 120000);
    return response;

  } catch (error) {
    logger.error('Error in searchCustomers:', error);
    return {
      data: [],
      success: false,
      error: handleAPIError(error),
      errors: [{ message: 'Failed to search customers' }]
    };
  }
}

// Export all search operations
export const searchOperations = {
  searchOrders,
  searchCustomers
};