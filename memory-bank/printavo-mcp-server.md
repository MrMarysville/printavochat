# Printavo GraphQL MCP Server

This document details the Printavo GraphQL MCP server created to interact with the Printavo API via the Model Context Protocol.

## Purpose

The server provides a set of tools that allow Cline (the AI assistant) to perform read and limited write operations against the Printavo GraphQL API (v2) on behalf of the user.

## Location

-   **Repository:** `C:/Users/King/Documents/Cline/MCP/printavo-graphql-mcp-server/`
-   **Executable:** `C:/Users/King/Documents/Cline/MCP/printavo-graphql-mcp-server/build/index.js`

## Configuration (in `cline_mcp_settings.json`)

```json
"printavo-graphql-mcp-server": {
  "command": "node",
  "args": [
    "C:\\Users\\King\\Documents\\Cline\\MCP\\printavo-graphql-mcp-server\\build\\index.js"
  ],
  "disabled": false,
  "autoApprove": [
    "search_orders",
    "get_account",
    "get_order",
    "get_customer",
    "get_order_by_visual_id",
    "get_current_user" // Renamed from get_user
    // Add other read-only tools here as they are implemented and tested
  ],
  "env": {
    "PRINTAVO_API_URL": "https://www.printavo.com/api/v2",
    "PRINTAVO_EMAIL": "sales@kingclothing.com", // Replace with actual user email if different
    "PRINTAVO_TOKEN": "rEPQzTtowT_MQVbY1tfLtg" // Replace with actual user token if different
  }
}
```

**Note:** Ensure `PRINTAVO_EMAIL` and `PRINTAVO_TOKEN` in the environment variables match the user's actual credentials.

## Implemented Tools (as of 2025-03-27)

### Read Operations (Queries)

*   **`get_account`**: Retrieves Printavo account information.
*   **`get_current_user`**: Retrieves information about the currently authenticated user.
*   **`get_order`**: Retrieves details for a specific order by its internal Printavo ID.
*   **`get_order_by_visual_id`**: Retrieves order details using the 4-digit Visual ID.
*   **`search_orders`**: Searches across orders (invoices/quotes) using a text query.
*   **`get_invoice`**: Retrieves details for a specific invoice by its internal Printavo ID.
*   **`get_quote`**: Retrieves details for a specific quote by its internal Printavo ID.
*   **`get_customer`**: Retrieves details for a specific customer by their internal Printavo ID.
*   **`get_contact`**: Retrieves details for a specific contact by their internal Printavo ID.
*   **`get_status`**: Retrieves details for a specific status by its internal Printavo ID.
*   **`list_statuses`**: Lists available statuses, optionally filtered by type (INVOICE, QUOTE, TASK).

### Write Operations (Mutations)

*   **`update_status`**: Updates the status of an existing order, quote, or invoice.

## Usage Notes

*   The server uses the credentials provided in the environment variables (`PRINTAVO_EMAIL`, `PRINTAVO_TOKEN`) for authentication.
*   API calls are made directly to the Printavo GraphQL endpoint specified by `PRINTAVO_API_URL`.
*   Error handling is basic; GraphQL errors or network issues will result in an MCP error response.
*   Currently, **creation** of new entities (like invoices or quotes) is **not** implemented.

## Development

*   **Build:** `npm run build --prefix C:/Users/King/Documents/Cline/MCP/printavo-graphql-mcp-server`
*   **Restart:** Requires toggling the `disabled` flag in `cline_mcp_settings.json` (disable then enable).
    *   **Known Issue (2025-03-27):** There is a persistent issue where the MCP host system does not reliably pick up code changes after rebuilds, even when toggling the `disabled` flag or attempting to kill the process. New tools may appear as "Unknown tool". A more complete restart of the host application or system might be required to resolve this.
*   **Dependencies:** `@modelcontextprotocol/sdk`, `node-fetch` (implicitly used by SDK or globally available).

## Future Enhancements

*   Implement remaining query tools based on `memory-bank/printavoApiDocs/results.json`.
*   Implement mutation tools (e.g., `quoteCreate`, `invoiceCreate`, `customerCreate`, `contactCreate`, `lineItemCreate`, etc.).
*   Add robust error handling (retries, timeouts).
*   Implement input validation based on API schema.
*   Add pagination support for list operations.
