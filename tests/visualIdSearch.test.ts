import { determineOperation } from '../lib/operations';
import { searchOperations } from '../lib/graphql/operations/searchOperations';
import { PrintavoOrder } from '../lib/types';
import { logger } from '../lib/logger';

// Mock the logger to prevent console output during tests
jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock the searchOperations to return test data
jest.mock('../lib/graphql/operations/searchOperations', () => ({
  searchOperations: {
    searchOrders: jest.fn(),
  },
}));

describe('Visual ID Search', () => {
  const mockSentiment = {
    isUrgent: false,
    isConfused: false,
    isPositive: false,
    isNegative: false,
  };

  const mockContext = {
    lastOrderId: undefined,
    lastOrderType: undefined,
    lastCustomerId: undefined,
    lastSearchTerm: undefined,
    lastIntent: undefined,
  };

  const mockOrder: PrintavoOrder = {
    id: 'INV-1234',
    visualId: '5678',
    name: 'Test Order',
    status: {
      id: '1',
      name: 'In Progress',
    },
    customer: {
      id: 'CUST-1',
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '123-456-7890',
      createdAt: '2025-03-22T00:00:00Z',
      updatedAt: '2025-03-22T00:00:00Z',
    },
    createdAt: '2025-03-22T00:00:00Z',
    updatedAt: '2025-03-22T00:00:00Z',
    total: 100.00,
    lineItemGroups: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Direct Visual ID Queries', () => {
    it('should handle standalone Visual ID input', async () => {
      const visualId = '5678';
      (searchOperations.searchOrders as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockOrder],
      });

      const operation = determineOperation(visualId, mockContext, mockSentiment);
      expect(operation.name).toBe('getOrder');

      const result = await operation.execute();
      expect(result.data).toEqual(mockOrder);
      expect(result.message).toContain('5678');
    });

    it('should handle "visual id XXXX" format', async () => {
      const input = 'visual id 5678';
      (searchOperations.searchOrders as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockOrder],
      });

      const operation = determineOperation(input, mockContext, mockSentiment);
      expect(operation.name).toBe('getOrder');

      const result = await operation.execute();
      expect(result.data).toEqual(mockOrder);
      expect(result.message).toContain('5678');
    });

    it('should handle "find order with visual id XXXX" format', async () => {
      const input = 'find order with visual id 5678';
      (searchOperations.searchOrders as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockOrder],
      });

      const operation = determineOperation(input, mockContext, mockSentiment);
      expect(operation.name).toBe('getOrder');

      const result = await operation.execute();
      expect(result.data).toEqual(mockOrder);
      expect(result.message).toContain('5678');
    });
  });

  describe('Visual ID Search Filters', () => {
    it('should handle searching orders with Visual ID filter', async () => {
      const input = 'search orders with visual id 5678';
      (searchOperations.searchOrders as jest.Mock).mockResolvedValue({
        success: true,
        data: [mockOrder],
      });

      const operation = determineOperation(input, mockContext, mockSentiment);
      expect(operation.name).toBe('searchOrders');

      const result = await operation.execute();
      expect(result.data).toEqual([mockOrder]); // Expect array of orders
      expect(result.message).toContain('5678');
    });

    it('should handle no results for Visual ID filter', async () => {
      const input = 'search orders with visual id 9999';
      (searchOperations.searchOrders as jest.Mock).mockResolvedValue({
        success: true,
        data: [], // Return empty array for no results
      });

      const operation = determineOperation(input, mockContext, mockSentiment);
      expect(operation.name).toBe('searchOrders');

      const result = await operation.execute();
      expect(result.data).toEqual([]); // Expect empty array
      expect(result.message).toContain('9999');
      expect(result.message).toContain('couldn\'t find any orders');
    });
  });

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const input = 'visual id 5678';
      (searchOperations.searchOrders as jest.Mock).mockRejectedValue(new Error('API Error'));

      const operation = determineOperation(input, mockContext, mockSentiment);
      expect(operation.name).toBe('getOrder');

      const result = await operation.execute();
      expect(result.data.error).toBeDefined();
      expect(result.message).toContain('error');
    });

    it('should handle invalid Visual ID format', async () => {
      const input = 'visual id 123'; // Only 3 digits
      const operation = determineOperation(input, mockContext, mockSentiment);
      expect(operation.name).not.toBe('getOrder');
    });
  });
});