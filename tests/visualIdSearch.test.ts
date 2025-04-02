/**
 * Manual test script for Visual ID search
 * 
 * This script tests Visual ID search functionality using Jest.
 */

import { determineOperation } from '../lib/operations';
import { searchOperations } from '../lib/graphql/operations/searchOperations';
import { AgentService } from '../lib/agent-service';

// Mock the AgentService responses for test stability
jest.mock('../lib/agent-service', () => ({
  AgentService: {
    getOrderByVisualId: jest.fn().mockResolvedValue({
      success: true,
      data: {
        id: 'TEST-9435',
        visualId: '9435',
        name: 'Test T-Shirt Order',
        status: {
          name: 'In Production'
        },
        customer: {
          name: 'Test Customer',
          email: 'test@example.com'
        },
        total: 245.99,
        lineItemGroups: [
          {
            name: 'Custom T-Shirts',
            lineItems: [
              {
                name: 'Black T-Shirt',
                quantity: 24,
                price: 9.50
              }
            ]
          }
        ]
      }
    }),
    searchOrders: jest.fn().mockResolvedValue({
      success: true,
      data: []
    }),
    executeOperation: jest.fn().mockResolvedValue({
      success: true,
      data: {}
    })
  }
}));

describe('Visual ID Search Tests', () => {
  const visualId = '9435';

  test('should find order with direct visual ID search', async () => {
    const searchResult = await searchOperations.searchOrders({ visualId });
    expect(searchResult.success).toBe(true);
    expect(searchResult.data).toBeDefined();
    expect(searchResult.data.length).toBeGreaterThan(0);
    
    const order = searchResult.data[0];
    expect(order.visualId).toBe(visualId);
    expect(order.name).toBe('Test T-Shirt Order');
  });

  test('should handle different input formats', async () => {
    const testInputs = [
      visualId, // Direct visual ID
      `visual id ${visualId}`, // Prefixed visual ID
      `find order with visual id ${visualId}`, // Search phrase
      `show order ${visualId}`, // Show order command
      `search orders with visual id ${visualId}` // Filter search
    ];

    for (const input of testInputs) {
      const operation = determineOperation(input);
      expect(operation).toBeDefined();
      
      if (operation) {
        const result = await operation.execute({});
        expect(result).toBeDefined();
        if (operation.name === 'getOrderByVisualId') {
          expect(result.visualId).toBe(visualId);
        }
      }
    }
  });

  test('should return correct order details', async () => {
    const searchResult = await searchOperations.searchOrders({ visualId });
    expect(searchResult.success).toBe(true);
    expect(searchResult.data).toBeDefined();
    expect(searchResult.data.length).toBeGreaterThan(0);
    
    const order = searchResult.data[0];
    expect(order).toMatchObject({
      id: 'TEST-9435',
      visualId: '9435',
      name: 'Test T-Shirt Order',
      status: {
        name: 'In Production'
      },
      customer: {
        name: 'Test Customer',
        email: 'test@example.com'
      },
      total: 245.99,
      lineItemGroups: expect.arrayContaining([
        expect.objectContaining({
          name: 'Custom T-Shirts',
          lineItems: expect.arrayContaining([
            expect.objectContaining({
              name: 'Black T-Shirt',
              quantity: 24,
              price: 9.50
            })
          ])
        })
      ])
    });
  });
}); 