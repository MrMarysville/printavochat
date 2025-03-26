import { 
  isVisualId, 
  validateVisualId, 
  extractVisualIds, 
  formatAsVisualId,
  searchByVisualId,
  getOrderByExactVisualId
} from '../lib/visual-id-utils';
import * as printavoApi from '../lib/printavo-api';
import cache from '../lib/cache';

// Mock dependencies
jest.mock('../lib/printavo-api');
jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));
jest.mock('../lib/cache', () => ({
  get: jest.fn(),
  set: jest.fn(),
  __esModule: true,
  default: {
    get: jest.fn(),
    set: jest.fn()
  }
}));

describe('Visual ID Utilities', () => {
  describe('isVisualId', () => {
    it('returns true for valid 4-digit Visual IDs', () => {
      expect(isVisualId('1234')).toBe(true);
      expect(isVisualId('0001')).toBe(true);
      expect(isVisualId('9999')).toBe(true);
    });

    it('returns false for invalid Visual IDs', () => {
      expect(isVisualId('123')).toBe(false); // Too short
      expect(isVisualId('12345')).toBe(false); // Too long
      expect(isVisualId('abcd')).toBe(false); // Not digits
      expect(isVisualId('12a4')).toBe(false); // Contains non-digits
      expect(isVisualId('')).toBe(false); // Empty string
      expect(isVisualId(' 1234 ')).toBe(false); // Has whitespace
    });
  });

  describe('validateVisualId', () => {
    it('returns valid: true for valid 4-digit Visual IDs', () => {
      expect(validateVisualId('1234')).toEqual({ valid: true });
      expect(validateVisualId('0001')).toEqual({ valid: true });
      expect(validateVisualId('9999')).toEqual({ valid: true });
    });

    it('returns validation errors for invalid Visual IDs', () => {
      expect(validateVisualId('')).toEqual({ 
        valid: false, 
        message: 'Visual ID is required' 
      });
      
      expect(validateVisualId('123')).toEqual({ 
        valid: false, 
        message: 'Visual ID must be exactly 4 digits' 
      });
      
      expect(validateVisualId('12345')).toEqual({ 
        valid: false, 
        message: 'Visual ID must be exactly 4 digits' 
      });
      
      expect(validateVisualId('abcd')).toEqual({ 
        valid: false, 
        message: 'Visual ID must contain only numbers' 
      });
      
      expect(validateVisualId('12a4')).toEqual({ 
        valid: false, 
        message: 'Visual ID must contain only numbers' 
      });
    });
  });

  describe('extractVisualIds', () => {
    it('extracts Visual IDs from explicit formats', () => {
      expect(extractVisualIds('visual id: 1234')).toEqual(['1234']);
      expect(extractVisualIds('visual id #1234')).toEqual(['1234']);
      expect(extractVisualIds('visual id 1234')).toEqual(['1234']);
      expect(extractVisualIds('order #1234')).toEqual(['1234']);
      expect(extractVisualIds('order: 1234')).toEqual(['1234']);
      expect(extractVisualIds('find order 1234')).toEqual(['1234']);
    });

    it('extracts Visual IDs from text with multiple 4-digit numbers', () => {
      expect(extractVisualIds('I need to find order 1234 and also check 5678')).toEqual(['1234']);
    });

    it('returns an empty array when no Visual IDs are found', () => {
      expect(extractVisualIds('This has no visual IDs')).toEqual([]);
      expect(extractVisualIds('This has a 3-digit number 123')).toEqual([]);
      expect(extractVisualIds('')).toEqual([]);
    });
  });

  describe('formatAsVisualId', () => {
    it('formats numbers as 4-digit zero-padded strings', () => {
      expect(formatAsVisualId(1)).toBe('0001');
      expect(formatAsVisualId(12)).toBe('0012');
      expect(formatAsVisualId(123)).toBe('0123');
      expect(formatAsVisualId(1234)).toBe('1234');
      expect(formatAsVisualId(9999)).toBe('9999');
    });

    it('handles string inputs', () => {
      expect(formatAsVisualId('1')).toBe('0001');
      expect(formatAsVisualId('12')).toBe('0012');
      expect(formatAsVisualId('123')).toBe('0123');
      expect(formatAsVisualId('1234')).toBe('1234');
    });
  });

  describe('searchByVisualId', () => {
    const mockOrderData = {
      invoices: {
        edges: [
          {
            node: {
              id: 'order123',
              visualId: '1234',
              nickname: 'Test Order',
              createdAt: '2023-01-01',
              total: 100,
              contact: {
                id: 'contact123',
                fullName: 'John Doe',
                email: 'john@example.com'
              },
              status: {
                id: 'status123',
                name: 'In Progress'
              }
            }
          },
          {
            node: {
              id: 'order456',
              visualId: '1235', // Similar but not exact match
              nickname: 'Another Order',
              createdAt: '2023-01-02',
              total: 200,
              contact: {
                id: 'contact456',
                fullName: 'Jane Smith',
                email: 'jane@example.com'
              },
              status: {
                id: 'status456',
                name: 'Completed'
              }
            }
          }
        ]
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
      // Mock the executeGraphQL function
      (printavoApi.executeGraphQL as jest.Mock).mockResolvedValue(mockOrderData);
      // Mock cache to return null (no cached data)
      (cache.get as jest.Mock).mockReturnValue(null);
    });

    it('returns exact match when exactMatchOnly is true', async () => {
      // Mock getOrderByExactVisualId to return a single order
      const exactOrder = mockOrderData.invoices.edges[0].node;
      jest.spyOn(global, 'getOrderByExactVisualId' as any).mockResolvedValue(exactOrder);

      const result = await searchByVisualId('1234', { exactMatchOnly: true });
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(exactOrder);
      expect(cache.set).toHaveBeenCalled();
    });

    it('returns filtered results when includeSimilar is false', async () => {
      const result = await searchByVisualId('1234', { includeSimilar: false });
      
      expect(result).toHaveLength(1);
      expect(result[0].visualId).toBe('1234');
      expect(printavoApi.executeGraphQL).toHaveBeenCalledWith(
        expect.any(String),
        { query: '1234', limit: 10 },
        "SearchByVisualId"
      );
    });

    it('returns all matching results when includeSimilar is true', async () => {
      const result = await searchByVisualId('123', { includeSimilar: true });
      
      expect(result).toHaveLength(2);
      expect(result.map((o: any) => o.visualId)).toContain('1234');
      expect(result.map((o: any) => o.visualId)).toContain('1235');
    });

    it('uses cached results when available', async () => {
      const cachedOrder = { id: 'cached123', visualId: '1234' };
      (cache.get as jest.Mock).mockReturnValue([cachedOrder]);
      
      const result = await searchByVisualId('1234');
      
      expect(result).toEqual([cachedOrder]);
      expect(printavoApi.executeGraphQL).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      (printavoApi.executeGraphQL as jest.Mock).mockRejectedValue(new Error('API error'));
      
      await expect(searchByVisualId('1234')).rejects.toThrow('API error');
    });
  });

  describe('getOrderByExactVisualId', () => {
    const mockData = {
      invoices: {
        edges: [
          {
            node: {
              id: 'order123',
              visualId: '1234',
              nickname: 'Test Order'
            }
          },
          {
            node: {
              id: 'order456',
              visualId: '5678',
              nickname: 'Another Order'
            }
          }
        ]
      }
    };

    beforeEach(() => {
      jest.clearAllMocks();
      (printavoApi.executeGraphQL as jest.Mock).mockResolvedValue(mockData);
      (cache.get as jest.Mock).mockReturnValue(null);
    });

    it('returns the exact match when found', async () => {
      const result = await getOrderByExactVisualId('1234');
      
      expect(result).toEqual(mockData.invoices.edges[0].node);
      expect(cache.set).toHaveBeenCalled();
    });

    it('returns null when no exact match is found', async () => {
      const result = await getOrderByExactVisualId('9999');
      
      expect(result).toBeNull();
    });

    it('uses cached results when available', async () => {
      const cachedOrder = { id: 'cached123', visualId: '1234' };
      (cache.get as jest.Mock).mockReturnValue(cachedOrder);
      
      const result = await getOrderByExactVisualId('1234');
      
      expect(result).toEqual(cachedOrder);
      expect(printavoApi.executeGraphQL).not.toHaveBeenCalled();
    });

    it('handles API errors gracefully', async () => {
      (printavoApi.executeGraphQL as jest.Mock).mockRejectedValue(new Error('API error'));
      
      await expect(getOrderByExactVisualId('1234')).rejects.toThrow('API error');
    });

    it('returns null when API returns empty results', async () => {
      (printavoApi.executeGraphQL as jest.Mock).mockResolvedValue({ invoices: { edges: [] } });
      
      const result = await getOrderByExactVisualId('1234');
      
      expect(result).toBeNull();
    });
  });
});
