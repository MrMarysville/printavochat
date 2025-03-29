# Printavo GraphQL MCP Server

This is a Model Context Protocol (MCP) server for the Printavo GraphQL API. It allows AI assistants to interact with your Printavo account through standardized tools.

## Features

- Read operations:
  - Get account and user information
  - Retrieve and search orders, quotes, invoices
  - Access customers, contacts, line items
  - View tasks, inquiries, transactions

- Write operations:
  - Update statuses of orders, quotes, and invoices
  - Create and update customers and contacts
  - Create and manage quotes and invoices
  - Add, update, and delete line items
  - Create inquiries, tasks, and addresses
  - Process payments

## Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Configure environment variables:
   - Create a `.env` file with the following variables:
     ```
     PRINTAVO_API_URL=https://www.printavo.com/api/v2
     PRINTAVO_EMAIL=your-printavo-email
     PRINTAVO_TOKEN=your-printavo-token
     ```
4. Start the server: `npm start`

## Available Tools

### Authentication

#### login

Authenticate with Printavo and get an access token.

**Parameters:**
- `email` (string, required): User email
- `password` (string, required): User password
- `device_name` (string, required): Name of the device making the request
- `device_token` (string, optional): Device token for push notifications

**Example:**
```json
{
  "email": "user@example.com",
  "password": "secure-password",
  "device_name": "MCP Server"
}
```

**Response:**
```json
{
  "token": "your-access-token",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "Jane Smith",
    "role": "owner"
  }
}
```

### Read Operations

#### get_account

Get the current account information.

**Parameters:** None

**Example:**
```json
{}
```

**Response:**
```json
{
  "id": "123",
  "name": "My Print Shop",
  "email": "info@myprintshop.com"
}
```

#### get_order

Get an order by ID.

**Parameters:**
- `id` (string, required): Order ID

**Example:**
```json
{
  "id": "order-123"
}
```

**Response:**
```json
{
  "id": "order-123",
  "visualId": "1234",
  "total": "500.00",
  "status": {
    "id": "status-1",
    "name": "Confirmed"
  }
}
```

#### search_orders

Search orders by query string.

**Parameters:**
- `query` (string, required): Search query
- `first` (number, optional, default: 10): Number of results to retrieve

**Example:**
```json
{
  "query": "company t-shirts",
  "first": 5
}
```

**Response:**
```json
[
  {
    "id": "order-123",
    "visualId": "1234",
    "total": "500.00",
    "customer": {
      "companyName": "ABC Company"
    }
  },
  {
    "id": "order-456",
    "visualId": "1235",
    "total": "750.00",
    "customer": {
      "companyName": "XYZ Inc"
    }
  }
]
```

### Write Operations

#### update_status

Update the status of an order, quote, or invoice.

**Parameters:**
- `parent_id` (string, required): ID of the order, quote, or invoice
- `status_id` (string, required): ID of the status to set

**Example:**
```json
{
  "parent_id": "order-123",
  "status_id": "status-2"
}
```

**Response:**
```json
{
  "statusUpdate": true
}
```

#### production_file_create

Upload a production file to an order, quote, or invoice.

**Parameters:**
- `parent_id` (string, required): ID of the order, quote, or invoice to attach the file to
- `public_file_url` (string, required): Publicly accessible URL of the file to upload

**Example:**
```json
{
  "parent_id": "order-123",
  "public_file_url": "https://example.com/files/artwork.pdf"
}
```

**Response:**
```json
{
  "id": "file-123",
  "fileUrl": "https://printavo-files.s3.amazonaws.com/artwork.pdf",
  "name": "artwork.pdf",
  "mimeType": "application/pdf"
}
```

### Convenience Tools

#### get_order_summary

Get a comprehensive order summary with all related information.

**Parameters:**
- `id` (string, required): Order ID

**Example:**
```json
{
  "id": "order-123"
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "order-123",
    "visualId": "1234",
    "total": "500.00"
  },
  "lineItems": [...],
  "customer": {...},
  "contact": {...},
  "transactions": [...],
  "timeline": [...],
  "summary": {
    "invoiceNumber": "1234",
    "customerName": "ABC Company",
    "totalAmount": "500.00",
    "amountPaid": "250.00",
    "amountDue": "250.00",
    "status": "Confirmed",
    "createdAt": "2023-01-15T12:00:00Z",
    "dueAt": "2023-02-15T12:00:00Z",
    "isPaid": false,
    "daysSinceCreation": 30,
    "daysUntilDue": 15
  }
}
```

#### create_quote_with_items

Create a new quote with customer, line items, and optional settings in one operation.

**Parameters:**
- `customer_id` (string, required): Customer ID
- `contact_id` (string, required): Contact ID
- `line_items` (array, required): Array of line item objects
- `settings` (object, optional): Optional settings for the quote

**Example:**
```json
{
  "customer_id": "customer-123",
  "contact_id": "contact-456",
  "line_items": [
    {
      "product": "T-Shirt",
      "color": "Blue",
      "sizes": "S(5), M(10), L(5)",
      "price": 15.00,
      "description": "Company logo on front"
    }
  ],
  "settings": {
    "customerNote": "Rush order",
    "productionNote": "Print front only"
  }
}
```

**Response:**
```json
{
  "success": true,
  "quote": {...},
  "lineItems": [...],
  "message": "Quote created successfully with all line items"
}
```

## Testing

The server includes comprehensive test scripts to verify functionality:

### Running Tests

```bash
# Run all tests
npm test

# Test a specific tool
npm run test:individual get_customer '{"id": "customer-id-here"}'

# Test SanMar integration
npm run test:sanmar
```

### Available Test Scripts

- `test-all-tools.js`: Tests all MCP server tools
- `test-individual-tool.js`: Tests a single tool with custom parameters
- `test-sanmar-integration.js`: Tests SanMar integration capabilities

See the [tests/README.md](./tests/README.md) file for detailed testing information.

## Error Handling

The server implements robust error handling with different error types:

- `PrintavoAuthenticationError`: For authentication failures
- `PrintavoValidationError`: For parameter validation issues
- `PrintavoRateLimitError`: For rate limiting situations
- `PrintavoApiError`: For general API errors

All errors include detailed information about what went wrong and how to fix it.

## Rate Limiting

The server includes automatic rate limiting management:

- Respects Printavo API rate limits
- Implements exponential backoff for retries
- Handles the Retry-After header
- Limits request frequency
- Provides detailed logging of rate limit events

## Parameter Validation

All tool parameters are validated before execution:

- Required parameters are checked
- Type validation ensures correct data types
- Helpful error messages guide proper usage

## License

MIT 