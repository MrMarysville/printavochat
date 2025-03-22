import {
  PrintavoOrder,
} from '../../types';
import { PrintavoAPIResponse, query } from '../utils';
import { QUERIES } from '../queries';
import { logger } from '../../logger';
import { handleAPIError } from '../utils';
import { PrintavoNotFoundError } from '../errors';

// Order Queries
interface Order {
  id: string;
  name: string;
  orderNumber?: string;
  status: {
    id: string;
    name: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  notes?: string;
  dueDate?: string;
  paymentTerms?: string;
  paymentStatus?: string;
  lineItemGroups?: Array<{
    id: string;
    name: string;
    description?: string;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      quantity: number;
      price: number;
      style?: {
        id: string;
        name: string;
        number: string;
        color: string;
        sizes: Array<{
          id: string;
          name: string;
          quantity: number;
        }>;
      };
    }>;
  }>;
}

// Using underscore prefix for unused interface
interface _GraphQLOrderResponse {
  order?: Order;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}

// Update the getOrder function for better error handling
export async function getOrder(id: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    logger.info(`Fetching order with ID: ${id}`);
    const result = await query<{ order: PrintavoOrder }>(QUERIES.order, { id });
    
    // If we get a valid response but no order, it means the order ID wasn't found
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
    return { 
      data: result.data.order,
      success: true 
    };
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

// Get order by Visual ID (4-digit ID)
export async function getOrderByVisualId(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    logger.info(`Fetching order with Visual ID: ${visualId}`);
    const result = await query<{ orders: { nodes: PrintavoOrder[] } }>(
      QUERIES.orderByVisualId, 
      { query: visualId }
    );
    
    // Check if we found any orders
    if (!result.data?.orders?.nodes || result.data.orders.nodes.length === 0) {
      logger.warn(`Order not found with Visual ID: ${visualId}`);
      return { 
        data: undefined,
        errors: [{ message: `Order not found with Visual ID: ${visualId}` }],
        success: false, 
        error: new PrintavoNotFoundError(`Order not found with Visual ID: ${visualId}`) 
      };
    }
    
    // Return the first matching order
    const order = result.data.orders.nodes[0];
    logger.info(`Successfully retrieved order with Visual ID: ${visualId}`);
    return { 
      data: order,
      success: true 
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

// Fix searchOrders function to properly handle errors and return types
export async function searchOrders(params: {
  query?: string;
  first?: number;
  inProductionAfter?: string;
  inProductionBefore?: string;
  statusIds?: string[];
  sortOn?: string;
} = {}): Promise<PrintavoAPIResponse<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>> {
  try {
    const searchQuery = params.query || '';
    logger.info(`Searching orders with query: "${searchQuery}"`);
    
    const result = await query<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>(
      QUERIES.orders, 
      { ...params }
    );
    
    if (!result.data?.orders) {
      return { 
        data: undefined,
        errors: [{ message: `No orders found matching query: ${searchQuery}` }],
        success: false, 
        error: new PrintavoNotFoundError(`No orders found matching query: ${searchQuery}`) 
      };
    }
    
    return { 
      data: result.data,
      success: true 
    };
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
