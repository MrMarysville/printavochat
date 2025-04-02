/**
 * Caching mechanism for Agent operations.
 * This provides memory caching with TTL and key generation utilities
 * to improve performance by avoiding redundant API calls.
 */

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  keyPrefix?: string; // Prefix for cache keys
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class AgentCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes default TTL
  private keyPrefix: string = 'agent-cache:';

  /**
   * Set cache options
   */
  setOptions(options: CacheOptions): void {
    if (options.ttl) {
      this.defaultTTL = options.ttl;
    }
    if (options.keyPrefix) {
      this.keyPrefix = options.keyPrefix;
    }
  }

  /**
   * Generate a cache key from operation name and parameters
   */
  generateKey(operation: string, params: any): string {
    // Handle different parameter types for consistent key generation
    let paramsString: string;
    
    if (params === null || params === undefined) {
      paramsString = '';
    } else if (typeof params === 'string' || typeof params === 'number' || typeof params === 'boolean') {
      paramsString = String(params);
    } else {
      // For objects and arrays, sort keys for consistency
      paramsString = JSON.stringify(params, Object.keys(params).sort());
    }
    
    return `${this.keyPrefix}${operation}:${paramsString}`;
  }

  /**
   * Get a value from cache with the specified operation and parameters
   */
  get<T>(operation: string, params: any): T | undefined {
    const key = this.generateKey(operation, params);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if the entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  /**
   * Set a value in cache with the specified operation and parameters
   */
  set<T>(operation: string, params: any, value: T, ttl?: number): void {
    const key = this.generateKey(operation, params);
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Execute a function with caching
   * If the result is already cached and not expired, return it.
   * Otherwise, execute the function and cache the result.
   */
  async executeWithCache<T>(
    operation: string,
    params: any,
    fn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = this.get<T>(operation, params);
    if (cached !== undefined) {
      return cached;
    }
    
    // Execute the function
    const result = await fn();
    
    // Cache the result
    this.set(operation, params, result, ttl);
    
    return result;
  }

  /**
   * Remove a value from cache
   */
  remove(operation: string, params: any): void {
    const key = this.generateKey(operation, params);
    this.cache.delete(key);
  }

  /**
   * Manually delete a key from the cache
   */
  deleteKey(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Extract the operation name from a cache key
   */
  private extractOperationFromKey(key: string): string {
    // Skip the keyPrefix
    const withoutPrefix = key.startsWith(this.keyPrefix) 
      ? key.substring(this.keyPrefix.length) 
      : key;
    
    // Get the part before the colon (which is the operation)
    const colonIndex = withoutPrefix.indexOf(':');
    if (colonIndex !== -1) {
      return withoutPrefix.substring(0, colonIndex);
    }
    
    return withoutPrefix;
  }

  /**
   * Clear all cache entries or entries with a specific prefix
   */
  clear(operationPrefix?: string): void {
    if (!operationPrefix) {
      this.cache.clear();
      return;
    }
    
    // Create a list of keys to delete
    const keysToDelete: string[] = [];
    
    // Iterate through all keys in the cache
    for (const key of this.cache.keys()) {
      const operation = this.extractOperationFromKey(key);
      
      // Check if this operation starts with the prefix
      if (operation.startsWith(operationPrefix)) {
        keysToDelete.push(key);
      }
    }
    
    // Delete the keys
    for (const key of keysToDelete) {
      this.cache.delete(key);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const agentCache = new AgentCache();

/**
 * Decorator to cache method results.
 * Can be used on agent methods to automatically cache results.
 * 
 * Example:
 * ```
 * class MyAgent {
 *   @cacheable('get_product', 10 * 60 * 1000) // 10 minute TTL
 *   async getProduct(id: string): Promise<Product> {
 *     // Implementation...
 *   }
 * }
 * ```
 */
export function cacheable(operation: string, ttl?: number) {
  return function(
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args: any[]) {
      // Use the first argument as the params for cache key generation
      const params = args.length > 0 ? args[0] : {};
      
      return agentCache.executeWithCache(
        operation,
        params,
        () => originalMethod.apply(this, args),
        ttl
      );
    };
    
    return descriptor;
  };
}

// Set up automatic expired entry cleanup every 5 minutes
setInterval(() => {
  agentCache.cleanExpired();
}, 5 * 60 * 1000);

export default agentCache; 