/**
 * Enhanced logging utility with detailed error reporting
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Configure logging behavior
const isDevelopment = process.env.NODE_ENV === 'development';
const LOG_MAX_DEPTH = 3; // Max depth for object serialization
const INCLUDE_STACK_TRACE = true; // Include stack traces for errors
const MAX_STRING_LENGTH = 10000; // Max length for logged strings to prevent console overload

/**
 * Format objects and errors for better readability
 */
function formatValue(value: any, depth = 0): string {
  if (depth > LOG_MAX_DEPTH) {
    return '[Object]'; // Prevent deep recursion
  }

  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  // Handle Error objects specially
  if (value instanceof Error) {
    const errorObj: Record<string, any> = {
      name: value.name,
      message: value.message,
      stack: INCLUDE_STACK_TRACE ? value.stack : undefined,
    };
    
    // Capture non-standard error properties
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key) && 
          !['name', 'message', 'stack'].includes(key)) {
        try {
          errorObj[key] = (value as Record<string, any>)[key];
        } catch (e) {
          errorObj[key] = '[Getter/Setter error]';
        }
      }
    }
    
    return JSON.stringify(errorObj, null, 2);
  }

  // Handle other types
  switch (typeof value) {
    case 'string':
      return value.length > MAX_STRING_LENGTH 
        ? value.substring(0, MAX_STRING_LENGTH) + '... [truncated]' 
        : value;
    case 'function':
      return `[Function: ${value.name || 'anonymous'}]`;
    case 'object':
      if (Array.isArray(value)) {
        const items = value.map(item => formatValue(item, depth + 1));
        return `[${items.join(', ')}]`;
      }
      try {
        const formattedObj: Record<string, any> = {};
        for (const key in value) {
          if (Object.prototype.hasOwnProperty.call(value, key)) {
            try {
              formattedObj[key] = formatValue(value[key], depth + 1);
            } catch (e) {
              formattedObj[key] = '[Circular or getter/setter error]';
            }
          }
        }
        return JSON.stringify(formattedObj, null, 2);
      } catch (e) {
        return '[Complex Object]';
      }
    default:
      return String(value);
  }
}

/**
 * Get current code location for better context
 */
function getCodeLocation(): string {
  try {
    const stack = new Error().stack || '';
    const stackLines = stack.split('\n');
    
    // Skip the first 3 lines (Error, getCodeLocation, log)
    for (let i = 3; i < stackLines.length; i++) {
      const line = stackLines[i];
      if (line && !line.includes('node_modules') && !line.includes('at log ')) {
        // Extract clean location info
        const locationMatch = line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
        if (locationMatch) {
          const [_, funcName, file, lineNum, colNum] = locationMatch;
          return `${file.split('/').pop()}:${lineNum}${funcName ? ` (${funcName})` : ''}`;
        } else {
          // Simpler format without parentheses
          const simpleMatch = line.match(/at\s+(.+?):(\d+):(\d+)/);
          if (simpleMatch) {
            const [_, file, lineNum, colNum] = simpleMatch;
            return `${file.split('/').pop()}:${lineNum}`;
          }
        }
      }
    }
  } catch (e) {
    // Ignore errors in stack tracing
  }
  return '';
}

/**
 * Enhanced log method with better formatting and context information
 */
function log(level: LogLevel, ...args: any[]): void {
  // In production, only log warnings and errors unless explicitly configured
  if (!isDevelopment && (level !== 'warn' && level !== 'error')) {
    return;
  }

  const timestamp = new Date().toISOString();
  const location = getCodeLocation();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]${location ? ` [${location}]` : ''}`;
  
  // Format all arguments for better readability
  const formattedArgs = args.map(arg => {
    if (typeof arg === 'string') {
      return arg;
    }
    return formatValue(arg);
  });

  // Log to console with appropriate level
  switch (level) {
    case 'debug':
      console.debug(prefix, ...formattedArgs);
      break;
    case 'info':
      console.info(prefix, ...formattedArgs);
      break;
    case 'warn':
      console.warn(prefix, ...formattedArgs);
      break;
    case 'error':
      console.error(prefix, ...formattedArgs);
      
      // For errors, additionally log to any error monitoring service if configured
      if (isDevelopment && typeof window !== 'undefined') {
        console.groupCollapsed('Error Details');
        args.forEach((arg, i) => {
          if (arg instanceof Error) {
            console.error(`Error ${i+1}:`, arg);
            console.error('Stack trace:', arg.stack);
          } else if (typeof arg === 'object' && arg !== null) {
            console.error(`Context ${i+1}:`, arg);
          }
        });
        console.groupEnd();
      }
      break;
  }
}

export const logger = {
  debug: (...args: any[]) => log('debug', ...args),
  info: (...args: any[]) => log('info', ...args),
  warn: (...args: any[]) => log('warn', ...args),
  error: (...args: any[]) => log('error', ...args),
  
  // New utility methods
  
  /**
   * Log an error with additional context
   */
  logError: (error: Error, context?: Record<string, any>) => {
    log('error', error, context || {});
  },
  
  /**
   * Create a logger with predefined context
   */
  withContext: (context: Record<string, any>) => {
    return {
      debug: (...args: any[]) => log('debug', ...args, { context }),
      info: (...args: any[]) => log('info', ...args, { context }),
      warn: (...args: any[]) => log('warn', ...args, { context }),
      error: (...args: any[]) => log('error', ...args, { context }),
    };
  }
};