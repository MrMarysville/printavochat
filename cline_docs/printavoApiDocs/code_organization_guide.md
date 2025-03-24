# Printavo Chat Application Code Organization Guide

This document outlines the proper organization and responsibility boundaries for the key files in the Printavo Chat application. Following these guidelines will improve the maintainability and clarity of the codebase.

## Overview of Key Components

The Printavo Chat application has several key components that work together to provide a chat interface for Printavo operations. Each component has a specific responsibility and should adhere to clear boundaries.

## Responsibility Boundaries

### 1. `lib/graphql-client.ts`

**Primary Responsibility**: Serve as the entry point for all GraphQL operations with the Printavo API.

#### What Should Be Here:
- Exports of all GraphQL operations
- Configuration of the GraphQL client
- Authentication setup for the Printavo API

#### What Should NOT Be Here:
- Business logic
- Direct API calls that bypass the GraphQL client
- UI-related code

#### Example Structure:

```typescript
// lib/graphql-client.ts
import { GraphQLClient } from 'graphql-request';
import { logger } from './logger';

// Import all operations from their respective files
import * as orderOperations from './graphql/operations/orders';
import * as customerOperations from './graphql/operations/customers';
import * as quoteOperations from './graphql/operations/quotes';
import * as productOperations from './graphql/operations/products';

// Configure the GraphQL client
const endpoint = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2/graphql';
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '';

export const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${API_TOKEN}`,
  },
});

// Re-export all operations
export const {
  getOrder,
  getOrderByVisualId,
  searchOrders,
  getDueOrders,
} = orderOperations;

export const {
  getCustomer,
  createCustomer,
  getCustomers,
  getOrdersByCustomer,
} = customerOperations;

export const {
  createQuote,
  addLineItemGroup,
  addLineItem,
  addCustomAddress,
  addImprint,
  updateStatus,
  createCompleteQuote,
  calculatePricing,
  calculateQuoteTotal,
  createQuoteFromProducts,
  createInvoice,
} = quoteOperations;

export const {
  searchProducts,
  getProduct,
  getProductsByCategory,
  getProductsByPriceRange,
  createProduct,
  updateProduct,
  deleteProduct,
} = productOperations;

// Export helper function for GraphQL execution
export const executeGraphQL = async <T = any>(query: string, variables: any = {}): Promise<T> => {
  try {
    logger.debug(`Executing GraphQL query: ${query.substring(0, 50)}...`);
    logger.debug(`Variables: ${JSON.stringify(variables).substring(0, 100)}`);
    
    const result = await client.request<T>(query, variables);
    logger.debug('GraphQL query successful');
    return result;
  } catch (error) {
    logger.error('GraphQL request failed:', error);
    throw error;
  }
};
```

### 2. `lib/printavo-api.ts`

**Primary Responsibility**: Handle low-level API interactions and error handling.

#### What Should Be Here:
- Error classes and error handling utilities
- Direct API calls (if needed)
- Authentication utilities
- Input validation utilities

#### What Should NOT Be Here:
- Business logic
- UI-related code
- GraphQL operations (these should be in `lib/graphql/operations/`)

#### Example Structure:

```typescript
// lib/printavo-api.ts
import { logger } from './logger';

// API base URL and authentication from env variables
const API_BASE_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;

// GraphQL endpoint
const GRAPHQL_ENDPOINT = `${API_BASE_URL}/graphql`;

// Check if we have necessary credentials
if (!API_TOKEN) {
  logger.warn('Printavo credentials not set in environment variables. API calls will fail.');
  logger.warn('Please set NEXT_PUBLIC_PRINTAVO_API_URL and NEXT_PUBLIC_PRINTAVO_TOKEN in your .env.local file');
} else {
  logger.info('Printavo API credentials found. API URL:', API_BASE_URL);
  logger.info('Token length:', API_TOKEN.length, 'characters');
}

// Error handler
export class PrintavoAPIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'PrintavoAPIError';
    this.statusCode = statusCode;
  }
}

// Specific error types extending PrintavoAPIError
export class PrintavoAuthenticationError extends PrintavoAPIError {
  constructor(message: string, statusCode: number = 401) {
    super(message, statusCode);
    this.name = 'PrintavoAuthenticationError';
  }
}

export class PrintavoValidationError extends PrintavoAPIError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode);
    this.name = 'PrintavoValidationError';
  }
}

export class PrintavoNotFoundError extends PrintavoAPIError {
  constructor(message: string, statusCode: number = 404) {
    super(message, statusCode);
    this.name = 'PrintavoNotFoundError';
  }
}

export class PrintavoRateLimitError extends PrintavoAPIError {
  constructor(message: string, statusCode: number = 429) {
    super(message, statusCode);
    this.name = 'PrintavoRateLimitError';
  }
}

// Validation utility functions
export function validateId(id: string, entityName: string): void {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new PrintavoValidationError(
      `Invalid ${entityName} ID: ID must be a non-empty string`,
      400
    );
  }
}

// Direct API call function (for non-GraphQL endpoints if needed)
export async function makeApiRequest(endpoint: string, method: string = 'GET', body?: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN || ''}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      
      // Categorize the error based on status code
      if (response.status === 401 || response.status === 403) {
        throw new PrintavoAuthenticationError(
          `Authentication Error: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      } else if (response.status === 404) {
        throw new PrintavoNotFoundError(
          `Resource Not Found: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      } else if (response.status === 422) {
        throw new PrintavoValidationError(
          `Validation Error: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      } else if (response.status === 429) {
        throw new PrintavoRateLimitError(
          `Rate Limit Exceeded: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      } else {
        throw new PrintavoAPIError(
          `API Error: ${response.status} ${response.statusText} - ${errorText}`,
          response.status
        );
      }
    }

    return await response.json();
  } catch (error) {
    logger.error('API request failed:', error);
    throw error;
  }
}
```

### 3. `lib/printavo-service.ts`

**Primary Responsibility**: Provide a simplified interface to operations in graphql-client.ts.

#### What Should Be Here:
- Methods that wrap GraphQL operations
- Input validation before calling GraphQL operations
- Error handling for GraphQL operations
- Business logic related to Printavo operations

#### What Should NOT Be Here:
- Direct GraphQL queries (these should be in `lib/graphql/operations/`)
- UI-related code
- Chat message processing logic

#### Example Structure:

```typescript
// lib/printavo-service.ts
import { operations } from './graphql-client';
import { logger } from './logger';
import { 
  PrintavoAuthenticationError, 
  PrintavoValidationError,
  PrintavoNotFoundError,
  validateId
} from './printavo-api';

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
      
      // Use the GraphQL client implementation
      return operations.getOrderByVisualId(visualId);
    } catch (error) {
      logger.error(`[PrintavoService] Error in getOrderByVisualId: ${error instanceof Error ? error.message : String(error)}`);
      
      let errorMessage = `Failed to find order with visual ID ${visualId}`;
      let errorInstance = error instanceof Error 
        ? error 
        : new Error(`Unknown error: ${error}`);
      
      logger.error(`[PrintavoService] ${errorMessage}`, errorInstance);
      return {
        success: false,
        errors: [{ message: errorMessage }],
        error: errorInstance
      };
    }
  },
  
  // Additional methods for other operations...
};
```

### 4. `lib/operations.ts`

**Primary Responsibility**: Manage the determination and execution of operations based on user input.

#### What Should Be Here:
- Logic for parsing user messages
- Logic for determining which operation to execute
- Logic for executing operations
- Context tracking for conversations

#### What Should NOT Be Here:
- Direct GraphQL queries (these should be in `lib/graphql/operations/`)
- UI-related code
- Low-level API interactions

#### Example Structure:

```typescript
// lib/operations.ts
import { printavoService } from './printavo-service';
import { logger } from './logger';
import { ConversationContext } from './context';

// Define the ChatMessage interface
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

// Function to determine which operation to execute based on user message
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

  // Check for Visual ID patterns
  // ... (Visual ID detection logic)

  // Check for order searches
  // ... (Order search detection logic)

  // Check for customer searches
  // ... (Customer search detection logic)

  // Default operation if no pattern matches
  return {
    name: 'default',
    explanation: 'Default response for unrecognized input',
    execute: async () => ({
      message: "I'm not sure what you're asking for. You can ask me to find orders, look up quotes, or search for customers.",
      data: null,
    }),
  };
}

// Function to execute an operation
export async function executeOperation(operation: Operation) {
  logger.info(`Executing operation: ${operation.name}`);
  return operation.execute();
}

// Helper functions to create specific operations
function createGetOrderOperation(orderId: string, messageLower: string, sentiment: { isUrgent: boolean; isConfused: boolean; isPositive: boolean; isNegative: boolean }): Operation {
  return {
    name: 'getOrder',
    explanation: 'Fetching order details from Printavo',
    execute: async () => {
      try {
        // Use the printavoService to get the order
        const result = await printavoService.getOrder(orderId);
        
        // Process the result and return a formatted message
        // ... (Result processing logic)
        
        return {
          message: "Here's the order information...",
          data: result.data,
        };
      } catch (error) {
        // Handle errors
        // ... (Error handling logic)
        
        return {
          message: "I couldn't find that order. Please try again with a different order number.",
          data: { error: 'Order not found' },
        };
      }
    },
  };
}

// Additional helper functions for other operations...
```

### 5. `lib/graphql/operations/`

**Primary Responsibility**: Implement specific GraphQL operations.

#### What Should Be Here:
- Implementation of GraphQL operations
- GraphQL queries and mutations
- Response processing for GraphQL operations

#### What Should NOT Be Here:
- Business logic
- UI-related code
- Message parsing logic

#### Example Structure:

```typescript
// lib/graphql/operations/orders.ts
import { PrintavoOrder } from '../../types';
import { PrintavoAPIResponse, query } from '../utils';
import { QUERIES } from '../queries';
import { logger } from '../../logger';
import { handleAPIError } from '../utils';
import { PrintavoNotFoundError } from '../errors';
import cache from '../../cache';

// Get order by ID
export async function getOrder(id: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  // Implementation...
}

// Get order by Visual ID
export async function getOrderByVisualId(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  // Implementation...
}

// Search orders
export async function searchOrders(params: any = {}): Promise<PrintavoAPIResponse<any>> {
  // Implementation...
}

// Get due orders
export async function getDueOrders(params: any = {}): Promise<PrintavoAPIResponse<any>> {
  // Implementation...
}
```

## Directory Structure

The following directory structure should be maintained:

```
lib/
├── graphql-client.ts        # Entry point for all GraphQL operations
├── printavo-api.ts          # Low-level API interactions and error handling
├── printavo-service.ts      # Simplified interface to operations
├── operations.ts            # Message parsing and operation determination
├── context.ts               # Conversation context tracking
├── logger.ts                # Logging utilities
├── types.ts                 # Type definitions
├── utils.ts                 # General utilities
├── cache.ts                 # Caching utilities
├── graphql/
│   ├── queries.ts           # GraphQL query definitions
│   ├── mutations.ts         # GraphQL mutation definitions
│   ├── utils.ts             # GraphQL utilities
│   ├── errors.ts            # GraphQL-specific error handling
│   ├── operations/
│   │   ├── orders.ts        # Order-related operations
│   │   ├── customers.ts     # Customer-related operations
│   │   ├── quotes.ts        # Quote-related operations
│   │   └── products.ts      # Product-related operations
│   └── queries/
│       ├── orderQueries.ts  # Order-related queries
│       ├── customerQueries.ts # Customer-related queries
│       └── productQueries.ts # Product-related queries
└── api/
    ├── chat.ts              # Chat API utilities
    └── printavo.ts          # Printavo API utilities
```

## Import/Export Patterns

To maintain clear boundaries between components, follow these import/export patterns:

1. **Top-level exports**: All GraphQL operations should be exported from `lib/graphql-client.ts`.
2. **Service layer**: `lib/printavo-service.ts` should import operations from `lib/graphql-client.ts`, not from individual operation files.
3. **Operation determination**: `lib/operations.ts` should import from `lib/printavo-service.ts`, not directly from GraphQL operations.
4. **API routes**: API routes should import from `lib/operations.ts` or `lib/printavo-service.ts`, not directly from GraphQL operations.

## Conclusion

Following these responsibility boundaries and organization patterns will improve the maintainability and clarity of the Printavo Chat application. Each component has a clear responsibility, and the boundaries between components are well-defined. This will make it easier to understand, maintain, and extend the application in the future.