import { PrintavoAPIResponse, query } from '../utils';
import { QUERIES } from '../queries';
import { PrintavoProduct } from '../../types';

/**
 * Search for products by query string
 * @param searchParams Parameters for searching products
 * @returns API Response containing product data
 */
export interface ProductSearchParams {
  query?: string;
  first?: number;
  after?: string;
  before?: string;
  last?: number;
}

export async function searchProducts(searchParams: ProductSearchParams | string): Promise<PrintavoAPIResponse<{ products: { edges: Array<{ node: PrintavoProduct }> } }>> {
  // Convert string parameter to object with query property
  const params = typeof searchParams === 'string' ? { query: searchParams } : searchParams;
  return query(QUERIES.products, params);
}

/**
 * Get a product by ID
 * @param id Product ID
 * @returns API Response containing product data
 */
export async function getProduct(id: string): Promise<PrintavoAPIResponse<{ product: PrintavoProduct }>> {
  // Using custom query since there's no dedicated product query in QUERIES
  const productQuery = `
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        name
        description
        price
        sku
      }
    }
  `;
  return query(productQuery, { id });
}

/**
 * Get products by category
 * @param category Product category
 * @returns API Response containing product data
 */
export async function getProductsByCategory(category: string): Promise<PrintavoAPIResponse<{ products: { edges: Array<{ node: PrintavoProduct }> } }>> {
  return query(QUERIES.products, { query: `category:${category}` });
}

/**
 * Get products by price range
 * @param minPrice Minimum price
 * @param maxPrice Maximum price
 * @returns API Response containing product data
 */
export async function getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<PrintavoAPIResponse<{ products: { edges: Array<{ node: PrintavoProduct }> } }>> {
  return query(QUERIES.products, { query: `price:>=${minPrice} price:<=${maxPrice}` });
}

/**
 * Create a new product
 * @param productData Product data
 * @returns API Response containing created product
 */
export async function createProduct(productData: {
  name: string;
  description?: string;
  price?: number;
  sku?: string;
}): Promise<PrintavoAPIResponse<{ product: PrintavoProduct }>> {
  return query('/mutation/productcreate', { input: productData });
}

/**
 * Update an existing product
 * @param id Product ID
 * @param productData Product data to update
 * @returns API Response containing updated product
 */
export async function updateProduct(id: string, productData: {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
}): Promise<PrintavoAPIResponse<{ product: PrintavoProduct }>> {
  return query('/mutation/productupdate', { id, input: productData });
}

/**
 * Delete a product
 * @param id Product ID
 * @returns API Response indicating success or failure
 */
export async function deleteProduct(id: string): Promise<PrintavoAPIResponse<boolean>> {
  return query('/mutation/productdelete', { id });
} 