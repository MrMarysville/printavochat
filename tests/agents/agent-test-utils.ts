import { performance } from 'perf_hooks';

/**
 * Utility functions for agent testing and performance measurement
 */

/**
 * Measures the execution time of a function
 */
export async function measurePerformance<T>(
  fn: () => Promise<T>,
  iterations: number = 1
): Promise<{
  result: T;
  averageTimeMs: number;
  totalTimeMs: number;
  iterations: number;
}> {
  let totalTimeMs = 0;
  let result: T | null = null;

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    if (i === iterations - 1) {
      // Only save the result from the last iteration
      result = await fn();
    } else {
      await fn();
    }
    const end = performance.now();
    totalTimeMs += (end - start);
  }

  return {
    result: result as T,
    averageTimeMs: totalTimeMs / iterations,
    totalTimeMs,
    iterations
  };
}

/**
 * Mock GraphQL execution function for testing Printavo agent
 */
export function createMockGraphQLExecutor(mockResponses: Record<string, any>) {
  return async (query: string, variables?: any, operationName?: string): Promise<any> => {
    // Simple query name extraction (this is a basic implementation)
    const queryNameMatch = query.match(/query\s+(\w+)|mutation\s+(\w+)/);
    const extractedName = queryNameMatch ? (queryNameMatch[1] || queryNameMatch[2]) : operationName;
    
    const responseName = operationName || extractedName || Object.keys(mockResponses)[0];
    
    if (!mockResponses[responseName]) {
      throw new Error(`No mock response for operation: ${responseName}`);
    }
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return mockResponses[responseName];
  };
}

/**
 * Records all calls to a function for testing and verification
 */
export function createRecordingProxy<T extends object>(obj: T): T & { calls: Record<string, any[]> } {
  const calls: Record<string, any[]> = {};
  
  const proxy = new Proxy(obj, {
    get(target, prop, receiver) {
      const origMethod = target[prop as keyof T];
      
      if (typeof origMethod === 'function') {
        return function(...args: any[]) {
          // Record the call
          if (!calls[prop.toString()]) {
            calls[prop.toString()] = [];
          }
          calls[prop.toString()].push(args);
          
          // Call the original method
          return origMethod.apply(target, args);
        };
      }
      
      return Reflect.get(target, prop, receiver);
    }
  });
  
  return Object.assign(proxy, { calls });
}

/**
 * Compare results between two implementations (e.g., MCP server vs. Agent)
 */
export function compareResults(a: any, b: any): { identical: boolean; differences: any[] } {
  const differences: any[] = [];
  
  function compare(objA: any, objB: any, path: string = ''): void {
    if (objA === objB) return;
    
    if (typeof objA !== typeof objB) {
      differences.push({ path, a: objA, b: objB, reason: 'type mismatch' });
      return;
    }
    
    if (Array.isArray(objA) && Array.isArray(objB)) {
      if (objA.length !== objB.length) {
        differences.push({ path, reason: 'array length mismatch', a: objA.length, b: objB.length });
      }
      
      const minLength = Math.min(objA.length, objB.length);
      for (let i = 0; i < minLength; i++) {
        compare(objA[i], objB[i], `${path}[${i}]`);
      }
      return;
    }
    
    if (typeof objA === 'object' && objA !== null && objB !== null) {
      const keysA = Object.keys(objA);
      const keysB = Object.keys(objB);
      
      // Check for missing keys
      keysA.forEach(key => {
        if (!keysB.includes(key)) {
          differences.push({ path: `${path}.${key}`, reason: 'key missing in B', value: objA[key] });
        }
      });
      
      keysB.forEach(key => {
        if (!keysA.includes(key)) {
          differences.push({ path: `${path}.${key}`, reason: 'key missing in A', value: objB[key] });
        }
      });
      
      // Check common keys
      keysA.filter(key => keysB.includes(key)).forEach(key => {
        compare(objA[key], objB[key], `${path}.${key}`);
      });
      return;
    }
    
    // Simple value comparison
    if (objA !== objB) {
      differences.push({ path, a: objA, b: objB, reason: 'value mismatch' });
    }
  }
  
  compare(a, b);
  
  return {
    identical: differences.length === 0,
    differences
  };
} 