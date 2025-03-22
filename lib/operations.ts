import { operations } from '@/lib/graphql-client';
import { logger } from '@/lib/logger';
import {
    PrintavoAPIError,
    PrintavoAuthenticationError,
    PrintavoValidationError,
    PrintavoNotFoundError,
    PrintavoRateLimitError
  } from '@/lib/graphql-client';
import { ConversationContext } from './context';

// Define the ChatMessage interface to match the one in app/api/chat/route.ts
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

interface OrderLineItemGroup {
  id: string;
  name: string;
  style?: {
    style_number?: string;
    color?: string;
    sizes?: any;
  };
  quantity?: number;
  price?: number;
  items?: any[];
}

function formatErrorMessage(error: unknown, sentiment?: { isUrgent: boolean; isConfused: boolean; isPositive: boolean; isNegative: boolean }): string {
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

  // Add sentiment-based modifiers
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

function createGetOrderOperation(orderId: string, messageLower: string, sentiment: { isUrgent: boolean; isConfused: boolean; isPositive: boolean; isNegative: boolean }): Operation {
    return {
      name: 'getOrder',
      explanation: 'Fetching order details from Printavo',
      execute: async () => {
        try {
          logger.info(`Attempting to fetch order: ${orderId}`);
          
          let order = null;
          let _error = null;
          
          // Check if this looks like a visual ID (4-digit number)
          const isVisualId = /^\d{4}$/.test(orderId);
          
          if (isVisualId) {
            // Try to fetch by visual ID first
            try {
              logger.info(`Trying to fetch order with visual ID: ${orderId}`);
              const response = await operations.getOrderByVisualId(orderId);

              if (response.success && response.data) {
                order = response.data;
                logger.info(`Successfully found order by visual ID: ${orderId}`);
              } else {
                _error = response.error;
                logger.warn(`Failed to fetch order with visual ID ${orderId}:`, response.error);
              }
            } catch (err) {
              _error = err;
              logger.warn(`Error fetching order with visual ID ${orderId}:`, err);
            }
          }
          
          // If visual ID lookup failed or it's not a visual ID, try different formats for the order ID
          if (!order) {
            // Define ID formats to try
            const orderIdFormats = [
              orderId,                // Try the raw input first
              `INV-${orderId}`,       // Try INV- prefix
              `Q-${orderId}`          // Try Q- prefix
            ];
            
            // Only add the prefixed versions if it's not already a full ID format
            if (!/^(INV|Q)-/.test(orderId)) {
              logger.info(`Trying alternative formats for order ID: ${orderIdFormats.join(', ')}`);
              
              // Try each format until we find the order
              for (const idFormat of orderIdFormats) {
                try {
                  // Regular ID search
                  const response = await operations.getOrder(idFormat);
                  if (response.success && response.data) {
                    order = response.data;
                    logger.info(`Successfully found order with ID: ${idFormat}`);
                    break;
                  } else {
                    _error = response.error;
                    logger.warn(`Failed to fetch order with ID ${idFormat}:`, response.error);
                  }
                } catch (err) {
                  _error = err;
                  logger.warn(`Failed to fetch order with ID format ${idFormat}:`, err);
                  // Continue trying other formats
                }
              }
            }
          }

          if (!order) {
            return {
              message: `I couldn't find order #${orderId}. Please verify the order number and try again. You can enter just the 4-digit visual ID without any prefix.`,
              data: { error: 'Order not found' },
            };
          }

          // Format the order details for display
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
          
          // Add line items if available
          if (order.lineItemGroups && order.lineItemGroups.length > 0) {
            message += `\nItems:\n`;
            
            order.lineItemGroups.forEach((group: OrderLineItemGroup, index: number) => {
              const itemName = group.name || `Item Group ${index + 1}`;
              message += `- ${itemName}`;
              
              // Add style details if available
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

  function createOrderSearchOperation(message: string, messageLower: string, sentiment: { isUrgent: boolean; isConfused: boolean; isPositive: boolean; isNegative: boolean }): Operation {
    return {
      name: 'searchOrders',
      explanation: 'Searching for orders in Printavo',
      execute: async () => {
        try {
          // Extract search query from message
          let searchQuery = message
            .replace(/search|find|look|show|display|get|fetch|up|view|see|me|for|the|an?|of/gi, '')
            .replace(/orders?|invoices?|quotes?/gi, '')
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
          const response = await operations.searchOrders({ query: queryToUse });
          
          interface OrdersResponse {
            orders?: {
              edges?: Array<{ 
                node: { 
                  id: string; 
                  status?: string; 
                  customer?: { name?: string };
                  createdAt?: string;
                  total?: string;
                } 
              }>;
            };
          }
          
          const typedResponse = response as OrdersResponse;
          const orders = typedResponse?.orders?.edges?.map(edge => edge?.node).filter(Boolean) || [];
          
          if (orders.length === 0) {
            return {
              message: `I couldn't find any orders matching "${queryToUse}".`,
              data: { query: queryToUse }
            };
          }
  
          // Determine if we need to limit results (for readability)
          const maxDisplayOrders = 5;
          const hasMoreOrders = orders.length > maxDisplayOrders;
          const displayOrders = hasMoreOrders ? orders.slice(0, maxDisplayOrders) : orders;
  
          const orderList = displayOrders.map((order) => {
            const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Unknown date';
            const total = order.total ? `$${parseFloat(order.total).toFixed(2)}` : 'N/A';
            return `- ${order.id} - ${order.customer?.name || 'Unnamed'} - ${order.status || 'No status'} - ${date} - ${total}`;
          }).join('\n');
  
          const responseMessage = `${orders.length === 1 
            ? `Here is the order matching "${queryToUse}":`
            : `Here are ${displayOrders.length} ${hasMoreOrders ? `of ${orders.length} ` : ''}orders matching "${queryToUse}":`
          }\n${orderList}${hasMoreOrders ? `\n\n...and ${orders.length - maxDisplayOrders} more. Please refine your search to see specific orders.` : ''}`;
  
          return {
            message: responseMessage,
            data: orders,
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

  function createCustomerSearchOperation(message: string, _messageLower: string, sentiment: { isUrgent: boolean; isConfused: boolean; isPositive: boolean; isNegative: boolean }): Operation {
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
          // Since we don't have a direct search function, use operations.getCustomers
          // and pass the queryToUse as a custom parameter that will be handled by our service
          const response = await operations.getCustomers({first: 20}); // Use a valid parameter
          
          // Ideally there would be a search function, but we'll use type assertion for now
          
          // Type assertion for the response
          interface CustomerResponse {
            customers?: {
              edges?: Array<{ 
                node: { 
                  id: string; 
                  name: string; 
                  email?: string; 
                  phone?: string; 
                } 
              }>;
            };
          }
          
          const typedResponse = response as CustomerResponse;
          const customers = typedResponse?.customers?.edges?.map(edge => edge?.node).filter(Boolean) || [];
          
          if (customers.length === 0) {
            return {
              message: `I couldn't find any customers matching "${queryToUse}".`,
              data: { query: queryToUse }
            };
          }
  
          // Determine if we need to limit results (for readability)
          const maxDisplayCustomers = 10;
          const hasMoreCustomers = customers.length > maxDisplayCustomers;
          const displayCustomers = hasMoreCustomers ? customers.slice(0, maxDisplayCustomers) : customers;
  
          const customerList = displayCustomers.map((customer) => {
            return `- ${customer.name || 'Unnamed'} ${customer.email ? `(${customer.email})` : ''}${customer.phone ? ` - ${customer.phone}` : ''}`;
          }).join('\n');
  
          const responseMessage = `${customers.length === 1 
            ? `Here is the customer matching "${queryToUse}":`
            : `Here are ${displayCustomers.length} ${hasMoreCustomers ? `of ${customers.length} ` : ''}customers matching "${queryToUse}":`
          }\n${customerList}${hasMoreCustomers ? `\n\n...and ${customers.length - maxDisplayCustomers} more. Please refine your search to see specific customers.` : ''}`;
  
          return {
            message: responseMessage,
            data: customers,
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

// Modify determineOperation to use context
export function determineOperation(message: string, context: ConversationContext, sentiment: { isUrgent: boolean; isConfused: boolean; isPositive: boolean; isNegative: boolean }): Operation {
  const messageLower = message.toLowerCase();

  // Check for context-aware follow-up questions
  if (context.lastOrderId && messageLower.match(/^(show|get|view|what('s| is))\s+(more|detail|info|status|it)/i)) {
    // User is asking for more details about the last order
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

  // Check specifically for natural language visual ID queries
  const visualIdPhraseMatch = messageLower.match(/(?:visual id|visual-id|vis id|vis-id|vis\.|visual\.|vid)\s+(?:search|query|lookup|for|is|=|:)?\s*(\d{4})/i);
  
  // Also check for phrases like "search order by visual id 1234"
  const orderByVisualIdMatch = messageLower.match(/(?:search|find|get|show|view|display|fetch)\s+(?:order|quote|invoice)(?:s)?\s+(?:by|with|using|for|where)\s+(?:visual id|visual-id|vis id|vid)\s+(\d{4})/i);
  
  // Check for "order with visual id 1234" pattern
  const orderWithVisualIdMatch = messageLower.match(/(?:order|quote|invoice)(?:s)?\s+(?:with|using|for|where|by)\s+(?:visual id|visual-id|vis id|vid)\s+(\d{4})/i);
  
  // If any of these specific visual ID patterns match, use the visual ID directly
  if (visualIdPhraseMatch || orderByVisualIdMatch || orderWithVisualIdMatch) {
    const match = visualIdPhraseMatch || orderByVisualIdMatch || orderWithVisualIdMatch;
    if (match && match[1]) {
      const visualId = match[1];
      logger.info(`Detected explicit visual ID query: ${visualId}`);
      return createGetOrderOperation(visualId, messageLower, sentiment);
    }
  }

  // Extract potential order IDs with different patterns
  // Look specifically for 4-digit numbers that could be visual IDs
  const visualIdMatch = messageLower.match(/\b(\d{4})\b/);

  // Also check for prefixed order IDs like INV-XXXX or Q-XXXX
  const prefixedOrderIdMatch = messageLower.match(/\b(?:inv-?|q-?|order\s*#?\s*|quote\s*#?\s*|o#|#)?(\d{3,})\b/i);

  // Check for order lookups - prioritize 4-digit visual IDs
  if (visualIdMatch && (
      messageLower.includes('order') || 
      messageLower.includes('quote') || 
      messageLower.includes('invoice') ||
      messageLower.includes('get') || 
      messageLower.includes('view') || 
      messageLower.includes('show') || 
      messageLower.includes('find') ||
      // Also match if they just type the 4 digits with minimal context
      messageLower.trim().length < 10 // Short message with just the ID
  )) {
    const orderId = visualIdMatch[1];
    logger.info(`Detected potential visual ID: ${orderId}`);
    return createGetOrderOperation(orderId, messageLower, sentiment);
  }

  // Fall back to other order ID formats if no visual ID
  if (prefixedOrderIdMatch) {
    const orderId = prefixedOrderIdMatch[1];
    logger.info(`Detected potential order ID: ${orderId}`);
    return createGetOrderOperation(orderId, messageLower, sentiment);
  }

  // Check for order searches
  if (messageLower.match(/\b(find|search|show|get|list|view|display|fetch)\s+(orders?|quotes?|invoices?)\b/i) ||
      messageLower.match(/\b(orders?|quotes?|invoices?)(\s+for|\s+by|\s+from)?\b/i)) {
    return createOrderSearchOperation(message, messageLower, sentiment);
  }

  // Check for customer searches
  if (messageLower.match(/\b(find|search|show|get|list|view|display|fetch)\s+(customers?|clients?|accounts?)\b/i) ||
      messageLower.match(/\b(customers?|clients?|accounts?)(\s+for|\s+by|\s+from)?\b/i)) {
    return createCustomerSearchOperation(message, messageLower, sentiment);
  }

  // If the message is just a 4-digit number by itself, treat it as an order visual ID
  if (/^\s*\d{4}\s*$/.test(message)) {
    const orderId = message.trim();
    logger.info(`Detected standalone visual ID: ${orderId}`);
    return createGetOrderOperation(orderId, messageLower, sentiment);
  }

  // Handle greetings
  if (messageLower.match(/^(hi|hello|hey|greetings|howdy|sup|hiya|yo|what's up)/i)) {
    return {
      name: 'greeting',
      explanation: 'Responding to greeting',
      execute: async () => ({
        message: "Hello! I'm your Printavo assistant. How can I help you today? You can ask me to find orders, look up quotes, or search for customers.",
        data: null,
      }),
    };
  }

  // Handle help requests
  if (messageLower.match(/^(help|assist|support|what can you do|commands|options|features|capabilities)/i)) {
    return {
      name: 'help',
      explanation: 'Providing help information',
      execute: async () => ({
        message: "I can help you with Printavo in the following ways:\n\n" +
                "- Find an order by number (e.g., \"Show order #1234\" or just \"1234\")\n" +
                "- Find order by Visual ID (e.g., \"Find order with visual ID 1234\" or \"visual ID 1234\")\n" +
                "- Search for orders (e.g., \"Find recent orders\" or \"Search orders for XYZ Company\")\n" +
                "- Search for customers (e.g., \"Show customers\" or \"Find customer ABC Inc\")\n" +
                "- Create a new customer (e.g., \"Create a new customer with email john@example.com, name John Smith\")\n\n" +
                "You can also just type a 4-digit Visual ID directly and I'll look up the matching order for you.",
        data: null,
      }),
    };
  }

  // Check for customer creation intent
  if (messageLower.match(/\b(create|add|new|make|register)\s+(a\s+)?(customer|client|account)\b/i)) {
    // Extract potential customer info from message
    const emailMatch = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    const email = emailMatch ? emailMatch[0] : null;
    
    // Check for a name in the format "FirstName LastName"
    const nameMatch = message.match(/\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/);
    const firstName = nameMatch ? nameMatch[1] : null;
    const lastName = nameMatch ? nameMatch[2] : null;
    
    // Check for company name (anything in quotes)
    const companyMatch = message.match(/"([^"]*)"/);
    const company = companyMatch ? companyMatch[1] : null;
    
    // Phone number with various formats
    const phoneMatch = message.match(/\b(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}\b/);
    const phone = phoneMatch ? phoneMatch[0] : null;
    
    return createCustomerOperation(email, firstName, lastName, company, phone, messageLower, sentiment);
  }

  // Default response
  return {
    name: 'default',
    explanation: 'Default response for unrecognized intent',
    execute: async () => {
      const baseMessage = "I'm not sure I understand what you're asking. ";

      let suggestionMessage;
      if (sentiment.isConfused) {
        suggestionMessage = "Could you try rephrasing your question? You can ask me to find orders, search for customers, or look up specific orders by number.";
      } else if (sentiment.isUrgent) {
        suggestionMessage = "For immediate assistance, you can directly search for an order by number (like 'Show order #1234' or just type '1234') or search customers by name.";
      } else {
        suggestionMessage = "You can ask me to find orders, search for customers, or look up specific orders by number.";
      }

      return {
        message: baseMessage + suggestionMessage,
        data: null,
      };
    },
  };
}

export async function executeOperation(operation: Operation) {
  return operation.execute();
}

// Customer creation operation
function createCustomerOperation(
  email: string | null, 
  firstName: string | null, 
  lastName: string | null, 
  company: string | null, 
  phone: string | null, 
  messageLower: string, 
  sentiment: { isUrgent: boolean; isConfused: boolean; isPositive: boolean; isNegative: boolean }
): Operation {
  return {
    name: 'createCustomer',
    explanation: 'Creating a customer in Printavo',
    execute: async () => {
      try {
        // Check if we have enough information
        const missingFields = [];
        if (!email) missingFields.push('email');
        if (!firstName) missingFields.push('first name');
        if (!lastName) missingFields.push('last name');
        
        if (missingFields.length > 0) {
          return {
            message: `To create a customer, I need the following information: ${missingFields.join(', ')}. Please provide these details.`,
            data: { missingFields }
          };
        }
        
        // Try to find or create the customer using the service
        const response = await operations.createCustomer({
          firstName: firstName as string,
          lastName: lastName as string,
          email: email as string,
          phone: phone || undefined,
          company: company || undefined
        });
        
        if (!response.success) {
          return {
            message: formatErrorMessage(response.error, sentiment),
            data: { error: response.error }
          };
        }
        
        if (!response.data) {
          return {
            message: "Customer was created but no data was returned.",
            data: null
          };
        }
        
        const customer = response.data;
        return {
          message: `I've successfully created a new customer:\n\nName: ${customer.name || 'Unknown'}\nEmail: ${customer.email || 'Unknown'}${customer.phone ? `\nPhone: ${customer.phone}` : ''}${customer.company ? `\nCompany: ${customer.company}` : ''}\n\nThe customer ID is ${customer.id || 'Unknown'}.`,
          data: customer
        };
      } catch (error) {
        logger.error('Error in createCustomer operation:', error);
        return {
          message: formatErrorMessage(error, sentiment),
          data: { error: error instanceof Error ? error.message : String(error) }
        };
      }
    }
  };
}

// Export other functions and types for use in other modules
export type { Operation, OperationResult, PrintavoChatMessage };
export { createGetOrderOperation, createOrderSearchOperation, createCustomerSearchOperation, createCustomerOperation };
