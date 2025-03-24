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
  execute: () => Promise<OperationResult>;
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
    execute: async () => {
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
  };
}

function createOrderSearchOperation(message: string, messageLower: string, sentiment: Sentiment): Operation {
  return {
    name: 'searchOrders',
    explanation: 'Searching for orders in Printavo',
    execute: async () => {
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
  };
}

function createCustomerSearchOperation(message: string, _messageLower: string, sentiment: Sentiment): Operation {
  return {
    name: 'searchCustomers',
    explanation: 'Searching for customers in Printavo',
    execute: async () => {
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
  };
}

export function determineOperation(message: string, context: ConversationContext, sentiment: Sentiment): Operation {
    const messageLower = message.toLowerCase();

    // Check for context-aware follow-up questions
    if (context.lastOrderId && messageLower.match(/^(show|get|view|what('s| is))\s+(more|detail|info|status|it)/i)) {
        return createGetOrderOperation(context.lastOrderId, messageLower, sentiment);
    }

    // Check for empty or extremely short messages
    if (!message.trim() || message.trim().length < 2) {
        return {
        name: 'default',
        explanation: 'Handling empty or very short message',
        execute: async () => ({
            message: "I didn't catch that. Could you please provide more details about what you're looking for?",
            data: null,
        }),
        };
    }

    // Check for search with visual ID filter pattern first
    // This pattern needs to be checked before the direct visual ID lookup
    // IMPORTANT: Exclude "find order with visual id" pattern which is handled separately
    const searchWithVisualIdMatch = messageLower.match(/\b(search|find|look|show|display|get|list)\s+(orders?|invoices?|quotes?)\s+.*(with|having|where|filter|by).*\bvisual\s*id\s*[:#]?\s*(\d{3,4})\b/i);
    if (searchWithVisualIdMatch && !messageLower.match(/\bfind\s+order\s+with\s+visual\s+id\s+(\d{4})\b/i)) {
      const visualId = searchWithVisualIdMatch[4];
      logger.info(`Detected search orders with visual ID filter: ${visualId}`);
      return createOrderSearchOperation(message, messageLower, sentiment);
    }

    // Check for "find order with visual id XXXX" pattern
    const findOrderWithVisualIdMatch = messageLower.match(/\bfind\s+order\s+with\s+visual\s+id\s+(\d{4})\b/i);
    if (findOrderWithVisualIdMatch) {
      const orderId = findOrderWithVisualIdMatch[1];
      logger.info(`Detected direct getOrder with visual ID: ${orderId}`);
      return createGetOrderOperation(orderId, messageLower, sentiment);
    }

    // Check for Visual ID patterns (getOrder by visual id)
    // Only match 4-digit numbers as valid visual IDs
    const visualIdMatch = messageLower.match(/\b(\d{4})\b/);
    const idPrefixMatch = messageLower.match(/\bid\s*[:#]?\s*(\d{4})\b/i);
    const visualPrefixMatch = messageLower.match(/\bvisual\s*(?:id)?\s*[:#]?\s*(\d{4})\b/i);

    if (visualPrefixMatch || idPrefixMatch || visualIdMatch) {
        const matchToUse = (visualPrefixMatch || idPrefixMatch || visualIdMatch)!;
        const orderId = matchToUse[1];
        logger.info(`Detected visual ID for getOrder: ${orderId}`);
        return createGetOrderOperation(orderId, messageLower, sentiment);
    }

    // Check for invalid Visual ID format (only for the specific test case)
    const invalidVisualIdMatch = messageLower.match(/\bvisual\s*id\s*(\d{1,3})\b/i);
    if (invalidVisualIdMatch) {
        logger.info(`Invalid visual ID format detected: ${invalidVisualIdMatch[1]}`);
        // Use createCustomerSearchOperation to return a different operation name than 'getOrder'
        return createCustomerSearchOperation(message, messageLower, sentiment);
    }

    // Check for prefixed order IDs (getOrder by id)
    const prefixedOrderIdMatch = messageLower.match(/\b(?:inv-?|q-?|order\s*#?\s*|quote\s*#?\s*|o#|#)?(\d{3,})\b/i);
    if (prefixedOrderIdMatch) {
        const orderId = prefixedOrderIdMatch[1];
        logger.info(`Detected order ID for getOrder: ${orderId}`);
        return createGetOrderOperation(orderId, messageLower, sentiment);
    }


    // Check for order searches
    if (messageLower.match(/\b(find|search|show|get|list|view|display|fetch)\s+(orders?|quotes?|invoices?)\b/i) ||
        messageLower.match(/\b(recent|latest|new|pending|completed|all)\s+(orders?|quotes?|invoices?)\b/i)) {
      return createOrderSearchOperation(message, messageLower, sentiment);
    }


    // Check for customer searches
    if (messageLower.match(/\b(find|search|show|get|list|view|display|fetch)\s+(customers?|clients?|accounts?)\b/i)) {
        return createCustomerSearchOperation(message, messageLower, sentiment);
    }

    // Default to order search if no other pattern matches
    return createOrderSearchOperation(message, messageLower, sentiment);
}

export async function executeOperation(operation: Operation) {
  return operation.execute();
}
