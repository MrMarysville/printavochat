import { determineOperation } from '../lib/operations';

describe('Operation Determination Tests', () => {
  describe('Visual ID Operations', () => {
    const testCases = [
      { input: '1234', expectedOperation: 'getOrderByVisualId' },
      { input: '12345', expectedOperation: 'getOrderByVisualId' },
      { input: 'find order 1234', expectedOperation: 'getOrderByVisualId' },
      { input: 'show me order #5678', expectedOperation: 'getOrderByVisualId' },
      { input: 'display order 9876', expectedOperation: 'getOrderByVisualId' },
      { input: 'get invoice 1234', expectedOperation: 'getOrderByVisualId' }
    ];

    test.each(testCases)(
      'should return $expectedOperation for input "$input"',
      ({ input, expectedOperation }) => {
        const operation = determineOperation(input);
        expect(operation).toBeDefined();
        expect(operation?.name).toBe(expectedOperation);
      }
    );

    it('should not return getOrderByVisualId for invalid inputs', () => {
      const invalidInputs = [
        '123',  // Too short
        'hello world',
        'search for customers',
        'create a quote'
      ];

      invalidInputs.forEach(input => {
        const operation = determineOperation(input);
        if (operation) {
          expect(operation.name).not.toBe('getOrderByVisualId');
        }
      });
    });

    it('should extract the correct Visual ID from inputs', () => {
      const inputs = [
        { text: '1234', expectedId: '1234' },
        { text: 'find order 5678', expectedId: '5678' }
      ];

      inputs.forEach(({ text, expectedId }) => {
        const operation = determineOperation(text);
        expect(operation).toBeDefined();
        expect(operation?.name).toBe('getOrderByVisualId');
        
        if (operation && operation.name === 'getOrderByVisualId') {
          operation.execute({}).then(result => {
            expect(result.visualId).toBe(expectedId);
          });
        }
      });
    });
  });

  describe('Quote Creation Operations', () => {
    const testCases = [
      { input: 'create a new quote', expectedOperation: 'createQuote' },
      { input: 'make quote', expectedOperation: 'createQuote' },
      { input: 'generate estimate', expectedOperation: 'createQuote' },
      { input: 'add quote for ABC Company', expectedOperation: 'createQuote' }
    ];

    test.each(testCases)(
      'should return $expectedOperation for input "$input"',
      ({ input, expectedOperation }) => {
        const operation = determineOperation(input);
        expect(operation).toBeDefined();
        expect(operation?.name).toBe(expectedOperation);
      }
    );
  });

  describe('Invoice Creation Operations', () => {
    const testCases = [
      { input: 'create a new invoice', expectedOperation: 'createInvoice' },
      { input: 'make invoice', expectedOperation: 'createInvoice' },
      { input: 'generate bill', expectedOperation: 'createInvoice' },
      { input: 'add invoice for XYZ Corp', expectedOperation: 'createInvoice' }
    ];

    test.each(testCases)(
      'should return $expectedOperation for input "$input"',
      ({ input, expectedOperation }) => {
        const operation = determineOperation(input);
        expect(operation).toBeDefined();
        expect(operation?.name).toBe(expectedOperation);
      }
    );
  });

  describe('Order Search Operations', () => {
    const testCases = [
      { input: 'search orders', expectedOperation: 'searchOrders' },
      { input: 'find all orders', expectedOperation: 'searchOrders' },
      { input: 'show invoices', expectedOperation: 'searchOrders' },
      { input: 'list quotes', expectedOperation: 'searchOrders' }
    ];

    test.each(testCases)(
      'should return $expectedOperation for input "$input"',
      ({ input, expectedOperation }) => {
        const operation = determineOperation(input);
        expect(operation).toBeDefined();
        expect(operation?.name).toBe(expectedOperation);
      }
    );
  });
}); 