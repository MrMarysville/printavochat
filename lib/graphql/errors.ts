// Custom error classes for better error handling
export class PrintavoAPIError extends Error {
  constructor(
    message: string,
    public readonly _statusCode?: number,
    public readonly _code?: string,
    public readonly _details?: any
  ) {
    super(message);
    this.name = 'PrintavoAPIError';
  }
}

// Update the subclasses to use the public properties
export class PrintavoAuthenticationError extends PrintavoAPIError {
  constructor(message: string = 'Authentication failed with Printavo API') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

export class PrintavoValidationError extends PrintavoAPIError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class PrintavoNotFoundError extends PrintavoAPIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class PrintavoRateLimitError extends PrintavoAPIError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
  }
}
