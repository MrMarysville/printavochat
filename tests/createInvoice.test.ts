import { createInvoice } from '../lib/graphql/operations/quotes';
import { PrintavoAPIResponse } from '../lib/types';
import * as utils from '../lib/graphql/utils';

jest.mock('../lib/graphql/utils', () => ({
  query: jest.fn(),
  mutate: jest.fn(),
  handleAPIError: jest.fn(error => error)
}));

jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('createInvoice', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should successfully create an invoice with valid input', async () => {
        // Mock successful query response
        (utils.query as jest.Mock).mockResolvedValueOnce({
            data: {
                createInvoice: {
                    invoice: {
                        id: 'INV-12345',
                        visualId: '1234',
                        name: 'Test Invoice'
                    }
                }
            }
        });

        const input = { 
            customerId: 'CUST-123',
            description: 'Test Invoice'
        };
        
        const response = await createInvoice(input);
        
        // Expect data to be defined
        expect(response.success).toBe(true);
        expect(response.data).toBeDefined();
        expect(utils.query).toHaveBeenCalled();
    });

    it('should handle validation errors gracefully', async () => {
        // Test with invalid input (missing required fields)
        const input = { description: 'Invalid Invoice' };
        
        const response = await createInvoice(input);
        
        // Should get a validation error
        expect(response.success).toBe(false);
        expect(response.errors?.[0].message).toContain('validation error');
    });
});