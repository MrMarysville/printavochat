# Printavo API v2.0

These GraphQL API docs are used to access information in your Printavo account. Printavo is the simplest way for screen-printing, embroidering and promotional product shops to manage their business.

## Rate Limiting
For API requests, we allow a maximum of 10 requests for every 5 seconds per user email or IP address.

## Get Started
Requests to Printavo API v2.0 are made to the following endpoint and you will need the authentication headers below:

### API v2.0 Endpoint:
```
www.printavo.com/api/v2
```

### Authentication Headers
```javascript
const headers = {
  'Content-Type': 'application/json',
  'email': '{{youremail@email.com}}',
  'token': '{{API token from My Account page}}'
};
```