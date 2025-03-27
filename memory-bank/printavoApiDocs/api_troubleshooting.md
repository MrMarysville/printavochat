# Printavo API Troubleshooting Guide

## Common Issues and Solutions

### Authentication Errors

**Symptoms:**
- 401 Unauthorized errors
- "Authentication failed" messages in logs
- Empty responses from API calls

**Solutions:**
1. **Check Environment Variables**:
   - Ensure `NEXT_PUBLIC_PRINTAVO_EMAIL` and `NEXT_PUBLIC_PRINTAVO_TOKEN` are set correctly in `.env.local`
   - Values should match your Printavo account credentials
   - Do not use quotes around the values

2. **Header Format**:
   - Printavo API requires `email` and `token` headers (not Bearer token)
   - Double-check header format in all API clients (GraphQL and REST)

3. **API URL**:
   - Confirm `NEXT_PUBLIC_PRINTAVO_API_URL` is correct (typically `https://www.printavo.com/api/v2`)
   - GraphQL endpoint should be `${API_URL}/graphql`

4. **Token Expiration**:
   - Printavo tokens might expire; regenerate if necessary
   - Check your Printavo account settings for token management

### Connection Issues

**Symptoms:**
- Network errors
- Timeouts
- CORS errors in browser

**Solutions:**
1. **Network Connectivity**:
   - Verify network connection
   - Check if Printavo services are operational
   - Try using `/api/health` endpoint to diagnose connection issues

2. **CORS Issues**:
   - Use server-side API routes instead of direct browser calls
   - Routes like `/api/printavo` and `/api/health` proxy requests to avoid CORS

3. **Firewall/Proxy**:
   - Check if your network has restrictions on outbound connections
   - Configure any proxy settings if needed

### Data Retrieval Problems

**Symptoms:**
- Empty data responses
- Missing fields in responses
- Incorrect data formatting

**Solutions:**
1. **GraphQL Queries**:
   - Validate query syntax against the Printavo GraphQL schema
   - Use `printavodocs.json` as reference for valid fields and operations
   - Check if you're requesting all necessary fields

2. **ID Formats**:
   - Ensure IDs are in the correct format
   - Visual IDs might need to be normalized or handled differently than database IDs
   - Check the validation in `validateId` functions

3. **API Versions**:
   - Confirm you're using the correct API version
   - Some fields or operations may differ between versions

## Diagnosing Issues

### Using the Health Check

The application provides a health check endpoint at `/api/health`. Use it to test API connectivity:

```typescript
// Example health check response
{
  "status": "ok",
  "timestamp": "2023-08-25T12:34:56.789Z",
  "printavoApi": {
    "connected": true,
    "account": {
      "id": "123456",
      "companyName": "Your Company",
      "companyEmail": "company@example.com"
    },
    "message": "Connected successfully"
  }
}
```

### Logging

Enable detailed logging by setting the log level in the logger configuration:

```typescript
// In logger.ts
const logLevel = process.env.LOG_LEVEL || 'info';
```

Available log levels: `error`, `warn`, `info`, `debug`

### Error Types

The application uses specific error types for different scenarios:

- `PrintavoAuthenticationError`: Authentication issues (401)
- `PrintavoValidationError`: Invalid request parameters (400)
- `PrintavoNotFoundError`: Resource not found (404)
- `PrintavoRateLimitError`: Rate limiting hit (429)
- `PrintavoAPIError`: Generic API errors

## Rate Limiting

Printavo API has rate limits. The application implements:

1. **Retry with Exponential Backoff**:
   - Automatic retries with increasing delays
   - Honors `Retry-After` headers when provided

2. **Optimized Requests**:
   - Batching related operations
   - Limiting query sizes
   - Careful pagination

3. **Response Caching**:
   - Consider caching frequently accessed, rarely changed data
   - Implement cache invalidation strategies based on your needs

## Testing API Integration

Use the provided test utilities to verify API integration:

```bash
# Test GraphQL client
npm run test:api-graphql

# Test specific operations
npm run test:orders
```

These tests use mocked responses to simulate various API scenarios.

## Additional Resources

- [Printavo API Documentation](https://help.printavo.com/en/articles/4020819-api-documentation)
- [GraphQL Request Library Docs](https://github.com/prisma-labs/graphql-request)
- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables) 