import { logger } from './logger';

/**
 * Agent Service
 * 
 * Provides a client-side interface for interacting with the agent system.
 * This service replaces the MCP client usage throughout the application.
 */

/**
 * Response type for agent operations
 */
export interface AgentResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Telemetry data for agent operations
 */
interface AgentTelemetry {
  operationCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  slowestOperation: {
    operation: string;
    time: number;
  } | null;
  lastError: {
    operation: string;
    error: string;
    timestamp: Date;
  } | null;
  operationTimings: Record<string, {
    count: number;
    totalTime: number;
    averageTime: number;
  }>;
}

/**
 * Agent service for client-side usage
 */
export class AgentService {
  // Feature flag for using the new Python service
  private static usePythonService: boolean = process.env.USE_PYTHON_AGENT === 'true';
  
  // Python service URL
  private static pythonServiceUrl: string = process.env.PYTHON_AGENT_URL || 'http://localhost:8000';
  
  // Telemetry data
  private static telemetry: AgentTelemetry = {
    operationCount: 0,
    successCount: 0,
    errorCount: 0,
    averageResponseTime: 0,
    slowestOperation: null,
    lastError: null,
    operationTimings: {},
  };

  /**
   * Execute an operation using the agent system
   */
  static async executeOperation<T>(
    operation: string, 
    params: any = {}, 
    useToolChoice: boolean = false,
    isAssistantMessage: boolean = false
  ): Promise<AgentResponse<T>> {
    const startTime = performance.now();
    
    // Check if we should use the Python service
    if (this.usePythonService && operation === 'printavo_search_orders') {
      // For search_orders, use the Python service
      return this.executePythonAgentOperation<T>(params);
    }
    
    try {
      this.telemetry.operationCount++;
      
      // Ensure operation has agent prefix
      let operationWithPrefix = operation;
      if (!operation.includes('_') && !isAssistantMessage) {
        // Default to printavo if no prefix
        operationWithPrefix = `printavo_${operation}`;
      }
      
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          operation: operationWithPrefix, 
          params,
          useToolChoice,
          isAssistantMessage
        }),
      });

      const result = await response.json();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Update telemetry
      this.updateTelemetry(operation, duration, result.success);
      
      if (!response.ok) {
        this.telemetry.errorCount++;
        this.telemetry.lastError = {
          operation,
          error: result.error || 'Unknown error occurred',
          timestamp: new Date(),
        };
        
        logger.error(`Agent operation failed: ${operation}`, {
          operation,
          params,
          error: result.error,
          duration,
        });
        
        return {
          success: false,
          error: result.error || 'Unknown error occurred',
        };
      }

      return result as AgentResponse<T>;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Update telemetry for error
      this.telemetry.errorCount++;
      this.telemetry.lastError = {
        operation,
        error: (error as Error).message || 'Unknown error occurred',
        timestamp: new Date(),
      };
      
      this.updateTelemetry(operation, duration, false);
      
      logger.error(`Agent operation threw exception: ${operation}`, {
        operation,
        params,
        error: (error as Error).message,
        stack: (error as Error).stack,
        duration,
      });
      
      return {
        success: false,
        error: (error as Error).message || 'Failed to execute operation',
      };
    }
  }
  
  /**
   * Execute an operation using the Python agent service
   */
  private static async executePythonAgentOperation<T>(params: any = {}): Promise<AgentResponse<T>> {
    const startTime = performance.now();
    
    try {
      logger.info('Using Python agent service', { params });
      
      // Prepare request for the Python agent service
      const requestBody = {
        query: params.query || '',
        exclude_completed: params.hasOwnProperty('exclude_completed') ? params.exclude_completed : true,
        exclude_quotes: params.hasOwnProperty('exclude_quotes') ? params.exclude_quotes : true
      };
      
      // Make request to the Python agent service
      const response = await fetch(`${this.pythonServiceUrl}/api/agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const result = await response.json();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Update telemetry
      this.updateTelemetry('python_agent', duration, result.success);
      
      if (!result.success) {
        this.telemetry.errorCount++;
        this.telemetry.lastError = {
          operation: 'python_agent',
          error: result.error || 'Unknown error occurred',
          timestamp: new Date(),
        };
        
        logger.error(`Python agent operation failed`, {
          params,
          error: result.error,
          duration,
        });
        
        return {
          success: false,
          error: result.error || 'Unknown error occurred',
        };
      }
      
      // For search_orders, we need to transform the response to match the expected format
      if (params.query) {
        // The data contains the agent's natural language response
        // For now, we'll just return it directly, but in the future we might
        // want to parse structured data from it
        return {
          success: true,
          data: result.data as unknown as T
        };
      }
      
      return result as AgentResponse<T>;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Update telemetry for error
      this.telemetry.errorCount++;
      this.telemetry.lastError = {
        operation: 'python_agent',
        error: (error as Error).message || 'Unknown error occurred',
        timestamp: new Date(),
      };
      
      this.updateTelemetry('python_agent', duration, false);
      
      logger.error(`Python agent operation threw exception`, {
        params,
        error: (error as Error).message,
        stack: (error as Error).stack,
        duration,
      });
      
      return {
        success: false,
        error: (error as Error).message || 'Failed to execute Python agent operation',
      };
    }
  }

  /**
   * Get the status of all agents
   */
  static async getStatus(): Promise<AgentResponse<any>> {
    const startTime = performance.now();
    
    try {
      // If using Python service, get status from there
      if (this.usePythonService) {
        const response = await fetch(`${this.pythonServiceUrl}/api/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          return {
            success: false,
            error: 'Failed to get Python agent status',
          };
        }
        
        const result = await response.json();
        return {
          success: true,
          data: {
            python_agent: result,
            usePythonService: true
          }
        };
      }
      
      // Otherwise, get status from the regular agent API
      const response = await fetch('/api/agent', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Update telemetry
      this.updateTelemetry('get_status', duration, result.success);
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Unknown error occurred',
        };
      }

      return result;
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Update telemetry for error
      this.updateTelemetry('get_status', duration, false);
      
      return {
        success: false,
        error: (error as Error).message || 'Failed to get agent status',
      };
    }
  }
  
  /**
   * Update telemetry data for an operation
   */
  private static updateTelemetry(operation: string, duration: number, success: boolean): void {
    // Update overall stats
    if (success) {
      this.telemetry.successCount++;
    }
    
    // Update operation-specific timing stats
    if (!this.telemetry.operationTimings[operation]) {
      this.telemetry.operationTimings[operation] = {
        count: 0,
        totalTime: 0,
        averageTime: 0,
      };
    }
    
    const opStats = this.telemetry.operationTimings[operation];
    opStats.count++;
    opStats.totalTime += duration;
    opStats.averageTime = opStats.totalTime / opStats.count;
    
    // Update overall average response time
    const totalResponseTime = Object.values(this.telemetry.operationTimings)
      .reduce((sum, opStat) => sum + opStat.totalTime, 0);
    this.telemetry.averageResponseTime = totalResponseTime / this.telemetry.operationCount;
    
    // Check if this is the slowest operation
    if (!this.telemetry.slowestOperation || duration > this.telemetry.slowestOperation.time) {
      this.telemetry.slowestOperation = {
        operation,
        time: duration,
      };
    }
  }
  
  /**
   * Get telemetry data for monitoring
   */
  static getTelemetry(): AgentTelemetry {
    return { ...this.telemetry };
  }
  
  /**
   * Reset telemetry data
   */
  static resetTelemetry(): void {
    this.telemetry = {
      operationCount: 0,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      slowestOperation: null,
      lastError: null,
      operationTimings: {},
    };
  }

  // Printavo-specific methods
  
  /**
   * Get an order by ID
   */
  static async getOrder(id: string): Promise<AgentResponse<any>> {
    return this.executeOperation('printavo_get_order', { id });
  }

  /**
   * Get an order by visual ID
   */
  static async getOrderByVisualId(visualId: string): Promise<AgentResponse<any>> {
    return this.executeOperation('printavo_get_order_by_visual_id', { visualId });
  }
  
  /**
   * Get an order by visual ID using directed tool choice (v2 feature)
   */
  static async getOrderByVisualIdDirected(visualId: string): Promise<AgentResponse<any>> {
    return this.executeOperation('printavo_get_order_by_visual_id', { visualId }, true);
  }
  
  /**
   * Add a custom assistant message showing order summary (v2 feature)
   */
  static async addOrderSummaryMessage(order: any): Promise<AgentResponse<string>> {
    return this.executeOperation('add_order_summary', { order }, false, true);
  }
  
  /**
   * Add a custom assistant message (v2 feature)
   */
  static async addAssistantMessage(content: string): Promise<AgentResponse<string>> {
    return this.executeOperation('add_assistant_message', { content }, false, true);
  }

  /**
   * Search orders by query
   */
  static async searchOrders(query: string): Promise<AgentResponse<any[]>> {
    return this.executeOperation('printavo_search_orders', { query });
  }

  /**
   * List orders with pagination
   */
  static async listOrders(first: number = 10, after?: string): Promise<AgentResponse<any>> {
    return this.executeOperation('printavo_list_orders', { first, after });
  }

  /**
   * Create a customer
   */
  static async createCustomer(customerData: any): Promise<AgentResponse<any>> {
    return this.executeOperation('printavo_create_customer', customerData);
  }

  /**
   * Create a quote
   */
  static async createQuote(quoteData: any): Promise<AgentResponse<any>> {
    return this.executeOperation('printavo_create_quote', quoteData);
  }

  /**
   * Update the status of an order, quote, or invoice
   */
  static async updateStatus(id: string, statusId: string): Promise<AgentResponse<any>> {
    return this.executeOperation('printavo_update_status', { id, statusId });
  }

  // SanMar-specific methods

  /**
   * Get product information
   */
  static async getProductInfo(styleNumber: string, color?: string, size?: string): Promise<AgentResponse<any>> {
    return this.executeOperation('sanmar_get_product_info', { styleNumber, color, size });
  }

  /**
   * Get inventory levels
   */
  static async getInventory(styleNumber: string, color?: string, size?: string): Promise<AgentResponse<any>> {
    return this.executeOperation('sanmar_get_inventory', { styleNumber, color, size });
  }

  /**
   * Check product availability (composite operation)
   */
  static async checkProductAvailability(
    styleNumber: string, 
    color?: string, 
    size?: string,
    quantity?: number
  ): Promise<AgentResponse<any>> {
    return this.executeOperation('sanmar_check_product_availability', { 
      styleNumber, 
      color, 
      size, 
      quantity 
    });
  }

  // SanMar FTP-specific methods

  /**
   * Download and parse inventory
   */
  static async downloadAndParseInventory(): Promise<AgentResponse<any>> {
    return this.executeOperation('sanmar_ftp_download_and_parse_inventory', {});
  }

  /**
   * Check product inventory
   */
  static async checkProductInventory(products: Array<{ styleNumber: string; color?: string; size?: string }>): Promise<AgentResponse<any>> {
    return this.executeOperation('sanmar_ftp_check_product_inventory', { products });
  }

  // Composite operations

  /**
   * Create a quote with product lookup
   * This is a higher-level operation that combines multiple operations
   */
  static async createQuoteWithProductLookup(
    customerInfo: any,
    productDetails: any[]
  ): Promise<AgentResponse<any>> {
    // Use the AgentManager's composite operation directly
    return this.executeOperation('composite_create_quote_with_product_lookup', {
      customerInfo,
      productDetails
    });
  }
} 