import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';
import * as tools from './tools';
import * as convenience from './convenience';

// Define the MCPServer class with appropriate types
interface MCPServerOptions {
  name: string;
  description: string;
  version: string;
}

interface ToolParameter {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
  default?: any;
}

interface ToolOptions {
  name: string;
  description: string;
  parameters?: ToolParameter[];
  execute: (params: Record<string, any>) => Promise<any> | any;
}

/**
 * Utility function to validate parameters for tools
 */
function validateParameters(params: Record<string, any>, parameterDefinitions: ToolParameter[]): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for required parameters
  parameterDefinitions.forEach(param => {
    if (!param.optional && (params[param.name] === undefined || params[param.name] === null)) {
      errors.push(`Required parameter '${param.name}' is missing`);
    }
  });
  
  // Type validation
  parameterDefinitions.forEach(param => {
    if (params[param.name] !== undefined && params[param.name] !== null) {
      const value = params[param.name];
      
      // Basic type checking
      switch (param.type) {
        case 'string':
          if (typeof value !== 'string') {
            errors.push(`Parameter '${param.name}' must be a string`);
          }
          break;
        case 'number':
          if (typeof value !== 'number' || isNaN(value)) {
            errors.push(`Parameter '${param.name}' must be a number`);
          }
          break;
        case 'boolean':
          if (typeof value !== 'boolean') {
            errors.push(`Parameter '${param.name}' must be a boolean`);
          }
          break;
        case 'array':
          if (!Array.isArray(value)) {
            errors.push(`Parameter '${param.name}' must be an array`);
          }
          break;
        case 'object':
          if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            errors.push(`Parameter '${param.name}' must be an object`);
          }
          break;
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

class MCPServer {
  private options: MCPServerOptions;
  private tools: ToolOptions[] = [];

  constructor(options: MCPServerOptions) {
    this.options = options;
  }

  registerTool(tool: ToolOptions): void {
    // Ensure tool has a name and description
    if (!tool.name) {
      throw new Error('Tool must have a name');
    }
    
    if (!tool.description) {
      throw new Error('Tool must have a description');
    }
    
    // Add wrapper to validate parameters before execution
    const originalExecute = tool.execute;
    tool.execute = async (params: Record<string, any>) => {
      // Skip validation if no parameters defined
      if (!tool.parameters || tool.parameters.length === 0) {
        return originalExecute(params);
      }
      
      // Validate parameters
      const validation = validateParameters(params, tool.parameters);
      if (!validation.isValid) {
        throw new PrintavoValidationError(`Parameter validation failed: ${validation.errors.join(', ')}`);
      }
      
      return originalExecute(params);
    };
    
    this.tools.push(tool);
    console.log(`Registered tool: ${tool.name}`);
  }

  start(): void {
    console.log(`MCP Server '${this.options.name}' started successfully.`);
    console.log(`Registered ${this.tools.length} tools.`);
  }
}

// Load environment variables directly from .env file
function loadEnvFile(filePath: string): Record<string, string> {
  try {
    const envFileContent = fs.readFileSync(filePath, 'utf8');
    const envVars: Record<string, string> = {};
    
    envFileContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && match[1]) {
        const key = match[1];
        let value = match[2] || '';
        
        // Remove surrounding quotes if they exist
        value = value.replace(/^(['"])(.*)['"]$/, '$2');
        
        envVars[key] = value;
      }
    });
    
    return envVars;
  } catch (error) {
    console.warn(`Warning: Could not load .env file: ${error}`);
    return {};
  }
}

// Try to find the env file in multiple locations
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../.env'),
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
];

let envVars: Record<string, string> = {};
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    console.log(`Loading environment variables from ${envPath}`);
    envVars = loadEnvFile(envPath);
    break;
  }
}

// Set environment variables with values from .env or use defaults
const PRINTAVO_API_URL = envVars.PRINTAVO_API_URL || process.env.PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const PRINTAVO_EMAIL = envVars.PRINTAVO_EMAIL || process.env.PRINTAVO_EMAIL || 'sales@kingclothing.com';
const PRINTAVO_TOKEN = envVars.PRINTAVO_TOKEN || process.env.PRINTAVO_TOKEN || 'rEPQzTtowT_MQVbY1tfLtg';

console.log(`Using Printavo API URL: ${PRINTAVO_API_URL}`);
console.log(`Using Printavo Email: ${PRINTAVO_EMAIL}`);
console.log(`Using Printavo Token: ${PRINTAVO_TOKEN.substring(0, 4)}...${PRINTAVO_TOKEN.substring(PRINTAVO_TOKEN.length - 4)}`);

const server = new MCPServer({
  name: 'printavo-graphql-mcp-server',
  description: 'Printavo GraphQL API MCP Server',
  version: '1.0.0',
});

// Define error classes for specific error types
class PrintavoApiError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'PrintavoApiError';
    this.status = status;
  }
}

class PrintavoAuthenticationError extends PrintavoApiError {
  constructor(message: string) {
    super(message, 401);
    this.name = 'PrintavoAuthenticationError';
  }
}

class PrintavoRateLimitError extends PrintavoApiError {
  retryAfter: number;
  
  constructor(message: string, retryAfter: number = 60) {
    super(message, 429);
    this.name = 'PrintavoRateLimitError';
    this.retryAfter = retryAfter;
  }
}

class PrintavoValidationError extends PrintavoApiError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'PrintavoValidationError';
  }
}

// Rate limiting control
const rateLimitState = {
  lastRequestTime: 0,
  minRequestInterval: 100, // ms between requests
  retryCount: 0,
  maxRetries: 5,
  backoffBase: 2,
  isRateLimited: false,
  rateLimitReset: 0
};

// Helper function to make GraphQL requests with improved error handling and rate limiting
export async function executeGraphQL(query: string, variables: Record<string, any> = {}): Promise<any> {
  const apiUrl = PRINTAVO_API_URL.startsWith('http') ? PRINTAVO_API_URL : `https://${PRINTAVO_API_URL}`;
  
  // Check if we're currently rate limited
  if (rateLimitState.isRateLimited && Date.now() < rateLimitState.rateLimitReset) {
    const waitTime = Math.ceil((rateLimitState.rateLimitReset - Date.now()) / 1000);
    console.warn(`Rate limited: Waiting ${waitTime} seconds before retrying`);
    throw new PrintavoRateLimitError(`Rate limited. Retry after ${waitTime} seconds.`, waitTime);
  }
  
  // Respect minimum request interval
  const timeSinceLastRequest = Date.now() - rateLimitState.lastRequestTime;
  if (timeSinceLastRequest < rateLimitState.minRequestInterval) {
    const waitTime = rateLimitState.minRequestInterval - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  rateLimitState.lastRequestTime = Date.now();
  
  try {
    const response = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'email': PRINTAVO_EMAIL,
        'token': PRINTAVO_TOKEN,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
      rateLimitState.isRateLimited = true;
      rateLimitState.rateLimitReset = Date.now() + (retryAfter * 1000);
      
      console.warn(`Rate limited by Printavo API. Retry after ${retryAfter} seconds.`);
      throw new PrintavoRateLimitError(`Printavo API rate limit exceeded. Retry after ${retryAfter} seconds.`, retryAfter);
    }
    
    // Handle authentication errors
    if (response.status === 401) {
      throw new PrintavoAuthenticationError('Authentication failed. Check your API credentials.');
    }
    
    // Handle other HTTP errors
    if (!response.ok) {
      throw new PrintavoApiError(`GraphQL request failed: ${response.statusText}`, response.status);
    }
    
    const result = await response.json();
    
    // Check for GraphQL errors
    if (result.errors) {
      const errorMessage = result.errors.map((e: any) => e.message).join(', ');
      
      // Handle different types of GraphQL errors
      if (errorMessage.includes('authentication') || errorMessage.includes('unauthorized')) {
        throw new PrintavoAuthenticationError(errorMessage);
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        throw new PrintavoValidationError(errorMessage);
      } else {
        throw new PrintavoApiError(`GraphQL errors: ${errorMessage}`, 400);
      }
    }
    
    // Reset retry count on success
    rateLimitState.retryCount = 0;
    return result.data;
  } catch (error: any) {
    // Handle rate limit errors with exponential backoff retry
    if (error instanceof PrintavoRateLimitError) {
      // Allow caller to handle rate limiting
      throw error;
    }
    
    // Log other errors
    console.error('Error executing GraphQL request:', error);
    
    // Retry logic for network errors or server errors
    if (!(error instanceof PrintavoAuthenticationError) && 
        !(error instanceof PrintavoValidationError) &&
        rateLimitState.retryCount < rateLimitState.maxRetries) {
      
      rateLimitState.retryCount++;
      const backoffTime = Math.pow(rateLimitState.backoffBase, rateLimitState.retryCount) * 1000;
      console.warn(`Retrying request in ${backoffTime}ms (attempt ${rateLimitState.retryCount} of ${rateLimitState.maxRetries})`);
      
      await new Promise(resolve => setTimeout(resolve, backoffTime));
      return executeGraphQL(query, variables);
    }
    
    throw error;
  }
}

// Register read tools
server.registerTool({
  name: 'get_account',
  description: 'Get the current account information',
  execute: () => tools.getAccount(),
});

server.registerTool({
  name: 'get_current_user',
  description: 'Get the current user information',
  execute: () => tools.getCurrentUser(),
});

server.registerTool({
  name: 'get_customer',
  description: 'Get a customer by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Customer ID' }
  ],
  execute: (params: Record<string, any>) => tools.getCustomer(params.id),
});

server.registerTool({
  name: 'get_contact',
  description: 'Get a contact by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Contact ID' }
  ],
  execute: (params: Record<string, any>) => tools.getContact(params.id),
});

server.registerTool({
  name: 'get_order',
  description: 'Get an order by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Order ID' }
  ],
  execute: (params: Record<string, any>) => tools.getOrder(params.id),
});

server.registerTool({
  name: 'get_order_by_visual_id',
  description: 'Get an order by visual ID',
  parameters: [
    { name: 'visual_id', type: 'string', description: 'Visual ID of the order' }
  ],
  execute: (params: Record<string, any>) => tools.getOrderByVisualId(params.visual_id),
});

server.registerTool({
  name: 'get_quote',
  description: 'Get a quote by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Quote ID' }
  ],
  execute: (params: Record<string, any>) => tools.getQuote(params.id),
});

server.registerTool({
  name: 'get_invoice',
  description: 'Get an invoice by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Invoice ID' }
  ],
  execute: (params: Record<string, any>) => tools.getInvoice(params.id),
});

server.registerTool({
  name: 'get_line_item',
  description: 'Get a line item by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Line item ID' }
  ],
  execute: (params: Record<string, any>) => tools.getLineItem(params.id),
});

server.registerTool({
  name: 'get_line_item_group',
  description: 'Get a line item group by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Line item group ID' }
  ],
  execute: (params: Record<string, any>) => tools.getLineItemGroup(params.id),
});

server.registerTool({
  name: 'get_status',
  description: 'Get a status by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Status ID' }
  ],
  execute: (params: Record<string, any>) => tools.getStatus(params.id),
});

server.registerTool({
  name: 'get_task',
  description: 'Get a task by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Task ID' }
  ],
  execute: (params: Record<string, any>) => tools.getTask(params.id),
});

server.registerTool({
  name: 'get_inquiry',
  description: 'Get an inquiry by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Inquiry ID' }
  ],
  execute: (params: Record<string, any>) => tools.getInquiry(params.id),
});

server.registerTool({
  name: 'get_transaction',
  description: 'Get a transaction by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Transaction ID' }
  ],
  execute: (params: Record<string, any>) => tools.getTransaction(params.id),
});

server.registerTool({
  name: 'get_merch_store',
  description: 'Get a merch store by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Merch store ID' }
  ],
  execute: (params: Record<string, any>) => tools.getMerchStore(params.id),
});

server.registerTool({
  name: 'get_thread',
  description: 'Get a thread by ID',
  parameters: [
    { name: 'id', type: 'string', description: 'Thread ID' }
  ],
  execute: (params: Record<string, any>) => tools.getThread(params.id),
});

server.registerTool({
  name: 'list_orders',
  description: 'List orders with optional sorting',
  parameters: [
    { name: 'first', type: 'number', description: 'Number of orders to retrieve', default: 10 },
    { name: 'sort_on', type: 'string', description: 'Field to sort on', optional: true },
    { name: 'sort_descending', type: 'boolean', description: 'Sort in descending order', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    tools.listOrders(params.first, params.sort_on, params.sort_descending),
});

server.registerTool({
  name: 'list_invoices',
  description: 'List invoices with optional sorting',
  parameters: [
    { name: 'first', type: 'number', description: 'Number of invoices to retrieve', default: 10 },
    { name: 'sort_on', type: 'string', description: 'Field to sort on', optional: true },
    { name: 'sort_descending', type: 'boolean', description: 'Sort in descending order', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    tools.listInvoices(params.first, params.sort_on, params.sort_descending),
});

server.registerTool({
  name: 'list_quotes',
  description: 'List quotes with optional sorting',
  parameters: [
    { name: 'first', type: 'number', description: 'Number of quotes to retrieve', default: 10 },
    { name: 'sort_on', type: 'string', description: 'Field to sort on', optional: true },
    { name: 'sort_descending', type: 'boolean', description: 'Sort in descending order', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    tools.listQuotes(params.first, params.sort_on, params.sort_descending),
});

server.registerTool({
  name: 'list_customers',
  description: 'List customers',
  parameters: [
    { name: 'first', type: 'number', description: 'Number of customers to retrieve', default: 10 }
  ],
  execute: (params: Record<string, any>) => tools.listCustomers(params.first),
});

server.registerTool({
  name: 'list_contacts',
  description: 'List contacts with optional sorting',
  parameters: [
    { name: 'first', type: 'number', description: 'Number of contacts to retrieve', default: 10 },
    { name: 'sort_on', type: 'string', description: 'Field to sort on', optional: true },
    { name: 'sort_descending', type: 'boolean', description: 'Sort in descending order', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    tools.listContacts(params.first, params.sort_on, params.sort_descending),
});

server.registerTool({
  name: 'list_products',
  description: 'List products with optional search query',
  parameters: [
    { name: 'first', type: 'number', description: 'Number of products to retrieve', default: 10 },
    { name: 'query', type: 'string', description: 'Search query', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    tools.listProducts(params.first, params.query),
});

server.registerTool({
  name: 'list_tasks',
  description: 'List tasks with optional sorting',
  parameters: [
    { name: 'first', type: 'number', description: 'Number of tasks to retrieve', default: 10 },
    { name: 'sort_on', type: 'string', description: 'Field to sort on', optional: true },
    { name: 'sort_descending', type: 'boolean', description: 'Sort in descending order', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    tools.listTasks(params.first, params.sort_on, params.sort_descending),
});

server.registerTool({
  name: 'list_inquiries',
  description: 'List inquiries',
  parameters: [
    { name: 'first', type: 'number', description: 'Number of inquiries to retrieve', default: 10 }
  ],
  execute: (params: Record<string, any>) => tools.listInquiries(params.first),
});

server.registerTool({
  name: 'list_transactions',
  description: 'List transactions',
  parameters: [
    { name: 'first', type: 'number', description: 'Number of transactions to retrieve', default: 10 }
  ],
  execute: (params: Record<string, any>) => tools.listTransactions(params.first),
});

server.registerTool({
  name: 'list_statuses',
  description: 'List statuses with optional type filter',
  parameters: [
    { name: 'first', type: 'number', description: 'Number of statuses to retrieve', default: 10 },
    { name: 'type', type: 'string', description: 'Filter by status type', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    tools.listStatuses(params.first, params.type),
});

server.registerTool({
  name: 'search_orders',
  description: 'Search orders by query string',
  parameters: [
    { name: 'query', type: 'string', description: 'Search query' },
    { name: 'first', type: 'number', description: 'Number of results to retrieve', default: 10 }
  ],
  execute: (params: Record<string, any>) => 
    tools.searchOrders(params.query, params.first),
});

// Register write tools

server.registerTool({
  name: 'update_status',
  description: 'Update the status of an order, quote, or invoice',
  parameters: [
    { name: 'parent_id', type: 'string', description: 'ID of the order, quote, or invoice' },
    { name: 'status_id', type: 'string', description: 'ID of the status to set' }
  ],
  execute: (params: Record<string, any>) => 
    tools.updateStatus(params.parent_id, params.status_id),
});

server.registerTool({
  name: 'contact_create',
  description: 'Create a new contact for a customer',
  parameters: [
    { name: 'customer_id', type: 'string', description: 'Customer ID' },
    { name: 'input', type: 'object', description: 'Contact data' }
  ],
  execute: (params: Record<string, any>) => 
    tools.contactCreate(params.customer_id, params.input),
});

server.registerTool({
  name: 'contact_update',
  description: 'Update an existing contact',
  parameters: [
    { name: 'id', type: 'string', description: 'Contact ID' },
    { name: 'input', type: 'object', description: 'Contact data to update' }
  ],
  execute: (params: Record<string, any>) => 
    tools.contactUpdate(params.id, params.input),
});

server.registerTool({
  name: 'customer_create',
  description: 'Create a new customer',
  parameters: [
    { name: 'input', type: 'object', description: 'Customer data' }
  ],
  execute: (params: Record<string, any>) => tools.customerCreate(params.input),
});

server.registerTool({
  name: 'customer_update',
  description: 'Update an existing customer',
  parameters: [
    { name: 'id', type: 'string', description: 'Customer ID' },
    { name: 'input', type: 'object', description: 'Customer data to update' }
  ],
  execute: (params: Record<string, any>) => 
    tools.customerUpdate(params.id, params.input),
});

server.registerTool({
  name: 'quote_create',
  description: 'Create a new quote',
  parameters: [
    { name: 'input', type: 'object', description: 'Quote data' }
  ],
  execute: (params: Record<string, any>) => tools.quoteCreate(params.input),
});

server.registerTool({
  name: 'quote_update',
  description: 'Update an existing quote',
  parameters: [
    { name: 'id', type: 'string', description: 'Quote ID' },
    { name: 'input', type: 'object', description: 'Quote data to update' }
  ],
  execute: (params: Record<string, any>) => 
    tools.quoteUpdate(params.id, params.input),
});

server.registerTool({
  name: 'quote_duplicate',
  description: 'Duplicate an existing quote',
  parameters: [
    { name: 'id', type: 'string', description: 'Quote ID to duplicate' }
  ],
  execute: (params: Record<string, any>) => tools.quoteDuplicate(params.id),
});

server.registerTool({
  name: 'invoice_update',
  description: 'Update an existing invoice',
  parameters: [
    { name: 'id', type: 'string', description: 'Invoice ID' },
    { name: 'input', type: 'object', description: 'Invoice data to update' }
  ],
  execute: (params: Record<string, any>) => 
    tools.invoiceUpdate(params.id, params.input),
});

server.registerTool({
  name: 'invoice_duplicate',
  description: 'Duplicate an existing invoice',
  parameters: [
    { name: 'id', type: 'string', description: 'Invoice ID to duplicate' }
  ],
  execute: (params: Record<string, any>) => tools.invoiceDuplicate(params.id),
});

server.registerTool({
  name: 'line_item_create',
  description: 'Create a new line item',
  parameters: [
    { name: 'line_item_group_id', type: 'string', description: 'Line item group ID' },
    { name: 'input', type: 'object', description: 'Line item data' }
  ],
  execute: (params: Record<string, any>) => 
    tools.lineItemCreate(params.line_item_group_id, params.input),
});

server.registerTool({
  name: 'line_item_creates',
  description: 'Create multiple line items',
  parameters: [
    { name: 'input', type: 'array', description: 'Array of line item data' }
  ],
  execute: (params: Record<string, any>) => tools.lineItemCreates(params.input),
});

server.registerTool({
  name: 'line_item_update',
  description: 'Update an existing line item',
  parameters: [
    { name: 'id', type: 'string', description: 'Line item ID' },
    { name: 'input', type: 'object', description: 'Line item data to update' }
  ],
  execute: (params: Record<string, any>) => 
    tools.lineItemUpdate(params.id, params.input),
});

server.registerTool({
  name: 'line_item_delete',
  description: 'Delete a line item',
  parameters: [
    { name: 'id', type: 'string', description: 'Line item ID' }
  ],
  execute: (params: Record<string, any>) => tools.lineItemDelete(params.id),
});

server.registerTool({
  name: 'inquiry_create',
  description: 'Create a new inquiry',
  parameters: [
    { name: 'input', type: 'object', description: 'Inquiry data' }
  ],
  execute: (params: Record<string, any>) => tools.inquiryCreate(params.input),
});

server.registerTool({
  name: 'task_create',
  description: 'Create a new task',
  parameters: [
    { name: 'input', type: 'object', description: 'Task data' }
  ],
  execute: (params: Record<string, any>) => tools.taskCreate(params.input),
});

server.registerTool({
  name: 'custom_address_create',
  description: 'Create a custom address',
  parameters: [
    { name: 'parent_id', type: 'string', description: 'Parent ID (customer, order, etc.)' },
    { name: 'input', type: 'object', description: 'Address data' }
  ],
  execute: (params: Record<string, any>) => 
    tools.customAddressCreate(params.parent_id, params.input),
});

server.registerTool({
  name: 'custom_address_update',
  description: 'Update a custom address',
  parameters: [
    { name: 'id', type: 'string', description: 'Address ID' },
    { name: 'input', type: 'object', description: 'Address data to update' }
  ],
  execute: (params: Record<string, any>) => 
    tools.customAddressUpdate(params.id, params.input),
});

server.registerTool({
  name: 'transaction_payment_create',
  description: 'Create a payment transaction',
  parameters: [
    { name: 'input', type: 'object', description: 'Transaction data' }
  ],
  execute: (params: Record<string, any>) => tools.transactionPaymentCreate(params.input),
});

// Register convenience tools
server.registerTool({
  name: 'get_order_summary',
  description: 'Get a comprehensive order summary with all related information including customer, contact, line items, and transactions',
  parameters: [
    { name: 'id', type: 'string', description: 'Order ID' }
  ],
  execute: (params: Record<string, any>) => convenience.getOrderSummary(params.id),
});

server.registerTool({
  name: 'create_quote_with_items',
  description: 'Create a new quote with customer, line items, and optional settings in one operation',
  parameters: [
    { name: 'customer_id', type: 'string', description: 'Customer ID' },
    { name: 'contact_id', type: 'string', description: 'Contact ID' },
    { name: 'line_items', type: 'array', description: 'Array of line item objects' },
    { name: 'settings', type: 'object', description: 'Optional settings for the quote', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    convenience.createQuoteWithItems(params.customer_id, params.contact_id, params.line_items, params.settings),
});

server.registerTool({
  name: 'search_customer_detail',
  description: 'Search for a customer by name, email, or phone and return comprehensive information including contacts and recent orders',
  parameters: [
    { name: 'query', type: 'string', description: 'Search query' },
    { name: 'limit', type: 'number', description: 'Maximum number of results to return', default: 5, optional: true }
  ],
  execute: (params: Record<string, any>) => 
    convenience.searchCustomerDetail(params.query, params.limit),
});

server.registerTool({
  name: 'convert_quote_to_invoice',
  description: 'Convert a quote to an invoice in one operation, optionally updating the status',
  parameters: [
    { name: 'quote_id', type: 'string', description: 'Quote ID' },
    { name: 'status_id', type: 'string', description: 'Status ID to set on the new invoice', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    convenience.convertQuoteToInvoice(params.quote_id, params.status_id),
});

server.registerTool({
  name: 'create_customer_with_details',
  description: 'Create a new customer with primary contact and address in one operation',
  parameters: [
    { name: 'customer_data', type: 'object', description: 'Customer data' },
    { name: 'contact_data', type: 'object', description: 'Contact data' },
    { name: 'address_data', type: 'object', description: 'Address data', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    convenience.createCustomerWithDetails(params.customer_data, params.contact_data, params.address_data),
});

server.registerTool({
  name: 'get_order_analytics',
  description: 'Get order analytics by status for a specified period of days',
  parameters: [
    { name: 'days', type: 'number', description: 'Number of days to analyze', default: 30, optional: true }
  ],
  execute: (params: Record<string, any>) => 
    convenience.getOrderAnalytics(params.days),
});

server.registerTool({
  name: 'get_customer_analytics',
  description: 'Get customer analytics with RFM segmentation and detailed metrics',
  execute: () => convenience.getCustomerAnalytics(),
});

server.registerTool({
  name: 'process_payment',
  description: 'Process a payment for an order, invoice, or quote',
  parameters: [
    { name: 'order_id', type: 'string', description: 'ID of the order, invoice, or quote' },
    { name: 'amount', type: 'number', description: 'Payment amount' },
    { name: 'payment_details', type: 'object', description: 'Optional payment details', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    convenience.processPayment(params.order_id, params.amount, params.payment_details),
});

server.registerTool({
  name: 'get_product_analytics',
  description: 'Get comprehensive product data with order history and customer insights',
  parameters: [
    { name: 'product_query', type: 'string', description: 'Product search query' },
    { name: 'limit', type: 'number', description: 'Maximum number of products to analyze', default: 10, optional: true }
  ],
  execute: (params: Record<string, any>) => 
    convenience.getProductAnalytics(params.product_query, params.limit),
});

// Register login tool
server.registerTool({
  name: 'login',
  description: 'Authenticate with Printavo and get access token',
  parameters: [
    { name: 'email', type: 'string', description: 'User email' },
    { name: 'password', type: 'string', description: 'User password' },
    { name: 'device_name', type: 'string', description: 'Name of the device making the request' },
    { name: 'device_token', type: 'string', description: 'Optional device token for push notifications', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    tools.login(params.email, params.password, params.device_name, params.device_token),
});

// Register production file create tool
server.registerTool({
  name: 'production_file_create',
  description: 'Upload a production file to an order, quote, or invoice',
  parameters: [
    { name: 'parent_id', type: 'string', description: 'ID of the order, quote, or invoice to attach the file to' },
    { name: 'public_file_url', type: 'string', description: 'Publicly accessible URL of the file to upload' }
  ],
  execute: (params: Record<string, any>) => 
    tools.productionFileCreate(params.parent_id, params.public_file_url),
});

// Register SanMar integration tool
server.registerTool({
  name: 'create_quote_with_sanmar_products',
  description: 'Create a new quote with SanMar products specified by style numbers, including size quantities',
  parameters: [
    { name: 'customer_id', type: 'string', description: 'Customer ID' },
    { name: 'contact_id', type: 'string', description: 'Contact ID' },
    { name: 'sanmar_items', type: 'array', description: 'Array of SanMar products with style numbers and sizes' },
    { name: 'settings', type: 'object', description: 'Optional settings for the quote', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    convenience.createQuoteWithSanMarLiveData(
      params.customer_id, 
      params.contact_id, 
      params.sanmar_items, 
      params.settings
    ),
});

// Register advanced SanMar integration tool with live data
server.registerTool({
  name: 'create_quote_with_sanmar_live_data',
  description: 'Create a new quote with SanMar products using live data from SanMar API, including inventory checking',
  parameters: [
    { name: 'customer_id', type: 'string', description: 'Customer ID' },
    { name: 'contact_id', type: 'string', description: 'Contact ID' },
    { name: 'sanmar_items', type: 'array', description: 'Array of SanMar products with style numbers, colors, and sizes' },
    { name: 'settings', type: 'object', description: 'Optional settings for the quote', optional: true }
  ],
  execute: (params: Record<string, any>) => 
    convenience.createQuoteWithSanMarLiveData(
      params.customer_id, 
      params.contact_id, 
      params.sanmar_items, 
      params.settings
    ),
});

// Register line item sizes update tool
server.registerTool({
  name: 'update_line_item_sizes',
  description: 'Update sizes and quantities for an existing line item',
  parameters: [
    { name: 'line_item_id', type: 'string', description: 'Line item ID' },
    { name: 'sizes', type: 'object', description: 'Object mapping sizes to quantities (e.g., {"S": 5, "M": 10})' }
  ],
  execute: (params: Record<string, any>) => 
    convenience.updateLineItemSizes(params.line_item_id, params.sizes),
});

console.log('Starting Printavo GraphQL MCP Server...');
try {
  server.start();
  console.log('Printavo GraphQL MCP Server started successfully!');
} catch (error) {
  console.error('Failed to start Printavo GraphQL MCP Server:', error);
} 