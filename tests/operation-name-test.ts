import { executeGraphQL } from '../lib/printavo-api';

describe('GraphQL Operation Name Tests', () => {
  test('anonymous query should have operation name added', async () => {
    // This would previously fail with "No operation named" error
    const anonymousQuery = `{ account { id } }`;
    
    // Mock the fetch function to verify operation name is sent
    global.fetch = jest.fn().mockImplementation((url, options) => {
      const body = JSON.parse(options.body);
      // Check that operationName is not empty
      expect(body.operationName).toBeTruthy();
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { account: { id: '123' } } })
      });
    });
    
    await executeGraphQL(anonymousQuery);
    expect(global.fetch).toHaveBeenCalled();
  });
  
  test('named query should preserve operation name', async () => {
    const namedQuery = `query GetAccount { account { id } }`;
    
    global.fetch = jest.fn().mockImplementation((url, options) => {
      const body = JSON.parse(options.body);
      expect(body.operationName).toBe('GetAccount');
      
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: { account: { id: '123' } } })
      });
    });
    
    await executeGraphQL(namedQuery);
    expect(global.fetch).toHaveBeenCalled();
  });
});