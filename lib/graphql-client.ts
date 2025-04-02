import { logger } from './logger';

// Types for chart data
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

interface OrderData {
  id: string;
  createdAt: string;
  total: string | number;
}

// Use Agent endpoints instead of MCP server
export const fetchRecentOrders = async () => {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'printavo_list_orders',
        params: { 
          first: 50,
          sortOn: 'CREATED_AT_DESC'
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle the correct data structure from the agent response
    if (result.data?.orders?.nodes) {
      return result.data.orders.nodes;
    } else if (result.data?.orders) {
      return result.data.orders;
    } else if (Array.isArray(result.data)) {
      return result.data;
    } else {
      logger.warn('Unexpected response format from list_orders:', result);
      return [];
    }
  } catch (error) {
    logger.error('Error fetching recent orders:', error);
    return [];
  }
};

export const fetchOrdersChartData = async (): Promise<ChartData> => {
  try {
    // Fetch orders for chart data using the agent
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'printavo_list_orders',
        params: { first: 30 }
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle the correct data structure from the agent response
    let orders = [];
    if (result.data?.orders) {
      orders = result.data.orders;
    } else if (Array.isArray(result.data)) {
      orders = result.data;
    } else {
      logger.warn('Unexpected response format from list_orders:', result);
      return {
        labels: ['Error'],
        datasets: [{
          label: 'Error',
          data: [0],
          color: 'red'
        }]
      };
    }
    
    // Process orders for chart
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Group by day
    const ordersByDay = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      ordersByDay[date] = (ordersByDay[date] || 0) + 1;
    });
    
    const labels = Object.keys(ordersByDay);
    const data = labels.map(label => ordersByDay[label]);
    
    return {
      labels,
      datasets: [{
        label: 'Orders',
        data,
        color: 'blue'
      }]
    };
  } catch (error) {
    logger.error('Error fetching orders chart data:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Error',
        data: [0],
        color: 'red'
      }]
    };
  }
};

export const fetchRevenueChartData = async (): Promise<ChartData> => {
  try {
    // Fetch orders for revenue data using the agent
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'printavo_list_orders',
        params: { first: 30 }
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    
    // Handle the correct data structure from the agent response
    let orders = [];
    if (result.data?.orders) {
      orders = result.data.orders;
    } else if (Array.isArray(result.data)) {
      orders = result.data;
    } else {
      logger.warn('Unexpected response format from list_orders:', result);
      return {
        labels: ['Error'],
        datasets: [{
          label: 'Error',
          data: [0],
          color: 'red'
        }]
      };
    }
    
    // Process orders for revenue chart
    const revenueByDay = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const total = parseFloat(order.total) || 0;
      revenueByDay[date] = (revenueByDay[date] || 0) + total;
    });
    
    const labels = Object.keys(revenueByDay);
    const data = labels.map(label => revenueByDay[label]);
    
    return {
      labels,
      datasets: [{
        label: 'Revenue ($)',
        data,
        color: 'green'
      }]
    };
  } catch (error) {
    logger.error('Error fetching revenue chart data:', error);
    return {
      labels: ['Error'],
      datasets: [{
        label: 'Error',
        data: [0],
        color: 'red'
      }]
    };
  }
};

export const getOrder = async (id: string) => {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'printavo_get_order',
        params: { id }
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { order: data.data };
  } catch (error) {
    logger.error(`Error fetching order ${id}:`, error);
    return null;
  }
};

export const getOrderByVisualId = async (visualId: string) => {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'printavo_get_order_by_visual_id',
        params: { visualId }
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { order: data.data };
  } catch (error) {
    logger.error(`Error fetching order by visual ID ${visualId}:`, error);
    return null;
  }
};

export const searchOrders = async (searchTerm: string) => {
  try {
    const response = await fetch('/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'printavo_search_orders',
        params: { query: searchTerm }
      }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { orders: data.data || [] };
  } catch (error) {
    logger.error(`Error searching orders with term "${searchTerm}":`, error);
    return { orders: [] };
  }
};
