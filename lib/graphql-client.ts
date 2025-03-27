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

// Simplified client that uses MCP server
export const fetchRecentOrders = async () => {
  try {
    const response = await fetch('/api/mcp/printavo/orders/recent');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.orders || [];
  } catch (error) {
    logger.error('Error fetching recent orders:', error);
    return [];
  }
};

export const fetchOrdersChartData = async (): Promise<ChartData> => {
  try {
    const response = await fetch('/api/mcp/printavo/orders/chart');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.chartData || {
      labels: ['No Data'],
      datasets: [{
        label: 'Orders',
        data: [0],
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
    const response = await fetch('/api/mcp/printavo/revenue/chart');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.chartData || {
      labels: ['No Data'],
      datasets: [{
        label: 'Revenue ($)',
        data: [0],
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
    const response = await fetch(`/api/mcp/printavo/orders/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    logger.error(`Error fetching order ${id}:`, error);
    return null;
  }
};

export const getOrderByVisualId = async (visualId: string) => {
  try {
    const response = await fetch(`/api/mcp/printavo/orders/visual/${visualId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    logger.error(`Error fetching order by visual ID ${visualId}:`, error);
    return null;
  }
};

export const searchOrders = async (searchTerm: string) => {
  try {
    const response = await fetch(`/api/mcp/printavo/orders/search?q=${encodeURIComponent(searchTerm)}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    logger.error(`Error searching orders with term "${searchTerm}":`, error);
    return [];
  }
};
