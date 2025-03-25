/**
 * Printavo API Integration
 * This service handles all API calls to the Printavo system
 * Includes robust error handling and input validation
 */

import { logger } from './logger';

// API base URL and authentication from env variables
const API_BASE_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const API_EMAIL = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;

// GraphQL endpoint
const GRAPHQL_ENDPOINT = API_BASE_URL;

// Check if we have necessary credentials
if (!API_EMAIL || !API_TOKEN) {
  logger.warn('Printavo credentials not set in environment variables. API calls will fail.');
  logger.warn('Please set NEXT_PUBLIC_PRINTAVO_EMAIL and NEXT_PUBLIC_PRINTAVO_TOKEN in your .env.local file');
} else {
  logger.info('Printavo API credentials found. API URL:', API_BASE_URL);
  logger.info('Using email:', API_EMAIL);
  logger.info('Token length:', API_TOKEN.length, 'characters');
}

// After the credential check but before the executeGraphQL function, add this API health check

/**
 * Checks if the Printavo API is accessible with the current credentials
 * @returns Promise with connection status and account info if successful
 */
export async function checkApiConnection() {
  const isBrowser = typeof window !== 'undefined';
  logger.info('Checking Printavo API connection...');
  
  const ACCOUNT_QUERY = `
    query {
      account {
        id
        companyName
        companyEmail
        phone
        website
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `;
  
  try {
    // If in browser environment, use the /api/health endpoint instead of direct API call
    // This avoids CORS issues with the Printavo API
    if (isBrowser) {
      try {
        logger.info('Using /api/health endpoint for browser API check');
        const response = await fetch('/api/health');
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          logger.error('API health check failed:', errorText);
          return { 
            connected: false, 
            error: `${response.status} ${response.statusText}`, 
            message: 'Failed to check API health' 
          };
        }
        
        const result = await response.json();
        
        // Return the API status from the health endpoint
        return {
          connected: result.printavoApi?.connected || false,
          account: result.printavoApi?.account || null,
          message: result.printavoApi?.message || 'Connection status from health endpoint'
        };
      } catch (error) {
        logger.error('Error accessing health endpoint:', error);
        return { 
          connected: false, 
          error: error instanceof Error ? error.message : String(error),
          message: 'Error accessing health endpoint' 
        };
      }
    }
    
    // Server-side direct API call
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'email': API_EMAIL || '',
          'token': API_TOKEN || '',
        },
        body: JSON.stringify({
          query: ACCOUNT_QUERY,
        }),
        cache: 'no-store'
      });
      
      logger.debug('API Connection check status:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        logger.error('API Connection failed:', errorText);
        return { 
          connected: false, 
          error: `${response.status} ${response.statusText}`, 
          message: 'Failed to connect to Printavo API' 
        };
      }
      
      const result = await response.json();
      
      if (result.errors) {
        logger.error('API Connection GraphQL errors:', result.errors);
        return { 
          connected: false, 
          error: result.errors[0].message,
          message: 'Authentication or permission error'
        };
      }
      
      if (result.data?.account) {
        logger.info('Successfully connected to Printavo API');
        logger.info(`Account: ${result.data.account.companyName} (${result.data.account.companyEmail})`);
        return { 
          connected: true, 
          account: result.data.account,
          message: 'Connected successfully'
        };
      } else {
        logger.warn('API response did not contain account data');
        return { 
          connected: false, 
          error: 'No account data',
          message: 'Could not retrieve account information'
        };
      }
    } catch (error) {
      logger.error('API Connection error:', error);
      return { 
        connected: false, 
        error: error instanceof Error ? error.message : String(error),
        message: 'Connection error'
      };
    }
  } catch (error) {
    // This is a fallback for any unexpected errors in the main try block
    logger.error('Unexpected error in API connection check:', error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : String(error),
      message: 'Unexpected error checking connection'
    };
  }
}

// GraphQL request function
async function executeGraphQL(query: string, variables = {}) {
  const isBrowser = typeof window !== 'undefined';
  // Use the proxy API endpoint when in browser environment
  const ENDPOINT = isBrowser ? '/api/proxy/printavo' : GRAPHQL_ENDPOINT;
  
  logger.debug('Executing GraphQL query to:', ENDPOINT);
  logger.debug('Query:', query.substring(0, 50) + '...');
  logger.debug('Variables:', JSON.stringify(variables).substring(0, 100));
  
  // Removed the mock data fallback for browser environment
  
  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': API_EMAIL || '',
        'token': API_TOKEN || '',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      cache: 'no-store'
    });

    logger.debug('API Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logger.error('API Error Response:', errorText);
      
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

    const result = await response.json();
    
    if (result.errors && result.errors.length > 0) {
      const errorMessage = result.errors[0].message;
      logger.error('GraphQL Error:', errorMessage);
      throw new PrintavoValidationError(`GraphQL Error: ${errorMessage}`, 400);
    }

    logger.debug('GraphQL query successful');

    return result.data;
  } catch (error) {
    // Removed the mock data fallback for network errors in browser environment
    throw error;
  }
}

// Export the executeGraphQL function for use in other modules
export { executeGraphQL };

// Function to create mock data for development
function getMockData(query: string) {
  // Extract operation type from query
  const queryType = query.toLowerCase();
  
  // Return appropriate mock data based on query type
  if (queryType.includes('order') || queryType.includes('orders')) {
    return getMockOrderData(query);
  } else if (queryType.includes('product') || queryType.includes('products')) {
    return getMockProductData(query);
  } else if (queryType.includes('customer') || queryType.includes('customers')) {
    return getMockCustomerData(query);
  } else if (queryType.includes('task') || queryType.includes('tasks')) {
    return getMockTaskData(query);
  } else if (queryType.includes('account')) {
    return getMockAccountData();
  } else {
    return { data: [] };
  }
}

// Define these mock data helper functions to provide realistic looking data
function getMockOrderData(query: string) {
  // Remove or replace with an empty function
}

function getMockProductData(query: string) {
  // Remove or replace with an empty function
}

function getMockCustomerData(query: string) {
  // Remove or replace with an empty function
}

function getMockTaskData(query: string) {
  // Remove or replace with an empty function
}

function getMockAccountData() {
  // Remove or replace with an empty function
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

/**
 * Validation utility functions
 */
function validateId(id: string, entityName: string): void {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new PrintavoValidationError(
      `Invalid ${entityName} ID: ID must be a non-empty string`,
      400
    );
  }
}

/**
 * Orders API
 */
export const OrdersAPI = {
  // Get all orders with optional filters
  getOrders: async (params: { page?: number, limit?: number, status?: string } = {}) => {
    // Validate inputs
    if (params.limit && (typeof params.limit !== 'number' || params.limit <= 0)) {
      throw new PrintavoValidationError('Invalid limit parameter: must be a positive number', 400);
    }
    
    logger.info('Fetching orders with params:', params);
    const limit = params.limit || 10;
    const query = `
      query GetOrders {
        invoices(first: ${limit}) {
          edges {
            node {
              id
              visualId
              nickname
              total
              subtotal
              status {
                id
                name
              }
              contact {
                fullName
                email
              }
              createdAt
              dueAt
              customerDueAt
              threadSummary {
                lastMessage
                previewText
                updatedAt
              }
              lineItemGroups {
                edges {
                  node {
                    name
                    lineItems {
                      edges {
                        node {
                          name
                          quantity
                          price
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQL(query);
    logger.info(`Retrieved ${data.invoices.edges.length} orders`);
    return data.invoices.edges.map((edge: any) => edge.node);
  },

  // Get a specific order by ID
  getOrder: async (orderId: string) => {
    // Validate order ID
    validateId(orderId, 'order');
    
    logger.info(`Fetching order with ID: ${orderId}`);
    const query = `
      query GetOrder($id: ID!) {
        invoice(id: $id) {
          id
          visualId
          nickname
          total
          subtotal
          createdAt
          dueAt
          customerDueAt
          productionNote
          customerNote
          status {
            id
            name
          }
          contact {
            fullName
            email
            phone
          }
          billingAddress {
            name
            address1
            address2
            city
            state
            country
            postalCode
          }
          shippingAddress {
            name
            address1
            address2
            city
            state
            country
            postalCode
          }
          lineItemGroups {
            edges {
              node {
                name
                lineItems {
                  edges {
                    node {
                      name
                      quantity
                      price
                      description
                    }
                  }
                }
              }
            }
          }
          threadSummary {
            lastMessage
            previewText
            updatedAt
          }
        }
      }
    `;
    
    const data = await executeGraphQL(query, { id: orderId });
    if (!data.invoice) {
      throw new PrintavoNotFoundError(`Order with ID ${orderId} not found`, 404);
    }
    logger.info(`Retrieved order: ${orderId}`);
    return data.invoice;
  },

  // Get a specific order by Visual ID
  getOrderByVisualId: async (visualId: string) => {
    // Validate visual ID
    validateId(visualId, 'visual ID');
    // According to Printavo API docs, we should use the orders connection with a query parameter
    const query = `
      query GetOrdersByVisualId($query: String) {
        orders(first: 10, query: $query) {
          edges {
            node {
              ... on Invoice {
                id
                visualId
                nickname
                total
                subtotal
                createdAt
                dueAt
                customerDueAt
                productionNote
                customerNote
                status {
                  id
                  name
                }
                contact {
                  fullName
                  email
                  phone
                }
              }
              ... on Quote {
                id
                visualId
                nickname
                total
                status {
                  id
                  name
                }
                contact {
                  fullName
                  email
                  phone
                }
              }
            }
          }
        }
      }
    `;
    
    logger.info(`Executing GraphQL query for visual ID: ${visualId}`);
    
    try {
      const data = await executeGraphQL(query, { query: visualId });
      logger.debug(`Query result:`, JSON.stringify(data).substring(0, 200));
      
      if (data && data.orders && data.orders.edges && data.orders.edges.length > 0) {
        const nodes = data.orders.edges.map((edge: any) => edge.node);
        
        // Find an exact match for the visual ID if possible
        const exactMatch = nodes.find((node: any) => 
          node.visualId === visualId
        );
        
        if (exactMatch) {
          logger.info(`Found exact match for Visual ID ${visualId}`);
          return exactMatch;
        } else if (nodes.length > 0) {
          logger.info(`No exact match for Visual ID ${visualId}, using first result`);
          return nodes[0];
        }
      }
      
      logger.info(`No orders found with Visual ID ${visualId}`);
      return null;
    } catch (error) {
      // Don't throw errors for 404 (not found) responses, just return null
      if (error instanceof PrintavoNotFoundError || 
          (error instanceof PrintavoAPIError && error.statusCode === 404)) {
        logger.info(`Order with Visual ID ${visualId} not found (404 response)`);
        return null;
      }
      
      // For all other errors, log them and rethrow
      logger.error(`Error searching for Visual ID ${visualId}:`, error);
      throw error;
    }
  }
};

/**
 * Customers API
 */
export const CustomersAPI = {
  // Get all customers with optional filters
  getCustomers: async (params: { page?: number, limit?: number, search?: string } = {}) => {
    // Validate inputs
    if (params.limit && (typeof params.limit !== 'number' || params.limit <= 0)) {
      throw new PrintavoValidationError('Invalid limit parameter: must be a positive number', 400);
    }
    
    if (params.search && typeof params.search !== 'string') {
      throw new PrintavoValidationError('Invalid search parameter: must be a string', 400);
    }
    
    logger.info('Fetching customers with params:', params);
    
    // Set defaults and prepare query
    const limit = params.limit || 10;
    const searchFilter = params.search ? `, filter: { name: "${params.search}" }` : '';
    
    const query = `
      query GetCustomers {
        contacts(first: ${limit}${searchFilter}) {
          edges {
            node {
              id
              name
              email
              phone
              companyName
              invoiceCount
              shippingAddress {
                address1
                address2
                city
                state
                country
                postalCode
              }
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQL(query);
    logger.info(`Retrieved ${data.contacts.edges.length} customers`);
    return data.contacts.edges.map((edge: any) => edge.node);
  },

  // Get a specific customer by ID
  getCustomer: async (customerId: string) => {
    // Validate customer ID
    validateId(customerId, 'customer');
    
    logger.info(`Fetching customer with ID: ${customerId}`);
    
    const query = `
      query GetCustomer($id: ID!) {
        contact(id: $id) {
          id
          name
          email
          phone
          companyName
          invoiceCount
          shippingAddress {
            address1
            address2
            city
            state
            country
            postalCode
          }
          billingAddress {
            address1
            address2
            city
            state
            country
            postalCode
          }
          invoices(first: 5) {
            edges {
              node {
                id
                visualId
                total
                status {
                  name
                }
                createdAt
              }
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQL(query, { id: customerId });
    if (!data.contact) {
      throw new PrintavoNotFoundError(`Customer with ID ${customerId} not found`, 404);
    }
    logger.info(`Retrieved customer: ${customerId}`);
    return data.contact;
  },

  // Create a new customer
  createCustomer: async (customerData: any) => {
    logger.info('Creating new customer');
    
    const mutation = `
      mutation CreateCustomer($input: CustomerCreateInput!) {
        customerCreate(input: $input) {
          id
          companyName
          primaryContact {
            id
            fullName
            email
          }
          billingAddress {
            address1
            address2
            city
            state
            country
            postalCode
          }
          shippingAddress {
            address1
            address2
            city
            state
            country
            postalCode
          }
        }
      }
    `;
    
    const data = await executeGraphQL(mutation, { input: customerData });
    logger.info(`Customer created with ID: ${data.customerCreate.id}`);
    return data.customerCreate;
  }
};

/**
 * Products API
 * Implementation based on Printavo API documentation
 */
export const ProductsAPI = {
  // Get all products with optional filters
  getProducts: async (params: { page?: number, limit?: number, query?: string } = {}) => {
    // Validate inputs
    if (params.limit && (typeof params.limit !== 'number' || params.limit <= 0)) {
      throw new PrintavoValidationError('Invalid limit parameter: must be a positive number', 400);
    }
    
    if (params.query && typeof params.query !== 'string') {
      throw new PrintavoValidationError('Invalid query parameter: must be a string', 400);
    }
    
    logger.info('Fetching products with params:', params);
    
    // Set defaults and prepare query parameters
    const limit = params.limit || 20;
    const searchQuery = params.query || '';
    
    const query = `
      query GetProducts($query: String, $first: Int) {
        products(query: $query, first: $first) {
          edges {
            node {
              id
              name
              description
              sku
              price
              cost
              category
              createdAt
              updatedAt
              variants {
                edges {
                  node {
                    id
                    name
                    sku
                    price
                    cost
                  }
                }
              }
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQL(query, { 
      query: searchQuery, 
      first: limit 
    });
    
    logger.info(`Retrieved ${data.products.edges.length} products`);
    return data.products.edges.map((edge: any) => edge.node);
  },

  // Get a specific product by ID
  getProduct: async (productId: string) => {
    // Validate product ID
    validateId(productId, 'product');
    
    logger.info(`Fetching product with ID: ${productId}`);
    
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          name
          description
          sku
          price
          cost
          category
          createdAt
          updatedAt
          variants {
            edges {
              node {
                id
                name
                sku
                price
                cost
              }
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQL(query, { id: productId });
    if (!data.product) {
      throw new PrintavoNotFoundError(`Product with ID ${productId} not found`, 404);
    }
    logger.info(`Retrieved product: ${productId}`);
    return data.product;
  },
  
  // Search products
  searchProducts: async (searchTerm: string, limit: number = 10) => {
    if (typeof searchTerm !== 'string') {
      throw new PrintavoValidationError('Invalid search term: must be a string', 400);
    }
    
    logger.info(`Searching products with term: ${searchTerm}`);
    
    const query = `
      query SearchProducts($query: String, $first: Int) {
        products(query: $query, first: $first) {
          edges {
            node {
              id
              name
              description
              sku
              price
              category
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQL(query, { 
      query: searchTerm,
      first: limit 
    });
    
    logger.info(`Found ${data.products.edges.length} products matching "${searchTerm}"`);
    return data.products.edges.map((edge: any) => edge.node);
  }
};
