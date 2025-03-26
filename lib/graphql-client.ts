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
    
    if (!response.ok) {
      logger.error(`API health check failed: ${response.status} ${response.statusText}`);
      apiConnectionStatus = {
        connected: false,
        checked: true,
        account: null,
        lastCheck: now
      };
      return apiConnectionStatus;
    }
    
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
      operationName?: string;
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
export const executeGraphQLOld = async <T = any>(query: string, variables: any = {}, operationName: string = ''): Promise<T> => {
  let lastError: Error | null = null;
  
  // Ensure operation name is valid
  if (!operationName) {
    const error = new GraphQLValidationError(
      'GraphQL operation name is required',
      { operationName },
      { query: query.substring(0, 100) }
    );
    logger.error('Missing operation name for GraphQL query', error);
    throw error;
  }
  
  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      // Log the request attempt with detailed context
      logger.debug(`Executing GraphQL query (attempt ${attempt}/${RETRY_CONFIG.maxAttempts}):`, {
        query: query.substring(0, 50) + '...',
        variables: JSON.stringify(variables).substring(0, 100) + '...',
        operationName,
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
        body: JSON.stringify({ query, variables, operationName }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to parse error response');
        logger.error(`GraphQL request failed with status ${response.status}:`, errorText);
        
        throw new GraphQLClientError(
          `GraphQL request failed with status ${response.status}`,
          response.status,
          { response: errorText },
          'HTTP_ERROR',
          { query, variables, operationName }
        );
      }

      const result = await response.json();

      // Check for GraphQL errors in the response
      if (result.errors) {
        const errorContext = {
          query,
          variables,
          operationName,
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
  const operationName = "GetTasks"; // Always define operation name explicitly
  const query = `
    query ${operationName} {
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
    const data = await executeGraphQL(query, {}, operationName);
    return data.tasks?.edges?.map((edge: { node: any }) => edge.node) || [];
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    // Return empty array on error to prevent UI from breaking
    return [];
  }
};

// Helper function to execute GraphQL request with better browser diagnostics
async function executeClientGraphQL(
  query: string, 
  variables: Record<string, any> = {}, 
  operationName: string
): Promise<any> {
  try {
    if (!operationName || operationName.trim() === '') {
      console.error('[GraphQL] Operation name is required', {
        error: 'No operation name provided',
        query: query.substring(0, 100)
      });
      throw new Error('GraphQL operation name is required and cannot be empty');
    }
    
    // Log the request attempt in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[GraphQL] Executing ${operationName}...`);
    }
    
    // Ensure we're sending the operation name properly
    const result = await executeGraphQL(query, variables, operationName);
    return result;
  } catch (error: unknown) {
    // Enhanced client-side error reporting
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[GraphQL] Error in ${operationName}:`, errorMessage);
    
    // Re-throw to be handled by the calling function
    throw error;
  }
}

// Replace direct executeGraphQL calls with our enhanced client version in dashboard-used functions
export const fetchRecentOrders = async () => {
  logger.info('Fetching recent orders from Printavo API');
  const operationName = "GetRecentOrders";
  
  const query = `
    query ${operationName} {
      invoices(first: 50, sortDescending: true) {
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
    const data = await executeClientGraphQL(query, {}, operationName);
    
    // Handle empty or invalid response
    if (!data || !data.invoices || !data.invoices.edges) {
      logger.warn('Empty or invalid response from Printavo API for recent orders');
      return [];
    }
    
    logger.info(`Received ${data.invoices.edges.length} orders from Printavo API`);
    
    // Transform the data to the format expected by RecentOrdersSummary
    const orders = data.invoices.edges.map((edge: { node: any }) => ({
      id: edge.node.id,
      name: edge.node.nickname || `Order #${edge.node.visualId || 'Unknown'}`,
      customer: {
        id: edge.node.contact?.id || 'unknown',
        name: edge.node.contact?.fullName || 'Unknown Customer'
      },
      date: edge.node.createdAt || new Date().toISOString(),
      status: edge.node.status?.name || 'Unknown Status',
      total: parseFloat(edge.node.total || '0')
    }));
    
    // Make sure we have valid dates and sort newest first
    const sortedOrders = orders
      .filter((order: { date: string }) => order.date) // Remove any orders with missing dates
      .sort((a: { date: string }, b: { date: string }) => {
        try {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        } catch (e) {
          // If date parsing fails, keep original order
          return 0;
        }
      });
    
    // Log some info about the results
    logger.info(`Processed ${sortedOrders.length} orders for display (after filtering and sorting)`);
    if (sortedOrders.length > 0) {
      logger.debug(`First order: ${sortedOrders[0].name}, date: ${sortedOrders[0].date}`);
    }
    
    return sortedOrders;
  } catch (error) {
    logger.error('Error fetching recent orders:', error);
    // Return empty array instead of throwing to prevent dashboard from breaking
    return [];
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
    color?: string;
  }[];
}

export const fetchOrdersChartData = async (): Promise<ChartData> => {
  logger.info('Fetching orders chart data');
  const operationName = "GetOrdersChartData";
  
  const query = `
    query ${operationName} {
      invoices(first: 100, sortDescending: true) {
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
    const response = await executeClientGraphQL(query, {}, operationName);
    
    // Check if we received valid data
    if (!response || !response.invoices || !response.invoices.edges) {
      logger.warn('No order data available for chart');
      return {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Orders',
            data: [0],
            color: 'blue'
          }
        ]
      };
    }
    
    // Process the raw data into chart format
    const orders = response.invoices.edges.map((edge: OrderEdge) => edge.node);
    logger.info(`Processing ${orders.length} orders for chart data`);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get data for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Create a map of all months we want to display (even if no data)
    const ordersByMonth: MonthlyOrderData = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      ordersByMonth[monthKey] = { 
        count: 0, 
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      };
    }
    
    // Fill in the actual data
    orders.forEach((order: OrderData) => {
      try {
        const date = new Date(order.createdAt);
        // Only include orders from the last 6 months
        if (date >= sixMonthsAgo) {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          if (ordersByMonth[monthKey]) {
            ordersByMonth[monthKey].count++;
          }
        }
      } catch (e) {
        logger.warn(`Error processing order date: ${e}`);
      }
    });
    
    // Sort by date (oldest to newest)
    const sortedMonths = Object.keys(ordersByMonth)
      .sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        return (yearA - yearB) || (monthA - monthB);
      });
    
    // Convert to chart format
    const labels = sortedMonths.map(key => ordersByMonth[key].label);
    const chartData = sortedMonths.map(key => ordersByMonth[key].count);
    
    logger.debug(`Chart labels: ${labels.join(', ')}`);
    logger.debug(`Chart data: ${chartData.join(', ')}`);
    
    return {
      labels,
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
    return {
      labels: ['Error'],
      datasets: [
        {
          label: 'Error',
          data: [0],
          color: 'red'
        }
      ]
    };
  }
};

export const fetchRevenueChartData = async (): Promise<ChartData> => {
  logger.info('Fetching revenue chart data');
  const operationName = "GetRevenueChartData";
  
  const query = `
    query ${operationName} {
      invoices(first: 100, sortDescending: true) {
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
    const response = await executeClientGraphQL(query, {}, operationName);
    
    // Check if we received valid data
    if (!response || !response.invoices || !response.invoices.edges) {
      logger.warn('No revenue data available for chart');
      return {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Revenue',
            data: [0],
            color: 'green'
          }
        ]
      };
    }
    
    // Process the raw data into chart format
    const orders = response.invoices.edges.map((edge: OrderEdge) => edge.node);
    logger.info(`Processing ${orders.length} orders for revenue chart data`);
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get data for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Create a map of all months we want to display (even if no data)
    const revenueByMonth: MonthlyRevenueData = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      revenueByMonth[monthKey] = { 
        total: 0, 
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      };
    }
    
    // Fill in the actual data
    orders.forEach((order: OrderData) => {
      try {
        const date = new Date(order.createdAt);
        // Only include orders from the last 6 months
        if (date >= sixMonthsAgo) {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          if (revenueByMonth[monthKey]) {
            revenueByMonth[monthKey].total += parseFloat(order.total.toString()) || 0;
          }
        }
      } catch (e) {
        logger.warn(`Error processing order revenue: ${e}`);
      }
    });
    
    // Sort by date (oldest to newest)
    const sortedMonths = Object.keys(revenueByMonth)
      .sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        return (yearA - yearB) || (monthA - monthB);
      });
    
    // Convert to chart format
    const labels = sortedMonths.map(key => revenueByMonth[key].label);
    const chartData = sortedMonths.map(key => revenueByMonth[key].total);
    
    logger.debug(`Revenue chart labels: ${labels.join(', ')}`);
    logger.debug(`Revenue chart data: ${chartData.join(', ')}`);
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue ($)',
          data: chartData,
          color: 'green'
        }
      ]
    };
  } catch (error) {
    logger.error('Error fetching revenue chart data:', error);
    return {
      labels: ['Error'],
      datasets: [
        {
          label: 'Error',
          data: [0],
          color: 'red'
        }
      ]
    };
  }
};

export { executeGraphQL };