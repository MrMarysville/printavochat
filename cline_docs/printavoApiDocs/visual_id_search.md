# Visual ID Search in Printavo Chat

## Overview

The Printavo Chat application allows users to search for orders using their Visual ID (a 4-digit identifier). This document explains how this functionality is implemented and the API endpoints used.

## API Endpoints

According to the Printavo API documentation, the following endpoints support search functionality:

1. **Invoices Endpoint** (`/query/invoices`)
   - Supports a `query` parameter for searching
   - Documented in the API specification
   - Preferred method for searching by Visual ID

2. **Quotes Endpoint** (`/query/quotes`)
   - Supports a `query` parameter for searching
   - Documented in the API specification
   - Used as a fallback if invoices search doesn't return results

3. **Orders Endpoint** (`/query/orders`)
   - Does NOT officially support a `query` parameter according to documentation
   - Used only as a last resort fallback

## Implementation Strategy

The application uses a multi-tiered approach to search for orders by Visual ID:

1. **Primary Method**: Query the `invoices` endpoint with the Visual ID as the `query` parameter
2. **First Fallback**: Query the `quotes` endpoint with the Visual ID as the `query` parameter
3. **Last Resort**: Try the `orders` endpoint with various parameter approaches

This strategy ensures maximum reliability while prioritizing documented API features.

## Natural Language Processing

The application supports various ways for users to reference Visual IDs:

1. Standalone 4-digit numbers (e.g., "1234")
2. Explicit Visual ID references (e.g., "visual id 1234")
3. Order references with Visual IDs (e.g., "find order with visual id 1234")

The `determineOperation` function in `operations.ts` handles the detection of these patterns and routes them to the appropriate search function.

## Error Handling

If a Visual ID search fails, the system:

1. Logs detailed error information
2. Tries alternative search methods
3. Returns a user-friendly error message if all methods fail

## Maintenance Notes

When updating the Visual ID search functionality:

1. Prioritize documented API endpoints (`invoices` and `quotes`)
2. Use undocumented features only as a last resort
3. Keep the fallback mechanisms in place for reliability
4. Update the natural language patterns if user query patterns change