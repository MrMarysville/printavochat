import { ChatMessage } from '../../app/api/chat/route';

// Add this new interface for tracking conversation context
export interface ConversationContext {
  lastOrderId?: string;
  lastOrderType?: string;
  lastCustomerId?: string;
  lastSearchTerm?: string;
  lastIntent?: string;
}

// Build context from previous messages
export function buildConversationContext(messages: ChatMessage[]): ConversationContext {
  const context: ConversationContext = {};

  // Process messages in reverse (newest first) to capture most recent context
  for (const message of messages.slice().reverse()) {
    const content = message.content.toLowerCase();

    // Extract order IDs
    const orderIdMatch = content.match(/\border\s*#?\s*(\d+)\b|invoice\s*#?\s*(\d+)\b|quote\s*#?\s*(\d+)\b|#(\d+)\b/i);
    if (orderIdMatch) {
      const id = orderIdMatch[1] || orderIdMatch[2] || orderIdMatch[3] || orderIdMatch[4];
      if (id && !context.lastOrderId) {
        context.lastOrderId = id;
        // Determine type based on message content
        if (content.includes('invoice')) {
          context.lastOrderType = 'Invoice';
        } else if (content.includes('quote')) {
          context.lastOrderType = 'Quote';
        } else {
          context.lastOrderType = 'Order';
        }
      }
    }

    // Extract search terms for orders or customers
    if (content.includes('search') || content.includes('find') || content.includes('look')) {
      const terms = content
        .replace(/search|find|look|show|display|get|fetch|up|view|see|me|for|the|an?|of/gi, '')
        .replace(/orders?|invoices?|quotes?|customers?|clients?/gi, '')
        .trim();

      if (terms && !context.lastSearchTerm) {
        context.lastSearchTerm = terms;
      }
    }

    // Extract last intent
    if (message.role === 'assistant' && message.content.includes('orders:')) {
      context.lastIntent = 'orders';
    } else if (message.role === 'assistant' && message.content.includes('customers:')) {
      context.lastIntent = 'customers';
    }
  }

  return context;
}

// Update context after a response
export function updateContextFromResponse(
  context: ConversationContext,
  operation: {name: string}, // Simplified type
  response: { message: string; data?: any }
): void {
  if (operation.name === 'getOrder' && response.data?.id) {
    context.lastOrderId = response.data.id.replace(/^(INV-|Q-|QUOTE-|INVOICE-)/, '');
    context.lastOrderType = determineOrderType(response.data.id);
  } else if (operation.name === 'searchOrders' && response.data?.length > 0) {
    context.lastIntent = 'orders';
  } else if (operation.name === 'searchCustomers' && response.data?.length > 0) {
    context.lastIntent = 'customers';
  }
}

// This function is duplicated here and in operations.ts, will need to be resolved.
function determineOrderType(orderId: string): string {
    if (!orderId) return 'Order';

    if (orderId.startsWith('Q-') || orderId.startsWith('QUOTE-')) {
        return 'Quote';
    } else if (orderId.startsWith('INV-') || orderId.startsWith('INVOICE-')) {
        return 'Invoice';
    }

    return 'Order';
}
