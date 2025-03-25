import { 
  PrintavoAPIResponse, 
  PrintavoOrder,
  PrintavoCustomer,
  PrintavoLineItemGroup,
  PrintavoLineItem
} from './types';
import { logger } from './logger';

// Generate mock data for development and testing
export function getMockResponse<T>(endpoint: string, params: Record<string, any> = {}): PrintavoAPIResponse<T> {
  logger.error('Mock data usage attempted when real API data is required');
  throw new Error('Mock data is disabled. Application must use real Printavo API data.');
  
  // The following code is unreachable but kept for reference
  // Map endpoints to mock data generators
  const mockGenerators: Record<string, () => any> = {
    '/query/order': () => generateMockOrder(params.id),
    '/query/quote': () => generateMockOrder(params.id),
    '/query/orders': () => Array(5).fill(null).map((_, i) => generateMockOrder(`mock-${i}`)),
    '/query/customer': () => generateMockCustomer(params.id),
    '/query/customers': () => Array(3).fill(null).map((_, i) => generateMockCustomer(`mock-${i}`)),
    '/query/lineitemgroup': () => generateMockLineItemGroup(params.id),
    '/query/lineitem': () => generateMockLineItem(params.id),
    '/mutation/quotecreate': () => generateMockOrder('new-quote-123'),
    '/mutation/lineitemgroupcreate': () => generateMockLineItemGroup('new-group-123'),
    '/mutation/lineitemcreate': () => generateMockLineItem('new-item-123')
  };
  
  // Get the appropriate mock generator or use default
  const generator = mockGenerators[endpoint] || (() => ({ message: 'Mock data not implemented for this endpoint' }));
  
  return { data: generator() as T };
}

// Mock data generators for different entity types
function generateMockOrder(id: string): PrintavoOrder {
  return {
    id: id || 'mock-order-123',
    visualId: id || '123',
    name: `Mock Order ${id}`,
    status: { id: 'status-1', name: 'New' },
    customer: generateMockCustomer('mock-customer-1'),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    total: 1250.00,
    lineItemGroups: [
      generateMockLineItemGroup('mock-group-1')
    ]
  };
}

function generateMockCustomer(id: string): PrintavoCustomer {
  return {
    id: id || 'mock-customer-123',
    name: `Mock Customer ${id}`,
    email: `customer-${id}@example.com`,
    phone: '555-123-4567',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function generateMockLineItemGroup(id: string): PrintavoLineItemGroup {
  return {
    id: id || 'mock-group-123',
    name: `Mock Group ${id}`,
    lineItems: [
      generateMockLineItem('mock-item-1'),
      generateMockLineItem('mock-item-2')
    ]
  };
}

function generateMockLineItem(id: string): PrintavoLineItem {
  return {
    id: id || 'mock-item-123',
    name: `Mock Item ${id}`,
    quantity: 100,
    price: 12.50,
    total: 1250.00
  };
}