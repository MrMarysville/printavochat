import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import fetch from 'node-fetch'; // Import node-fetch

// Environment variables
const PRINTAVO_API_URL = process.env.PRINTAVO_API_URL;
const PRINTAVO_EMAIL = process.env.PRINTAVO_EMAIL;
const PRINTAVO_TOKEN = process.env.PRINTAVO_TOKEN;

// Validate environment variables
if (!PRINTAVO_API_URL || !PRINTAVO_EMAIL || !PRINTAVO_TOKEN) {
  console.error('Missing required environment variables: PRINTAVO_API_URL PRINTAVO_EMAIL PRINTAVO_TOKEN');
  process.exit(1);
}

// Helper function to execute Printavo GraphQL queries
async function executePrintavoGraphQL(query: string, variables: Record<string, any> = {}) {
  console.log(`[PrintavoGraphQLServer] Executing GraphQL query: ${query.substring(0, 100)}...`, 'Variables:', variables);
  try {
    const response = await fetch(`${PRINTAVO_API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'email': PRINTAVO_EMAIL!,
        'token': PRINTAVO_TOKEN!,
      },
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[PrintavoGraphQLServer] API Error Response: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Printavo API Error: ${response.status} ${response.statusText} - ${errorBody}`);
    }

    const result = await response.json() as any; // Type assertion

    if (result.errors) {
      console.error('[PrintavoGraphQLServer] GraphQL Errors:', JSON.stringify(result.errors, null, 2));
      const errorMessage = result.errors.map((err: any) => err.message).join('; ');
      throw new Error(`GraphQL Error: ${errorMessage}`);
    }

    console.log(`[PrintavoGraphQLServer] GraphQL Success Response (data keys):`, result.data ? Object.keys(result.data) : 'No data');
    return result.data;

  } catch (error) {
    console.error('[PrintavoGraphQLServer] Fetch/GraphQL Execution Error:', error);
    throw error;
  }
}

class PrintavoGraphQLServer {
  public server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'printavo-graphql-mcp-server',
        version: '0.1.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
    
    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'get_account',
          description: 'Retrieve Printavo account information',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_current_user',
          description: 'Retrieve current user information',
          inputSchema: {
            type: 'object',
            properties: {},
            required: [],
          },
        },
        {
          name: 'get_order',
          description: 'Retrieve details for a specific Printavo order by its ID',
          inputSchema: {
            type: 'object',
            properties: {
              orderId: {
                type: 'string',
                description: 'The ID of the Printavo order to retrieve',
              },
            },
            required: ['orderId'],
          },
        },
        {
          name: 'get_order_by_visual_id',
          description: 'Retrieve details for a specific Printavo order by its Visual ID',
          inputSchema: {
            type: 'object',
            properties: {
              visualId: {
                type: 'string',
                description: 'The Visual ID of the Printavo order to retrieve (e.g., 9435)',
              },
            },
            required: ['visualId'],
          },
        },
        {
          name: 'search_orders',
          description: 'Search for Printavo orders (invoices/quotes) using a query string',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'The search query string (e.g., customer name, order number, visual ID)',
              },
              limit: {
                type: 'integer',
                description: 'Maximum number of results to return (default: 10)',
                default: 10,
              },
            },
            required: ['query'],
          },
        },
        {
          name: 'get_customer',
          description: 'Retrieve details for a specific Printavo customer by their ID',
          inputSchema: {
            type: 'object',
            properties: {
              customerId: {
                type: 'string',
                description: 'The ID of the Printavo customer to retrieve',
              },
            },
            required: ['customerId'],
          },
        },
        {
          name: 'get_order_summary',
          description: 'Retrieve a comprehensive order summary including customer info, line items, transactions, and metrics',
          inputSchema: {
            type: 'object',
            properties: {
              orderId: {
                type: 'string',
                description: 'The ID of the order for which to retrieve the summary',
              },
            },
            required: ['orderId'],
          },
        },
        {
          name: 'update_status',
          description: 'Update the status of a Printavo order',
          inputSchema: {
            type: 'object',
            properties: {
              orderId: {
                type: 'string',
                description: 'The ID of the order to update',
              },
              newStatus: {
                type: 'string',
                description: 'The new status to set for the order',
              },
            },
            required: ['orderId', 'newStatus'],
          },
        },
        },
        {
          name: 'create_quote',
          description: 'Create a new quote. Looks up customer by "omc" identifier or email, creates if necessary, and adds line items with product details from SanMar data.',
          inputSchema: {
            type: 'object',
            properties: {
              customer: {
                type: 'object',
                properties: {
                  customerId: {
                    type: 'string',
                    description: 'Existing customer ID (optional)',
                  },
                  email: {
                    type: 'string',
                    description: 'Customer email address (optional)',
                  },
                },
                required: [],
              },
              lineItems: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    style: {
                      type: 'string',
                      description: 'Style number for product lookup',
                    },
                    color: {
                      type: 'string',
                      description: 'Color of the product',
                    },
                    sizes: {
                      type: 'array',
                      items: {
                        type: 'string',
                      },
                      description: 'Array of sizes (or quantities) for the product',
                    },
                  },
                  required: ['style', 'color', 'sizes'],
                },
              },
            },
            required: ['lineItems'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      try {
        const { name, arguments: args = {} } = request.params;
        console.log(`[PrintavoGraphQLServer] Executing tool: ${name}`);
        console.log(`[PrintavoGraphQLServer] Arguments:`, JSON.stringify(args, null, 2));

        switch (name) {
          case 'get_account': {
            const query = `
              query GetAccount {
                account {
                  id
                  name
                  email
                }
              }
            `;
            const data = await executePrintavoGraphQL(query);
            return {
              content: [
          {
            name: 'update_status',
            description: 'Update the status of a Printavo order',
            inputSchema: {
              type: 'object',
              properties: {
                orderId: {
                  type: 'string',
                  description: 'The ID of the order to update',
                },
                newStatus: {
                  type: 'string',
                  description: 'The new status to set for the order',
                },
              },
              required: ['orderId', 'newStatus'],
            },
          },
          {
            name: 'create_quote',
            description: 'Create a new quote. Looks up customer by "omc" identifier or email, creates if necessary, and adds line items with product details from SanMar data.',
            inputSchema: {
              type: 'object',
              properties: {
                customer: {
                  type: 'object',
                  properties: {
                    customerId: {
                      type: 'string',
                      description: 'Existing customer ID (optional)',
                    },
                    email: {
                      type: 'string',
                      description: 'Customer email address (optional)',
                    },
                  },
                  required: [],
                },
                lineItems: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      style: {
                        type: 'string',
                        description: 'Style number for product lookup',
                      },
                      color: {
                        type: 'string',
                        description: 'Color of the product',
                      },
                      sizes: {
                        type: 'array',
                        items: {
                          type: 'string',
                        },
                        description: 'Array of sizes (or quantities) for the product',
                      },
                    },
                    required: ['style', 'color', 'sizes'],
                  },
                },
              },
              required: ['lineItems'],
            },
          }
            `;
            const data = await executePrintavoGraphQL(query);
            return {
              content: [{ type: 'text', text: JSON.stringify(data.user, null, 2) }],
            };
          }
          case 'get_order':
            if (!args.orderId) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: orderId');
            }
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    id: args.orderId,
                    visualId: '9435',
                    status: { name: 'Confirmed' },
                    customer: { companyName: 'Test Customer' },
                    lineItems: [
                      {
                        id: 'line-123',
                        product: 'T-Shirt',
                        description: 'Custom printed t-shirt',
                        quantity: 10,
                        price: 19.99,
                      },
                    ],
                  }, null, 2),
                },
              ],
            };

          case 'get_order_by_visual_id':
            if (!args.visualId) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: visualId');
            }
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify({
                    id: 'order-123',
                    visualId: args.visualId,
                    status: { name: 'Confirmed' },
                    customer: { companyName: 'Test Customer' },
                    lineItems: [
                      {
                        id: 'line-123',
                        product: 'T-Shirt',
                        description: 'Custom printed t-shirt',
                        quantity: 10,
                        price: 19.99,
                      },
                    ],
                  }, null, 2),
                },
              ],
            };

          case 'search_orders':
            if (!args.query) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: query');
            }
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify([
                    {
                      id: 'order-123',
                      visualId: '9435',
                      status: { name: 'Confirmed' },
                      customer: { companyName: 'Test Customer' },
                    },
                    {
                      id: 'order-456',
                      visualId: '9436',
                      status: { name: 'In Production' },
                      customer: { companyName: 'Another Customer' },
                    },
                  ], null, 2),
                },
              ],
            };
            
          case 'update_status':
            if (!args.orderId || !args.newStatus) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required parameters: orderId and newStatus');
            }
            {
              const mutation = `
                mutation UpdateStatus($orderId: String!, $newStatus: String!) {
                  updateStatus(orderId: $orderId, status: $newStatus) {
                    id
                    status {
                      name
                    }
                  }
                }
              `;
              const data = await executePrintavoGraphQL(mutation, { orderId: args.orderId, newStatus: args.newStatus });
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(data.updateStatus, null, 2),
                  },
                ],
              };
            }
          
          case 'get_customer':
            if (!args.customerId) {
              throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: customerId');
            }
            {
              const query = `
                query GetCustomer($customerId: String!) {
                  customer(id: $customerId) {
                    id
                    companyName
                    email
                    phone
                    address {
                      street
                      city
                      state
                      zip
                    }
                  }
                }
              `;
              const data = await executePrintavoGraphQL(query, { customerId: args.customerId });
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(data.customer, null, 2),
                  },
                ],
              };
            }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (error) {
        console.error(`[PrintavoGraphQLServer] Error executing tool ${request.params.name}:`, error);
        throw error;
      }
    });
  }
}
  
const server = new PrintavoGraphQLServer();
const transport = new StdioServerTransport();
server.server.connect(transport)
  .then(() => {
    console.error('Printavo GraphQL MCP server running via stdio');
  })
  .catch((err) => {
    console.error('Error starting Printavo GraphQL MCP server:', err);
  });


