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

// Create a new quote
export async function createQuote(input: any): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    logger.info(`Creating quote with input: ${JSON.stringify(input)}`);
    
    // Validate required fields
    if (!input.customerId && (!input.customerName || !input.customerEmail)) {
      const error = new Error('Either customerId or customerName+customerEmail is required to create a quote');
      logger.error('Quote creation validation error:', error);
      return {
        data: undefined,
        errors: [{ message: 'validation error: Either customerId or customerName+customerEmail is required' }],
        success: false,
        error
      };
    }
    
    const result = await query<{ createQuote: { quote: PrintavoOrder } }>(
      quoteQueries.createQuote, 
      { input }
    );
    
    if (!result.data?.createQuote?.quote) {
      logger.error('Failed to create quote, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to create quote' }],
        success: false,
        error: new Error('Failed to create quote')
      };
    }
    
    logger.info(`Successfully created quote: ${result.data.createQuote.quote.id}`);
    return {
      data: result.data.createQuote.quote,
      success: true
    };
  } catch (error) {
    logger.error('Error creating quote:', error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to create quote' }],
      success: false,
      error: handleAPIError(error, 'Failed to create quote')
    };
  }
}

// Add a line item group to a quote
export async function addLineItemGroup(parentId: string, input: any): Promise<PrintavoAPIResponse<any>> {
  try {
    logger.info(`Adding line item group to ${parentId} with input: ${JSON.stringify(input)}`);
    
    const result = await query<{ addLineItemGroup: { lineItemGroup: any } }>(
      quoteQueries.addLineItemGroup, 
      { parentId, input }
    );
    
    if (!result.data?.addLineItemGroup?.lineItemGroup) {
      logger.error('Failed to add line item group, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to add line item group' }],
        success: false,
        error: new Error('Failed to add line item group')
      };
    }
    
    logger.info(`Successfully added line item group to ${parentId}`);
    return {
      data: result.data.addLineItemGroup.lineItemGroup,
      success: true
    };
  } catch (error) {
    logger.error(`Error adding line item group to ${parentId}:`, error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to add line item group' }],
      success: false,
      error: handleAPIError(error, 'Failed to add line item group')
    };
  }
}

// Add a line item to a line item group
export async function addLineItem(lineItemGroupId: string, input: any): Promise<PrintavoAPIResponse<any>> {
  try {
    logger.info(`Adding line item to group ${lineItemGroupId} with input: ${JSON.stringify(input)}`);
    
    const result = await query<{ addLineItem: { lineItem: any } }>(
      quoteQueries.addLineItem, 
      { lineItemGroupId, input }
    );
    
    if (!result.data?.addLineItem?.lineItem) {
      logger.error('Failed to add line item, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to add line item' }],
        success: false,
        error: new Error('Failed to add line item')
      };
    }
    
    logger.info(`Successfully added line item to group ${lineItemGroupId}`);
    return {
      data: result.data.addLineItem.lineItem,
      success: true
    };
  } catch (error) {
    logger.error(`Error adding line item to group ${lineItemGroupId}:`, error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to add line item' }],
      success: false,
      error: handleAPIError(error, 'Failed to add line item')
    };
  }
}

// Add a custom address to a quote
export async function addCustomAddress(quoteId: string, input: any): Promise<PrintavoAPIResponse<any>> {
  try {
    logger.info(`Adding custom address to quote ${quoteId} with input: ${JSON.stringify(input)}`);
    
    const result = await query<{ addCustomAddress: { address: any } }>(
      quoteQueries.addCustomAddress, 
      { quoteId, input }
    );
    
    if (!result.data?.addCustomAddress?.address) {
      logger.error('Failed to add custom address, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to add custom address' }],
        success: false,
        error: new Error('Failed to add custom address')
      };
    }
    
    logger.info(`Successfully added custom address to quote ${quoteId}`);
    return {
      data: result.data.addCustomAddress.address,
      success: true
    };
  } catch (error) {
    logger.error(`Error adding custom address to quote ${quoteId}:`, error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to add custom address' }],
      success: false,
      error: handleAPIError(error, 'Failed to add custom address')
    };
  }
}

// Add an imprint to a line item group
export async function addImprint(lineItemGroupId: string, input: any): Promise<PrintavoAPIResponse<any>> {
  try {
    logger.info(`Adding imprint to group ${lineItemGroupId} with input: ${JSON.stringify(input)}`);
    
    const result = await query<{ addImprint: { imprint: any } }>(
      quoteQueries.addImprint, 
      { lineItemGroupId, input }
    );
    
    if (!result.data?.addImprint?.imprint) {
      logger.error('Failed to add imprint, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to add imprint' }],
        success: false,
        error: new Error('Failed to add imprint')
      };
    }
    
    logger.info(`Successfully added imprint to group ${lineItemGroupId}`);
    return {
      data: result.data.addImprint.imprint,
      success: true
    };
  } catch (error) {
    logger.error(`Error adding imprint to group ${lineItemGroupId}:`, error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to add imprint' }],
      success: false,
      error: handleAPIError(error, 'Failed to add imprint')
    };
  }
}

// Update the status of a quote
export async function updateStatus(quoteId: string, statusId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    logger.info(`Updating status of quote ${quoteId} to status ${statusId}`);
    
    const result = await query<{ updateQuoteStatus: { quote: PrintavoOrder } }>(
      quoteQueries.updateQuoteStatus, 
      { quoteId, statusId }
    );
    
    if (!result.data?.updateQuoteStatus?.quote) {
      logger.error('Failed to update quote status, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to update quote status' }],
        success: false,
        error: new Error('Failed to update quote status')
      };
    }
    
    logger.info(`Successfully updated status of quote ${quoteId} to status ${statusId}`);
    return {
      data: result.data.updateQuoteStatus.quote,
      success: true
    };
  } catch (error) {
    logger.error(`Error updating status of quote ${quoteId}:`, error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to update quote status' }],
      success: false,
      error: handleAPIError(error, 'Failed to update quote status')
    };
  }
}

// Create a complete quote with all details in one operation
export async function createCompleteQuote(input: any): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    logger.info(`Creating complete quote with input: ${JSON.stringify(input)}`);
    
    // Validate required fields
    if (!input.customerId && (!input.customerName || !input.customerEmail)) {
      const error = new Error('Either customerId or customerName+customerEmail is required to create a quote');
      logger.error('Quote creation validation error:', error);
      return {
        data: undefined,
        errors: [{ message: 'validation error: Either customerId or customerName+customerEmail is required' }],
        success: false,
        error
      };
    }
    
    const result = await query<{ createCompleteQuote: { quote: PrintavoOrder } }>(
      quoteQueries.createCompleteQuote, 
      { input }
    );
    
    if (!result.data?.createCompleteQuote?.quote) {
      logger.error('Failed to create complete quote, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to create complete quote' }],
        success: false,
        error: new Error('Failed to create complete quote')
      };
    }
    
    logger.info(`Successfully created complete quote: ${result.data.createCompleteQuote.quote.id}`);
    return {
      data: result.data.createCompleteQuote.quote,
      success: true
    };
  } catch (error) {
    logger.error('Error creating complete quote:', error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to create complete quote' }],
      success: false,
      error: handleAPIError(error, 'Failed to create complete quote')
    };
  }
}

// Calculate pricing for a quote
export async function calculatePricing(quoteId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    logger.info(`Calculating pricing for quote ${quoteId}`);
    
    const result = await query<{ calculateQuotePricing: { quote: PrintavoOrder } }>(
      quoteQueries.calculateQuotePricing, 
      { quoteId }
    );
    
    if (!result.data?.calculateQuotePricing?.quote) {
      logger.error('Failed to calculate quote pricing, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to calculate quote pricing' }],
        success: false,
        error: new Error('Failed to calculate quote pricing')
      };
    }
    
    logger.info(`Successfully calculated pricing for quote ${quoteId}`);
    return {
      data: result.data.calculateQuotePricing.quote,
      success: true
    };
  } catch (error) {
    logger.error(`Error calculating pricing for quote ${quoteId}:`, error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to calculate quote pricing' }],
      success: false,
      error: handleAPIError(error, 'Failed to calculate quote pricing')
    };
  }
}

// Calculate the total for a quote
export async function calculateQuoteTotal(quoteId: string): Promise<PrintavoAPIResponse<number>> {
  try {
    logger.info(`Calculating total for quote ${quoteId}`);
    
    const result = await query<{ calculateQuoteTotal: { total: number } }>(
      quoteQueries.calculateQuoteTotal, 
      { quoteId }
    );
    
    if (result.data?.calculateQuoteTotal?.total === undefined) {
      logger.error('Failed to calculate quote total, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to calculate quote total' }],
        success: false,
        error: new Error('Failed to calculate quote total')
      };
    }
    
    logger.info(`Successfully calculated total for quote ${quoteId}: ${result.data.calculateQuoteTotal.total}`);
    return {
      data: result.data.calculateQuoteTotal.total,
      success: true
    };
  } catch (error) {
    logger.error(`Error calculating total for quote ${quoteId}:`, error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to calculate quote total' }],
      success: false,
      error: handleAPIError(error, 'Failed to calculate quote total')
    };
  }
}

// Create a quote from products
export async function createQuoteFromProducts(input: any): Promise<PrintavoAPIResponse<PrintavoOrder>> {
  try {
    logger.info(`Creating quote from products with input: ${JSON.stringify(input)}`);
    
    // Validate required fields
    if (!input.customerId && (!input.customerName || !input.customerEmail)) {
      const error = new Error('Either customerId or customerName+customerEmail is required to create a quote');
      logger.error('Quote creation validation error:', error);
      return {
        data: undefined,
        errors: [{ message: 'validation error: Either customerId or customerName+customerEmail is required' }],
        success: false,
        error
      };
    }
    
    const result = await query<{ createQuoteFromProducts: { quote: PrintavoOrder } }>(
      quoteQueries.createQuoteFromProducts, 
      { input }
    );
    
    if (!result.data?.createQuoteFromProducts?.quote) {
      logger.error('Failed to create quote from products, missing data in response');
      return {
        data: undefined,
        errors: [{ message: 'Failed to create quote from products' }],
        success: false,
        error: new Error('Failed to create quote from products')
      };
    }
    
    logger.info(`Successfully created quote from products: ${result.data.createQuoteFromProducts.quote.id}`);
    return {
      data: result.data.createQuoteFromProducts.quote,
      success: true
    };
  } catch (error) {
    logger.error('Error creating quote from products:', error);
    return {
      data: undefined,
      errors: [{ message: 'Failed to create quote from products' }],
      success: false,
      error: handleAPIError(error, 'Failed to create quote from products')
    };
  }
}

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

// Export all quote operations
export const quoteOperations = {
  getQuote,
  getQuoteByVisualId,
  searchQuotes,
  createQuote,
  addLineItemGroup,
  addLineItem,
  addCustomAddress,
  addImprint,
  updateStatus,
  createCompleteQuote,
  calculatePricing,
  calculateQuoteTotal,
  createQuoteFromProducts,
  createInvoice
};
