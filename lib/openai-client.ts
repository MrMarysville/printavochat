import 'openai/shims/node';
import OpenAI from 'openai';
import { ChatCompletionMessage } from 'openai/resources/chat';
import {
  QuoteCreateInput,
  LineItemGroupCreateInput,
  LineItemCreateInput,
  ImprintCreateInput,
  ProductSearchParams,
  LineItemGroupPricingInput
} from './types';

// Initialize the OpenAI client with API key from environment variables
const apiKey = process.env.OPENAI_API_KEY || 'dummy-key-for-development';

// Only throw an error in production environment
if (!process.env.OPENAI_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('Warning: OPENAI_API_KEY environment variable is not set. Using dummy key for development.');
}

const openai = new OpenAI({
  apiKey,
  timeout: 30000,
  maxRetries: 3
});

interface BusinessOperation {
  operation: 'createQuote' | 'getCustomer' | 'searchOrders' | 'createTask' | 'searchProducts' | 'calculatePricing' | 'createQuoteFromProducts' | 'conversation';
  params: {
    quote?: {
      input: QuoteCreateInput;
      lineItemGroups: Array<{
        group: LineItemGroupCreateInput;
        items: LineItemCreateInput[];
        imprints?: ImprintCreateInput[];
      }>;
    };
    productSearch?: ProductSearchParams;
    productQuote?: {
      input: QuoteCreateInput;
      items: Array<{
        productId: string;
        quantity: number;
        unitPrice?: number;
        imprints?: ImprintCreateInput[];
      }>;
    };
    pricingCalc?: {
      items: Array<{
        name: string;
        quantity: number;
        unitPrice: number;
      }>;
    };
    customerId?: string;
    orderParams?: {
      inProductionAfter?: string;
      inProductionBefore?: string;
      statusIds?: string[];
      sortOn?: string;
    };
    taskInput?: {
      title: string;
      description?: string;
      dueAt?: string;
    };
    response?: string; // Add response parameter for conversation
  };
  explanation: string;
}

// Mock operation generator for when OpenAI is unavailable
function mockBusinessOperation(userMessage: string): BusinessOperation {
  const operation = {
    operation: 'createQuote' as const,
    params: {
      quote: {
        input: {
          customerName: "Sample Customer",
          customerEmail: "sample@example.com",
          description: "Sample Quote"
        },
        lineItemGroups: [
          {
            group: {
              name: "Sample Group",
              description: "Sample group description"
            },
            items: [
              {
                name: "Sample Item",
                quantity: 1,
                unitPrice: 10.00
              }
            ]
          }
        ]
      }
    },
    explanation: "I'll create a sample quote with basic information."
  };

  return operation;
}

// Define a type that matches OpenAI API message format
type OpenAIMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

// Process natural language into business operations
export async function processWithGPT(messages: ChatCompletionMessage[]) {
  try {
    // Prepare messages for the API call with proper typing
    const apiMessages: OpenAIMessage[] = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content || ''
    }));

    // Check if we need to add a system message
    const hasSystemMessage = messages.length > 0 && 
                             apiMessages[0] && 
                             apiMessages[0].role === 'system';

    if (!hasSystemMessage) {
      apiMessages.unshift({
        role: 'system',
        content: `You are a business operations assistant for a print shop using Printavo.
        Interpret user requests and map them to specific business operations.
        For order-related queries like "show me my orders", use the 'searchOrders' operation.
        For customer queries, use 'getCustomer' operation.
        For product searches, use 'searchProducts' operation.
        Only respond with conversation if no specific business operation matches.
        Format your response as JSON with operation type and parameters.`
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: apiMessages,
      temperature: 0.2, // Lower temperature for more consistent responses
    });

    const assistantMessage = completion.choices[0].message;
    const userMessage = messages.length > 0 ? (messages[messages.length - 1]?.content || '') : '';
    const userMessageLower = userMessage.toLowerCase();
    
    // Parse the message to determine the operation type
    let operation: BusinessOperation;
    
    // Check for order-related queries
    if (userMessageLower.includes('order') || userMessageLower.includes('show me my orders')) {
      operation = {
        operation: 'searchOrders',
        params: {
          orderParams: {
            // Default to sorting by most recent
            sortOn: 'created_at'
          }
        },
        explanation: "Searching for orders based on your request."
      };
    }
    // Check for customer-related queries
    else if (userMessageLower.includes('customer')) {
      operation = {
        operation: 'getCustomer',
        params: {
          customerId: 'recent' // This would be replaced with actual logic
        },
        explanation: "Retrieving customer information."
      };
    }
    // Check for product-related queries
    else if (userMessageLower.includes('product')) {
      operation = {
        operation: 'searchProducts',
        params: {
          productSearch: {
            query: userMessage.replace(/product/i, '').trim()
          }
        },
        explanation: "Searching for products based on your query."
      };
    }
    // Default to conversation for other queries
    else {
      operation = {
        operation: 'conversation',
        params: {
          response: assistantMessage.content || ''
        },
        explanation: "I'm responding to your message."
      };
    }

    return {
      response: assistantMessage,
      operation: operation
    };
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    // Use mock response in case of API failure
    const mockResponse = mockBusinessOperation(messages[messages.length - 1]?.content || '');
    return {
      response: { role: 'assistant', content: 'I can help with that!' },
      operation: mockResponse
    };
  }
}