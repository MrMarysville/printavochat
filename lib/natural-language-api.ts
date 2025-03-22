import { processWithGPT } from './openai-client';
import * as quoteOperations from './graphql/operations/quotes';
import * as orderOperations from './graphql/operations/orders';
import * as customerOperations from './graphql/operations/customers';
// Dynamic import to handle missing operations file
let productOperations: any;
try {
  // This is wrapped in a try-catch in case the file doesn't exist yet
  productOperations = require('./graphql/operations/products');
} catch (e) {
  console.error('Products operations module not found, some functionality will be limited');
}

import { logger } from './logger';
import { PrintavoAPIResponse, PrintavoOrder } from './types';

// Define the types of operations the natural language interface can handle
type SupportedOperation = 'GET' | 'CREATE' | 'UPDATE' | 'DELETE' | 'SEARCH';
type SupportedEntity = 'QUOTE' | 'ORDER' | 'CUSTOMER' | 'PRODUCT' | 'LINE_ITEM' | 'PAYMENT';

// Define the structure of an operation request parsed from natural language
interface _OperationRequest {
  operation: SupportedOperation;
  entity: SupportedEntity;
  parameters: Record<string, any>;
  metadata?: {
    confidence: number;
    alternateInterpretations?: Array<{
      operation: SupportedOperation;
      entity: SupportedEntity;
      confidence: number;
    }>;
  };
}

// Define a response from the natural language interface
interface NLApiResponse<T = any> {
  data?: T;
  message: string;
  success: boolean;
  interpretedAs?: {
    operation: string;
    entity: string;
  };
  errors?: Array<{
    message: string;
    code?: string;
  }>;
}

// Helper function to extend PrintavoAPIResponse with success field
function ensureSuccessField<T>(response: PrintavoAPIResponse<T>): PrintavoAPIResponse<T> & { success: boolean } {
  return {
    ...response,
    success: !response.errors || response.errors.length === 0
  };
}

/**
 * Process a natural language request to the Printavo API
 * @param userQuery The natural language query from the user
 * @param contextMessages Optional context from previous messages
 * @returns A structured response with the results and explanation
 */
export async function processNaturalLanguageRequest(
  userQuery: string,
  contextMessages: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<NLApiResponse> {
  try {
    // Use messageHistory for GPT without the strict typing that's causing issues
    const messageHistory = [
      ...contextMessages,
      { role: 'user', content: userQuery }
    ];

    // Process the natural language query with GPT
    // @ts-ignore - Ignore type issues since we know the format works with the API
    const gptResponse = await processWithGPT(messageHistory);
    
    // If there was an error in GPT processing
    if (gptResponse.error) {
      return {
        success: false,
        message: "I couldn't understand your request properly.",
        errors: [{ message: gptResponse.error }]
      };
    }

    // If no operation was identified
    if (!gptResponse.operation) {
      return {
        success: false,
        message: gptResponse.message,
        errors: [{ message: 'No specific operation was identified from your request' }]
      };
    }

    // Parse the operation from GPT response
    const { operation, params } = gptResponse.operation;
    
    // Execute the identified operation
    const result = await executeOperation(operation, params);
    const resultWithSuccess = ensureSuccessField(result);
    
    // Return a structured response
    return {
      data: resultWithSuccess.data,
      success: resultWithSuccess.success,
      message: gptResponse.message,
      interpretedAs: {
        operation: operation,
        entity: getEntityFromOperation(operation)
      },
      errors: resultWithSuccess.errors
    };
  } catch (error) {
    logger.error('Error processing natural language request:', error);
    return {
      success: false,
      message: "I couldn't process your request due to an unexpected error.",
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
    };
  }
}

/**
 * Execute the identified operation with the provided parameters
 */
async function executeOperation(operation: string, params: Record<string, any>): Promise<PrintavoAPIResponse<any>> {
  try {
    switch (operation) {
      // Quote operations
      case 'createQuote':
        return await quoteOperations.createQuote(params.input);
      case 'createQuoteFromProducts':
        return await quoteOperations.createQuoteFromProducts(
          params.quoteInput,
          params.items,
          params.searchQuery,
          params.options
        );
      case 'calculateQuoteTotal':
        return await quoteOperations.calculateQuoteTotal(params.lineItems);
        
      // Order operations
      case 'getOrder':
        return await orderOperations.getOrder(params.id);
      case 'getOrders':
        return await orderOperations.searchOrders(params.query || '');
        
      // Customer operations
      case 'getCustomer':
        return await customerOperations.getCustomer(params.id);
      case 'getCustomers':
      case 'searchCustomers':
        return await customerOperations.getCustomers({ query: params.query || '' });
        
      // Product operations
      case 'getProduct':
        if (!productOperations) {
          return {
            errors: [{ message: 'Product operations not available' }]
          };
        }
        return await productOperations.getProduct(params.id);
      case 'getProducts':
      case 'searchProducts':
        if (!productOperations) {
          return {
            errors: [{ message: 'Product operations not available' }]
          };
        }
        return await productOperations.searchProducts(params.query || '');
        
      // Default case if operation not matched
      default:
        return {
          errors: [{ message: `Operation '${operation}' not supported` }]
        };
    }
  } catch (error) {
    logger.error(`Error executing operation ${operation}:`, error);
    return {
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error executing operation' }]
    };
  }
}

/**
 * Get the entity type from an operation name
 */
function getEntityFromOperation(operation: string): string {
  if (operation.includes('Quote')) return 'QUOTE';
  if (operation.includes('Order')) return 'ORDER';
  if (operation.includes('Customer')) return 'CUSTOMER';
  if (operation.includes('Product')) return 'PRODUCT';
  if (operation.includes('LineItem')) return 'LINE_ITEM';
  if (operation.includes('Payment')) return 'PAYMENT';
  return 'UNKNOWN';
}

/**
 * Helper function for common natural language queries
 */
export async function getQuoteByName(name: string): Promise<PrintavoAPIResponse<any>> {
  return await orderOperations.searchOrders({ query: `name:${name}` });
}

export async function getCustomerByName(name: string): Promise<PrintavoAPIResponse<any>> {
  return await customerOperations.getCustomers({ query: name });
}

export async function getProductByName(name: string): Promise<PrintavoAPIResponse<any>> {
  if (!productOperations) {
    return {
      errors: [{ message: 'Product operations not available' }]
    };
  }
  return await productOperations.searchProducts(name);
}

export async function createSimpleQuote(
  customerName: string,
  productNames: string[],
  quantities: number[]
): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    // Find the customer
    const customerResponse = await customerOperations.getCustomers({ query: customerName });
    if (!customerResponse.data?.customers?.edges?.[0]?.node) {
      return {
        errors: [{ message: `Customer '${customerName}' not found` }]
      };
    }
    const customer = customerResponse.data.customers.edges[0].node;
    
    // Check if product operations are available
    if (!productOperations) {
      return {
        errors: [{ message: 'Product operations not available, cannot create quote' }]
      };
    }
    
    // Find the products
    const productPromises = productNames.map(name => productOperations.searchProducts(name));
    const productResponses = await Promise.all(productPromises);
    
    const items = [];
    for (let i = 0; i < productResponses.length; i++) {
      const productResponse = productResponses[i];
      if (!productResponse.data?.products?.edges?.[0]?.node) {
        continue;
      }
      const product = productResponse.data.products.edges[0].node;
      items.push({
        productId: product.id,
        quantity: quantities[i] || 1,
        unitPrice: product.price
      });
    }
    
    if (items.length === 0) {
      return {
        errors: [{ message: 'No valid products found' }]
      };
    }
    
    // Create the quote with a properly typed input
    const quoteInput = { 
      customerId: customer.id,
      // No name field in the actual QuoteCreateInput type
    };
    
    return await quoteOperations.createQuoteFromProducts(
      quoteInput,
      items
    );
  } catch (error) {
    logger.error('Error creating simple quote:', error);
    return {
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error creating quote' }]
    };
  }
} 