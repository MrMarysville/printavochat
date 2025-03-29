# Printavo-SanMar Integration Tests

This repository contains a suite of tests for validating the integration between Printavo and SanMar. The tests cover various aspects of the integration, from order lookup to inventory checking and quote creation.

## Tests Included

- Order lookup by visual ID
- Product information retrieval
- Inventory checking
- Quote creation with SanMar products
- Size updates for line items
- Handling inventory warnings
- Error handling for non-existent products and unavailable colors
- Product-specific tests for PC61 and ST850 styles

## Test Files

- `printavo-tests.js` - Comprehensive tests using mock data
- `st850-test.js` - Tests specific to the ST850 Sport-Tek Pullover Hoodie
- `dt6000-test.js` - Tests specific to the District DT6000 Very Important Tee, including decoration options
- `mcp-direct-test.js` - Tests for the MCP direct implementation
- `real-sanmar-test.js` - Tests using real API data (requires API credentials)
- `mcp-server-test.js` - Tests for MCP server implementation
- `run-all-tests.js` - Master test runner that executes all test files

## Running Tests

### Using the Master Test Runner

The easiest way to run all tests is to use the master test runner:

```bash
node run-all-tests.js
```

This will automatically:
1. Verify all test files exist
2. Run each test file in sequence
3. Provide a summary of test results, including pass/fail status and execution time

### Using Mock Data

To run tests with mock data:

```bash
node printavo-tests.js
```

This will run all tests using mock data without making actual API calls.

### Using Real API Data

To run tests with real API data:

1. Edit `real-sanmar-test.js` and update the configuration:
   ```javascript
   const config = {
     API_URL: 'your-printavo-api-url',
     EMAIL: 'your-email',
     TOKEN: 'your-api-token'
   };
   ```

2. Run the tests:
   ```bash
   node real-sanmar-test.js
   ```

### Running Product-Specific Tests

For testing specific SanMar products:

```bash
node st850-test.js  # For testing the ST850 Sport-Tek Pullover Hoodie
node dt6000-test.js # For testing the District DT6000 Very Important Tee
```

## Implementation

### Test Structure

Each test file follows a similar structure:

1. Configuration and setup
2. Mock data or API client initialization
3. API functions for interacting with Printavo and SanMar
4. Test runner function that executes tests in sequence
5. Detailed logging for test results

### Extending Tests

To add new tests:

1. Create a new test file following the existing pattern
2. Add the file to the `TEST_FILES` array in `run-all-tests.js`
3. Run the tests to ensure everything works correctly

### API Methods

The tests cover the following SanMar API methods:

- **Get Order by Visual ID**: Retrieves an order using its visual ID
- **Get Product Information**: Retrieves details about a SanMar product
- **Check Product Inventory**: Checks inventory levels for specific products and colors
- **Create Quote with SanMar Products**: Creates a quote with SanMar products
- **Update Line Item Sizes**: Updates sizes for a line item in a quote

## Troubleshooting

### Common Issues

- **API Authentication Errors**: Ensure your API credentials are correct in the configuration
- **404 Errors**: Verify that the API endpoints are correct
- **HTML Responses**: Check that the API requests are properly formatted and not hitting frontend routes

### Running MCP Server Tests

To run tests against the MCP server:

1. Start the MCP server:
   ```bash
   cd path/to/mcp-server
   npm start
   ```

2. In another terminal, run the tests:
   ```bash
   node mcp-server-test.js
   ```

## Test Implementation Details

The tests are designed with a clear separation between the API layer and the test logic. The `PrintavoAPI` object contains all API-related functionality and can be modified to use real API calls when `USE_REAL_API` is set to true.

Each API method follows this pattern:

```javascript
method: async (params) => {
  if (USE_REAL_API) {
    // Real API implementation
    // TODO: Implement this when needed
  } else {
    // Mock implementation using MOCK_DATA
  }
}
```

This makes it easy to switch between mock data and real API calls without changing the test logic.

## SanMar API Methods

The following methods are implemented and tested:

- `getOrderByVisualId(visualId)` - Retrieves an order by its visual ID
- `getSanMarProductInfo(styleNumber)` - Gets product information for a SanMar style
- `checkSanMarInventory(styleNumber, color)` - Checks inventory for a specific style and color
- `createQuoteWithSanmarProducts(customerId, contactId, sanmarItems, settings)` - Creates a quote with SanMar products
- `updateLineItemSizes(lineItemId, sizes)` - Updates the sizes for a line item

## Extending the Tests

To add more tests:

1. Add new methods to the `PrintavoAPI` object
2. Add new test cases to the `runTests()` function
3. Add any necessary mock data to the `MOCK_DATA` object

## MCP Server Tests

The `mcp-server-test.js` file tests the MCP server implementation. To run these tests:

1. Make sure the MCP server is running (on port 3000 by default)
2. Run the tests:

```bash
node mcp-server-test.js
```

Note that the MCP server tests require a running MCP server with proper authentication to the Printavo API. 