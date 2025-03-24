/**
 * Simple in-memory cache implementation with TTL (Time To Live)
 */

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheItem<any>>;
  private defaultTTL: number;

  private constructor(defaultTTL: number = 300000) { // Default TTL: 5 minutes (in milliseconds)
    this.cache = new Map();
    this.defaultTTL = defaultTTL;
  }

  /**
   * Get the singleton instance of the cache
   */
  public static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  /**
   * Set a value in the cache with an optional TTL
   * @param key The cache key
   * @param value The value to cache
   * @param ttl Time to live in milliseconds (optional, defaults to the instance default)
   */
  public set<T>(key: string, value: T, ttl?: number): void {
    const expiresAt = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { value, expiresAt });
  }

  /**
   * Get a value from the cache
   * @param key The cache key
   * @returns The cached value or undefined if not found or expired
   */
  public get<T>(key: string): T | undefined {
    const item = this.cache.get(key);
    
    // Return undefined if item doesn't exist or has expired
    if (!item || item.expiresAt < Date.now()) {
      if (item) {
        // Clean up expired item
        this.cache.delete(key);
      }
      return undefined;
    }
    
    return item.value as T;
  }

  /**
   * Check if a key exists in the cache and is not expired
   * @param key The cache key
   * @returns True if the key exists and is not expired
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);
    const exists = !!item && item.expiresAt >= Date.now();
    
    // Clean up expired item
    if (item && !exists) {
      this.cache.delete(key);
    }
    
    return exists;
  }

  /**
   * Delete a key from the cache
   * @param key The cache key
   */
  public delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from the cache
   */
  public clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of items in the cache
   */
  public size(): number {
    // Clean up expired items before returning size
    this.cleanExpired();
    return this.cache.size;
  }

  /**
   * Clean up expired items
   */
  private cleanExpired(): void {
    const now = Date.now();
    Array.from(this.cache.entries()).forEach(([key, item]) => {
      if (item.expiresAt < now) {
        this.cache.delete(key);
      }
    });
  }
}

export default Cache.getInstance();