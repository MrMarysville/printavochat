# Printavo GraphQL MCP Server

## Overview
The Printavo GraphQL MCP (Model Context Protocol) server is a bridge that allows AI assistants to interact with the Printavo API through standardized tools. It provides a structured way to access and manipulate Printavo data through GraphQL.

## Location
The server is located at:
`~/UsersKingDocumentsClineMCPprintavo-graphql-mcp-server/`

## Configuration
The server is configured using environment variables:
- `PRINTAVO_EMAIL`: The email used for Printavo authentication (sales@kingclothing.com)
- `PRINTAVO_TOKEN`: The API token for Printavo authentication
- `PRINTAVO_API_URL`: The base URL for the Printavo API (https://www.printavo.com/api/v2)

## Structure
The server consists of several key files:
- `src/index.ts`: Main server file containing tool registration and server configuration
- `src/tools.ts`: Implementation of all MCP tools, both read and write operations
- `src/queries.ts`: GraphQL queries and mutations definitions
- `src/types.ts`: TypeScript interfaces for Printavo data types
- `src/inputTypes.ts`: TypeScript interfaces for Printavo mutations inputs
- `src/convenience.ts`: Higher-level convenience tools that combine multiple operations

## Implemented Tools

### Basic Read Operations
- `get_account`: Get the current account information
- `get_current_user`: Get the current user information
- `get_customer`: Get a customer by ID
- `get_contact`: Get a contact by ID
- `get_order`: Get an order by ID
- `get_order_by_visual_id`: Get an order by visual ID
- `get_quote`: Get a quote by ID
- `get_invoice`: Get an invoice by ID
- `get_line_item`: Get a line item by ID
- `get_line_item_group`: Get a line item group by ID
- `get_status`: Get a status by ID
- `get_task`: Get a task by ID
- `get_inquiry`: Get an inquiry by ID
- `get_transaction`: Get a transaction by ID
- `get_merch_store`: Get a merch store by ID
- `get_thread`: Get a thread by ID
- `list_orders`: List orders with optional sorting
- `list_invoices`: List invoices with optional sorting
- `list_quotes`: List quotes with optional sorting
- `list_customers`: List customers
- `list_contacts`: List contacts with optional sorting
- `list_products`: List products with optional search query
- `list_tasks`: List tasks with optional sorting
- `list_inquiries`: List inquiries
- `list_transactions`: List transactions
- `list_statuses`: List statuses with optional type filter
- `search_orders`: Search orders by query string

### Basic Write Operations
- `update_status`: Update the status of an order, quote, or invoice
- `contact_create`: Create a new contact for a customer
- `contact_update`: Update an existing contact
- `customer_create`: Create a new customer
- `customer_update`: Update an existing customer
- `quote_create`: Create a new quote
- `quote_update`: Update an existing quote
- `quote_duplicate`: Duplicate an existing quote
- `invoice_update`: Update an existing invoice
- `invoice_duplicate`: Duplicate an existing invoice
- `line_item_create`: Create a new line item
- `line_item_creates`: Create multiple line items
- `line_item_update`: Update an existing line item
- `line_item_delete`: Delete a line item
- `inquiry_create`: Create a new inquiry
- `task_create`: Create a new task
- `custom_address_create`: Create a custom address
- `custom_address_update`: Update a custom address
- `transaction_payment_create`: Create a payment transaction

### Higher-Level Convenience Tools
These tools combine multiple API operations into single, powerful workflows:

- `get_order_summary`: Get a comprehensive order summary with all related information
  - Retrieves complete order details, line items, customer and contact information
  - Includes transaction history
  - Builds an event timeline with key milestones
  - Calculates additional metrics like days since creation and days until due

- `create_quote_with_items`: Create a new quote with customer, line items, and settings in one operation
  - Creates the base quote with all settings
  - Adds all line items to the appropriate line item group
  - Returns the complete updated quote with created line items

- `search_customer_detail`: Search for customers and get comprehensive information
  - Finds customers by name, email, or phone
  - Includes all contacts for each customer
  - Retrieves order history and calculates customer metrics
  - Provides insights like total spent, average order value, and order frequency

- `convert_quote_to_invoice`: Convert a quote to an invoice in one step
  - Duplicates the quote as an invoice
  - Optionally updates the status
  - Returns both the original quote and new invoice

- `create_customer_with_details`: Create a complete customer entry with one call
  - Creates the customer record
  - Adds the primary contact
  - Creates and associates shipping/billing address
  - Returns the complete customer with all related records

- `get_order_analytics`: Get detailed order analytics and metrics
  - Analyzes orders within a specified time period
  - Groups orders by status
  - Provides key metrics like average order value and revenue per day
  - Includes time-based comparisons (last week, last month)

- `get_customer_analytics`: Get sophisticated customer segmentation with RFM analysis
  - Segments customers into categories like "Champions," "Loyal Customers," "At Risk"
  - Uses recency, frequency, and monetary value dimensions
  - Calculates segment metrics including revenue contribution
  - Provides individual customer analysis and lifecycle stage

- `process_payment`: Process a payment for an order in one step
  - Creates the payment transaction
  - Checks if the order is paid in full
  - Optionally updates the order status
  - Returns payment details and remaining balance

- `get_product_analytics`: Get comprehensive product data and sales analytics
  - Analyzes product usage across orders
  - Tracks sales trends over time periods (30/60/90 days)
  - Identifies top customers for each product
  - Calculates key metrics like monthly average sales

## Usage
To use the MCP server:
1. Ensure it is running (`npm start` in the server directory)
2. Connect an MCP-compatible AI assistant to the server
3. The AI can then use the registered tools to interact with Printavo

## Known Issues
- **MCP host update issue**: The MCP host system (like Cursor or other applications that integrate the MCP server) may not recognize code changes after rebuilds. This often requires a complete restart of the host application to clear cached processes.

## Development Path

## Latest Updates
- Modified `src/index.ts`: Removed extra closing brace after the "update_status" tool definition.
- Refactored the "get_account" tool handler so it returns proper account information instead of mistakenly including tool definitions.

### Implemented
- Basic server structure with MCP protocol support
- Environment variable configuration with fallback options
- Error handling for GraphQL requests
- All read operations for Printavo entities
- All write operations corresponding to Printavo mutations

### Current Status
- Server is fully functional and running
- All required tools have been implemented
- Server properly authenticates with Printavo API
- Configuration is flexible with environment variables

## Technical Details
- The server uses the MCP protocol to expose tools to AI assistants
- GraphQL is used to communicate with the Printavo API
- TypeScript is used for type safety
- The server registers tools with the MCP host to make them available to AI assistants
- Each tool corresponds to a specific GraphQL query or mutation
- Higher-level convenience tools include robust error handling and standardized response formats

## Troubleshooting
If you encounter issues:
1. Check that the Printavo credentials are correct in the `.env` file
2. Ensure the server is running (`npm start`)
3. If the MCP host doesn't recognize new tools, restart the host application
4. Check the server logs for errors in GraphQL requests
5. For convenience tools, check the detailed error messages in the response

## Future Enhancements
- Add additional tools for missing single-entity operations (e.g., product, merchOrder, transactionDetail) and list queries for contacts, customers, inquiries, invoices, merchStores, paymentRequests, quotes, tasks, threads, and transactions.
- Implement robust error handling improvements with retries, timeouts, and better error classification.
- Integrate a GraphQL schema validator to proactively detect API changes.
- Enhance logging capabilities and collect performance metrics for API calls.
- Improve configuration to support multiple API versions and fallback strategies.
- Automate integration testing for the MCP server tools to streamline future updates.
