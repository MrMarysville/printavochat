import { executeGraphQL } from './printavo-api';
import { logger } from './logger';
import cache from './cache';

/**
 * Utility functions for Visual ID searching and filtering
 */

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Determines if a string might be a visual ID
 * @param value The string to check
 * @returns Boolean indicating if the string could be a visual ID
 */
export const isVisualId = (value: string): boolean => {
  // Visual IDs are 4-digit numbers
  return /^\d{4}$/.test(value);
};

/**
 * Searches for orders by Visual ID with support for exact and partial matches
 * @param visualId - The Visual ID to search for
 * @param options - Search options (exact match only, include similar, etc.)
 */
export const searchByVisualId = async (
  visualId: string,
  options: {
    exactMatchOnly?: boolean;
    includeSimilar?: boolean;
    limit?: number;
  } = {}
) => {
  const {
    exactMatchOnly = false,
    includeSimilar = true,
    limit = 10
  } = options;

  const cacheKey = `visualid-search-${visualId}-${exactMatchOnly}-${includeSimilar}-${limit}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    logger.info(`Using cached result for Visual ID search: ${visualId}`);
    return cachedResult;
  }

  try {
    logger.info(`Searching for orders with Visual ID: ${visualId}`);
    
    // If it's an exact match search only, use the optimized query
    if (exactMatchOnly) {
      const result = await getOrderByExactVisualId(visualId);
      if (result) {
        cache.set(cacheKey, [result], CACHE_TTL);
        return [result];
      }
      return [];
    }
    
    // Otherwise, use a more flexible search that can include similar Visual IDs
    const query = `
      query SearchByVisualId($query: String!, $limit: Int!) {
        invoices(first: $limit, query: $query, sortDescending: true) {
          edges {
            node {
              id
              visualId
              nickname
              createdAt
              total
              contact {
                id
                fullName
                email
              }
              status {
                id
                name
              }
            }
          }
        }
      }
    `;
    
    const variables = {
      query: visualId,
      limit: limit
    };
    
    const data = await executeGraphQL(query, variables, "SearchByVisualId");
    
    if (!data?.invoices?.edges) {
      logger.warn(`No results found for Visual ID search: ${visualId}`);
      return [];
    }
    
    const orders = data.invoices.edges.map((edge: any) => edge.node);
    
    // If includeSimilar is false, filter to exact matches only
    const filtered = includeSimilar ? orders : orders.filter((order: any) => 
      order.visualId === visualId
    );
    
    logger.info(`Found ${filtered.length} orders for Visual ID search: ${visualId}`);
    
    // Cache the results
    cache.set(cacheKey, filtered, CACHE_TTL);
    
    return filtered;
  } catch (error) {
    logger.error(`Error searching by Visual ID: ${visualId}`, error);
    throw error;
  }
};

/**
 * Get an order by exact Visual ID match
 * @param visualId - The Visual ID to look for
 */
export const getOrderByExactVisualId = async (visualId: string) => {
  const cacheKey = `visualid-exact-${visualId}`;
  const cachedResult = cache.get(cacheKey);
  
  if (cachedResult) {
    logger.info(`Using cached result for exact Visual ID: ${visualId}`);
    return cachedResult;
  }
  
  try {
    logger.info(`Looking for exact match for Visual ID: ${visualId}`);
    
    const query = `
      query GetOrderByExactVisualId($query: String!) {
        invoices(first: 5, query: $query) {
          edges {
            node {
              id
              visualId
              nickname
              createdAt
              total
              contact {
                id
                fullName
                email
              }
              status {
                id
                name
              }
            }
          }
        }
      }
    `;
    
    const variables = {
      query: visualId
    };
    
    const data = await executeGraphQL(query, variables, "GetOrderByExactVisualId");
    
    if (!data?.invoices?.edges || data.invoices.edges.length === 0) {
      logger.info(`No exact match found for Visual ID: ${visualId}`);
      return null;
    }
    
    // Find the exact match in the results
    const exactMatch = data.invoices.edges
      .map((edge: any) => edge.node)
      .find((node: any) => node.visualId === visualId);
    
    if (exactMatch) {
      logger.info(`Found exact match for Visual ID: ${visualId}`);
      cache.set(cacheKey, exactMatch, CACHE_TTL);
      return exactMatch;
    }
    
    logger.info(`No exact match found for Visual ID: ${visualId}`);
    return null;
  } catch (error) {
    logger.error(`Error getting order by exact Visual ID: ${visualId}`, error);
    throw error;
  }
};

/**
 * Validate if a string is a proper Visual ID format
 * @param visualId - The Visual ID to validate
 */
export const validateVisualId = (visualId: string): { 
  valid: boolean; 
  message?: string 
} => {
  if (!visualId) {
    return { valid: false, message: 'Visual ID is required' };
  }
  
  if (!/^\d+$/.test(visualId)) {
    return { valid: false, message: 'Visual ID must contain only numbers' };
  }
  
  if (visualId.length !== 4) {
    return { valid: false, message: 'Visual ID must be exactly 4 digits' };
  }
  
  return { valid: true };
};

/**
 * Extract potential Visual IDs from free text
 * @param text - The text to search for Visual IDs
 */
export const extractVisualIds = (text: string): string[] => {
  // First look for specific patterns that likely indicate Visual IDs
  const patterns = [
    /\bvisual\s*id\s*[#:]\s*(\d{4})\b/i,  // "visual id: 1234" or "visual id #1234"
    /\bvisual\s*id\s*(\d{4})\b/i,         // "visual id 1234"
    /\border\s*[#:]\s*(\d{4})\b/i,        // "order #1234" or "order: 1234"
    /\bfind\s*order\s*(\d{4})\b/i,        // "find order 1234"
    /\b(\d{4})\b/                         // Any 4-digit number as fallback
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      // Return the first capture group from the first matching pattern
      return [match[1]];
    }
  }
  
  // If no patterns matched, extract all 4-digit numbers as potential Visual IDs
  const allMatches = text.match(/\b\d{4}\b/g) || [];
  // Remove duplicates
  return Array.from(new Set(allMatches));
};

/**
 * Format a number as a Visual ID (zero-padded 4-digit number)
 */
export const formatAsVisualId = (num: number | string): string => {
  return String(num).padStart(4, '0');
};
