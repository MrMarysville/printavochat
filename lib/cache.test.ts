import { Cache } from './cache';

describe('Cache', () => {
  let cache: Cache;

  beforeEach(() => {
    // Reset the singleton instance for each test
    // This is a bit of a hack since we're accessing a private property
    (Cache as any).instance = undefined;
    cache = Cache.getInstance();
  });

  test('should store and retrieve values', () => {
    cache.set('test-key', 'test-value');
    expect(cache.get('test-key')).toBe('test-value');
  });

  test('should return undefined for non-existent keys', () => {
    expect(cache.get('non-existent-key')).toBeUndefined();
  });

  test('should correctly check if a key exists', () => {
    cache.set('test-key', 'test-value');
    expect(cache.has('test-key')).toBe(true);
    expect(cache.has('non-existent-key')).toBe(false);
  });

  test('should delete keys', () => {
    cache.set('test-key', 'test-value');
    expect(cache.has('test-key')).toBe(true);
    
    cache.delete('test-key');
    expect(cache.has('test-key')).toBe(false);
    expect(cache.get('test-key')).toBeUndefined();
  });

  test('should clear all keys', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    
    cache.clear();
    
    expect(cache.has('key1')).toBe(false);
    expect(cache.has('key2')).toBe(false);
    expect(cache.size()).toBe(0);
  });

  test('should expire items after TTL', () => {
    jest.useFakeTimers();
    
    // Set with a short TTL (100ms)
    cache.set('test-key', 'test-value', 100);
    
    // Verify it exists initially
    expect(cache.get('test-key')).toBe('test-value');
    
    // Advance time past TTL
    jest.advanceTimersByTime(101);
    
    // Item should be expired now
    expect(cache.get('test-key')).toBeUndefined();
    expect(cache.has('test-key')).toBe(false);
    
    jest.useRealTimers();
  });

  test('should return correct size', () => {
    expect(cache.size()).toBe(0);
    
    cache.set('key1', 'value1');
    expect(cache.size()).toBe(1);
    
    cache.set('key2', 'value2');
    expect(cache.size()).toBe(2);
    
    cache.delete('key1');
    expect(cache.size()).toBe(1);
    
    cache.clear();
    expect(cache.size()).toBe(0);
  });

  test('should automatically clean expired items when checking size', () => {
    jest.useFakeTimers();
    
    // Set with a short TTL (100ms)
    cache.set('test-key', 'test-value', 100);
    expect(cache.size()).toBe(1);
    
    // Advance time past TTL
    jest.advanceTimersByTime(101);
    
    // Size should be 0 after cleaning expired items
    expect(cache.size()).toBe(0);
    
    jest.useRealTimers();
  });
});