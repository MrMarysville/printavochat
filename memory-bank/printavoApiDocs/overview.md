# Printavo API v2.0 Overview

This document provides a general overview of the Printavo API v2.0, based on information scraped from `https://www.printavo.com/api/v2`.

## API Endpoint

All requests to Printavo API v2.0 should be made to:

`https://www.printavo.com/api/v2`

## Authentication

Authentication is handled via headers included in each request:

```javascript
const headers = {
  'Content-Type': 'application/json',
  'email': '{{youremail@email.com}}', // Replace with your Printavo account email
  'token': '{{API token from My Account page}}' // Replace with your API token
};
```

## Rate Limiting

The API enforces rate limiting:
*   Maximum of **10 requests every 5 seconds** per user email or IP address.

## GraphQL Basics

The Printavo API v2.0 uses GraphQL. Key concepts include:

*   **Types:** Data models in GraphQL (e.g., `Invoice`, `CustomerAddress`).
*   **Fields:** Information stored within types. Requests specify exactly which fields are needed.
*   **Queries:** Used to fetch data. See [Query Documentation](https://www.printavo.com/docs/api/v2/operation/query.md) (Note: This link returned 404 during scraping).
*   **Mutations:** Used to modify data. See [Mutation Documentation](https://www.printavo.com/docs/api/v2/mutation.md).
*   **Connections & Nodes:** Collections of data objects (like Customers or Invoices) are returned in a `Connection`. Each individual object within the connection is a `Node`.
*   **Pagination:**
    *   Connections are paginated, typically 25 nodes per page by default.
    *   Connections report `totalNodes`.
    *   Use arguments like `first: N`, `last: N`, `after: cursor`, `before: cursor` for pagination control.
    *   Example: `tasks(first: 5) { nodes { id } }`
*   **Aliasing:** Allows renaming queries, mutations, or fields in the response for clarity or to avoid naming conflicts.
    *   Example Query: `query { taskAlias: tasks { nodes { nameAlias: name } } }`
    *   Example Response: `{ "data": { "taskAlias": { "nodes": [ { "nameAlias": "..." } ] } } }`
*   **Conventions (`!`):**
    *   **Arguments:** `!` indicates a required argument (e.g., `task(id: ID!)`).
    *   **Return Fields:** `!` indicates a non-nullable field. For connections, it means a connection object will always be returned, even if empty (e.g., `fees (FeeConnection!)`).

For more details, refer to the official [GraphQL documentation](https://graphql.org/learn).
