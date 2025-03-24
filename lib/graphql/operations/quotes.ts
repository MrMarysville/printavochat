import { PrintavoOrder } from '../../types';
import { PrintavoAPIResponse, query } from '../utils';
import { quoteQueries } from '../queries/quoteQueries';
import { logger } from '../../logger';
import { handleAPIError } from '../utils';
import { PrintavoNotFoundError } from '../errors';
import cache from '../../cache';

// Get quote by ID
export async function getQuote(id: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  // Generate a cache key for this quote ID
  const cacheKey = `quote_id_${id}`;
  
  // Check if we have a cached result
  const cachedResult = cache.get<PrintavoAPIResponse<PrintavoOrder>>(cacheKey);
  if (cachedResult) {
    logger.info(`Using cached result for quote with ID: ${id}`);
    return cachedResult;
  }

  try {
    logger.info(`Fetching quote with ID: ${id}`);
    const result = await query<{ quote: PrintavoOrder }>(quoteQueries.getQuoteById, { id });
    
    if (!result.data?.quote) {
      logger.warn(`Quote not found with ID: ${id}`);
      return { 
        data: undefined,
        errors: [{ message: `Quote not found with ID: ${id}` }],
        success: false, 
        error: new PrintavoNotFoundError(`Quote not found with ID: ${id}`) 
      };
    }
    
    logger.info(`Successfully retrieved quote: ${id}`);
    
    const response = { 
      data: result.data.quote,
      success: true 
    };
    
    // Cache the successful result for 5 minutes
    cache.set(cacheKey, response);
    return response;
  } catch (error) {
    logger.error(`Error fetching quote with ID ${id}:`, error);
    return {
      data: undefined,
      errors: [{ message: `Failed to fetch quote with ID: ${id}` }],
      success: false,
      error: handleAPIError(error, `Failed to fetch quote with ID: ${id}`)
    };
  }
}

// Get quote by Visual ID
export async function getQuoteByVisualId(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  // Generate a cache key for this visual ID
  const cacheKey = `quote_visual_id_${visualId}`;
  
  // Check if we have a cached result
  const cachedResult = cache.get<PrintavoAPIResponse<PrintavoOrder>>(cacheKey);
  if (cachedResult) {
    logger.info(`Using cached result for quote with Visual ID: ${visualId}`);
    return cachedResult;
  }

  try {
    logger.info(`Fetching quote with Visual ID: ${visualId}`);
    const result = await query<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>(
      quoteQueries.searchQuotesByVisualId, 
      { query: visualId.trim(), first: 5 }
    );
    
    // Check if we found any quotes
    if (!result.data?.quotes?.edges || result.data.quotes.edges.length === 0) {
      logger.warn(`Quote not found with Visual ID: ${visualId}`);
      return { 
        data: undefined,
        errors: [{ message: `Quote not found with Visual ID: ${visualId}` }],
        success: false, 
        error: new PrintavoNotFoundError(`Quote not found with Visual ID: ${visualId}`) 
      };
    }
    
    // Find an exact match for the visual ID
    const exactMatch = result.data.quotes.edges.find(
      edge => edge.node.visualId === visualId
    );
    
    if (exactMatch) {
      logger.info(`Found exact match for Visual ID ${visualId} in quotes`);
      const response = { 
        data: exactMatch.node,
        success: true 
      };
      cache.set(cacheKey, response);
      return response;
    }
    
    // If no exact match but we have results, use the first one
    logger.info(`No exact match for Visual ID ${visualId} in quotes, using first result`);
    const response = { 
      data: result.data.quotes.edges[0].node,
      success: true 
    };
    cache.set(cacheKey, response);
    return response;
  } catch (error) {
    logger.error(`Error fetching quote with Visual ID ${visualId}:`, error);
    return {
      data: undefined,
      errors: [{ message: `Failed to fetch quote with Visual ID: ${visualId}` }],
      success: false,
      error: handleAPIError(error, `Failed to fetch quote with Visual ID: ${visualId}`)
    };
  }
}

// Search quotes with optional filters
export async function searchQuotes(params: {
  query?: string;
  first?: number;
  statusIds?: string[];
  sortOn?: string;
  sortDescending?: boolean;
} = {}): Promise<PrintavoAPIResponse<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>> {
  try {
    // Generate a cache key based on the search parameters
    const cacheKey = `search_quotes_${JSON.stringify(params)}`;
    
    // Check if we have a cached result (2 minutes TTL for search results)
    const cachedResult = cache.get<PrintavoAPIResponse<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>>(cacheKey);
    if (cachedResult) {
      logger.info(`Using cached result for quotes search with params: ${JSON.stringify(params)}`);
      return cachedResult;
    }
    
    logger.info(`Searching quotes with params: ${JSON.stringify(params)}`);
    const result = await query<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>(
      quoteQueries.searchQuotes,
      { ...params, first: params.first || 10 }
    );
    
    if (!result.data?.quotes?.edges) {
      return { 
        data: undefined,
        errors: [{ message: `No quotes found matching query: ${params.query || ''}` }],
        success: false, 
        error: new PrintavoNotFoundError(`No quotes found matching query: ${params.query || ''}`) 
      };
    }
    
    const response = { 
      data: result.data,
      success: true 
    };
    
    // Cache the successful result for 2 minutes
    cache.set(cacheKey, response, 120000);
    return response;
  } catch (error) {
    logger.error(`Error searching quotes:`, error);
    return {
      data: undefined,
      errors: [{ message: `Failed to search quotes with query: ${params.query || ''}` }],
      success: false,
      error: handleAPIError(error, `Failed to search quotes with query: ${params.query || ''}`)
    };
  }
}

// Export all quote operations
export const quoteOperations = {
  getQuote,
  getQuoteByVisualId,
  searchQuotes,
};

// Create invoice from a quote or from scratch
export async function createInvoice(input: any): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    logger.info(`Creating invoice with input: ${JSON.stringify(input)}`);
    
    // Validate required fields
    if (!input.customerId && (!input.customerName || !input.customerEmail)) {
      const error = new Error('Either customerId or customerName+customerEmail is required to create an invoice');
      logger.error('Invoice creation validation error:', error);
      return {
        data: undefined,
        errors: [{ message: 'validation error: Either customerId or customerName+customerEmail is required' }],
        success: false,
        error
      };
    }
    
    const result = await query<{ createInvoice: { invoice: PrintavoOrder } }>(
      quoteQueries.createInvoice, 
      { input }
    );
    
    if (!result.data?.createInvoice?.invoice) {
      logger.error('Failed to create invoice, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to create invoice' }],
        success: false,
        error: new Error('Failed to create invoice')
      };
    }
    
    logger.info(`Successfully created invoice: ${result.data.createInvoice.invoice.id}`);
    return {
      data: result.data.createInvoice.invoice,
      success: true
    };
  } catch (error) {
    logger.error('Error creating invoice:', error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to create invoice' }],
      success: false,
      error: handleAPIError(error, 'Failed to create invoice')
    };
  }
}
