# OpenAI Agents for Printavo and SanMar Integration

This directory contains a comprehensive agent system built with OpenAI to interact with Printavo's GraphQL API and SanMar's SOAP and FTP services. The agents provide a unified, reliable, and maintainable way to access these external services.

## Architecture

The agent system is organized into three main components:

1. **Agent Manager**: Coordinates between different agents and provides a unified interface.
2. **Specialized Agents**: Individual agents for each service (Printavo, SanMar, SanMar FTP).
3. **Tool Implementations**: Service-specific tools that implement actual functionality.

```
agents/
├── index.ts                # Main entry point and AgentManager
├── agent-base.ts           # Base Agent class with common functionality
├── printavo/               # Printavo GraphQL agent
│   ├── index.ts            # PrintavoAgent class
│   ├── graphql-client.ts   # GraphQL client with error handling
│   ├── queries.ts          # GraphQL queries and mutations
│   └── tools.ts            # Printavo-specific tools
├── sanmar/                 # SanMar SOAP agent
│   ├── index.ts            # SanMarAgent class
│   ├── soap-client.ts      # SOAP client implementation
│   └── tools.ts            # SanMar-specific tools
└── sanmar-ftp/             # SanMar FTP agent
    ├── index.ts            # SanMarFTPAgent class
    ├── ftp-client.ts       # FTP client implementation
    └── tools.ts            # FTP-specific tools
```

## Agent Manager

The `AgentManager` class is the main entry point for using the agent system. It provides:

- A unified interface for executing operations on any agent
- Coordination between different agents for complex operations
- Smart routing of operations to the appropriate agent

## Using the Agents

### Environment Variables

The agent system requires several environment variables to be set:

```
# OpenAI API key
OPENAI_API_KEY=your_openai_api_key

# Printavo API credentials
PRINTAVO_API_URL=https://www.printavo.com/api/v2
PRINTAVO_EMAIL=your_printavo_email
PRINTAVO_TOKEN=your_printavo_token

# SanMar API credentials
SANMAR_USERNAME=your_sanmar_username
SANMAR_PASSWORD=your_sanmar_password
SANMAR_CUSTOMER_NUMBER=your_sanmar_customer_number
SANMAR_CUSTOMER_IDENTIFIER=your_sanmar_customer_identifier

# SanMar FTP credentials
SANMAR_FTP_HOST=ftp.sanmar.com
SANMAR_FTP_USERNAME=your_sanmar_ftp_username
SANMAR_FTP_PASSWORD=your_sanmar_ftp_password
SANMAR_FTP_PORT=22
```

### Basic Usage

```typescript
import { AgentManager } from './agents';

// Create an agent manager
const agentManager = new AgentManager();

// Execute an operation on the Printavo agent
const order = await agentManager.executeOperation('printavo_get_order', { id: 'order_id' });

// Execute an operation on the SanMar agent
const product = await agentManager.executeOperation('sanmar_get_product_info', {
  styleNumber: 'PC61',
  color: 'Black',
  size: 'L'
});

// Get the status of all agents
const status = agentManager.getStatus();
```

### REST API

The system includes a Next.js API route at `/api/agent` that exposes the agent functionality via REST:

```typescript
// POST /api/agent
// Request body:
{
  "operation": "printavo_get_order",
  "params": { "id": "order_id" }
}

// Response:
{
  "success": true,
  "data": { ... } // Operation result
}
```

```typescript
// GET /api/agent
// Response:
{
  "success": true,
  "status": {
    "printavo": { ... },
    "sanmar": { ... },
    "sanmarFTP": { ... }
  }
}
```

## Available Operations

### Printavo Operations

- `printavo_get_account`: Get information about the current Printavo account
- `printavo_get_current_user`: Get information about the current Printavo user
- `printavo_get_order`: Get an order by ID
- `printavo_get_order_by_visual_id`: Get an order by its visual ID
- `printavo_search_orders`: Search for orders by query string
- `printavo_list_orders`: List orders with pagination
- `printavo_get_customer`: Get a customer by ID
- `printavo_get_customer_by_email`: Get a customer by email
- `printavo_create_customer`: Create a new customer
- `printavo_create_quote`: Create a new quote
- `printavo_update_status`: Update the status of an order, quote, or invoice
- `printavo_list_statuses`: List available statuses

### SanMar Operations

- `sanmar_get_product_info`: Get product information by style number, color, and size
- `sanmar_get_product_sellable`: Get sellable products with colors and sizes
- `sanmar_get_inventory`: Get inventory levels for a product
- `sanmar_get_product_media`: Get media content for a product
- `sanmar_get_product_pricing`: Get pricing information for a product
- `sanmar_create_purchase_order`: Create a purchase order
- `sanmar_get_purchase_order_status`: Get the status of a purchase order
- `sanmar_check_product_availability`: Check if a product is available and get pricing information

### SanMar FTP Operations

- `sanmar_ftp_list_files`: List files in a directory on the SanMar FTP server
- `sanmar_ftp_download_file`: Download a file from the SanMar FTP server
- `sanmar_ftp_upload_file`: Upload a file to the SanMar FTP server
- `sanmar_ftp_delete_file`: Delete a file from the SanMar FTP server
- `sanmar_ftp_download_and_parse_inventory`: Download and parse the latest inventory file
- `sanmar_ftp_download_and_parse_products`: Download and parse the latest products file
- `sanmar_ftp_check_product_inventory`: Check inventory for specific products

## Extending the System

### Adding a New Agent

1. Create a new directory for your agent (e.g., `agents/new-service/`)
2. Create the required files (index.ts, client.ts, tools.ts)
3. Implement the agent class extending the base Agent class
4. Register tools with the agent
5. Add the agent to the AgentManager

### Adding a New Tool

1. Find the appropriate agent for your tool
2. Add the tool to the agent's tools.ts file
3. Implement the tool handler function
4. (Optional) Add helper functions to the agent class for common use cases

## Testing

Use the `npm run test-agents` script to run a comprehensive test of all agents and their functionality.

## Error Handling

The agent system includes robust error handling:

- Custom error classes for different types of errors (Authentication, Validation, Not Found, Rate Limit)
- Automatic retries with exponential backoff for rate limiting
- Detailed error messages and logging
- Clear error responses with appropriate HTTP status codes

## Future Improvements

- Add caching layer for improved performance
- Implement more composite operations that use multiple agents
- Add support for OpenAI's function calling for more complex operations
- Enhance monitoring and logging

## OpenAI Assistants Integration

This project now supports using the OpenAI Assistants API for Printavo integration. The Assistants API provides:

- Improved conversation context management
- More reliable function calling
- Better memory and reasoning capabilities

### How to Use the Assistants API

1. Make sure you have set `USE_OPENAI_ASSISTANTS=true` in your `.env` file
2. The first time you run the application, an Assistant will be created and its ID will be logged to the console
3. Copy this ID and set it in your `.env` file as `PRINTAVO_ASSISTANT_ID` to avoid creating a new assistant on each restart

### Implementation Details

- `printavo-assistant.ts` - Defines the assistant tools and executes Printavo API operations
- `agent-client.ts` - Manages the assistant and thread lifecycle, handles tool execution
- `chat/route.ts` - API endpoint that uses the Assistants API when enabled

The Assistants API implements the same functionality as the custom agent system, but with more reliable conversational capabilities and tool execution. 