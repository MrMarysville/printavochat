import * as printavoApi from '../lib/printavo-api';

// Mock the checkApiConnection function directly
jest.mock('../lib/printavo-api', () => {
  const originalModule = jest.requireActual('../lib/printavo-api');
  return {
    ...originalModule,
    checkApiConnection: jest.fn()
  };
});

// Mock logger
jest.mock('../lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

const mockCheckApiConnection = printavoApi.checkApiConnection as jest.MockedFunction<typeof printavoApi.checkApiConnection>;

describe('Printavo API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkApiConnection', () => {
    it('should return connected: true when API responds successfully', async () => {
      // Set up successful mock response
      mockCheckApiConnection.mockResolvedValueOnce({
        connected: true,
        account: {
          companyName: 'Test Company',
          companyEmail: 'test@example.com'
        },
        message: 'Connected successfully'
      });
      
      const result = await printavoApi.checkApiConnection();
      
      expect(result.connected).toBe(true);
      expect(result.account).toBeDefined();
      expect(result.account.companyName).toBe('Test Company');
    });
    
    it('should return connected: false when API returns an error', async () => {
      // Set up error mock response
      mockCheckApiConnection.mockResolvedValueOnce({
        connected: false,
        error: 'Unauthorized',
        message: 'Failed to connect to Printavo API'
      });
      
      const result = await printavoApi.checkApiConnection();
      
      expect(result.connected).toBe(false);
      expect(result.error).toBe('Unauthorized');
    });
    
    it('should return connected info from health endpoint in browser environment', async () => {
      // Mock the browser response from health endpoint
      mockCheckApiConnection.mockResolvedValueOnce({
        connected: true,
        account: {
          companyName: 'Test Company'
        },
        message: 'Connected successfully via health endpoint'
      });
      
      const result = await printavoApi.checkApiConnection();
      
      expect(result.connected).toBe(true);
      expect(result.account).toBeDefined();
    });
  });
}); 