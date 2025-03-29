#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from '@modelcontextprotocol/sdk/types.js';
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
async function executePrintavoGraphQL(query, variables = {}) {
    console.log(`[PrintavoGraphQLServer] Executing GraphQL query: ${query.substring(0, 100)}...`, 'Variables:', variables);
    try {
        const response = await fetch(`${PRINTAVO_API_URL}/graphql`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'email': PRINTAVO_EMAIL, // Non-null assertion as we check at startup
                'token': PRINTAVO_TOKEN, // Non-null assertion
            },
            body: JSON.stringify({ query, variables }),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[PrintavoGraphQLServer] API Error Response: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Printavo API Error: ${response.status} ${response.statusText} - ${errorBody}`);
        }
        const result = await response.json(); // Type assertion
        if (result.errors) {
            console.error('[PrintavoGraphQLServer] GraphQL Errors:', JSON.stringify(result.errors, null, 2));
            // Combine multiple error messages if they exist
            const errorMessage = result.errors.map((err) => err.message).join('; ');
            throw new Error(`GraphQL Error: ${errorMessage}`);
        }
        console.log(`[PrintavoGraphQLServer] GraphQL Success Response (data keys):`, result.data ? Object.keys(result.data) : 'No data');
        return result.data; // Return only the data part
    }
    catch (error) {
        console.error('[PrintavoGraphQLServer] Fetch/GraphQL Execution Error:', error);
        // Re-throw the error to be caught by the tool handler
        throw error;
    }
}
class PrintavoGraphQLServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'printavo-graphql-mcp-server',
            version: '0.1.0',
        }, {
            capabilities: {
                resources: {},
                tools: {},
            },
        });
        this.setupToolHandlers();
        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupToolHandlers() {
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
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                const { name, arguments: args = {} } = request.params;
                console.log(`[PrintavoGraphQLServer] Executing tool: ${name}`);
                console.log(`[PrintavoGraphQLServer] Arguments:`, JSON.stringify(args, null, 2));
                switch (name) {
                    case 'get_account':
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        id: 'account-123',
                                        name: 'King Clothing',
                                        email: PRINTAVO_EMAIL,
                                    }, null, 2),
                                },
                            ],
                        };
                    case 'get_current_user': {
                        const query = `
              query GetCurrentUser {
                user {
                  id
                  email
                  firstName
                  lastName
                  fullName
                  # Add other fields as needed
                }
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
                        // TODO: Implement real API call for get_order using executePrintavoGraphQL
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        id: args.orderId,
                                        visualId: '9435', // Mock data
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
                        // TODO: Implement real API call for get_order_by_visual_id using executePrintavoGraphQL
                        // Note: This might require searching invoices/quotes by visualId
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        id: 'order-123', // Mock data
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
                        // TODO: Implement real API call for search_orders using executePrintavoGraphQL
                        // Note: This might involve searching invoices or quotes
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
                    case 'get_customer':
                        if (!args.customerId) {
                            throw new McpError(ErrorCode.InvalidParams, 'Missing required parameter: customerId');
                        }
                        // TODO: Implement real API call for get_customer using executePrintavoGraphQL
                        return {
                            content: [
                                {
                                    type: 'text',
                                    text: JSON.stringify({
                                        id: args.customerId,
                                        companyName: 'Test Customer',
                                        email: 'customer@example.com',
                                        phone: '555-123-4567',
                                        address: {
                                            street: '123 Main St',
                                            city: 'Anytown',
                                            state: 'CA',
                                            zip: '12345'
                                        }
                                    }, null, 2),
                                },
                            ],
                        };
                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
                }
            }
            catch (error) {
                console.error(`[PrintavoGraphQLServer] Error executing tool:`, error);
                return {
                    content: [
                        {
                            type: 'text',
                            text: error instanceof Error ? error.message : String(error),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Printavo GraphQL MCP server running on stdio');
    }
}
const server = new PrintavoGraphQLServer();
