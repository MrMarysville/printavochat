import {
  PrintavoCustomer,
  CustomerCreateInput,
  PrintavoOrder
} from '../../types';
import { PrintavoAPIResponse, query, mutate } from '../utils';
import { QUERIES } from '../queries';
import { MUTATIONS } from '../mutations';
import { logger } from '../../logger';
import { handleGraphQLError } from '../utils';
import { PrintavoAPIError } from '../errors';

// Customer Queries
export async function getCustomer(id: string): Promise<PrintavoAPIResponse<PrintavoCustomer>> {
  return query(QUERIES.customer, { id });
}

export async function createCustomer(input: CustomerCreateInput): Promise<PrintavoAPIResponse<PrintavoCustomer>> {
  return mutate(MUTATIONS.customerCreate, { input });
}

export async function getCustomers(params: { 
  first?: number; 
  after?: string; 
  before?: string; 
  last?: number;
  query?: string;
} = {}): Promise<PrintavoAPIResponse<{ customers: { edges: Array<{ node: PrintavoCustomer }> } }>> {
  return query(QUERIES.customers, params);
}

export async function getOrdersByCustomer(customerId: string): Promise<PrintavoAPIResponse<PrintavoOrder[]>> {
  try {
    const customerResponse = await getCustomer(customerId);
    if (!customerResponse.success || !customerResponse.data) {
      return {
        success: false,
        errors: customerResponse.errors,
        error: customerResponse.error
      };
    }
    
    if (!customerResponse.data.orders) {
      return {
        success: true,
        data: []
      };
    }
    
    // Convert from PrintavoConnection to array if needed
    const orders = Array.isArray(customerResponse.data.orders) 
      ? customerResponse.data.orders 
      : (customerResponse.data.orders.edges || []).map(edge => edge.node);
    
    return {
      success: true,
      data: orders
    };
  } catch (error) {
    logger.error(`Error fetching orders for customer ${customerId}:`, error);
    return {
      success: false,
      errors: [{ message: `Failed to fetch orders for customer with ID: ${customerId}` }],
      error: error instanceof PrintavoAPIError ? error : handleGraphQLError(error),
    };
  }
}
