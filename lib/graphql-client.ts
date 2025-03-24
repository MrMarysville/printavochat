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
    const result = await checkApiConnection();
    
    // Update the connection status
    apiConnectionStatus = {
      connected: result.connected,
      checked: true,
      account: result.account || null,
      lastCheck: now
    };
    
    logger.info(`API connection check result: ${result.connected ? 'Connected' : 'Not connected'}`);
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

// Helper function for GraphQL execution with improved error handling
export const executeGraphQLOld = async <T = any>(query: string, variables: any = {}): Promise<T> => {
  try {
    // Log the request attempt
    logger.debug(`Executing GraphQL query: ${query.substring(0, 50)}...`);
    logger.debug(`Variables: ${JSON.stringify(variables).substring(0, 100)}`);
    
    // Check API connection status if we haven't already
    if (!apiConnectionStatus.checked) {
      await checkConnection();
    }
    
    // Execute the query against the actual API regardless of connection status
    const result = await client.request<T>(query, variables);
    logger.debug('GraphQL query successful');
    return result;
  } catch (error) {
    logger.error('GraphQL request failed:', error);
    
    // Rethrow the error instead of using mock data
    throw error;
  }
};

export const fetchTasks = async () => {
  const query = `
    query {
      tasks(first: 5) {
        nodes {
          id
          name
          dueDate
        }
      }
    }
  `;
  try {
    const data = await executeGraphQLOld<{ tasks: { nodes: Array<{ id: string; name: string; dueDate: string }> } }>(query);
    return data.tasks.nodes;
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    // Let the error propagate instead of returning mock data
    throw error;
  }
};

export const fetchRecentOrders = async () => {
  const query = `
    query {
      orders(first: 5) {
        nodes {
          id
          customer {
            id
            companyName
          }
          dateCreated
          status {
            name
          }
          total
        }
      }
    }
  `;
  try {
    const data = await executeGraphQL(query);
    return data.orders.nodes;
  } catch (error) {
    logger.error('Error fetching recent orders:', error);
    throw error;
  }
};

// Define types for chart data processing
interface OrderData {
  id: string;
  dateCreated: string;
  total: string | number;
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
      orders(first: 30, sortOn: CREATED_AT, sortDescending: true) {
        nodes {
          id
          dateCreated
          total
        }
      }
    }
  `;
  
  try {
    const response = await executeGraphQL(query);
    
    // Process the raw data into chart format
    const orders = response.orders.nodes as OrderData[];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group orders by month
    const ordersByMonth: MonthlyOrderData = {};
    orders.forEach((order: OrderData) => {
      const date = new Date(order.dateCreated);
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
      orders(first: 30, sortOn: CREATED_AT, sortDescending: true) {
        nodes {
          id
          dateCreated
          total
        }
      }
    }
  `;
  
  try {
    const response = await executeGraphQL(query);
    
    // Process the raw data into chart format
    const orders = response.orders.nodes as OrderData[];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Group revenue by month
    const revenueByMonth: MonthlyRevenueData = {};
    orders.forEach((order: OrderData) => {
      const date = new Date(order.dateCreated);
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