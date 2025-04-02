/**
 * GraphQL client for Printavo API with authentication and error handling.
 */

// Types for GraphQL execution
export interface GraphQLExecutionParams {
  query: string;
  variables?: any;
  operationName?: string;
  apiUrl: string;
  email: string;
  token: string;
}

// Error types
export class PrintavoAuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrintavoAuthenticationError';
  }
}

export class PrintavoValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrintavoValidationError';
  }
}

export class PrintavoNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrintavoNotFoundError';
  }
}

export class PrintavoRateLimitError extends Error {
  retryAfter?: number;

  constructor(message: string, retryAfter?: number) {
    super(message);
    this.name = 'PrintavoRateLimitError';
    this.retryAfter = retryAfter;
  }
}

export class PrintavoAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrintavoAPIError';
  }
}

export class GraphQLError extends Error {
  constructor(errors: any[]) {
    super('GraphQL Error');
    this.name = 'GraphQLError';
  }
}

/**
 * Execute a GraphQL query against the Printavo API.
 */
export const executeGraphQL = async (
  query: string,
  variables: Record<string, any> = {},
  operationName?: string
) => {
  console.log(`Executing GraphQL operation: ${operationName || 'unnamed'}`);
  
  // Get API URL and token from environment variables
  let apiUrl = process.env.PRINTAVO_API_URL;
  let apiToken = process.env.PRINTAVO_API_TOKEN;
  let apiEmail = process.env.PRINTAVO_EMAIL;
  
  // Update headers to match documentation
  const headers = {
    'Content-Type': 'application/json',
    'email': apiEmail,
    'token': apiToken
  };
  
  // Debug the environment variables
  console.log('Environment variables:');
  console.log('PRINTAVO_API_URL:', process.env.PRINTAVO_API_URL ? 'Set' : 'Not set');
  console.log('PRINTAVO_API_TOKEN:', process.env.PRINTAVO_API_TOKEN ? 'Set' : 'Not set');
  
  // Try to get the credentials from the PrintavoAgent if environment variables are not set
  if (!apiUrl || !apiToken) {
    try {
      // Check if we can get the credentials from the PrintavoAgent
      const printavoAgent = require('./index').PrintavoAgent;
      if (printavoAgent) {
        const agent = new printavoAgent();
        apiUrl = agent.apiUrl;
        apiToken = agent.token;
        
        console.log('Got credentials from PrintavoAgent:');
        console.log('apiUrl:', apiUrl ? 'Set' : 'Not set');
        console.log('apiToken:', apiToken ? 'Set' : 'Not set');
      }
    } catch (error) {
      console.error('Error getting credentials from PrintavoAgent:', error);
    }
  }
  
  // Ensure the URL has the https:// protocol
  if (apiUrl && !apiUrl.startsWith('http')) {
    apiUrl = `https://${apiUrl}`;
  }
  
  if (!apiUrl) {
    throw new Error('PRINTAVO_API_URL environment variable is not set');
  }
  
  console.log(`Using API URL: ${apiUrl}`);
  
  if (!apiToken) {
    throw new Error('PRINTAVO_API_TOKEN environment variable is not set');
  }
  
  // Set up retry logic
  const maxRetries = 3;
  let retryCount = 0;
  let lastError: Error | null = null;
  let circuitBreakerOpen = false;
  let circuitBreakerTimeoutId: NodeJS.Timeout | null = null;
  
  // Define which status codes should trigger a retry
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
  
  while (retryCount <= maxRetries) {
    if (circuitBreakerOpen) {
      console.log('Circuit breaker is open, waiting for timeout...');
      await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second timeout
      circuitBreakerOpen = false;
    }
    
    try {
      // Prepare the request body
      const body = JSON.stringify({
        query,
        variables,
        operationName,
      });
      
      console.log(`GraphQL request body (attempt ${retryCount + 1}/${maxRetries + 1}): ${body.substring(0, 200)}...`);
      
      // Create AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      try {
        // Make the request to the GraphQL API
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiToken}`,
          },
          body,
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // Check if the response is OK
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`GraphQL request failed with status ${response.status}: ${errorText}`);
          
          // Check for rate limiting headers
          const rateLimitRemaining = response.headers.get('x-ratelimit-remaining');
          const rateLimitReset = response.headers.get('x-ratelimit-reset');
          
          if (response.status === 429 || (rateLimitRemaining === '0' && rateLimitReset)) {
            console.warn('Rate limit exceeded, waiting before retrying');
            
            // Calculate delay based on rate limit reset header if available
            let delay = 5000; // Default 5 seconds
            if (rateLimitReset) {
              const resetTime = parseInt(rateLimitReset, 10) * 1000; // Convert to milliseconds
              const now = Date.now();
              if (resetTime > now) {
                delay = resetTime - now + 1000; // Add 1 second buffer
              }
            }
            
            console.log(`Waiting ${delay}ms for rate limit reset...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // If we get a retryable status code, retry the request
          if (retryableStatusCodes.includes(response.status) && retryCount < maxRetries) {
            lastError = new Error(`GraphQL request failed with status ${response.status}: ${errorText}`);
            retryCount++;
            
            // Exponential backoff
            const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Open circuit breaker if we've exceeded max retries
          if (retryCount >= maxRetries) {
            circuitBreakerOpen = true;
            circuitBreakerTimeoutId = setTimeout(() => circuitBreakerOpen = false, 30000); // 30 second timeout
          }
          
          throw new Error(`GraphQL request failed with status ${response.status}: ${errorText}`);
        }
        
        // Parse the response as JSON
        const data = await response.json();
        
        // Check for GraphQL errors
        if (data.errors) {
          console.error('GraphQL errors:', JSON.stringify(data.errors, null, 2));
          
          // Check if any of the errors are retryable
          const shouldRetry = data.errors.some((error: any) => {
            // Check for specific error messages or codes that indicate a retryable error
            const message = error.message?.toLowerCase() || '';
            return message.includes('timeout') || 
                  message.includes('rate limit') || 
                  message.includes('too many requests') ||
                  message.includes('server error') ||
                  message.includes('temporarily unavailable');
          });
          
          if (shouldRetry && retryCount < maxRetries) {
            lastError = new GraphQLError(data.errors);
            retryCount++;
            
            // Exponential backoff
            const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
            console.log(`Retrying in ${delay}ms due to GraphQL errors...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Open circuit breaker if we've exceeded max retries
          if (retryCount >= maxRetries) {
            circuitBreakerOpen = true;
            circuitBreakerTimeoutId = setTimeout(() => circuitBreakerOpen = false, 30000); // 30 second timeout
          }
          
          throw new GraphQLError(data.errors);
        }
        
        console.log(`GraphQL operation ${operationName || 'unnamed'} completed successfully`);
        
        // Return the data
        return data.data;
      } catch (fetchError: any) {
        // Clear the timeout to prevent memory leaks
        clearTimeout(timeoutId);
        
        // Check if this was an abort error (timeout)
        if (fetchError.name === 'AbortError') {
          console.error('GraphQL request timed out after 30 seconds');
          
          if (retryCount < maxRetries) {
            lastError = new Error('GraphQL request timed out');
            retryCount++;
            
            // Exponential backoff
            const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
            console.log(`Retrying in ${delay}ms after timeout...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          // Open circuit breaker if we've exceeded max retries
          if (retryCount >= maxRetries) {
            circuitBreakerOpen = true;
            circuitBreakerTimeoutId = setTimeout(() => circuitBreakerOpen = false, 30000); // 30 second timeout
          }
          
          throw new Error('GraphQL request timed out after multiple attempts');
        }
        
        // Re-throw other fetch errors
        throw fetchError;
      }
    } catch (error) {
      console.error(`Error executing GraphQL query (attempt ${retryCount + 1}/${maxRetries + 1}):`, error);
      
      // If we've reached the maximum number of retries, throw the error
      if (retryCount >= maxRetries) {
        throw error;
      }
      
      // Otherwise, retry
      lastError = error as Error;
      retryCount++;
      
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000 + Math.random() * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // This should never happen, but just in case
  throw lastError || new Error('Unknown error executing GraphQL query');
};
