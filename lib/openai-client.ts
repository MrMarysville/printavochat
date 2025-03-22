import 'openai/shims/node';
import OpenAI from 'openai';
import { ChatCompletionMessage } from 'openai/resources/chat';
import fs from 'fs';
import path from 'path';

// Create a more specific type that ensures compatibility
type PrintavoChatMessage = ChatCompletionMessage & {
  role: 'system' | 'user' | 'assistant' | 'function';
};

// Initialize the OpenAI client with API key from environment variables
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OPENAI_API_KEY environment variable is not set.');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey,
  timeout: 30000,
  maxRetries: 3
});

// Load Printavo API documentation
const printavoDocsPath = path.join(process.cwd(), 'printavo_docs.json');
const printavoDocs = JSON.parse(fs.readFileSync(printavoDocsPath, 'utf8'));

// System prompt with Printavo API documentation
const systemPrompt = `
You are an AI assistant that helps users interact with the Printavo API.
You can help users create quotes, invoices, line items, and more.

Here are the available Printavo API endpoints:
${JSON.stringify(printavoDocs[0].endpoints, null, 2)}

When a user asks you to perform an action with Printavo, respond with:
1. A confirmation of what you're going to do
2. The specific API endpoint you'll use
3. The parameters you'll send
`;

export async function processWithGPT(messages: PrintavoChatMessage[]): Promise<{
  message: string;
  operation?: {
    operation: string;
    params: Record<string, any>;
  };
  error?: string;
}> {
  try {
    // Add system message at the beginning if not already present
    if (messages.length === 0 || messages[0].role !== 'system') {
      messages.unshift({
        role: 'system',
        content: systemPrompt
      } as PrintavoChatMessage);
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 2000,
      tools: [
        {
          type: 'function',
          function: {
            name: 'executeOperation',
            description: 'Execute a Printavo API operation',
            parameters: {
              type: 'object',
              properties: {
                operation: {
                  type: 'string',
                  description: 'The Printavo API operation to execute',
                  enum: [
                    'getOrders', 'getOrder', 'getCustomers', 'getCustomer',
                    'createQuote', 'updateStatus', 'createFee', 'updateFee',
                    'deleteFee', 'createLineItemGroup', 'createLineItem',
                    'createImprint', 'createImprintMockup', 'createPaymentRequest',
                    'createApprovalRequest', 'createCustomAddress', 'getInvoice',
                    'getQuote', 'getLineItem', 'getLineItemGroup', 'getContact',
                    'getInquiry', 'getMerchOrder', 'getMerchStore', 'getStatus',
                    'getTask', 'getThread', 'getTransaction', 'getTransactionDetail',
                    'getUser', 'updateInquiry', 'login', 'createTask',
                    'updateThread', 'createDeliveryMethod', 'getThreads',
                    'getTransactions', 'calculateLineItemGroupPricing'
                  ]
                },
                params: {
                  type: 'object',
                  description: 'The parameters for the operation'
                }
              },
              required: ['operation']
            }
          }
        }
      ],
      tool_choice: 'auto'
    });

    const responseMessage = completion.choices[0].message;
    
    // Handle tool calls
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      const toolCall = responseMessage.tool_calls[0];
      if (toolCall.function.name === 'executeOperation') {
        const args = JSON.parse(toolCall.function.arguments);
        return {
          message: responseMessage.content || "I'll execute that operation for you.",
          operation: args
        };
      }
    }

    return {
      message: responseMessage.content || 'I processed your request, but no specific operation was needed.'
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      message: 'Sorry, I encountered an error while processing your request.',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}


















