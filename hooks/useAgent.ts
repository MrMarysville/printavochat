import { useState, useCallback } from 'react';
import { AgentService, AgentResponse } from '../lib/agent-service';

/**
 * Hook for using the agent service in React components.
 * Provides methods for interacting with the agent system and handles loading and error states.
 */
export function useAgent() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute any agent operation with loading and error handling
   */
  const executeOperation = useCallback(async <T>(operation: string, params?: any): Promise<AgentResponse<T>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await AgentService.executeOperation<T>(operation, params);
      
      if (!response.success) {
        setError(response.error || 'Unknown error occurred');
      }
      
      return response;
    } catch (err) {
      const errorMessage = (err as Error).message || 'Unknown error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get an order by ID
   */
  const getOrder = useCallback(async (id: string) => {
    return executeOperation('printavo_get_order', { id });
  }, [executeOperation]);

  /**
   * Get an order by visual ID
   */
  const getOrderByVisualId = useCallback(async (visualId: string) => {
    return executeOperation('printavo_get_order_by_visual_id', { visualId });
  }, [executeOperation]);

  /**
   * Search orders by query
   */
  const searchOrders = useCallback(async (query: string) => {
    return executeOperation<any[]>('printavo_search_orders', { query });
  }, [executeOperation]);

  /**
   * List orders with pagination
   */
  const listOrders = useCallback(async (first: number = 10, after?: string) => {
    return executeOperation('printavo_list_orders', { first, after });
  }, [executeOperation]);

  /**
   * Update order status
   */
  const updateStatus = useCallback(async (id: string, statusId: string) => {
    return executeOperation('printavo_update_status', { id, statusId });
  }, [executeOperation]);

  /**
   * Get product information from SanMar
   */
  const getProductInfo = useCallback(async (styleNumber: string, color?: string, size?: string) => {
    return executeOperation('sanmar_get_product_info', { styleNumber, color, size });
  }, [executeOperation]);

  /**
   * Check product availability (composite operation)
   */
  const checkProductAvailability = useCallback(async (
    styleNumber: string, 
    color?: string, 
    size?: string,
    quantity?: number
  ) => {
    return executeOperation('sanmar_check_product_availability', { 
      styleNumber, 
      color, 
      size, 
      quantity 
    });
  }, [executeOperation]);

  /**
   * Create a quote with product lookup (composite operation)
   */
  const createQuoteWithProductLookup = useCallback(async (
    customerInfo: any,
    productDetails: any[]
  ) => {
    return executeOperation('composite_create_quote_with_product_lookup', {
      customerInfo,
      productDetails
    });
  }, [executeOperation]);

  return {
    // State
    isLoading,
    error,
    
    // Generic operations
    executeOperation,
    
    // Printavo operations
    getOrder,
    getOrderByVisualId,
    searchOrders,
    listOrders,
    updateStatus,
    
    // SanMar operations
    getProductInfo,
    checkProductAvailability,
    
    // Composite operations
    createQuoteWithProductLookup,
  };
} 