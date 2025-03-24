import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'https://www.printavo.com/api/v2',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.PRINTAVO_API_TOKEN}`,
  },
});

export const getOrders = async (params: any = {}) => {
  try {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (id: string) => {
  try {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    throw error;
  }
};
