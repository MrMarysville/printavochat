import { checkApiConnection } from '../lib/printavo-api';
import fetch from 'node-fetch';

// Mock fetch
jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock logger
jest.mock('../lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// Mock environment variables
const originalEnv = process.env;
beforeEach(() => {
  jest.resetModules();
  process.env = { 
    ...originalEnv,
    NEXT_PUBLIC_PRINTAVO_API_URL: 'https://api.printavo.com',
    NEXT_PUBLIC_PRINTAVO_EMAIL: 'test@example.com',
    NEXT_PUBLIC_PRINTAVO_TOKEN: 'test-token'
  };
});

afterEach(() => {
  process.env = originalEnv;
  jest.clearAllMocks();
});

describe('Printavo API Services', () => {
  describe('checkApiConnection', () => {
    it('should return connected: true when API responds successfully', async () => {
      // Mock successful API response
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          data: {
            account: {
              companyName: 'Test Company',
              companyEmail: 'test@example.com'
            }
          }
        }),
        text: jest.fn().mockResolvedValue('{}')
      };
      
      mockedFetch.mockResolvedValue(mockResponse as any);
      
      const result = await checkApiConnection();
      
      expect(result.connected).toBe(true);
      expect(result.account).toBeDefined();
    });
    
    it('should return connected: false when API returns an error', async () => {
      // Mock error API response
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: jest.fn().mockResolvedValue('{"error": "Invalid credentials"}')
      };
      
      mockedFetch.mockResolvedValue(mockResponse as any);
      
      const result = await checkApiConnection();
      
      expect(result.connected).toBe(false);
      expect(result.error).toBeDefined();
    });
    
    it('should return connected: false when API connection fails', async () => {
      // Mock network error
      mockedFetch.mockRejectedValue(new Error('Network error'));
      
      const result = await checkApiConnection();
      
      expect(result.connected).toBe(false);
      expect(result.error).toBeDefined();
    });
    
    it('should use API health endpoint in browser environment', async () => {
      // Save original
      const originalWindow = global.window;
      
      // Mock browser environment
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true
      });
      
      // Mock successful API response from health endpoint
      const mockResponse = {
        ok: true,
        status: 200,
        json: jest.fn().mockResolvedValue({
          printavoApi: {
            connected: true,
            account: {
              companyName: 'Test Company'
            }
          }
        }),
        text: jest.fn().mockResolvedValue('{}')
      };
      
      mockedFetch.mockResolvedValue(mockResponse as any);
      
      const result = await checkApiConnection();
      
      expect(result.connected).toBe(true);
      expect(mockedFetch).toHaveBeenCalledWith('/api/health');
      
      // Restore original
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true
      });
    });
  });
}); 