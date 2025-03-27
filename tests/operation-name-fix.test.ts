import { executeGraphQL } from '../lib/printavo-api';
import { logger } from '../lib/logger';

// Mock the logger to avoid console noise during tests
jest.mock('../lib/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  }
}));

// Mock API utils to avoid real API calls
jest.mock('../lib/utils/api-utils', () => ({
  getBaseApiUrl: jest.fn().mockReturnValue('https://test-api.example.com'),
  getGraphQLEndpoint: jest.fn().mockReturnValue('https://test-api.example.com'),
  getApiCredentials: jest.fn().mockReturnValue({ 
    email: 'test@example.com', 
    token: 'test-token' 
  }),
  withLock: jest.fn().mockImplementation((_, fn) => fn()),
}));

// Mock fetch to return test data
global.fetch = jest.fn().mockImplementation((url, options) => {
  // Parse the request body
  const body = JSON.parse(options.body);
  
  // Ensure operation name exists
  if (!body.operationName || body.operationName.trim() === '') {
    return Promise.resolve({
      ok: false,
      status: 400,
      text: () => Promise.resolve(JSON.stringify({
        errors: [{ message: 'No operation named ""' }]
      }))
    });
  }
  
  // Return success response
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      data: {
        test: { id: '123', name: 'Test Data' }
      }
    })
  });
});

describe('GraphQL Operation Name Fix Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('should handle anonymous query with no operation name', async () => {
    // Anonymous query with no operation name
    const anonymousQuery = `{ 
      test { 
        id 
        name 
      } 
    }`;
    
    const result = await executeGraphQL(anonymousQuery);
    
    expect(result).toEqual({
      data: {
        test: { id: '123', name: 'Test Data' }
      }
    });
    
    // Check that fetch was called with a generated operation name
    expect(global.fetch).toHaveBeenCalled();
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    
    // Verify operation name was generated and not empty
    expect(requestBody.operationName).toBeDefined();
    expect(requestBody.operationName.trim()).not.toBe('');
    expect(requestBody.operationName).toContain('GraphQLQuery_');
    
    // Verify query was modified to include operation name
    expect(requestBody.query).toContain(`query ${requestBody.operationName}`);
  });
  
  test('should handle query with explicit operation name', async () => {
    // Query with explicit operation name
    const namedQuery = `
      query TestQuery { 
        test { 
          id 
          name 
        } 
      }`;
    
    const result = await executeGraphQL(namedQuery);
    
    expect(result).toEqual({
      data: {
        test: { id: '123', name: 'Test Data' }
      }
    });
    
    // Check that fetch was called with the correct operation name
    expect(global.fetch).toHaveBeenCalled();
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    
    // Verify operation name was extracted correctly
    expect(requestBody.operationName).toBe('TestQuery');
    // Verify query was not modified
    expect(requestBody.query).toBe(namedQuery);
  });
  
  test('should handle query with explicit operationName parameter', async () => {
    // Anonymous query with explicit operationName parameter
    const anonymousQuery = `{ 
      test { 
        id 
        name 
      } 
    }`;
    
    const result = await executeGraphQL(anonymousQuery, {}, 'ExplicitOperationName');
    
    expect(result).toEqual({
      data: {
        test: { id: '123', name: 'Test Data' }
      }
    });
    
    // Check that fetch was called with the provided operation name
    expect(global.fetch).toHaveBeenCalled();
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    
    // Verify operation name was used as provided
    expect(requestBody.operationName).toBe('ExplicitOperationName');
  });
  
  test('should extract operation name from query', async () => {
    // Query with operation name in the query but not provided as parameter
    const namedQuery = `
      query FindTestData { 
        test { 
          id 
          name 
        } 
      }`;
    
    const result = await executeGraphQL(namedQuery);
    
    expect(result).toEqual({
      data: {
        test: { id: '123', name: 'Test Data' }
      }
    });
    
    // Check that fetch was called with the extracted operation name
    expect(global.fetch).toHaveBeenCalled();
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    
    // Verify operation name was extracted correctly
    expect(requestBody.operationName).toBe('FindTestData');
  });
}); 