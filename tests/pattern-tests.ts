describe('Pattern Matching Tests', () => {
  describe('Visual ID Pattern Tests', () => {
    // Define the regex patterns for testing
    const orderVisualIdPattern = /(?:get|show|find|search|display|fetch)(?:\s+me)?\s+(?:order|quote|invoice)\s+(?:with\s+)?(?:visual\s+id\s+)?(?:#)?(\d{4,5})/i;
    const orderNumberPattern = /^(?:#)?(\d{4,5})$/i;
    
    it('should extract Visual ID from "find order 1234" format', () => {
      const input = 'find order 1234';
      const match = input.match(orderVisualIdPattern);
      expect(match).toBeTruthy();
      expect(match && match[1]).toBe('1234');
    });
    
    it('should extract Visual ID from "show me order #5678" format', () => {
      const input = 'show me order #5678';
      const match = input.match(orderVisualIdPattern);
      expect(match).toBeTruthy();
      expect(match && match[1]).toBe('5678');
    });
    
    it('should extract Visual ID from standalone number', () => {
      const input = '1234';
      const match = input.match(orderNumberPattern);
      expect(match).toBeTruthy();
      expect(match && match[1]).toBe('1234');
    });
    
    it('should extract Visual ID from "#1234" format', () => {
      const input = '#1234';
      const match = input.match(orderNumberPattern);
      expect(match).toBeTruthy();
      expect(match && match[1]).toBe('1234');
    });

    it('should not match too short ID patterns', () => {
      const input = '123'; // Only 3 digits
      const match = input.match(orderNumberPattern);
      expect(match).toBeNull();
    });
  });

  describe('Quote Creation Pattern Tests', () => {
    const createQuotePattern = /(?:create|make|generate|new|add)\s+(?:a\s+)?(?:new\s+)?(?:quote|estimate)/i;
    
    it('should match "create a new quote" pattern', () => {
      const input = 'create a new quote';
      expect(createQuotePattern.test(input)).toBe(true);
    });
    
    it('should match "make quote" pattern', () => {
      const input = 'make quote';
      expect(createQuotePattern.test(input)).toBe(true);
    });
    
    it('should match "generate estimate" pattern', () => {
      const input = 'generate estimate';
      expect(createQuotePattern.test(input)).toBe(true);
    });
    
    it('should not match unrelated pattern', () => {
      const input = 'find my quotes';
      expect(createQuotePattern.test(input)).toBe(false);
    });
  });

  describe('Invoice Creation Pattern Tests', () => {
    const createInvoicePattern = /(?:create|make|generate|new|add)\s+(?:a\s+)?(?:new\s+)?(?:invoice|bill)/i;
    
    it('should match "create a new invoice" pattern', () => {
      const input = 'create a new invoice';
      expect(createInvoicePattern.test(input)).toBe(true);
    });
    
    it('should match "make invoice" pattern', () => {
      const input = 'make invoice';
      expect(createInvoicePattern.test(input)).toBe(true);
    });
    
    it('should match "generate bill" pattern', () => {
      const input = 'generate bill';
      expect(createInvoicePattern.test(input)).toBe(true);
    });
    
    it('should not match unrelated pattern', () => {
      const input = 'find my invoices';
      expect(createInvoicePattern.test(input)).toBe(false);
    });
  });
}); 