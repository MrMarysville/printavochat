import { ProductsAPI } from '../lib/printavo-api';

// Mock fetch to avoid actual API calls
jest.mock('node-fetch', () => jest.fn());
global.fetch = jest.fn(() => 
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      data: {
        products: {
          edges: [
            {
              node: {
                id: 'PRD-123',
                name: 'Test Product',
                description: 'A test product',
                sku: 'TS123',
                price: 29.99,
                cost: 15.99,
                category: 'Test Category'
              }
            }
          ]
        }
      }
    })
  }) as any
);

jest.mock('../lib/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn()
  }
}));

describe('ProductsAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export ProductsAPI with required methods', () => {
    // Verify the ProductsAPI exists and has the required methods
    expect(ProductsAPI).toBeDefined();
    expect(typeof ProductsAPI.getProducts).toBe('function');
    expect(typeof ProductsAPI.getProduct).toBe('function');
    expect(typeof ProductsAPI.searchProducts).toBe('function');
  });

  it('should handle getProducts request', async () => {
    const products = await ProductsAPI.getProducts();
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBe(1);
    expect(products[0].name).toBe('Test Product');
  });

  it('should handle product search request', async () => {
    const searchResult = await ProductsAPI.searchProducts('Test');
    expect(searchResult).toBeDefined();
    expect(Array.isArray(searchResult)).toBe(true);
    expect(searchResult.length).toBe(1);
    expect(searchResult[0].name).toBe('Test Product');
  });
}); 