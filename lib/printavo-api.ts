/**
 * Printavo API Integration
 * This service handles all API calls to the Printavo system
 */

// API base URL and authentication from env variables
const API_BASE_URL = process.env.PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const API_EMAIL = process.env.PRINTAVO_EMAIL;
const API_TOKEN = process.env.PRINTAVO_TOKEN;

// GraphQL endpoint
const GRAPHQL_ENDPOINT = `${API_BASE_URL}/graphql`;

// Validate credentials
if (!API_EMAIL || !API_TOKEN) {
  console.warn('Printavo credentials not set in environment variables. API calls will fail.');
}

// GraphQL request function
async function executeGraphQL(query: string, variables = {}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-User-Email': API_EMAIL || '',
      'X-User-Token': API_TOKEN || '',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new PrintavoAPIError(
      `API Error: ${response.status} ${response.statusText} - ${errorText}`,
      response.status
    );
  }

  const result = await response.json();
  
  if (result.errors && result.errors.length > 0) {
    throw new PrintavoAPIError(
      `GraphQL Error: ${result.errors[0].message}`,
      400
    );
  }

  return result.data;
}

// Error handler
class PrintavoAPIError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'PrintavoAPIError';
    this.statusCode = statusCode;
  }
}

/**
 * Orders API
 */
export const OrdersAPI = {
  // Get all orders with optional filters
  getOrders: async (params: { page?: number, limit?: number, status?: string } = {}) => {
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
                name
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
    return data.invoices.edges.map((edge: any) => edge.node);
  },

  // Get a specific order by ID
  getOrder: async (orderId: string) => {
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
            name
            email
            phoneNumber
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
    return data.invoice;
  },

  // Get a specific order by Visual ID
  getOrderByVisualId: async (visualId: string) => {
    const query = `
      query GetOrdersByVisualId {
        invoices(first: 1, filter: { visualId: "${visualId}" }) {
          edges {
            node {
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
                name
                email
                phoneNumber
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
        }
      }
    `;
    
    const data = await executeGraphQL(query);
    const orders = data.invoices.edges.map((edge: any) => edge.node);
    return orders.length > 0 ? orders[0] : null;
  }
};

/**
 * Customers API
 */
export const CustomersAPI = {
  // Get all customers with optional filters
  getCustomers: async (params: { page?: number, limit?: number, search?: string } = {}) => {
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
              phoneNumber
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
    return data.contacts.edges.map((edge: any) => edge.node);
  },

  // Get a specific customer by ID
  getCustomer: async (customerId: string) => {
    const query = `
      query GetCustomer($id: ID!) {
        contact(id: $id) {
          id
          name
          email
          phoneNumber
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
    return data.contact;
  }
};

/**
 * Products API
 */
export const ProductsAPI = {
  // Get all products
  getProducts: async (params: { page?: number, limit?: number } = {}) => {
    const limit = params.limit || 10;
    
    const query = `
      query GetProducts {
        products(first: ${limit}) {
          edges {
            node {
              id
              name
              description
              sku
              price
              createdAt
              imageUrl
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQL(query);
    return data.products.edges.map((edge: any) => edge.node);
  },

  // Get a specific product by ID
  getProduct: async (productId: string) => {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          name
          description
          sku
          price
          createdAt
          imageUrl
        }
      }
    `;
    
    const data = await executeGraphQL(query, { id: productId });
    return data.product;
  }
};

/**
 * Quotes API
 */
export const QuotesAPI = {
  // Get all quotes
  getQuotes: async (params: { page?: number, limit?: number } = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    
    const url = `${API_BASE_URL}/quotes?${queryParams.toString()}`;
    const response = await fetch(url, fetchOptions());
    return handleResponse(response);
  },

  // Get a specific quote by ID
  getQuote: async (quoteId: string) => {
    const url = `${API_BASE_URL}/quotes/${quoteId}`;
    const response = await fetch(url, fetchOptions());
    return handleResponse(response);
  },

  // Create a new quote
  createQuote: async (quoteData: any) => {
    const url = `${API_BASE_URL}/quotes`;
    const response = await fetch(url, fetchOptions('POST', quoteData));
    return handleResponse(response);
  }
};

// Export the API & error classes
export { PrintavoAPIError }; 