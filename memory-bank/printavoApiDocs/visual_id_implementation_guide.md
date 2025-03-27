# Visual ID Search Implementation Guide

This document provides concrete code examples for implementing the Visual ID search strategy correctly in the Printavo Chat application. The examples address the issues identified in the implementation review.

## Current Issues

1. **Incomplete Implementation**: The current implementation only tries the `invoices` endpoint and doesn't have the fallback to `quotes` endpoint as specified in the documentation.
2. **Missing Visual ID Field**: The `visualId` field is inconsistently included across different queries.

## Correct Implementation

### 1. Update GraphQL Queries

First, ensure that all relevant queries include the `visualId` field:

#### Order Query

```typescript
// In lib/graphql/queries.ts or lib/graphql/queries/orderQueries.ts
const order = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      ... on Quote {
        id
        visualId  // Add this field
        name
        // other fields...
      }
      ... on Invoice {
        id
        visualId  // Add this field
        name
        // other fields...
      }
    }
  }
`;
```

#### Orders Query

```typescript
// In lib/graphql/queries.ts or lib/graphql/queries/orderQueries.ts
const orders = gql`
  query SearchOrders($query: String, $first: Int) {
    orders(query: $query, first: $first) {
      edges {
        node {
          id
          visualId  // Add this field
          name
          // other fields...
        }
      }
    }
  }
`;
```

#### Invoices Query

```typescript
// In lib/graphql/queries.ts or lib/graphql/queries/orderQueries.ts
const invoices = gql`
  query SearchInvoices($query: String, $first: Int) {
    invoices(query: $query, first: $first) {
      edges {
        node {
          id
          visualId  // Add this field
          name
          // other fields...
        }
      }
    }
  }
`;
```

#### Quotes Query

```typescript
// In lib/graphql/queries.ts or lib/graphql/queries/orderQueries.ts
const quotes = gql`
  query SearchQuotes($query: String, $first: Int) {
    quotes(query: $query, first: $first) {
      edges {
        node {
          id
          visualId  // Add this field
          name
          // other fields...
        }
      }
    }
  }
`;
```

### 2. Implement Multi-tiered Search Strategy

Update the `getOrderByVisualId` function to implement the multi-tiered approach:

```typescript
// In lib/graphql/operations/orders.ts

/**
 * Gets an order by its Visual ID (4-digit identifier)
 * 
 * Implements a multi-tiered approach:
 * 1. Primary: Query invoices endpoint
 * 2. Fallback: Query quotes endpoint
 * 3. Last resort: Try orders endpoint
 * 
 * @param visualId The 4-digit visual ID to search for
 */
export async function getOrderByVisualId(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  // Generate a cache key for this visual ID
  const cacheKey = `order_visual_id_${visualId}`;
  
  // Check if we have a cached result
  const cachedResult = cache.get<PrintavoAPIResponse<PrintavoOrder>>(cacheKey);
  if (cachedResult) {
    logger.info(`Using cached result for order with Visual ID: ${visualId}`);
    return cachedResult;
  }

  try {
    logger.info(`Fetching order with Visual ID: ${visualId}`);
    
    // TIER 1: Try invoices endpoint (primary method)
    try {
      logger.info(`[TIER 1] Trying invoices endpoint for Visual ID: ${visualId}`);
      const invoiceResult = await query<{ invoices: { edges: Array<{ node: PrintavoOrder }> } }>(
        QUERIES.invoices, 
        { query: visualId.trim(), first: 5 }
      );
      
      // Check if we found any invoices
      if (invoiceResult.data?.invoices?.edges && invoiceResult.data.invoices.edges.length > 0) {
        // Find an exact match for the visual ID
        const exactMatch = invoiceResult.data.invoices.edges.find(
          edge => edge.node.visualId === visualId
        );
        
        if (exactMatch) {
          logger.info(`[TIER 1] Found exact match in invoices for Visual ID: ${visualId}`);
          const response = { data: exactMatch.node, success: true };
          cache.set(cacheKey, response);
          return response;
        }
        
        // If no exact match but we have results, use the first one
        logger.info(`[TIER 1] No exact match in invoices, using first result for Visual ID: ${visualId}`);
        const response = { data: invoiceResult.data.invoices.edges[0].node, success: true };
        cache.set(cacheKey, response);
        return response;
      }
    } catch (error) {
      logger.warn(`[TIER 1] Error searching invoices for Visual ID ${visualId}:`, error);
      // Continue to next tier
    }
    
    // TIER 2: Try quotes endpoint (first fallback)
    try {
      logger.info(`[TIER 2] Trying quotes endpoint for Visual ID: ${visualId}`);
      const quoteResult = await query<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>(
        QUERIES.quotes, 
        { query: visualId.trim(), first: 5 }
      );
      
      // Check if we found any quotes
      if (quoteResult.data?.quotes?.edges && quoteResult.data.quotes.edges.length > 0) {
        // Find an exact match for the visual ID
        const exactMatch = quoteResult.data.quotes.edges.find(
          edge => edge.node.visualId === visualId
        );
        
        if (exactMatch) {
          logger.info(`[TIER 2] Found exact match in quotes for Visual ID: ${visualId}`);
          const response = { data: exactMatch.node, success: true };
          cache.set(cacheKey, response);
          return response;
        }
        
        // If no exact match but we have results, use the first one
        logger.info(`[TIER 2] No exact match in quotes, using first result for Visual ID: ${visualId}`);
        const response = { data: quoteResult.data.quotes.edges[0].node, success: true };
        cache.set(cacheKey, response);
        return response;
      }
    } catch (error) {
      logger.warn(`[TIER 2] Error searching quotes for Visual ID ${visualId}:`, error);
      // Continue to next tier
    }
    
    // TIER 3: Try orders endpoint (last resort)
    try {
      logger.info(`[TIER 3] Trying orders endpoint for Visual ID: ${visualId}`);
      const orderResult = await query<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>(
        QUERIES.orders, 
        { query: visualId.trim(), first: 5 }
      );
      
      // Check if we found any orders
      if (orderResult.data?.orders?.edges && orderResult.data.orders.edges.length > 0) {
        // Find an exact match for the visual ID
        const exactMatch = orderResult.data.orders.edges.find(
          edge => edge.node.visualId === visualId
        );
        
        if (exactMatch) {
          logger.info(`[TIER 3] Found exact match in orders for Visual ID: ${visualId}`);
          const response = { data: exactMatch.node, success: true };
          cache.set(cacheKey, response);
          return response;
        }
        
        // If no exact match but we have results, use the first one
        logger.info(`[TIER 3] No exact match in orders, using first result for Visual ID: ${visualId}`);
        const response = { data: orderResult.data.orders.edges[0].node, success: true };
        cache.set(cacheKey, response);
        return response;
      }
    } catch (error) {
      logger.warn(`[TIER 3] Error searching orders for Visual ID ${visualId}:`, error);
      // Continue to error handling
    }
    
    // If we get here, we didn't find anything in any of the tiers
    logger.warn(`No orders found with Visual ID: ${visualId} after trying all endpoints`);
    return { 
      data: undefined,
      errors: [{ message: `Order not found with Visual ID: ${visualId}` }],
      success: false, 
      error: new PrintavoNotFoundError(`Order not found with Visual ID: ${visualId}`) 
    };
  } catch (error) {
    logger.error(`Error fetching order with Visual ID ${visualId}:`, error);
    return {
      data: undefined,
      errors: [{ message: `Failed to fetch order with Visual ID: ${visualId}` }],
      success: false,
      error: handleAPIError(error, `Failed to fetch order with Visual ID: ${visualId}`)
    };
  }
}
```

### 3. Update Service Layer

Update the `printavo-service.ts` file to use the improved implementation:

```typescript
// In lib/printavo-service.ts

async getOrderByVisualId(visualId: string) {
  logger.info(`[PrintavoService] Getting order with visual ID: ${visualId}`);
  try {
    // Validate visual ID
    if (!visualId || typeof visualId !== 'string' || visualId.trim() === '') {
      throw new PrintavoValidationError(`Invalid visual ID: ${visualId}`, 400);
    }
    
    // Use the improved GraphQL client implementation
    const result = await operations.getOrderByVisualId(visualId);
    
    // If successful, return the result
    if (result.success && result.data) {
      return result;
    }
    
    // If the GraphQL implementation failed, log it and return the error
    logger.error(`[PrintavoService] Failed to find order with visual ID ${visualId}`);
    return {
      success: false,
      errors: [{ message: `Failed to find order with visual ID ${visualId}` }],
      error: result.error || new PrintavoNotFoundError(`Order not found with Visual ID: ${visualId}`)
    };
  } catch (error) {
    logger.error(`[PrintavoService] Error in getOrderByVisualId: ${error instanceof Error ? error.message : String(error)}`);
    
    let errorMessage = `Failed to find order with visual ID ${visualId}`;
    let errorInstance = error instanceof Error 
      ? error 
      : new Error(`Unknown error: ${error}`);
    
    logger.error(`[PrintavoService] ${errorMessage}`, errorInstance);
    return {
      success: false,
      errors: [{ message: errorMessage }],
      error: errorInstance
    };
  }
}
```

## Integration with User Query Processing

Update the `determineOperation` function in `operations.ts` to correctly handle Visual ID queries:

```typescript
// In lib/operations.ts

// Inside the determineOperation function
// Look specifically for 4-digit numbers that could be visual IDs
const visualIdMatch = messageLower.match(/\b(\d{4})\b/g);

// Also check for "id" or "ID" followed by digits
const idPrefixMatch = messageLower.match(/\bid\s*[:#]?\s*(\d{4})\b/i);

// Also check for "visual" followed by digits or "visual id" followed by digits
const visualPrefixMatch = messageLower.match(/\bvisual\s*(?:id)?\s*[:#]?\s*(\d{4})\b/i);

// Use the most specific match first
if (visualPrefixMatch || idPrefixMatch) {
  // Use non-null assertion since we've already checked that at least one of these is not null
  const matchToUse = (visualPrefixMatch || idPrefixMatch)!;
  const orderId = matchToUse[1];
  logger.info(`Detected potential visual ID with prefix: ${orderId}`);
  
  // Use the improved getOrderByVisualId function that implements the multi-tiered approach
  return createGetOrderOperation(orderId, messageLower, sentiment);
}
```

## Testing the Implementation

To verify that the Visual ID search strategy is working correctly, you can add tests:

```typescript
// In tests/visualIdSearch.test.ts

describe('Visual ID Search', () => {
  test('should find order by Visual ID using invoices endpoint', async () => {
    // Mock the invoices endpoint to return results
    // ...
    
    const result = await operations.getOrderByVisualId('1234');
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.visualId).toBe('1234');
  });
  
  test('should fall back to quotes endpoint if invoices endpoint returns no results', async () => {
    // Mock the invoices endpoint to return no results
    // Mock the quotes endpoint to return results
    // ...
    
    const result = await operations.getOrderByVisualId('1234');
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.visualId).toBe('1234');
  });
  
  test('should fall back to orders endpoint if both invoices and quotes endpoints return no results', async () => {
    // Mock the invoices endpoint to return no results
    // Mock the quotes endpoint to return no results
    // Mock the orders endpoint to return results
    // ...
    
    const result = await operations.getOrderByVisualId('1234');
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.visualId).toBe('1234');
  });
  
  test('should return error if no results found in any endpoint', async () => {
    // Mock all endpoints to return no results
    // ...
    
    const result = await operations.getOrderByVisualId('1234');
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(PrintavoNotFoundError);
  });
});
```

## Conclusion

By implementing the Visual ID search strategy as outlined above, the Printavo Chat application will have a more robust and reliable way to find orders by their Visual ID. The multi-tiered approach ensures that all possible endpoints are checked, and the consistent inclusion of the `visualId` field in all queries ensures that the application can correctly identify orders by their Visual ID.