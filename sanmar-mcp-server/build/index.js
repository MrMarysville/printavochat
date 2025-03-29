#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const soap = __importStar(require("soap"));
// --- Credentials from Environment Variables ---
const SANMAR_CUSTOMER_NUMBER = process.env.SANMAR_CUSTOMER_NUMBER;
const SANMAR_USERNAME = process.env.SANMAR_USERNAME;
const SANMAR_PASSWORD = process.env.SANMAR_PASSWORD;
if (!SANMAR_CUSTOMER_NUMBER || !SANMAR_USERNAME || !SANMAR_PASSWORD) {
    console.error('Missing SanMar credentials. Ensure SANMAR_CUSTOMER_NUMBER, SANMAR_USERNAME, and SANMAR_PASSWORD environment variables are set.');
    process.exit(1); // Exit if credentials are not provided
}
// --- SanMar API Endpoints (Production) ---
const PRODUCT_INFO_WSDL = 'https://ws.sanmar.com:8080/SanMarWebService/SanMarProductInfoServicePort?wsdl';
const INVENTORY_WSDL = 'https://ws.sanmar.com:8080/SanMarWebService/SanMarWebServicePort?wsdl';
const PRICING_WSDL = 'https://ws.sanmar.com:8080/SanMarWebService/SanMarPricingServicePort?wsdl';
const INVOICE_WSDL = 'https://ws.sanmar.com:8080/SanMarWebService/InvoicePort?wsdl';
// Add other WSDLs as needed (PromoStandards, LPN, etc.)
// --- Authentication Object ---
const authArgs = {
    sanMarCustomerNumber: SANMAR_CUSTOMER_NUMBER,
    sanMarUserName: SANMAR_USERNAME,
    sanMarUserPassword: SANMAR_PASSWORD,
};
// --- Helper Function to Create SOAP Client ---
async function createSoapClient(wsdlUrl) {
    try {
        const client = await soap.createClientAsync(wsdlUrl);
        // Potentially add SOAP headers for authentication if needed, though SanMar seems to use args
        return client;
    }
    catch (error) {
        console.error(`Failed to create SOAP client for ${wsdlUrl}:`, error);
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Failed to initialize SOAP client: ${error.message}`);
    }
}
// --- Tool Implementations ---
async function getProductInfoByStyleColorSize(args) {
    if (!args ||
        typeof args !== 'object' ||
        typeof args.style !== 'string' ||
        (args.color !== undefined && typeof args.color !== 'string') ||
        (args.size !== undefined && typeof args.size !== 'string')) {
        throw new types_js_1.McpError(types_js_1.ErrorCode.InvalidParams, 'Invalid arguments. Requires "style" (string), and optionally "color" (string) and "size" (string).');
    }
    const client = await createSoapClient(PRODUCT_INFO_WSDL);
    const requestArgs = {
        arg0: {
            style: args.style,
            color: args.color, // Will be null/undefined if not provided
            size: args.size, // Will be null/undefined if not provided
        },
        arg1: authArgs,
    };
    try {
        const [result] = await client.getProductInfoByStyleColorSizeAsync(requestArgs);
        // Check for SanMar specific errors in the response structure
        if (result?.return?.errorOccured === true) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `SanMar API Error: ${result.return.message || 'Unknown error'}`);
        }
        // Return the relevant part of the response
        return result?.return?.listResponse || result?.return || result;
    }
    catch (error) {
        console.error('SOAP Call Error (getProductInfoByStyleColorSize):', error);
        // Handle SOAP faults specifically
        if (error.root?.Envelope?.Body?.Fault) {
            const fault = error.root.Envelope.Body.Fault;
            const faultString = fault.faultstring || 'Unknown SOAP Fault';
            throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `SOAP Fault: ${faultString}`);
        }
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `SOAP call failed: ${error.message}`);
    }
}
// --- Add more tool functions here for Inventory, Pricing, Invoicing etc. ---
// async function getInventory(...) { ... }
// async function getPricing(...) { ... }
// async function getInvoice(...) { ... }
// --- MCP Server Setup ---
class SanMarMcpServer {
    constructor() {
        this.server = new index_js_1.Server({
            name: 'sanmar-mcp-server',
            version: '0.1.0',
        }, {
            capabilities: {
                resources: {}, // No resources defined for now
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
        // List Tools Handler
        this.server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'get_sanmar_product_info',
                    description: 'Retrieves SanMar product information (basic, image, price) by style, optionally filtered by color and size. Uses the getProductInfoByStyleColorSize SOAP method.',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            style: { type: 'string', description: 'SanMar style number (e.g., PC61)' },
                            color: { type: 'string', description: 'SanMar catalog color name (optional)' },
                            size: { type: 'string', description: 'Product size (e.g., S, XL) (optional)' },
                        },
                        required: ['style'],
                    },
                },
                // --- Add definitions for other tools here ---
                // { name: 'get_sanmar_inventory', ... },
                // { name: 'get_sanmar_pricing', ... },
                // { name: 'get_sanmar_invoice', ... },
            ],
        }));
        // Call Tool Handler
        this.server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
            let result;
            try {
                switch (request.params.name) {
                    case 'get_sanmar_product_info':
                        result = await getProductInfoByStyleColorSize(request.params.arguments);
                        break;
                    // --- Add cases for other tools here ---
                    // case 'get_sanmar_inventory':
                    //   result = await getInventory(request.params.arguments);
                    //   break;
                    // case 'get_sanmar_pricing':
                    //   result = await getPricing(request.params.arguments);
                    //   break;
                    // case 'get_sanmar_invoice':
                    //   result = await getInvoice(request.params.arguments);
                    //   break;
                    default:
                        throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
                // Format successful result
                return {
                    content: [
                        {
                            type: 'text',
                            // Convert result to JSON string for the response
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                // Handle errors thrown from tool functions or switch statement
                console.error(`Error calling tool ${request.params.name}:`, error);
                const errorMessage = error instanceof types_js_1.McpError ? error.message : 'An unexpected error occurred.';
                const errorCode = error instanceof types_js_1.McpError ? error.code : types_js_1.ErrorCode.InternalError;
                // Ensure error is an McpError for consistent handling downstream
                const mcpError = error instanceof types_js_1.McpError ? error : new types_js_1.McpError(errorCode, errorMessage);
                // Return error response
                return {
                    content: [{ type: 'text', text: mcpError.message }],
                    isError: true,
                    errorCode: mcpError.code,
                };
            }
        });
    }
    async run() {
        const transport = new stdio_js_1.StdioServerTransport();
        await this.server.connect(transport);
        console.error('SanMar MCP server running on stdio');
    }
}
// --- Run the Server ---
const server = new SanMarMcpServer();
server.run().catch((err) => {
    console.error('Server failed to run:', err);
    process.exit(1);
});
