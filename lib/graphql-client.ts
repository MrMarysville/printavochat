import { logger } from './logger';
import { GraphQLClient } from 'graphql-request';
import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';

// This is the GraphQL client for Printavo
import { 
  QuoteCreateInput, 
  LineItemGroupCreateInput,
  LineItemCreateInput,
  CustomAddressInput,
  ImprintCreateInput,
  TaskCreateInput,
  PrintavoOrder,
  PrintavoCustomer,
  PaymentRequestCreateInput,
  PrintavoPaymentRequest,
  ApprovalRequestCreateInput,
  PrintavoApprovalRequest,
  FeeInput,
  PrintavoFee,
  PrintavoThread,
  DeliveryMethodInput,
  PrintavoProduct,
  PrintavoLineItem,
  PrintavoLineItemGroup,
  LineItemGroupPricingInput,
  LineItemPricing,
  ProductSearchParams,
  CustomerCreateInput,
  PrintavoConnection as _PrintavoConnection
} from './types';
import Ajv from 'ajv';

const PRINTAVO_API_URL = process.env.PRINTAVO_API_URL || 'https://printavo.com/api/v2';

// Initialize JSON schema validator
const ajv = new Ajv();

// Parameter validation schemas based on Printavo API requirements
const _parameterSchemas: Record<string, any> = {
  '/query/order': {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  },
  '/mutation/quotecreate': {
    type: 'object',
    required: ['input'],
    properties: {
      input: { 
        type: 'object',
        properties: {
          customerId: { type: 'string' },
          name: { type: 'string' }
        }
      }
    }
  }
};

// Validate parameters against schema before sending request
function _validateParams(params: any, schema: any) {
  const validate = ajv.compile(schema);
  const valid = validate(params);
  
  if (!valid && validate.errors) {
    logger.error('Parameter validation errors:', validate.errors);
  }
  
  return !!valid;
}

// Define the PrintavoAPIResponse type with the success property
export type PrintavoAPIResponse<T = any> = {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
  success?: boolean;
  error?: Error | PrintavoAPIError;
};

// Get API credentials from environment variables
function _getApiCredentials() {
  const apiEmail = process.env.PRINTAVO_EMAIL;
  const apiToken = process.env.PRINTAVO_TOKEN;
  
  if (!apiEmail || !apiToken) {
    throw new Error('Printavo API credentials not configured. Please set PRINTAVO_EMAIL and PRINTAVO_TOKEN environment variables.');
  }
  
  return { apiEmail, apiToken };
}

// Initialize GraphQL client
export const printavoClient = new GraphQLClient(PRINTAVO_API_URL, {
  headers: {
    'Authorization': `Bearer ${process.env.PRINTAVO_TOKEN || ''}`,
    'Content-Type': 'application/json',
  },
});

// GraphQL Queries and Mutations
const QUERIES = {
  customer: gql`
    query GetCustomer($id: ID!) {
      customer(id: $id) {
        id
        name
        email
        phone
        createdAt
        updatedAt
      }
    }
  `,
  order: gql`
    query GetOrder($id: ID!) {
      order(id: $id) {
        ... on Quote {
          id
          name
          orderNumber
          status {
            id
            name
          }
          customer {
            id
            name
            email
            phone
          }
          createdAt
          updatedAt
          total
          subtotal
          tax
          shipping
          discount
          notes
          lineItemGroups {
            id
            name
            description
            items {
              id
              name
              description
              quantity
              price
              style {
                id
                name
                number
                color
                sizes {
                  id
                  name
                  quantity
                }
              }
            }
          }
        }
        ... on Invoice {
          id
          name
          orderNumber
          status {
            id
            name
          }
          customer {
            id
            name
            email
            phone
          }
          createdAt
          updatedAt
          total
          subtotal
          tax
          shipping
          discount
          notes
          dueDate
          paymentTerms
          paymentStatus
          lineItemGroups {
            id
            name
            description
            items {
              id
              name
              description
              quantity
              price
              style {
                id
                name
                number
                color
                sizes {
                  id
                  name
                  quantity
                }
              }
            }
          }
        }
      }
    }
  `,
  customers: gql`
    query SearchCustomers($query: String!) {
      customers(query: $query) {
        edges {
          node {
            id
            name
            email
            phone
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
  orders: gql`
    query SearchOrders($query: String) {
      orders(query: $query) {
        edges {
          node {
            ... on Quote {
              id
              name
              status {
                id
                name
              }
              customer {
                id
                name
                email
              }
              createdAt
              updatedAt
              total
            }
            ... on Invoice {
              id
              name
              status {
                id
                name
              }
              customer {
                id
                name
                email
              }
              createdAt
              updatedAt
              total
            }
          }
        }
      }
    }
  `,
  products: gql`
    query SearchProducts($query: String!) {
      products(query: $query) {
        edges {
          node {
            id
            name
            description
            price
          }
        }
      }
    }
  `,
  orderByVisualId: gql`
    query GetOrderByVisualId($query: String!) {
      orders(query: $query, sortOn: VISUAL_ID, first: 1) {
        nodes {
          ... on Quote {
            id
            visualId
            name
            status
            createdAt
            updatedAt
          }
          ... on Invoice {
            id
            visualId
            name
            status
            createdAt
            updatedAt
          }
        }
      }
    }
  `,
};

const MUTATIONS = {
  customerCreate: gql`
    mutation CreateCustomer($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        id
        name
        email
        phone
        company
        createdAt
        updatedAt
      }
    }
  `,
  quoteCreate: gql`
    mutation CreateQuote($input: QuoteCreateInput!) {
      quoteCreate(input: $input) {
        id
        name
        status {
          id
          name
        }
        customer {
          id
          name
          email
        }
        createdAt
        updatedAt
        total
      }
    }
  `,
  lineItemGroupCreate: gql`
    mutation CreateLineItemGroup($parentId: ID!, $input: LineItemGroupCreateInput!) {
      lineItemGroupCreate(parentId: $parentId, input: $input) {
        id
        name
        description
        notes
      }
    }
  `,
  lineItemCreate: gql`
    mutation CreateLineItem($lineItemGroupId: ID!, $input: LineItemCreateInput!) {
      lineItemCreate(lineItemGroupId: $lineItemGroupId, input: $input) {
        id
        name
        description
        quantity
        unitPrice
      }
    }
  `,
  customAddressCreate: gql`
    mutation CreateCustomAddress($parentId: ID!, $input: CustomAddressInput!) {
      customAddressCreate(parentId: $parentId, input: $input) {
        id
        name
        street1
        street2
        city
        state
        zipCode
        country
      }
    }
  `,
  contactUpdate: gql`
    mutation UpdateContact($id: ID!, $input: ContactUpdateInput!) {
      contactUpdate(id: $id, input: $input) {
        id
        name
        email
        phone
        company
        updatedAt
      }
    }
  `,
  invoiceUpdate: gql`
    mutation UpdateInvoice($id: ID!, $input: InvoiceUpdateInput!) {
      invoiceUpdate(id: $id, input: $input) {
        id
        name
        status {
          id
          name
        }
        customerNote
        productionNote
        customerDueAt
        tags
      }
    }
  `,
};

// Custom error classes for better error handling
export class PrintavoAPIError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly code?: string,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'PrintavoAPIError';
  }
}

// Update the subclasses to use the public properties
export class PrintavoAuthenticationError extends PrintavoAPIError {
  constructor(message: string = 'Authentication failed with Printavo API') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class PrintavoValidationError extends PrintavoAPIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class PrintavoNotFoundError extends PrintavoAPIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class PrintavoRateLimitError extends PrintavoAPIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}

// Helper function to handle GraphQL errors
function handleGraphQLError(error: any): PrintavoAPIError {
  if (error.response?.errors) {
    const graphqlError = error.response.errors[0];
    const message = graphqlError.message || 'GraphQL error occurred';
    
    // Map GraphQL error codes to our custom error types
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return new PrintavoAuthenticationError(message);
    }
    if (message.includes('not found')) {
      return new PrintavoNotFoundError(message);
    }
    if (message.includes('rate limit')) {
      return new PrintavoRateLimitError(message);
    }
    if (message.includes('validation')) {
      return new PrintavoValidationError(message, graphqlError.extensions);
    }
    
    return new PrintavoAPIError(message, error.response.status, graphqlError.extensions?.code);
  }
  
  if (error.response?.status === 401) {
    return new PrintavoAuthenticationError('Invalid API credentials');
  }
  
  if (error.response?.status === 404) {
    return new PrintavoNotFoundError('Resource not found');
  }
  
  if (error.response?.status === 429) {
    return new PrintavoRateLimitError('Too many requests');
  }
  
  return new PrintavoAPIError(
    error.message || 'An unexpected error occurred',
    error.response?.status
  );
}

// Helper function to handle API errors (missing previously)
function handleAPIError(error: any, _message?: string): PrintavoAPIError {
  if (error instanceof PrintavoAPIError) {
    return error;
  }
  return handleGraphQLError(error);
}

// Query methods
async function query<T>(queryString: string | DocumentNode, variables?: Record<string, any>): Promise<PrintavoAPIResponse<T>> {
  try {
    const response = await printavoClient.request<T>(queryString, variables);
    return { data: response, success: true };
  } catch (error) {
    return { 
      data: undefined, 
      success: false, 
      error: handleGraphQLError(error),
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
    };
  }
}

// Mutation methods
async function mutate<T>(mutationString: string | DocumentNode, variables?: Record<string, any>): Promise<PrintavoAPIResponse<T>> {
  try {
    const response = await printavoClient.request<T>(mutationString, variables);
    return { data: response, success: true };
  } catch (error) {
    return { 
      data: undefined, 
      success: false, 
      error: handleGraphQLError(error),
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }]
    };
  }
}

// Delete methods
async function _deleteOperation<T>(mutationString: string | DocumentNode, variables?: Record<string, any>): Promise<PrintavoAPIResponse<T>> {
  return mutate<T>(mutationString, variables);
}

// Mock data representing Printavo's API structure
const mockData = {
  orders: {
    edges: [
      {
        node: {
          id: "order_1",
          orderNumber: "ORD-001",
          status: { id: "1", name: "In Production" },
          createdAt: "2023-08-15T14:30:00Z",
          customer: {
            id: "cust_1",
            name: "John Smith",
            email: "john@example.com"
          },
          lineItemGroups: {
            edges: [
              {
                node: {
                  id: "lig_1",
                  name: "T-Shirts Order",
                  lineItems: {
                    edges: [
                      {
                        node: {
                          id: "li_1",
                          name: "Custom T-Shirt",
                          quantity: 100,
                          unitPrice: "15.99"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      }
    ]
  },
  customers: {
    edges: [
      {
        node: {
          id: "cust_1",
          name: "John Smith",
          email: "john@example.com",
          phone: "555-123-4567",
          orders: {
            edges: [
              {
                node: {
                  id: "order_1",
                  orderNumber: "ORD-001",
                  status: { id: "1", name: "In Production" }
                }
              }
            ]
          }
        }
      }
    ]
  },
  products: {
    edges: [
      {
        node: {
          id: "prod_1",
          name: "Custom T-Shirt",
          description: "High quality cotton t-shirt with custom printing",
          price: "25.99"
        }
      }
    ]
  }
};

// Returns mock data based on the query and parameters
function _getMockResponse(endpoint: string, _params: any) {
  let data = {};
  
  switch (endpoint) {
    case '/query/orders':
    case '/query/quotes':
    case '/query/invoices':
      data = { orders: mockData.orders };
      break;
    case '/query/customers':
      data = { customers: mockData.customers };
      break;
    case '/query/products':
      data = { products: mockData.products };
      break;
    default:
      data = { viewer: { name: "Test User", email: "test@example.com" } };
  }
  
  return { data };
}

// Quote Creation and Management
async function createQuote(input: QuoteCreateInput): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  return mutate(MUTATIONS.quoteCreate, { input });
}

async function addLineItemGroup(parentId: string, input: LineItemGroupCreateInput): Promise<PrintavoAPIResponse<any>> {
  return mutate(MUTATIONS.lineItemGroupCreate, { parentId, input });
}

async function addLineItem(lineItemGroupId: string, input: LineItemCreateInput): Promise<PrintavoAPIResponse<any>> {
  return mutate(MUTATIONS.lineItemCreate, { lineItemGroupId, input });
}

async function addCustomAddress(parentId: string, input: CustomAddressInput): Promise<PrintavoAPIResponse<any>> {
  return mutate(MUTATIONS.customAddressCreate, { parentId, input });
}

async function addImprint(lineItemGroupId: string, input: ImprintCreateInput): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/imprintcreate', { lineItemGroupId, input });
}

async function updateStatus(parentId: string, statusId: string): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/statusupdate', { parentId, statusId });
}

// Task Management
async function createTask(input: TaskCreateInput): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/taskcreate', { input });
}

// Customer Queries
async function getCustomer(id: string): Promise<PrintavoAPIResponse<PrintavoCustomer>> {
  return query(QUERIES.customer, { id });
}

async function createCustomer(input: CustomerCreateInput): Promise<PrintavoAPIResponse<PrintavoCustomer>> {
  return mutate(MUTATIONS.customerCreate, { input });
}

async function getCustomers(params: { 
  first?: number; 
  after?: string; 
  before?: string; 
  last?: number;
  query?: string;
} = {}): Promise<PrintavoAPIResponse<{ customers: { edges: Array<{ node: PrintavoCustomer }> } }>> {
  return query(QUERIES.customers, params);
}

async function getOrdersByCustomer(customerId: string): Promise<PrintavoAPIResponse<PrintavoOrder[]>> {
  try {
    const customerResponse = await getCustomer(customerId);
    if (!customerResponse.success || !customerResponse.data) {
      return {
        success: false,
        errors: customerResponse.errors,
        error: customerResponse.error
      };
    }
    
    if (!customerResponse.data.orders) {
      return {
        success: true,
        data: []
      };
    }
    
    // Convert from PrintavoConnection to array if needed
    const orders = Array.isArray(customerResponse.data.orders) 
      ? customerResponse.data.orders 
      : (customerResponse.data.orders.edges || []).map(edge => edge.node);
    
    return {
      success: true,
      data: orders
    };
  } catch (error) {
    logger.error(`Error fetching orders for customer ${customerId}:`, error);
    return {
      success: false,
      errors: [{ message: `Failed to fetch orders for customer with ID: ${customerId}` }],
      error: error instanceof PrintavoAPIError ? error : handleGraphQLError(error)
    };
  }
}

// Order Queries
interface Order {
  id: string;
  name: string;
  orderNumber?: string;
  status: {
    id: string;
    name: string;
  };
  customer: {
    id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
  total: number;
  subtotal?: number;
  tax?: number;
  shipping?: number;
  discount?: number;
  notes?: string;
  dueDate?: string;
  paymentTerms?: string;
  paymentStatus?: string;
  lineItemGroups?: Array<{
    id: string;
    name: string;
    description?: string;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      quantity: number;
      price: number;
      style?: {
        id: string;
        name: string;
        number: string;
        color: string;
        sizes: Array<{
          id: string;
          name: string;
          quantity: number;
        }>;
      };
    }>;
  }>;
}

// Using underscore prefix for unused interface
interface _GraphQLOrderResponse {
  order?: Order;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}

// Update the getOrder function for better error handling
async function getOrder(id: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    logger.info(`Fetching order with ID: ${id}`);
    const result = await query<{ order: PrintavoOrder }>(QUERIES.order, { id });
    
    // If we get a valid response but no order, it means the order ID wasn't found
    if (!result.data?.order) {
      logger.warn(`Order not found with ID: ${id}`);
      return { 
        data: undefined,
        errors: [{ message: `Order not found with ID: ${id}` }],
        success: false, 
        error: new PrintavoNotFoundError(`Order not found with ID: ${id}`) 
      };
    }
    
    logger.info(`Successfully retrieved order: ${id}`);
    return { 
      data: result.data.order,
      success: true 
    };
  } catch (error) {
    logger.error(`Error fetching order with ID ${id}:`, error);
    return {
      data: undefined,
      errors: [{ message: `Failed to fetch order with ID: ${id}` }],
      success: false,
      error: handleAPIError(error, `Failed to fetch order with ID: ${id}`)
    };
  }
}

// Get order by Visual ID (4-digit ID)
async function getOrderByVisualId(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    logger.info(`Fetching order with Visual ID: ${visualId}`);
    const result = await query<{ orders: { nodes: PrintavoOrder[] } }>(
      QUERIES.orderByVisualId, 
      { query: visualId }
    );
    
    // Check if we found any orders
    if (!result.data?.orders?.nodes || result.data.orders.nodes.length === 0) {
      logger.warn(`Order not found with Visual ID: ${visualId}`);
      return { 
        data: undefined,
        errors: [{ message: `Order not found with Visual ID: ${visualId}` }],
        success: false, 
        error: new PrintavoNotFoundError(`Order not found with Visual ID: ${visualId}`) 
      };
    }
    
    // Return the first matching order
    const order = result.data.orders.nodes[0];
    logger.info(`Successfully retrieved order with Visual ID: ${visualId}`);
    return { 
      data: order,
      success: true 
    };
  } catch (error) {
    logger.error(`Error fetching order with Visual ID ${visualId}:`, error);
    return {
      data: undefined,
      errors: [{ message: `Failed to fetch order with Visual ID: ${visualId}` }],
      success: false,
      error: handleAPIError(error, `Failed to fetch order with Visual ID: ${visualId}`)
    };
  }
}

// Fix searchOrders function to properly handle errors and return types
async function searchOrders(params: {
  query?: string;
  first?: number;
  inProductionAfter?: string;
  inProductionBefore?: string;
  statusIds?: string[];
  sortOn?: string;
} = {}): Promise<PrintavoAPIResponse<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>> {
  try {
    const searchQuery = params.query || '';
    logger.info(`Searching orders with query: "${searchQuery}"`);
    
    const result = await query<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>(
      QUERIES.orders, 
      { ...params }
    );
    
    if (!result.data?.orders) {
      return { 
        data: undefined,
        errors: [{ message: `No orders found matching query: ${searchQuery}` }],
        success: false, 
        error: new PrintavoNotFoundError(`No orders found matching query: ${searchQuery}`) 
      };
    }
    
    return { 
      data: result.data,
      success: true 
    };
  } catch (error) {
    logger.error(`Error searching orders:`, error);
    return {
      data: undefined,
      errors: [{ message: `Failed to search orders with query: ${params.query || ''}` }],
      success: false,
      error: handleAPIError(error, `Failed to search orders with query: ${params.query || ''}`)
    };
  }
}

async function getDueOrders(params: {
  first?: number;
  statusIds?: string[];
  sortOn?: string;
} = {}): Promise<PrintavoAPIResponse<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>> {
  const now = new Date().toISOString();
  return searchOrders({ ...params, inProductionBefore: now });
}

async function getInvoices(params: { 
  first?: number;
  sortOn?: string;
} = {}): Promise<PrintavoAPIResponse<any>> {
  return query('/query/invoices', params);
}

async function getDueInvoices(params: {
  first?: number;
  sortOn?: string;
} = {}): Promise<PrintavoAPIResponse<any>> {
  const now = new Date().toISOString();
  return query('/query/invoices', { ...params, inProductionBefore: now });
}

async function getInvoice(id: string): Promise<PrintavoAPIResponse<any>> {
  return query('/query/invoice', { id });
}

// Helper method for creating a complete quote with line items
async function createCompleteQuote(
  quoteInput: QuoteCreateInput,
  lineItemGroups: Array<{
    group: LineItemGroupCreateInput;
    items: LineItemCreateInput[];
    imprints?: ImprintCreateInput[];
  }>
): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    // Create the quote first
    const quoteResponse = await createQuote(quoteInput);
    if (!quoteResponse.data || quoteResponse.errors) {
      return quoteResponse;
    }

    const quoteId = quoteResponse.data.id;

    // Add each line item group and its items
    for (const groupData of lineItemGroups) {
      // Create line item group
      const groupResponse = await addLineItemGroup(quoteId, groupData.group);
      if (!groupResponse.data || groupResponse.errors) {
        continue;
      }

      const groupId = groupResponse.data.id;

      // Add line items to the group
      for (const item of groupData.items) {
        await addLineItem(groupId, item);
      }

      // Add imprints if provided
      if (groupData.imprints) {
        for (const imprint of groupData.imprints) {
          await addImprint(groupId, imprint);
        }
      }
    }

    // Return the final quote with all items
    return getOrder(quoteId);
  } catch (error) {
    return {
      errors: [{
        message: error instanceof Error ? error.message : 'Failed to create complete quote'
      }],
      success: false
    };
  }
}

// Payment Request Methods
async function createPaymentRequest(parentId: string, input: PaymentRequestCreateInput): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/paymentrequestcreate', { parentId, input });
}

async function getPaymentRequests(params: {
  first?: number;
  after?: string;
  before?: string;
  last?: number;
} = {}): Promise<PrintavoAPIResponse<{ paymentRequests: { edges: Array<{ node: PrintavoPaymentRequest }> } }>> {
  return query('/query/paymentrequests', params);
}

// Approval Request Methods
async function createApprovalRequest(parentId: string, input: ApprovalRequestCreateInput): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/approvalrequestcreate', { parentId, input });
}

async function getApprovalRequests(orderId: string): Promise<PrintavoAPIResponse<{ approvalRequests: { edges: Array<{ node: PrintavoApprovalRequest }> } }>> {
  return query(`/invoice/${orderId}/approvalrequests`);
}

// Fee Management
async function createFee(parentId: string, input: FeeInput): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/feecreate', { parentId, input });
}

async function updateFee(id: string, input: FeeInput): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/feeupdate', { id, input });
}

async function deleteFee(id: string): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/feedelete', { id });
}

async function getFees(orderId: string): Promise<PrintavoAPIResponse<{ fees: { edges: Array<{ node: PrintavoFee }> } }>> {
  return query(`/invoice/${orderId}/fees`);
}

// Thread/Message Management
async function getThreads(params: {
  first?: number;
  after?: string;
  before?: string;
  last?: number;
  onlyWithUnread?: boolean;
} = {}): Promise<PrintavoAPIResponse<{ threads: { edges: Array<{ node: PrintavoThread }> } }>> {
  return query('/query/threads', params);
}

async function updateThreadStatus(id: string, unread: boolean): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/threadupdate', { id, unread });
}

async function getThread(id: string): Promise<PrintavoAPIResponse<PrintavoThread>> {
  return query('/query/thread', { id });
}

// Delivery Methods
async function createDeliveryMethod(input: DeliveryMethodInput): Promise<PrintavoAPIResponse<any>> {
  return mutate('/mutation/deliverymethodcreate', { input });
}

// Product Management
async function searchProducts(params: ProductSearchParams): Promise<PrintavoAPIResponse<{ products: { edges: Array<{ node: PrintavoProduct }> } }>> {
  return query('/query/products', params);
}

async function getProduct(id: string): Promise<PrintavoAPIResponse<PrintavoProduct>> {
  return query('/query/product', { id });
}

// Line Item Management
async function getLineItem(id: string): Promise<PrintavoAPIResponse<PrintavoLineItem>> {
  return query('/query/lineitem', { id });
}

async function getLineItemGroup(id: string): Promise<PrintavoAPIResponse<PrintavoLineItemGroup>> {
  return query('/query/lineitemgroup', { id });
}

// Quote Pricing Methods
async function calculatePricing(lineItemGroup: LineItemGroupPricingInput): Promise<PrintavoAPIResponse<LineItemPricing>> {
  return query('/query/lineitemgrouppricing', { lineItemGroup });
}

// Helper method for calculating quote pricing
async function calculateQuoteTotal(
  lineItems: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>
): Promise<PrintavoAPIResponse<LineItemPricing>> {
  return calculatePricing({
    items: lineItems
  });
}

// Helper method for creating a quote with products
async function createQuoteFromProducts(
  quoteInput: QuoteCreateInput,
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice?: number;
    imprints?: ImprintCreateInput[];
  }>
): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    // Create the quote first
    const quoteResponse = await createQuote(quoteInput);
    if (!quoteResponse.data || quoteResponse.errors) {
      return quoteResponse;
    }

    const quoteId = quoteResponse.data.id;

    // Create a single line item group for all products
    const groupResponse = await addLineItemGroup(quoteId, {
      name: 'Product Order',
      description: 'Order created from product catalog'
    });

    if (!groupResponse.data || groupResponse.errors) {
      return quoteResponse;
    }

    const groupId = groupResponse.data.id;

    // Add each product as a line item
    for (const item of items) {
      await addLineItem(groupId, {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        imprints: item.imprints
      });
    }

    // Return the final quote
    return getOrder(quoteId);

  } catch (error) {
    return {
      errors: [{ message: error instanceof Error ? error.message : 'Failed to create quote from products' }],
      success: false
    };
  }
}

// Export operations for use in printavo-service.ts and operations.ts
export const operations = {
  createQuote,
  addLineItemGroup,
  addLineItem,
  addCustomAddress,
  addImprint,
  updateStatus,
  createTask,
  getCustomer,
  createCustomer,
  getCustomers,
  getOrderByVisualId,
  getOrder,
  searchOrders,
  getDueOrders,
  getInvoices,
  getDueInvoices,
  getInvoice,
  createCompleteQuote,
  createPaymentRequest,
  getPaymentRequests,
  createApprovalRequest,
  getApprovalRequests,
  createFee,
  updateFee,
  deleteFee,
  getFees,
  getThreads,
  updateThreadStatus,
  getThread,
  createDeliveryMethod,
  searchProducts,
  getProduct,
  getLineItem,
