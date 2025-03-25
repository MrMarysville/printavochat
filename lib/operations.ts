import { searchOperations } from './graphql/operations/searchOperations';
import { logger } from './logger';
import {
  PrintavoAPIError,
  PrintavoAuthenticationError,
  PrintavoValidationError,
  PrintavoNotFoundError,
  PrintavoRateLimitError
} from './printavo-api';
import { ConversationContext } from './context';
import { printavoService } from './printavo-service';

interface PrintavoChatMessage {
  id: string;
  content: string;
  role: 'user' | 'system' | 'assistant';
  timestamp: string | Date;
}

interface OperationResult {
  message: string;
  data?: any;
}

interface Operation {
  name: string;
  explanation: string;
  execute: (params: any) => Promise<any>;
  requiredParams?: string[];
}

interface Sentiment {
  isUrgent: boolean;
  isConfused: boolean;
  isPositive: boolean;
  isNegative: boolean;
}

function formatErrorMessage(error: unknown, sentiment?: Sentiment): string {
  let baseMessage = '';

  if (error instanceof PrintavoAuthenticationError) {
    baseMessage = 'I encountered an authentication error. Please check your API credentials.';
  }
  else if (error instanceof PrintavoValidationError) {
    baseMessage = `Invalid input: ${error.message}`;
  }
  else if (error instanceof PrintavoNotFoundError) {
    baseMessage = error.message;
  }
  else if (error instanceof PrintavoRateLimitError) {
    baseMessage = 'I\'m receiving too many requests right now. Please try again in a moment.';
  }
  else if (error instanceof PrintavoAPIError) {
    baseMessage = `API Error: ${error.message}`;
  }
  else {
    baseMessage = 'An unexpected error occurred. Please try again.';
  }

  if (sentiment?.isUrgent) {
    return `${baseMessage} I understand this is urgent, so please try a more specific request or contact support directly for immediate assistance.`;
  }
  if (sentiment?.isConfused) {
    return `${baseMessage} I understand you might be confused. Let me know if you need help trying a different approach.`;
  }
  if (sentiment?.isNegative) {
    return `${baseMessage} I apologize for the inconvenience. Let's try an alternative approach.`;
  }

  return baseMessage;
}

function createGetOrderOperation(orderId: string, messageLower: string, sentiment: Sentiment): Operation {
  return {
    name: 'getOrder',
    explanation: 'Fetching order details from Printavo',
    execute: async (params: any) => {
      try {
        logger.info(`Attempting to fetch order: ${orderId}`);
        
        // Use the new unified search with visual ID
        const result = await searchOperations.searchOrders({ visualId: orderId });
        
        if (!result.success || !result.data?.length) {
          return {
            message: `I couldn't find order #${orderId}. Please verify the order number and try again. You can enter just the 4-digit visual ID without any prefix.`,
            data: { error: 'Order not found' },
          };
        }

        const order = result.data[0];
        const orderType = order.id?.startsWith('INV-') ? 'Invoice' : 'Quote';
        const customerName = order.customer?.name || 'Unknown Customer';
        const orderStatus = order.status?.name || 'Unknown Status';
        const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown Date';
        
        let message = `Here are the details for ${orderType} #${orderId} (ID: ${order.id}):\n\n`;
        message += `Customer: ${customerName}\n`;
        message += `Status: ${orderStatus}\n`;
        message += `Date: ${orderDate}\n`;
        
        if (order.total) {
          message += `Total: $${parseFloat(String(order.total)).toFixed(2)}\n`;
        }
        
        if (order.lineItemGroups?.length) {
          message += `\nItems:\n`;
          order.lineItemGroups.forEach((group, index) => {
            const itemName = group.name || `Item Group ${index + 1}`;
            message += `- ${itemName}`;
            
            if (group.style) {
              const { style_number, color, sizes } = group.style;
              if (style_number) message += `, Style: ${style_number}`;
              if (color) message += `, Color: ${color}`;
              if (sizes) message += `, Sizes: ${sizes}`;
            }
            
            if (group.quantity) message += `, Qty: ${group.quantity}`;
            if (group.price) message += `, Price: $${parseFloat(String(group.price)).toFixed(2)}`;
            
            message += '\n';
          });
        }
        
        return {
          message,
          data: order,
        };
      } catch (error) {
        logger.error('Error in getOrder operation:', error);
        return {
          message: formatErrorMessage(error, sentiment),
          data: { error: error instanceof Error ? error.message : String(error) },
        };
      }
    },
    requiredParams: ['orderId'],
  };
}

function createOrderSearchOperation(message: string, messageLower: string, sentiment: Sentiment): Operation {
  return {
    name: 'searchOrders',
    explanation: 'Searching for orders in Printavo',
    execute: async (params: any) => {
      try {
        // Extract search query from message
        let searchQuery = message
          .replace(/search|find|look|show|display|get|fetch|up|view|see|me|for|the|an?|of/gi, '')
          .replace(/orders?|invoices?|quotes?/gi, '')
          .replace(/(?:visual\s*id|visual-id|vis\s*id|vis-id|vis\.|visual\.|vid)[\s:=]?\d{4}/gi, '')
          .trim();
          
        // Handle common phrases
        if (/recent|latest|last|new|newest/i.test(messageLower)) {
          searchQuery = 'recent';
        } else if (/pending|open|in\s*progress|not\s*complete|ongoing/i.test(messageLower)) {
          searchQuery = 'pending';
        } else if (/completed|closed|finished|done|delivered/i.test(messageLower)) {
          searchQuery = 'completed';
        } else if (/all|every/i.test(messageLower)) {
          searchQuery = '';
        }
        
        // Default to "recent" if no specific term
        const queryToUse = searchQuery || 'recent';
        logger.info(`Searching orders with query: "${queryToUse}"`);

        // Check for Visual ID filter in the search query.  This needs to be after extracting
        // the search query, otherwise the regex replace will remove the visual ID.
        const visualIdMatch = messageLower.match(/(?:visual\s*id|visual-id|vis\s*id|vis-id|vis\.|visual\.|vid)[\s:=]?(\d{4})/i);
        let searchParams: any = { query: queryToUse };
        if (visualIdMatch && visualIdMatch[1]) {
          searchParams.visualId = visualIdMatch[1];
          logger.info(`Searching orders with Visual ID filter: ${searchParams.visualId}`);
        }

        
        const result = await searchOperations.searchOrders(searchParams);
        
        if (!result.success || !result.data?.length) {
          const searchTerm = searchParams.visualId || searchParams.query;
          return {
            message: `I couldn't find any orders matching "${searchTerm}".`,
            data: [], // Return empty array for no results
          };
        }

        // Format the results
        const maxDisplayOrders = 5;
        const hasMoreOrders = result.data.length > maxDisplayOrders;
        const displayOrders = hasMoreOrders ? result.data.slice(0, maxDisplayOrders) : result.data;

        const orderList = displayOrders.map((order) => {
          const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown date';
          const total = order.total ? `$${parseFloat(String(order.total)).toFixed(2)}` : 'N/A';
          return `- ${order.id} - ${order.customer?.name || 'Unnamed'} - ${order.status?.name || 'No status'} - ${date} - ${total}`;
        }).join('\n');

        const searchTerm = searchParams.visualId || searchParams.query;
        const responseMessage = `${result.data.length === 1 
          ? `Here is the order matching "${searchTerm}":`
          : `Here are ${displayOrders.length} ${hasMoreOrders ? `of ${result.data.length} ` : ''}orders matching "${searchTerm}":`
        }\n${orderList}${hasMoreOrders ? `\n\n...and ${result.data.length - maxDisplayOrders} more. Please refine your search to see specific orders.` : ''}`;

        return {
          message: responseMessage,
          data: result.data,
        };
      } catch (error) {
        logger.error('Error in searchOrders operation:', error);
        return {
          message: formatErrorMessage(error, sentiment),
          data: { error: error instanceof Error ? error.message : String(error) },
        };
      }
    },
    requiredParams: ['message'],
  };
}

function createCustomerSearchOperation(message: string, _messageLower: string, sentiment: Sentiment): Operation {
  return {
    name: 'searchCustomers',
    explanation: 'Searching for customers in Printavo',
    execute: async (params: any) => {
      try {
        // Extract search query from message
        const searchTermText = message
          .replace(/search|find|look|show|display|get|fetch|up|view|see|me|for|the|an?|of/gi, '')
          .replace(/customers?|clients?|accounts?|buyers?|companies?|businesses?/gi, '')
          .trim();
          
        // Default to "recent" if no specific term
        const queryToUse = searchTermText || 'recent';
        
        logger.info(`Searching customers with query: "${queryToUse}"`);
        const result = await searchOperations.searchCustomers({ query: queryToUse });
        
        if (!result.success || !result.data?.length) {
          return {
            message: `I couldn't find any customers matching "${queryToUse}".`,
            data: { query: queryToUse }
          };
        }

        // Format the results
        const maxDisplayCustomers = 10;
        const hasMoreCustomers = result.data.length > maxDisplayCustomers;
        const displayCustomers = hasMoreCustomers ? result.data.slice(0, maxDisplayCustomers) : result.data;

        const customerList = displayCustomers.map((customer) => {
          return `- ${customer.name || 'Unnamed'} ${customer.email ? `(${customer.email})` : ''}${customer.phone ? ` - ${customer.phone}` : ''}`;
        }).join('\n');

        const responseMessage = `${displayCustomers.length === 1 
          ? `Here is the customer matching "${queryToUse}":`
          : `Here are ${displayCustomers.length} ${hasMoreCustomers ? `of ${displayCustomers.length} ` : ''}customers matching "${queryToUse}":`
        }\n${customerList}${hasMoreCustomers ? `\n\n...and ${displayCustomers.length - maxDisplayCustomers} more. Please refine your search to see specific customers.` : ''}`;

        return {
          message: responseMessage,
          data: displayCustomers,
        };
      } catch (error) {
        logger.error('Error in searchCustomers operation:', error);
        return {
          message: formatErrorMessage(error, sentiment),
          data: { error: error instanceof Error ? error.message : String(error) },
        };
      }
    },
    requiredParams: ['message'],
  };
}

export function determineOperation(input: string): Operation | null {
  if (!input || typeof input !== 'string') {
    return null;
  }
  
  const normalizedInput = input.toLowerCase().trim();
  
  // Visual ID search patterns
  // Match patterns like "show me order #1234", "find order 1234"
  const orderVisualIdPattern = /(?:get|show|find|search|display|fetch)(?:\s+me)?\s+(?:order|quote|invoice)\s+(?:#)?(\d{4,5})/i;
  const orderNumberPattern = /^(?:#)?(\d{4,5})$/i; // Just the order number
  
  if (orderVisualIdPattern.test(normalizedInput) || orderNumberPattern.test(normalizedInput)) {
    let visualId;
    const match1 = normalizedInput.match(orderVisualIdPattern);
    const match2 = normalizedInput.match(orderNumberPattern);
    
    if (match1) {
      visualId = match1[1];
    } else if (match2) {
      visualId = match2[1];
    }
    
    if (visualId) {
      return {
        name: 'getOrderByVisualId',
        explanation: `Searching for order with visual ID: ${visualId}`,
        execute: async () => {
          return { visualId };
        },
        requiredParams: []
      };
    }
  }
  
  // Quote creation patterns
  const createQuotePattern = /(?:create|make|generate|new|add)\s+(?:a\s+)?(?:new\s+)?(?:quote|estimate)/i;
  
  if (createQuotePattern.test(normalizedInput)) {
    return {
      name: 'createQuote',
      explanation: 'Creating a new quote',
      execute: async (params: any) => {
        return params;
      },
      requiredParams: ['input']
    };
  }
  
  // Invoice creation patterns
  const createInvoicePattern = /(?:create|make|generate|new|add)\s+(?:a\s+)?(?:new\s+)?(?:invoice|bill)/i;
  
  if (createInvoicePattern.test(normalizedInput)) {
    return {
      name: 'createInvoice',
      explanation: 'Creating a new invoice',
      execute: async (params: any) => {
        return params;
      },
      requiredParams: ['input']
    };
  }
  
  // Order search patterns
  const searchOrdersPattern = /(?:search|find|show|list|display|get)\s+(?:all\s+)?(?:orders|quotes|invoices)/i;
  
  if (searchOrdersPattern.test(normalizedInput)) {
    return {
      name: 'searchOrders',
      explanation: 'Searching for orders',
      execute: async (params: any) => {
        return params;
      }
    };
  }
  
  // No matching operation found
  return null;
}

export async function executeOperation(operation: Operation, params: any = {}) {
  logger.info(`Executing operation: ${operation.name}`);
  
  // Check required parameters
  if (operation.requiredParams && operation.requiredParams.length > 0) {
    for (const param of operation.requiredParams) {
      if (!params[param]) {
        throw new Error(`Required parameter '${param}' is missing for operation '${operation.name}'`);
      }
    }
  }
  
  // Execute the operation
  try {
    const result = await operation.execute(params);
    logger.info(`Operation ${operation.name} executed successfully`);
    return {
      success: true,
      data: result,
      operation: operation.name
    };
  } catch (error) {
    logger.error(`Error executing operation ${operation.name}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : `${error}`,
      operation: operation.name
    };
  }
}

export async function processUserInput(input: string, context: any = {}) {
  logger.info(`Processing user input: ${input}`);
  
  // Determine the operation
  const operation = determineOperation(input);
  
  if (!operation) {
    logger.warn(`No operation determined for input: ${input}`);
    return {
      success: false,
      error: 'I\'m not sure what you want to do. Could you please be more specific?',
      operation: null
    };
  }
  
  logger.info(`Determined operation: ${operation.name}`);
  
  // Execute the operation
  const result = await executeOperation(operation, context);
  
  return result;
}
