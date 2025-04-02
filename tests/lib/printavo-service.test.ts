import { PrintavoService } from '@/lib/printavo-service';
import { logger } from '@/lib/logger';

// Mock the logger
jest.mock('@/lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe('PrintavoService', () => {
  let printavoService: PrintavoService;
  
  beforeEach(() => {
    printavoService = new PrintavoService();
    // Mock the executeGraphQL method
    printavoService.executeGraphQL = jest.fn();
  });

  describe('listOrders', () => {
    test('should fetch orders with default parameters', async () => {
      // Mock successful GraphQL response
      const mockOrdersResponse = {
        orders: {
          nodes: [
            {
              id: 'order_123',
              visualId: '1001',
              name: 'Test Order 1',
              createdAt: '2023-05-15T10:00:00Z',
              total: 500,
              status: { id: 'status_1', name: 'In Production' },
              customer: { id: 'cust_1', companyName: 'Acme Inc.' },
              contact: { id: 'contact_1', fullName: 'John Doe' }
            }
          ]
        }
      };
      
      (printavoService.executeGraphQL as jest.Mock).mockResolvedValue(mockOrdersResponse);

      const result = await printavoService.listOrders({});

      // Verify executeGraphQL was called with correct parameters
      expect(printavoService.executeGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('query ListOrders'),
        {
          first: 10,
          after: undefined,
          sortOn: 'CREATED_AT_DESC'
        }
      );

      // Verify the result structure
      expect(result).toEqual({
        success: true,
        data: mockOrdersResponse
      });
    });

    test('should fetch orders with custom parameters', async () => {
      // Mock successful GraphQL response
      const mockOrdersResponse = {
        orders: {
          nodes: [
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
          ]
        }
      };
      
      (printavoService.executeGraphQL as jest.Mock).mockResolvedValue(mockOrdersResponse);

      const result = await printavoService.listOrders({
        first: 5,
        after: 'cursor123',
        sortOn: 'TOTAL_DESC'
      });

      // Verify executeGraphQL was called with correct parameters
      expect(printavoService.executeGraphQL).toHaveBeenCalledWith(
        expect.stringContaining('query ListOrders'),
        {
          first: 5,
          after: 'cursor123',
          sortOn: 'TOTAL_DESC'
        }
      );

      // Verify the result structure
      expect(result).toEqual({
        success: true,
        data: mockOrdersResponse
      });
    });

    test('should handle GraphQL errors', async () => {
      // Mock GraphQL error
      const error = new Error('GraphQL execution failed');
      (printavoService.executeGraphQL as jest.Mock).mockRejectedValue(error);

      const result = await printavoService.listOrders({});

      // Verify error was logged
      expect(logger.error).toHaveBeenCalledWith(
        'Error in PrintavoService.listOrders:',
        error
      );

      // Verify the error result structure
      expect(result).toEqual({
        success: false,
        error: 'GraphQL execution failed'
      });
    });
  });
});