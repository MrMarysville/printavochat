/**
 * Dashboard Agent Integration Tests
 * 
 * Tests the integration between the dashboard and the agent system
 */

import { fetchRecentOrders, fetchOrdersChartData, fetchRevenueChartData } from '../lib/graphql-client';

// Mock fetch for testing
global.fetch = jest.fn();

describe('Dashboard Agent Integration', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetchRecentOrders handles agent response with orders array', async () => {
    // Setup mock response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          orders: [
            { id: 'order-1', name: 'Test Order 1', createdAt: new Date().toISOString() },
            { id: 'order-2', name: 'Test Order 2', createdAt: new Date().toISOString() }
          ],
          pageInfo: { hasNextPage: false }
        }
      })
    });

    const orders = await fetchRecentOrders();
    
    // Check result
    expect(orders).toBeInstanceOf(Array);
    expect(orders.length).toBe(2);
    expect(orders[0].id).toBe('order-1');
    expect(orders[1].id).toBe('order-2');
    
    // Verify fetch was called correctly
    expect(fetch).toHaveBeenCalledWith('/api/agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        operation: 'printavo_list_orders',
        params: { first: 10 }
      })
    });
  });

  test('fetchRecentOrders handles direct array response', async () => {
    // Setup mock response
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          { id: 'order-1', name: 'Test Order 1', createdAt: new Date().toISOString() },
          { id: 'order-2', name: 'Test Order 2', createdAt: new Date().toISOString() }
        ]
      })
    });

    const orders = await fetchRecentOrders();
    
    // Check result
    expect(orders).toBeInstanceOf(Array);
    expect(orders.length).toBe(2);
    expect(orders[0].id).toBe('order-1');
    expect(orders[1].id).toBe('order-2');
  });

  test('fetchRecentOrders handles error response', async () => {
    // Setup mock response
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const orders = await fetchRecentOrders();
    
    // Check result - should get empty array on error
    expect(orders).toBeInstanceOf(Array);
    expect(orders.length).toBe(0);
  });

  test('fetchOrdersChartData handles agent response correctly', async () => {
    // Setup mock response
    const today = new Date().toISOString();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          orders: [
            { id: 'order-1', createdAt: today, total: '100' },
            { id: 'order-2', createdAt: today, total: '200' }
          ],
          pageInfo: { hasNextPage: false }
        }
      })
    });

    const chartData = await fetchOrdersChartData();
    
    // Check result
    expect(chartData).toHaveProperty('labels');
    expect(chartData).toHaveProperty('datasets');
    expect(chartData.datasets[0].data.length).toBeGreaterThan(0);
  });

  test('fetchRevenueChartData handles agent response correctly', async () => {
    // Setup mock response
    const today = new Date().toISOString();
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          orders: [
            { id: 'order-1', createdAt: today, total: '100' },
            { id: 'order-2', createdAt: today, total: '200' }
          ],
          pageInfo: { hasNextPage: false }
        }
      })
    });

    const chartData = await fetchRevenueChartData();
    
    // Check result
    expect(chartData).toHaveProperty('labels');
    expect(chartData).toHaveProperty('datasets');
    expect(chartData.datasets[0].data.length).toBeGreaterThan(0);
  });
}); 