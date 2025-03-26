import { fetchRecentOrders } from '../lib/graphql-client';
import { executeGraphQL } from '../lib/printavo-api';

// Mock the executeGraphQL function
jest.mock('../lib/printavo-api', () => ({
  executeGraphQL: jest.fn()
}));

// Mock the logger to avoid console output during tests
jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn()
  }
}));

describe('Dashboard Recent Orders', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('fetches recent orders with newest first order by default', async () => {
    // Mock response data for the GraphQL query
    const mockOrdersData = {
      invoices: {
        edges: [
          {
            node: {
              id: 'order1',
              visualId: '1234',
              nickname: 'Test Order 1',
              createdAt: '2025-03-20T00:00:00Z',
              total: '100',
              contact: {
                id: 'customer1',
                fullName: 'Test Customer 1',
                email: 'customer1@example.com'
              },
              status: {
                id: 'status1',
                name: 'New'
              }
            }
          },
          {
            node: {
              id: 'order2',
              visualId: '5678',
              nickname: 'Test Order 2',
              createdAt: '2025-03-15T00:00:00Z',
              total: '200',
              contact: {
                id: 'customer2',
                fullName: 'Test Customer 2',
                email: 'customer2@example.com'
              },
              status: {
                id: 'status2',
                name: 'In Progress'
              }
            }
          },
          {
            node: {
              id: 'order3',
              visualId: '9012',
              nickname: 'Test Order 3',
              createdAt: '2025-03-25T00:00:00Z',
              total: '300',
              contact: {
                id: 'customer3',
                fullName: 'Test Customer 3',
                email: 'customer3@example.com'
              },
              status: {
                id: 'status3',
                name: 'Completed'
              }
            }
          }
        ]
      }
    };

    // Set up the mock to return our test data
    (executeGraphQL as jest.Mock).mockResolvedValue(mockOrdersData);

    // Call the function that fetches recent orders
    const orders = await fetchRecentOrders();

    // Verify the GraphQL query was called with the correct parameters
    expect(executeGraphQL).toHaveBeenCalledWith(
      expect.stringContaining('query GetRecentOrders'),
      {},
      'GetRecentOrders'
    );
    
    // Verify that the query includes sortDescending: true
    const queryArg = (executeGraphQL as jest.Mock).mock.calls[0][0];
    expect(queryArg).toContain('sortDescending: true');

    // Verify the results were processed correctly
    expect(orders).toHaveLength(3);
    
    // Verify the orders are sorted from newest to oldest
    expect(orders[0].id).toBe('order3'); // March 25
    expect(orders[1].id).toBe('order1'); // March 20
    expect(orders[2].id).toBe('order2'); // March 15
    
    // Verify the order data is transformed correctly
    expect(orders[0]).toEqual({
      id: 'order3',
      name: 'Test Order 3',
      customer: {
        id: 'customer3',
        name: 'Test Customer 3'
      },
      date: '2025-03-25T00:00:00Z',
      status: 'Completed',
      total: 300
    });
  });

  it('handles empty or error responses gracefully', async () => {
    // Mock an empty response
    (executeGraphQL as jest.Mock).mockResolvedValue({
      invoices: {
        edges: []
      }
    });

    // Call the function
    const orders = await fetchRecentOrders();

    // Verify that it returns an empty array rather than throwing
    expect(orders).toEqual([]);
  });

  it('handles API errors by returning an empty array', async () => {
    // Mock a rejected promise (API error)
    (executeGraphQL as jest.Mock).mockRejectedValue(new Error('API connection failed'));

    // Call the function
    const orders = await fetchRecentOrders();

    // Verify that it returns an empty array rather than throwing
    expect(orders).toEqual([]);
  });
});
