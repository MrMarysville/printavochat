# Printavo GraphQL MCP Server Tests

This directory contains comprehensive test scripts for verifying the functionality of the Printavo GraphQL MCP server.

## Test Scripts

1. **test-all-tools.js**
   - Tests all available tools in the MCP server
   - Verifies basic connectivity, read operations, write operations, convenience tools, and SanMar integration
   - Creates test entities in Printavo for verification

2. **test-individual-tool.js**
   - Tests a single tool with custom parameters
   - Useful for debugging specific tool issues

3. **test-sanmar-integration.js**
   - Focuses specifically on testing the SanMar integration features
   - Creates quotes with SanMar products and verifies line item size updates

## MCP Endpoint Configuration

By default, all tests assume the MCP server is running at `http://localhost:3000/mcp`. If your server is running at a different URL, you'll need to update the `BASE_URL` constant in each test script.

## Running the Tests

### Prerequisites

1. Make sure you have Node.js installed
2. Install dependencies: `npm install`
3. Create a `.env` file with your Printavo credentials:
   ```
   PRINTAVO_API_URL=https://www.printavo.com/api/v2
   PRINTAVO_EMAIL=your-email@example.com
   PRINTAVO_TOKEN=your-api-token
   ```
4. Start the MCP server: `npm start`

### Running All Tests

```bash
npm test
```

This will run all tests defined in `test-all-tools.js` and output the results.

### Testing an Individual Tool

```bash
npm run test:individual get_customer '{"id": "customer-id-here"}'
```

Replace `get_customer` with the name of the tool you want to test, and provide the required parameters as a JSON string.

### Testing SanMar Integration

```bash
npm run test:sanmar
```

This will run a comprehensive test of the SanMar integration features, including creating quotes with SanMar products and updating line item sizes.

## Test Entity Management

The tests create temporary entities in your Printavo account for testing purposes. These include:

- Quotes
- Line items
- Invoices

The test script does not delete these entities after testing, so you may want to clean them up manually in your Printavo account. You can identify test entities by the notes and tags they contain, which typically include phrases like "test", "testing", or "MCP test script".

## Troubleshooting

If you encounter issues with the tests:

1. Check that the MCP server is running and accessible
2. Verify your Printavo credentials in the `.env` file
3. Make sure you have sufficient permissions in your Printavo account
4. Check the MCP server logs for error messages
5. Try testing individual tools to isolate the issue 