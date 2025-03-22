import { operations, printavoClient } from './graphql-client';
import { logger } from './logger';

// This service provides a simplified interface to the Printavo API operations
export const printavoService = {
  // Order operations
  async getOrder(id: string) {
    logger.info(`[PrintavoService] Getting order with ID: ${id}`);
    return operations.getOrder(id);
  },
  
  async getOrderByVisualId(visualId: string) {
    logger.info(`[PrintavoService] Getting order with visual ID: ${visualId}`);
    return operations.getOrderByVisualId(visualId);
  },
  
  async getOrders(params: any = {}) {
    logger.info(`[PrintavoService] Getting orders with params: ${JSON.stringify(params)}`);
    return operations.searchOrders(params);
  },
  
  async createQuote(input: any) {
    logger.info(`[PrintavoService] Creating quote for customer: ${input.customerId || input.customerName}`);
    return operations.createQuote(input);
  },
  
  async updateStatus(parentId: string, statusId: string) {
    logger.info(`[PrintavoService] Updating status for ${parentId} to ${statusId}`);
    return operations.updateStatus(parentId, statusId);
  },
  
  // Fee operations
  async createFee(parentId: string, input: any) {
    logger.info(`[PrintavoService] Creating fee for ${parentId}`);
    return operations.createFee(parentId, input);
  },
  
  async updateFee(id: string, input: any) {
    logger.info(`[PrintavoService] Updating fee ${id}`);
    return operations.updateFee(id, input);
  },
  
  async deleteFee(id: string) {
    logger.info(`[PrintavoService] Deleting fee ${id}`);
    return operations.deleteFee(id);
  },
  
  // Line item operations
  async createLineItemGroup(parentId: string, input: any) {
    logger.info(`[PrintavoService] Creating line item group for ${parentId}`);
    return operations.addLineItemGroup(parentId, input);
  },
  
  async createLineItem(lineItemGroupId: string, input: any) {
    logger.info(`[PrintavoService] Creating line item for group ${lineItemGroupId}`);
    return operations.addLineItem(lineItemGroupId, input);
  },
  
  // Imprint operations
  async createImprint(lineItemGroupId: string, input: any) {
    logger.info(`[PrintavoService] Creating imprint for group ${lineItemGroupId}`);
    return operations.addImprint(lineItemGroupId, input);
  },
  
  async createImprintMockup(imprintId: string, publicImageUrl: string) {
    logger.info(`[PrintavoService] Creating imprint mockup for ${imprintId}`);
    // This operation might not exist in operations, so fallback to direct client use
    return printavoClient.request(`
      mutation CreateImprintMockup($imprintId: ID!, $publicImageUrl: String!) {
        imprintMockupCreate(imprintId: $imprintId, publicImageUrl: $publicImageUrl) {
          id
          url
        }
      }
    `, { imprintId, publicImageUrl });
  },
  
  // Customer operations
  async getCustomer(id: string) {
    logger.info(`[PrintavoService] Getting customer with ID: ${id}`);
    return operations.getCustomer(id);
  },
  
  async getCustomers(params: any = {}) {
    logger.info(`[PrintavoService] Getting customers with params: ${JSON.stringify(params)}`);
    return operations.getCustomers(params);
  },
  
  async createCustomer(input: any) {
    logger.info(`[PrintavoService] Creating customer with email: ${input.email}`);
    return operations.createCustomer(input);
  },
  
  async findOrCreateCustomer(email: string, firstName: string, lastName: string, company?: string, phone?: string) {
    logger.info(`[PrintavoService] Finding or creating customer with email: ${email}`);
    
    try {
      // First try to find the customer by email
      // Note: We're using 'query' param which exists in the GraphQL query but might not be in TypeScript types
      const existingCustomersResponse = await operations.getCustomers({ 
        first: 10, 
        query: email 
      } as any); // Cast to any to bypass TypeScript error
      
      if (existingCustomersResponse.success && 
          existingCustomersResponse.data?.customers?.edges && 
          existingCustomersResponse.data.customers.edges.length > 0) {
        const customer = existingCustomersResponse.data.customers.edges[0].node;
        logger.info(`[PrintavoService] Found existing customer with ID: ${customer.id}`);
        return { success: true, data: customer, isExisting: true };
      }
    } catch (error) {
      logger.warn(`[PrintavoService] Error searching for customer: ${error instanceof Error ? error.message : String(error)}`);
      // Continue to create a new customer below
    }
    
    // Customer not found, create new one
    const customerInput = {
      firstName,
      lastName,
      email,
      phone,
      company
    };
    
    const createResponse = await operations.createCustomer(customerInput);
    if (createResponse.success) {
      logger.info(`[PrintavoService] Created new customer with ID: ${createResponse.data?.id}`);
      return { ...createResponse, isExisting: false };
    }
    
    return createResponse;
  },
  
  // Authentication
  async login(email: string, password: string, deviceName?: string, deviceToken?: string) {
    logger.info(`[PrintavoService] Logging in user: ${email}`);
    // This operation might not exist in operations, so fallback to direct client use
    return printavoClient.request(`
      mutation Login($email: String!, $password: String!, $deviceName: String, $deviceToken: String) {
        login(email: $email, password: $password, deviceName: $deviceName, deviceToken: $deviceToken) {
          token
          user {
            id
            name
            email
          }
        }
      }
    `, { email, password, deviceName, deviceToken });
  }
};
