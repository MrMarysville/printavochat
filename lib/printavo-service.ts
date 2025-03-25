import { operations, printavoClient } from './graphql';
import { logger } from './logger';
import { OrdersAPI } from './orders-api';
import { 
PrintavoAuthenticationError, 
PrintavoValidationError } from './printavo-api';


/**
 * Validation utility functions
 */
function validateId(id: string, entityName: string): void {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new PrintavoValidationError(
      `Invalid ${entityName} ID: ID must be a non-empty string`,
      400
    );
  }
}

// This service provides a simplified interface to the Printavo API operations
export const printavoService = {
  // Order operations
  async getOrder(id: string) {
    // Validate order ID
    validateId(id, 'order');
    
    logger.info(`[PrintavoService] Getting order with ID: ${id}`);
    return operations.getOrder(id);
  },
  
  async getOrderByVisualId(visualId: string) {
    logger.info(`[PrintavoService] Getting order with visual ID: ${visualId}`);
    try {
      // Validate visual ID
      if (!visualId || typeof visualId !== 'string' || visualId.trim() === '') {
        throw new PrintavoValidationError(`Invalid visual ID: ${visualId}`, 400);
      }
      // First try the GraphQL client implementation
      const result = await operations.getOrderByVisualId(visualId);
      if (result.success && result.data) {
        return result;
      }
      
      // Fall back to our direct implementation if that fails
      logger.info(`Falling back to direct API implementation for visual ID ${visualId}`);
      return { 
        data: await OrdersAPI.getOrderByVisualId(visualId),
        success: true
      };
    } catch (error) {
      logger.error(`Error in getOrderByVisualId: ${error instanceof Error ? error.message : String(error)}`);
      // Try our direct implementation as fallback
      try {
        const order = await OrdersAPI.getOrderByVisualId(visualId);
        return {
          data: order,
          success: !!order
        };
      } catch (fallbackError) {
        let errorMessage = `Failed to find order with visual ID ${visualId}`;
        let errorInstance = fallbackError instanceof Error 
          ? fallbackError 
          : new Error(`Unknown error: ${fallbackError}`)
        ;
        
        logger.error(`[PrintavoService] ${errorMessage}`, errorInstance);
        return {
          success: false,
          errors: [{ message: errorMessage }],
          error: errorInstance
        };
      }
    }
  },
  
  async getOrders(params: any = {}) {
    logger.info(`[PrintavoService] Getting orders with params: ${JSON.stringify(params)}`);
    try {
      // Validate limit if provided
      if (params.limit && (typeof params.limit !== 'number' || params.limit <= 0)) {
        throw new PrintavoValidationError('Invalid limit parameter: must be a positive number', 400);
      }
      
      return operations.searchOrders(params);
    } catch (error) {
      logger.error(`[PrintavoService] Error getting orders: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: 'Failed to retrieve orders' }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  },
  
  async createQuote(input: any) {
    // Validate input
    if (!input || typeof input !== 'object') {
      throw new PrintavoValidationError('Invalid quote input: must be an object', 400);
    }
    
    logger.info(`[PrintavoService] Creating quote for customer: ${input.customerId || input.customerName}`);
    try {
      return operations.createQuote(input);
    } catch (error) {
      logger.error(`[PrintavoService] Error creating quote: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: 'Failed to create quote' }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  },
  
  async updateStatus(parentId: string, statusId: string) {
    // Validate IDs
    validateId(parentId, 'parent');
    validateId(statusId, 'status');
    
    logger.info(`[PrintavoService] Updating status for ${parentId} to ${statusId}`);
    try {
      return operations.updateStatus(parentId, statusId);
    } catch (error) {
      logger.error(`[PrintavoService] Error updating status: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: 'Failed to update status' }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  },
  
  // Fee operations
  async createFee(parentId: string, input: any) {
    // Validate IDs and input
    validateId(parentId, 'parent');
    if (!input || typeof input !== 'object') {
      throw new PrintavoValidationError('Invalid fee input: must be an object', 400);
    }
    
    logger.info(`[PrintavoService] Creating fee for ${parentId}`);
    try {
      return operations.createFee(parentId, input);
    } catch (error) {
      logger.error(`[PrintavoService] Error creating fee: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: 'Failed to create fee' }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  },
  
  async updateFee(id: string, input: any) {
    // Validate ID and input
    validateId(id, 'fee');
    if (!input || typeof input !== 'object') {
      throw new PrintavoValidationError('Invalid fee input: must be an object', 400);
    }
    
    logger.info(`[PrintavoService] Updating fee ${id}`);
    return operations.updateFee(id, input);
  },
  
  async deleteFee(id: string) {
    // Validate ID
    validateId(id, 'fee');
    
    logger.info(`[PrintavoService] Deleting fee ${id}`);
    try {
      return operations.deleteFee(id);
    } catch (error) {
      logger.error(`[PrintavoService] Error deleting fee: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: `Failed to delete fee with ID ${id}` }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  },
  
  // Line item operations
  async createLineItemGroup(parentId: string, input: any) {
    // Validate ID and input
    validateId(parentId, 'parent');
    if (!input || typeof input !== 'object') {
      throw new PrintavoValidationError('Invalid line item group input: must be an object', 400);
    }
    
    logger.info(`[PrintavoService] Creating line item group for ${parentId}`);
    return operations.addLineItemGroup(parentId, input);
  },
  
  async createLineItem(lineItemGroupId: string, input: any) {
    // Validate ID and input
    validateId(lineItemGroupId, 'line item group');
    if (!input || typeof input !== 'object') {
      throw new PrintavoValidationError('Invalid line item input: must be an object', 400);
    }
    
    logger.info(`[PrintavoService] Creating line item for group ${lineItemGroupId}`);
    return operations.addLineItem(lineItemGroupId, input);
  },
  
  // Imprint operations
  async createImprint(lineItemGroupId: string, input: any) {
    // Validate ID and input
    validateId(lineItemGroupId, 'line item group');
    if (!input || typeof input !== 'object') {
      throw new PrintavoValidationError('Invalid imprint input: must be an object', 400);
    }
    
    logger.info(`[PrintavoService] Creating imprint for group ${lineItemGroupId}`);
    return operations.addImprint(lineItemGroupId, input);
  },
  
  async createImprintMockup(imprintId: string, publicImageUrl: string) {
    // Validate ID and URL
    validateId(imprintId, 'imprint');
    if (!publicImageUrl || typeof publicImageUrl !== 'string' || publicImageUrl.trim() === '') {
      throw new PrintavoValidationError('Invalid public image URL: must be a non-empty string', 400);
    }
    
    logger.info(`[PrintavoService] Creating imprint mockup for ${imprintId}`);
    // This operation might not exist in operations, so fallback to direct client use
    try {
      return printavoClient.request(`
        mutation CreateImprintMockup($imprintId: ID!, $publicImageUrl: String!) {
          imprintMockupCreate(imprintId: $imprintId, publicImageUrl: $publicImageUrl) {
            id
            url
          }
        }
      `, { imprintId, publicImageUrl });
    } catch (error) {
      logger.error(`[PrintavoService] Error creating imprint mockup: ${error instanceof Error ? error.message : String(error)}`);
      return {
        success: false,
        errors: [{ message: 'Failed to create imprint mockup' }],
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`)
      };
    }
  },
  
  // Customer operations
  async getCustomer(id: string) {
    // Validate ID
    validateId(id, 'customer');
    
    logger.info(`[PrintavoService] Getting customer with ID: ${id}`);
    return operations.getCustomer(id);
  },
  
  async getCustomers(params: any = {}) {
    // Validate limit if provided
    if (params.limit && (typeof params.limit !== 'number' || params.limit <= 0)) {
      throw new PrintavoValidationError('Invalid limit parameter: must be a positive number', 400);
    }
    
    logger.info(`[PrintavoService] Getting customers with params: ${JSON.stringify(params)}`);
    return operations.getCustomers(params);
  },
  
    async createCustomer(input: any) {
        // Validate input
        if (!input || typeof input !== 'object') {
          throw new PrintavoValidationError('Invalid customer input: must be an object', 400);
        }
        
        // Validate required fields
        if (!input.email || typeof input.email !== 'string' || input.email.trim() === '') {
          throw new PrintavoValidationError('Invalid customer input: email is required', 400);
        }
        
        logger.info(`[PrintavoService] Creating customer with email: ${input.email}`);
        return operations.createCustomer(input);
      },
  
  async findOrCreateCustomer(email: string, firstName: string, lastName: string, company?: string, phone?: string) {
    // Validate required fields
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new PrintavoValidationError('Invalid email: must be a non-empty string', 400);
    }
    
    if (!firstName || typeof firstName !== 'string' || firstName.trim() === '') {
      throw new PrintavoValidationError('Invalid first name: must be a non-empty string', 400);
    }
    
    if (!lastName || typeof lastName !== 'string' || lastName.trim() === '') {
      throw new PrintavoValidationError('Invalid last name: must be a non-empty string', 400);
    }
    
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

    async getInvoice(input: any) {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new PrintavoValidationError('Invalid invoice input: must be an object', 400);
        }

        logger.info(`[PrintavoService] Creating invoice for customer: ${input.customerId || 'unknown'}`);

        try {
            return operations.getInvoice(input);
        } catch (error: unknown) {
            let errorMessage = 'Failed to create invoice';
            let errorInstance = error instanceof Error ? error : new Error(`Unknown error: ${error}`);
            logger.error(`[PrintavoService] ${errorMessage}`, errorInstance);
            return {
                success: false,
                errors: [{ message: errorMessage }],
                error: errorInstance,
            };
        }
    },
    
    // Create a new invoice 
    async createInvoice(input: any) {
        // Validate input
        if (!input || typeof input !== 'object') {
            throw new PrintavoValidationError('Invalid invoice input: must be an object', 400);
        }

        logger.info(`[PrintavoService] Creating invoice for customer: ${input.customerId || 'unknown'}`);

        try {
            return operations.createInvoice(input);
        } catch (error: unknown) {
            let errorMessage = 'Failed to create invoice';
            let errorInstance = error instanceof Error ? error : new Error(`Unknown error: ${error}`);
            logger.error(`[PrintavoService] ${errorMessage}`, errorInstance);
            return {
                success: false,
                errors: [{ message: errorMessage }],
                error: errorInstance,
            };
        }
    },
  
  // Authentication
  async login(email: string, password: string, deviceName?: string, deviceToken?: string) {
    // Validate required fields
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new PrintavoValidationError('Invalid email: must be a non-empty string', 400);
    }
    
    if (!password || typeof password !== 'string' || password.trim() === '') {
      throw new PrintavoValidationError('Invalid password: must be a non-empty string', 400);
    }
    
    logger.info(`[PrintavoService] Logging in user: ${email}`);
    // This operation might not exist in operations, so fallback to direct client use
    try {
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
    } catch (error) {
      // Check if it's an authentication error
      if (error instanceof Error && error.message.toLowerCase().includes('auth')) {
        throw new PrintavoAuthenticationError(`Authentication failed: ${error.message}`, 401);
      }
      
      logger.error(`[PrintavoService] Error during login: ${error instanceof Error ? error.message : String(error)}`);
      throw error; // Re-throw to be handled by the API route
    }
  },
  
  // Payment terms operations
  async getPaymentTerms() {
    logger.info(`[PrintavoService] Getting payment terms`);
    
    try {
      // Use a GraphQL query to get actual payment terms from Printavo
      const query = `
        query {
          paymentTerms {
            edges {
              node {
                id
                name
                description
                paymentWindow
              }
            }
          }
        }
      `;
      
      const result = await printavoClient.request(query) as { paymentTerms?: { edges: Array<{ node: {id: string, name: string, description?: string, paymentWindow?: number} }> } };
      
      if (result && result.paymentTerms?.edges && result.paymentTerms.edges.length > 0) {
        // Map the GraphQL response structure to our expected format
        const paymentTerms = result.paymentTerms.edges.map(edge => ({
          id: edge.node.id,
          name: edge.node.name,
          description: edge.node.description || `Payment due ${edge.node.paymentWindow || 0} days after creation`
        }));
        
        logger.info(`[PrintavoService] Retrieved ${paymentTerms.length} payment terms from Printavo`);
        
        return {
          success: true,
          data: {
            paymentTerms
          }
        };
      } else {
        // Fall back to default payment terms if API doesn't return any
        logger.warn('[PrintavoService] No payment terms returned from Printavo API, using defaults');
        return getDefaultPaymentTerms();
      }
    } catch (error) {
      logger.error(`[PrintavoService] Error getting payment terms: ${error instanceof Error ? error.message : String(error)}`);
      
      // Return default payment terms on error
      return getDefaultPaymentTerms();
    }
  },
  
  // Status operations
  async getStatuses() {
    logger.info(`[PrintavoService] Getting available statuses`);
    
    try {
      // Use a GraphQL query to get order statuses
      const query = `
        query GetStatuses {
          statuses(type: INVOICE) {
            edges {
              node {
                id
                name
                color
                position
              }
            }
          }
        }
      `;
      
      const result = await printavoClient.request(query) as { 
        statuses?: { 
          edges: Array<{ 
            node: {
              id: string, 
              name: string, 
              color?: string,
              position: number
            } 
          }> 
        } 
      };
      
      if (result && result.statuses?.edges && result.statuses.edges.length > 0) {
        // Map the GraphQL response structure to our expected format
        const statuses = result.statuses.edges
          .sort((a, b) => a.node.position - b.node.position) // Sort by position
          .map(edge => ({
            id: edge.node.id,
            name: edge.node.name,
            color: edge.node.color
          }));
        
        logger.info(`[PrintavoService] Retrieved ${statuses.length} statuses`);
        
        return {
          success: true,
          data: {
            statuses
          }
        };
      } else {
        logger.warn('[PrintavoService] No statuses returned from Printavo API');
        return {
          success: false,
          error: new Error('No statuses found'),
          data: {
            statuses: []
          }
        };
      }
    } catch (error) {
      logger.error(`[PrintavoService] Error getting statuses: ${error instanceof Error ? error.message : String(error)}`);
      
      return {
        success: false,
        error: error instanceof Error ? error : new Error(`Unknown error: ${error}`),
        data: {
          statuses: []
        }
      };
    }
  }
};

// Helper function to return default payment terms
function getDefaultPaymentTerms() {
  return {
    success: true,
    data: {
      paymentTerms: [
        { id: "net30", name: "Net 30", description: "Payment due within 30 days" },
        { id: "net15", name: "Net 15", description: "Payment due within 15 days" },
        { id: "cod", name: "COD", description: "Cash on delivery" },
        { id: "prepaid", name: "Prepaid", description: "Payment required before delivery" }
      ]
    }
  };
}
