import OpenAI from 'openai';
import { executeGraphQL } from './printavo/graphql-client';

// OpenAI instance
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get Printavo API credentials
function getPrintavoCredentials() {
  const apiUrl = process.env.PRINTAVO_API_URL || process.env.NEXT_PUBLIC_PRINTAVO_API_URL || '';
  const email = process.env.PRINTAVO_EMAIL || process.env.NEXT_PUBLIC_PRINTAVO_EMAIL || '';
  const token = process.env.PRINTAVO_TOKEN || process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '';
  
  return { apiUrl, email, token };
}

// Define Printavo API tools
const printavoTools = [
  {
    type: "function",
    function: {
      name: "get_order_by_visual_id",
      description: "Get order details from Printavo using the visual ID",
      parameters: {
        type: "object",
        properties: {
          visualId: {
            type: "string",
            description: "The 4-digit visual ID of the order"
          }
        },
        required: ["visualId"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "search_orders",
      description: "Search for orders in Printavo",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Search query for finding orders"
          }
        },
        required: ["query"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_customer_by_email",
      description: "Find a customer by their email address",
      parameters: {
        type: "object",
        properties: {
          email: {
            type: "string",
            description: "The customer's email address"
          }
        },
        required: ["email"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_customer",
      description: "Create a new customer in Printavo",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The customer's full name"
          },
          email: {
            type: "string",
            description: "The customer's email address"
          },
          phone: {
            type: "string",
            description: "The customer's phone number"
          }
        },
        required: ["name", "email"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_quote",
      description: "Create a new quote in Printavo",
      parameters: {
        type: "object",
        properties: {
          customerId: {
            type: "string",
            description: "The customer's Printavo ID"
          },
          name: {
            type: "string",
            description: "Name of the quote"
          },
          lineItems: {
            type: "array",
            description: "Products to include in the quote",
            items: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Name of the product"
                },
                quantity: {
                  type: "integer",
                  description: "Quantity of the product"
                },
                price: {
                  type: "number",
                  description: "Price per unit"
                },
                description: {
                  type: "string",
                  description: "Product description"
                }
              },
              required: ["name", "quantity", "price"]
            }
          }
        },
        required: ["customerId", "name", "lineItems"]
      }
    }
  }
];

// Create or load an assistant
export async function getPrintavoAssistant() {
  // Check if assistant already exists in your storage
  let assistantId = process.env.PRINTAVO_ASSISTANT_ID;
  
  if (!assistantId) {
    console.log('Creating new Printavo Assistant...');
    
    const assistant = await openai.beta.assistants.create({
      name: "Printavo Agent",
      instructions: "You are a Printavo management assistant that helps users find and manage orders, customers, and quotes in their Printavo account. You can look up orders by visual ID, search for orders, find customers, create new customers, and create quotes.",
      model: "gpt-4o",
      tools: printavoTools
    });
    
    assistantId = assistant.id;
    console.log(`Created assistant with ID: ${assistantId}`);
    // Store this ID in your environment or database
  }
  
  return assistantId;
}

// Execute Printavo API calls
export async function executePrintavoOperation(operation: string, params: any) {
  // Get API credentials
  const { apiUrl, email, token } = getPrintavoCredentials();
  
  // Build GraphQL query based on the operation
  let query = '';
  let variables = {};
  
  switch (operation) {
    case 'get_order_by_visual_id':
      query = `
        query GetOrderByVisualId($visualId: String!) {
          orders(first: 1, filter: { visualId: { eq: $visualId } }) {
            edges {
              node {
                id
                name
                visualId
                status {
                  name
                }
                customer {
                  name
                  email
                }
                total
              }
            }
          }
        }
      `;
      variables = { visualId: params.visualId };
      break;
    
    case 'search_orders':
      query = `
        query SearchOrders($query: String!) {
          orders(first: 10, query: $query) {
            edges {
              node {
                id
                name
                visualId
                status {
                  name
                }
                customer {
                  name
                }
                total
              }
            }
          }
        }
      `;
      variables = { query: params.query };
      break;
    
    case 'get_customer_by_email':
      query = `
        query GetCustomerByEmail($email: String!) {
          customers(first: 1, filter: { email: { eq: $email } }) {
            edges {
              node {
                id
                name
                email
                phone
              }
            }
          }
        }
      `;
      variables = { email: params.email };
      break;
    
    case 'create_customer':
      query = `
        mutation CreateCustomer($input: CreateCustomerInput!) {
          createCustomer(input: $input) {
            customer {
              id
              name
              email
              phone
            }
          }
        }
      `;
      variables = { 
        input: { 
          name: params.name,
          email: params.email,
          phone: params.phone || ""
        } 
      };
      break;
    
    case 'create_quote':
      query = `
        mutation CreateQuote($input: CreateQuoteInput!) {
          createQuote(input: $input) {
            quote {
              id
              name
              total
              customer {
                name
              }
            }
          }
        }
      `;
      
      // Transform line items into Printavo format
      const lineItems = params.lineItems.map((item: any) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        description: item.description || ""
      }));
      
      variables = { 
        input: {
          customerId: params.customerId,
          name: params.name,
          lineItems: lineItems
        }
      };
      break;
    
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
  
  // Execute GraphQL query
  return executeGraphQL({
    query,
    variables,
    apiUrl,
    email,
    token
  });
} 