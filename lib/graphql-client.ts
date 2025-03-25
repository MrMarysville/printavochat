import { GraphQLClient } from 'graphql-request';
import { logger } from './logger';
import { executeGraphQL, checkApiConnection } from './printavo-api';

const isBrowser = typeof window !== 'undefined';
const endpoint = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '';
const API_EMAIL = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL || '';

// Store API connection status
let apiConnectionStatus = {
  connected: false,
  checked: false,
  account: null,
  lastCheck: 0
};

// Create GraphQL client with proper headers
const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'email': API_EMAIL,
    'token': API_TOKEN
  },
});

// Check API connection status, with cache (only check once every 5 minutes)
export const checkConnection = async (forceCheck = false) => {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  // Return cached status if we checked recently and not forcing a fresh check
  if (!forceCheck && apiConnectionStatus.checked && (now - apiConnectionStatus.lastCheck) < fiveMinutes) {
    logger.debug('Using cached API connection status:', apiConnectionStatus.connected ? 'Connected' : 'Not connected');
    return apiConnectionStatus;
  }
  
  try {
    logger.info('Checking API connection status...');
    const response = await fetch('/api/health');
    const result = await response.json();
    
    // Update the connection status
    apiConnectionStatus = {
      connected: result.printavoApi?.connected || false,
      checked: true,
      account: result.printavoApi?.account || null,
      lastCheck: now
    };
    
    logger.info(`API connection check result: ${apiConnectionStatus.connected ? 'Connected' : 'Not connected'}`);
    return apiConnectionStatus;
  } catch (error) {
    logger.error('Error checking API connection:', error);
    
    // Update status to reflect the error
    apiConnectionStatus = {
      connected: false,
      checked: true,
      account: null,
      lastCheck: now
    };
    
    return apiConnectionStatus;
  }
};

// Custom error types with detailed error information
export class GraphQLClientError extends Error {
  constructor(
    message: string,
    public status?: number,
    public details?: any,
    public code?: string,
    public context?: {
      query?: string;
      variables?: any;
      timestamp?: string;
      requestId?: string;
    }
  ) {
    super(message);
    this.name = 'GraphQLClientError';
    this.context = {
      ...this.context,
      timestamp: new Date().toISOString()
    };
  }
}

export class GraphQLValidationError extends GraphQLClientError {
  constructor(message: string, details?: any, context?: any) {
    super(message, 400, details, 'VALIDATION_ERROR', context);
    this.name = 'GraphQLValidationError';
  }
}

export class GraphQLConnectionError extends GraphQLClientError {
  constructor(message: string, details?: any, context?: any) {
    super(message, 503, details, 'CONNECTION_ERROR', context);
    this.name = 'GraphQLConnectionError';
  }
}

export class GraphQLAuthenticationError extends GraphQLClientError {
  constructor(message: string, details?: any, context?: any) {
    super(message, 401, details, 'AUTHENTICATION_ERROR', context);
    this.name = 'GraphQLAuthenticationError';
  }
}

export class GraphQLAuthorizationError extends GraphQLClientError {
  constructor(message: string, details?: any, context?: any) {
    super(message, 403, details, 'AUTHORIZATION_ERROR', context);
    this.name = 'GraphQLAuthorizationError';
  }
}

export class GraphQLRateLimitError extends GraphQLClientError {
  constructor(message: string, details?: any, context?: any) {
    super(message, 429, details, 'RATE_LIMIT_ERROR', context);
    this.name = 'GraphQLRateLimitError';
  }
}

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 5000,  // 5 seconds
};

// Helper function to calculate exponential backoff delay
const getRetryDelay = (attempt: number): number => {
  const delay = Math.min(
    RETRY_CONFIG.baseDelay * Math.pow(2, attempt - 1),
    RETRY_CONFIG.maxDelay
  );
  return delay + Math.random() * 1000; // Add jitter
};

// Helper function for GraphQL execution with improved error handling and retry logic
export const executeGraphQLOld = async <T = any>(query: string, variables: any = {}): Promise<T> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      // Log the request attempt with detailed context
      logger.debug(`Executing GraphQL query (attempt ${attempt}/${RETRY_CONFIG.maxAttempts}):`, {
        query: query.substring(0, 50) + '...',
        variables: JSON.stringify(variables).substring(0, 100) + '...',
        timestamp: new Date().toISOString(),
        attempt
      });
      
      // Check API connection status if we haven't already
      if (!apiConnectionStatus.checked) {
        await checkConnection();
      }
      
      // Execute the query through our API route
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
      });

      const result = await response.json();

      // Handle non-200 responses with specific error types
      if (!response.ok) {
        const errorContext = {
          query,
          variables,
          timestamp: new Date().toISOString(),
          requestId: response.headers.get('x-request-id') || undefined
        };

        switch (response.status) {
          case 400:
            throw new GraphQLValidationError(
              result.error || 'Invalid GraphQL request',
              result.details,
              errorContext
            );
          case 401:
            throw new GraphQLAuthenticationError(
              'Authentication failed',
              result.details,
              errorContext
            );
          case 403:
            throw new GraphQLAuthorizationError(
              'Not authorized to perform this operation',
              result.details,
              errorContext
            );
          case 429:
            throw new GraphQLRateLimitError(
              'Rate limit exceeded',
              result.details,
              errorContext
            );
          case 503:
            throw new GraphQLConnectionError(
              'Service temporarily unavailable',
              result.details,
              errorContext
            );
          default:
            throw new GraphQLClientError(
              result.error || 'Failed to execute GraphQL query',
              response.status,
              result.details,
              'UNKNOWN_ERROR',
              errorContext
            );
        }
      }

      // Check for GraphQL errors in the response
      if (result.errors) {
        const errorContext = {
          query,
          variables,
          timestamp: new Date().toISOString(),
          requestId: response.headers.get('x-request-id') || undefined
        };

        throw new GraphQLClientError(
          'GraphQL execution failed',
          response.status,
          result.errors,
          'GRAPHQL_ERROR',
          errorContext
        );
      }

      logger.debug('GraphQL query successful', {
        query: query.substring(0, 50) + '...',
        timestamp: new Date().toISOString(),
        attempt
      });
      
      return result;
    } catch (error) {
      lastError = error as Error;
      
      // Log detailed error information
      logger.error(`GraphQL request failed (attempt ${attempt}/${RETRY_CONFIG.maxAttempts}):`, {
        error: error instanceof GraphQLClientError ? {
          name: error.name,
          message: error.message,
          status: error.status,
          code: error.code,
          details: error.details,
          context: error.context
        } : error,
        attempt,
        timestamp: new Date().toISOString()
      });

      // Don't retry on validation errors
      if (error instanceof GraphQLValidationError) {
        throw error;
      }

      // If this is the last attempt, throw the error
      if (attempt === RETRY_CONFIG.maxAttempts) {
        throw error;
      }

      // Wait before retrying
      const delay = getRetryDelay(attempt);
      logger.debug(`Retrying in ${delay}ms...`, {
        attempt,
        delay,
        timestamp: new Date().toISOString()
      });
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // This should never be reached due to the throw in the last attempt
  throw lastError;
};

export const fetchTasks = async () => {
  const query = `
    query {
      tasks(first: 5) {
        edges {
          node {
            id
            name
            dueAt
          }
        }
      }
    }
  `;
  try {
    const data = await executeGraphQLOld<{ tasks: { edges: Array<{ node: { id: string; name: string; dueAt: string } }> } }>(query);
    return data.tasks.edges.map((edge: { node: any }) => edge.node);
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    // Let the error propagate instead of returning mock data
    throw error;
  }
};

export const fetchRecentOrders = async () => {
  const query = `
    query {
      invoices(first: 20, sortDescending: true, sortOn: CREATED_AT) {
        edges {
          node {
            id
            visualId
            nickname
            createdAt
            total
            contact {
              id
              fullName
              email
            }
            status {
              id
              name
            }
          }
        }
      }
    }
  `;
  try {
    const data = await executeGraphQL(query);
    // Transform the data to the format expected by RecentOrdersSummary
    const orders = data.invoices.edges.map((edge: { node: any }) => ({
      id: edge.node.id,
      name: edge.node.nickname || `Order #${edge.node.visualId}`,
      customer: {
        id: edge.node.contact?.id || 'unknown',
        name: edge.node.contact?.fullName || 'Unknown Customer'
      },
      date: edge.node.createdAt,
      status: edge.node.status?.name || 'Unknown Status',
      total: parseFloat(edge.node.total || '0')
    }));
    
    // Already sorted by the API, but add an extra sort to ensure newest first
    return orders.sort((a: { date: string }, b: { date: string }) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    logger.error('Error fetching recent orders:', error);
    throw error;
  }
};

// Define types for chart data processing
interface OrderData {
  id: string;
  createdAt: string;
  total: string | number;
}

interface OrderEdge {
  node: OrderData;
}

interface MonthlyOrderData {
  [key: string]: {
    count: number;
    label: string;
  };
}

interface MonthlyRevenueData {
  [key: string]: {
    total: number;
    label: string;
  };
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color: string;
  }[];
}

export const fetchOrdersChartData = async (): Promise<ChartData> => {
  // Implement the query to fetch actual orders chart data
  // This should query the Printavo API for real data
  const query = `
    query {
      invoices(first: 30) {
        edges {
          node {
            id
            createdAt
            total
          }
        }
      }
    }
  `;
  
  try {
    const response = await executeGraphQL(query);
    
    // Process the raw data into chart format
    const orders = response.invoices.edges.map((edge: OrderEdge) => edge.node);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group orders by month
    const ordersByMonth: MonthlyOrderData = {};
    orders.forEach((order: OrderData) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!ordersByMonth[monthKey]) {
        ordersByMonth[monthKey] = { 
          count: 0, 
          label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        };
      }
      ordersByMonth[monthKey].count++;
    });
    
    // Convert to chart format
    const labels = Object.values(ordersByMonth).map(m => m.label);
    const chartData = Object.values(ordersByMonth).map(m => m.count);
    
    return {
      labels: labels,
      datasets: [
        {
          label: 'Orders',
          data: chartData,
          color: 'blue'
        }
      ]
    };
  } catch (error) {
    logger.error('Error fetching orders chart data:', error);
    throw error;
  }
};

export const fetchRevenueChartData = async (): Promise<ChartData> => {
  // Query real revenue data
  const query = `
    query {
      invoices(first: 30) {
        edges {
          node {
            id
            createdAt
            total
          }
        }
      }
    }
  `;
  
  try {
    const response = await executeGraphQL(query);
    
    // Process the raw data into chart format
    const orders = response.invoices.edges.map((edge: OrderEdge) => edge.node);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group revenue by month
    const revenueByMonth: MonthlyRevenueData = {};
    orders.forEach((order: OrderData) => {
      const date = new Date(order.createdAt);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!revenueByMonth[monthKey]) {
        revenueByMonth[monthKey] = { 
          total: 0, 
          label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
        };
      }
      revenueByMonth[monthKey].total += parseFloat(order.total.toString());
    });
    
    // Convert to chart format
    const labels = Object.values(revenueByMonth).map(m => m.label);
    const chartData = Object.values(revenueByMonth).map(m => m.total);
    
    return {
      labels: labels,
      datasets: [
        {
          label: 'Revenue',
          data: chartData,
          color: 'green'
        }
      ]
    };
  } catch (error) {
    logger.error('Error fetching revenue chart data:', error);
    throw error;
  }
};

export { executeGraphQL };