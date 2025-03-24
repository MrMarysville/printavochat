import { 
  getOrder, 
  getOrderByVisualId, 
  searchOrders, 
  getDueOrders 
} from './operations/orders';

import {
  getCustomer,
  createCustomer,
  getCustomers,
  getOrdersByCustomer
} from './operations/customers';

import {
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
} from './operations/quotes';

import {
  searchProducts,
  getProduct,
  getProductsByCategory,
  getProductsByPriceRange,
  createProduct,
  updateProduct,
  deleteProduct
} from './operations/products';

// Export operations for use in printavo-service.ts and operations.ts
export const operations = {
  // Order operations
  getOrder,
  getOrderByVisualId,
  searchOrders,
  getDueOrders,
  
  // Customer operations
  getCustomer,
  createCustomer,
  getCustomers,
  getOrdersByCustomer,
  
  // Quote operations
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
  createInvoice,
  
  // Product operations
  searchProducts,
  getProduct,
  getProductsByCategory,
  getProductsByPriceRange,
  createProduct,
  updateProduct,
  deleteProduct,

  // Additional operations from the original operations object
  // These might need to be implemented or mapped to existing functions
  getInvoices: (params: any) => searchOrders({ ...params, type: 'invoice' }),
  getDueInvoices: (params: any) => getDueOrders({ ...params, type: 'invoice' }),
  getInvoice: (id: string) => getOrder(id),
  createTask: async (_parentId: string, _input: any) => {
    // This is a placeholder - implement if needed
    console.warn('createTask is not fully implemented in the new GraphQL client');
    return { success: false, errors: [{ message: 'Not implemented' }] };
  },
  createPaymentRequest: async (_input: any) => {
    // This is a placeholder - implement if needed
    console.warn('createPaymentRequest is not fully implemented in the new GraphQL client');
    return { success: false, errors: [{ message: 'Not implemented' }] };
  },
  getPaymentRequests: async (_params: any) => {
    // This is a placeholder - implement if needed
    console.warn('getPaymentRequests is not fully implemented in the new GraphQL client');
    return { success: false, errors: [{ message: 'Not implemented' }] };
  },
  createFee: async (_parentId: string, _input: any) => {
    // This is a placeholder - implement if needed
    console.warn('createFee is not fully implemented in the new GraphQL client');
    return { success: false, errors: [{ message: 'Not implemented' }] };
  },
  updateFee: async (_id: string, _input: any) => {
    // This is a placeholder - implement if needed
    console.warn('updateFee is not fully implemented in the new GraphQL client');
    return { success: false, errors: [{ message: 'Not implemented' }] };
  },
  deleteFee: async (_id: string) => {
    // This is a placeholder - implement if needed
    console.warn('deleteFee is not fully implemented in the new GraphQL client');
    return { success: false, errors: [{ message: 'Not implemented' }] };
  }
};