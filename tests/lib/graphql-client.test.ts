import { fetchRecentOrders } from '@/lib/graphql-client';
import { logger } from '@/lib/logger';
import fetchMock from 'jest-fetch-mock';

// Mock the fetch API
global.fetch = fetchMock as any;

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('GraphQL Client - Recent Orders', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('fetchRecentOrders should return orders when API call succeeds', async () => {
    // Mock successful API response
    const mockOrders = [
      {
        id: 'order_123',
        visualId: '1001',
        name: 'Test Order 1',
        createdAt: '2023-05-15T10:00:00Z',
        total: 500,
        status: { id: 'status_1', name: 'In Production' },
        customer: { id: 'cust_1', companyName: 'Acme Inc.' },
        contact: { id: 'contact_1', fullName: 'John Doe' }
      },
      {
        id: 'order_456',
        visualId: '1002',
        name: 'Test Order 2',
        createdAt: '2023-05-14T09:00:00Z',
        total: 750,
        status: { id: 'status_2', name: 'Completed' },
        customer: { id: 'cust_2', companyName: 'XYZ Corp' },
        contact: { id: 'contact_2', fullName: 'Jane Smith' }
      }
    ];

    fetchMock.mockResponseOnce(JSON.stringify({
      data: {
        orders: {
          nodes: mockOrders
        }
      }
    }));

    const result = await fetchRecentOrders();

    // Verify the fetch was called with correct parameters
    expect(fetchMock).toHaveBeenCalledWith('/api/agent', {
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

    // Verify the result matches the mock data
    expect(result).toEqual(mockOrders);
  });

  test('fetchRecentOrders should handle alternative response formats', async () => {
    // Test with orders directly in data.orders (no nodes)
    const mockOrders = [
      { id: 'order_123', name: 'Test Order 1' },
      { id: 'order_456', name: 'Test Order 2' }
    ];

    fetchMock.mockResponseOnce(JSON.stringify({
      data: {
        orders: mockOrders
      }
    }));

    const result = await fetchRecentOrders();
    expect(result).toEqual(mockOrders);
  });

  test('fetchRecentOrders should handle array response format', async () => {
    // Test with orders directly in data array
    const mockOrders = [
      { id: 'order_123', name: 'Test Order 1' },
      { id: 'order_456', name: 'Test Order 2' }
    ];

    fetchMock.mockResponseOnce(JSON.stringify({
      data: mockOrders
    }));

    const result = await fetchRecentOrders();
    expect(result).toEqual(mockOrders);
  });

  test('fetchRecentOrders should return empty array on API error', async () => {
    // Mock API error
    fetchMock.mockRejectOnce(new Error('API connection failed'));

    const result = await fetchRecentOrders();

    // Verify error was logged
    expect(logger.error).toHaveBeenCalledWith(
      'Error fetching recent orders:',
      expect.any(Error)
    );

    // Verify empty array is returned
    expect(result).toEqual([]);
  });

  test('fetchRecentOrders should return empty array on unexpected response format', async () => {
    // Mock unexpected response format
    fetchMock.mockResponseOnce(JSON.stringify({
      data: {
        something: 'unexpected'
      }
    }));

    const result = await fetchRecentOrders();

    // Verify warning was logged
    expect(logger.warn).toHaveBeenCalledWith(
      'Unexpected response format from list_orders:',
      expect.anything()
    );

    // Verify empty array is returned
    expect(result).toEqual([]);
  });

  test('fetchRecentOrders should handle HTTP errors', async () => {
    // Mock HTTP error
    fetchMock.mockResponseOnce(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const result = await fetchRecentOrders();

    // Verify error was logged
    expect(logger.error).toHaveBeenCalledWith(
      'Error fetching recent orders:',
      expect.any(Error)
    );

    // Verify empty array is returned
    expect(result).toEqual([]);
  });
});