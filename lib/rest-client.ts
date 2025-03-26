import axios from 'axios';
import { logger } from './logger';

// Get API configuration from environment variables
const API_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const API_EMAIL = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL || '';
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '';

// Check credentials
if (!API_EMAIL || !API_TOKEN) {
  logger.warn('Printavo REST client: API credentials not configured properly');
  logger.warn('Please set NEXT_PUBLIC_PRINTAVO_EMAIL and NEXT_PUBLIC_PRINTAVO_TOKEN in your .env file');
} else {
  logger.info('Printavo REST client initialized with URL:', API_URL);
  logger.info('Using email:', API_EMAIL);
  logger.info('Token length:', API_TOKEN.length, 'characters');
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'email': API_EMAIL,
    'token': API_TOKEN
  },
});

export const getOrders = async (params: any = {}) => {
  try {
    logger.info('REST client: fetching orders with params:', params);
    const response = await apiClient.get('/orders', { params });
    logger.info(`REST client: retrieved ${response.data?.length || 0} orders`);
    return response.data;
  } catch (error) {
    logger.error('REST client: error fetching orders:', error);
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
