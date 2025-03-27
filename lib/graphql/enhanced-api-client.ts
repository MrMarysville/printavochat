import { logger } from '../logger';
import { PrintavoAPIResponse, query } from './utils';
import { quoteQueries } from './queries/quoteQueries';
import { PrintavoOrder } from '../types';
import { handleAPIError } from './utils';
import { PrintavoNotFoundError, PrintavoRateLimitError } from './errors';
import cache from '../cache';

// Request queue for managing API calls
class RequestQueue {
  private queue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
    request: () => Promise<any>;
  }> = [];
  private processing = false;
  private rateLimitResetTime: number | null = null;
  private readonly minDelayBetweenRequests = 100; // ms
  private lastRequestTime = 0;

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject, request });
      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    
    while (this.queue.length > 0) {
      // Check rate limit reset time
      if (this.rateLimitResetTime && Date.now() < this.rateLimitResetTime) {
        const waitTime = this.rateLimitResetTime - Date.now();
        logger.info(`Waiting ${waitTime}ms for rate limit reset`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }

      // Ensure minimum delay between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minDelayBetweenRequests) {
        await new Promise(resolve => 
          setTimeout(resolve, this.minDelayBetweenRequests - timeSinceLastRequest)
        );
      }

      const { resolve, reject, request } = this.queue.shift()!;

      try {
        this.lastRequestTime = Date.now();
        const result = await request();
        resolve(result);
      } catch (error: any) {
        if (error.status === 429) { // Rate limit hit
          this.rateLimitResetTime = Date.now() + (parseInt(error.headers?.['retry-after'] || '60') * 1000);
          // Put the request back in the queue
          this.queue.unshift({ resolve, reject, request });
          continue;
        }
        reject(error);
      }
    }

    this.processing = false;
  }
}

const requestQueue = new RequestQueue();

// Enhanced API client with fallback mechanisms
export class EnhancedAPIClient {
  private static instance: EnhancedAPIClient;
  private retryAttempts = 3;
  private fallbackDelay = 1000; // ms

  private constructor() {}

  static getInstance(): EnhancedAPIClient {
    if (!EnhancedAPIClient.instance) {
      EnhancedAPIClient.instance = new EnhancedAPIClient();
    }
    return EnhancedAPIClient.instance;
  }

  // Get order with fallback to quotes endpoint
  async getOrder(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    const cacheKey = `order_${visualId}`;
    const cachedResult = cache.get<PrintavoAPIResponse<PrintavoOrder>>(cacheKey);
    
    if (cachedResult) {
      logger.info(`Using cached result for order ${visualId}`);
      return cachedResult;
    }

    // Try primary endpoint first
    try {
      const result = await this.tryGetOrder(visualId);
      if (result.success) {
        cache.set(cacheKey, result);
        return result;
      }
    } catch (error) {
      logger.warn(`Primary endpoint failed for order ${visualId}, trying fallback`, error);
    }

    // Fallback to quotes endpoint
    await new Promise(resolve => setTimeout(resolve, this.fallbackDelay));
    
    try {
      const result = await this.tryGetQuote(visualId);
      if (result.success) {
        cache.set(cacheKey, result);
        return result;
      }
    } catch (error) {
      logger.error(`Both primary and fallback endpoints failed for order ${visualId}`, error);
    }

    return {
      data: undefined,
      success: false,
      errors: [{ message: `Failed to find order with Visual ID: ${visualId}` }],
      error: new PrintavoNotFoundError(`Failed to find order with Visual ID: ${visualId}`)
    };
  }

  private async tryGetOrder(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    return await requestQueue.add(async () => {
      const result = await query(quoteQueries.searchQuotesByVisualId, {
        query: visualId.trim(),
        first: 1
      });

      if (!result.data?.quotes?.edges?.length) {
        throw new PrintavoNotFoundError(`Order not found with Visual ID: ${visualId}`);
      }

      return {
        data: result.data.quotes.edges[0].node,
        success: true
      };
    });
  }

  private async tryGetQuote(visualId: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    return await requestQueue.add(async () => {
      const result = await query(quoteQueries.searchQuotes, {
        query: visualId.trim(),
        first: 1
      });

      if (!result.data?.quotes?.edges?.length) {
        throw new PrintavoNotFoundError(`Quote not found with Visual ID: ${visualId}`);
      }

      return {
        data: result.data.quotes.edges[0].node,
        success: true
      };
    });
  }

  // Enhanced search with intelligent caching and rate limiting
  async searchOrders(params: {
    query?: string;
    first?: number;
    statusIds?: string[];
    sortOn?: string;
    sortDescending?: boolean;
  } = {}): Promise<PrintavoAPIResponse<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>> {
    const cacheKey = `search_${JSON.stringify(params)}`;
    const cachedResult = cache.get<PrintavoAPIResponse<{ quotes: { edges: Array<{ node: PrintavoOrder }> } }>>(cacheKey);
    
    if (cachedResult) {
      logger.info(`Using cached result for search with params: ${JSON.stringify(params)}`);
      return cachedResult;
    }

    return await requestQueue.add(async () => {
      try {
        const result = await query(quoteQueries.searchQuotes, {
          ...params,
          first: params.first || 10
        });

        if (!result.data?.quotes?.edges) {
          return {
            data: undefined,
            success: false,
            errors: [{ message: `No results found for query: ${params.query || ''}` }],
            error: new PrintavoNotFoundError(`No results found for query: ${params.query || ''}`)
          };
        }

        const response = {
          data: result.data,
          success: true
        };

        // Cache successful results
        cache.set(cacheKey, response, 120000); // 2 minute cache
        return response;
      } catch (error: any) {
        if (error.status === 429) {
          throw new PrintavoRateLimitError('Rate limit exceeded', error.headers?.['retry-after']);
        }
        throw error;
      }
    });
  }
} 