import { logger } from './logger';

/**
 * Formats API response data for display in the chat interface
 * @param data The data returned from the Printavo API
 * @param operation The operation that was performed
 * @returns A formatted string representation of the data
 */
export function formatResponseData(data: any, operation: string): string {
  try {
    if (!data) {
      return 'No data returned from the API.';
    }

    // Handle different operation types
    switch (operation) {
      case 'getCustomers':
        return formatCustomersList(data);
      case 'getCustomer':
        return formatCustomerDetails(data);
      case 'getOrders':
        return formatOrdersList(data);
      case 'getOrder':
      case 'getQuote':
      case 'getInvoice':
        return formatOrderDetails(data);
      default:
        // For operations without specific formatting, return a JSON string
        return `Operation result:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``;
    }
  } catch (error) {
    logger.error('Error formatting response data:', error);
    return `Error formatting data: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}

// Helper functions for formatting specific data types
function formatCustomersList(data: any): string {
  if (!data.customers || !Array.isArray(data.customers)) {
    return 'No customers found.';
  }
  
  return `Found ${data.customers.length} customers:\n\n${
    data.customers.map((c: any, i: number) => 
      `${i+1}. ${c.name || 'Unnamed'} (ID: ${c.id})`
    ).join('\n')
  }`;
}

function formatCustomerDetails(data: any): string {
  if (!data.customer) {
    return 'No customer details found.';
  }
  
  const customer = data.customer;
  let result = `Customer: ${customer.name || 'Unnamed'}\n`;
  if (customer.email) result += `Email: ${customer.email}\n`;
  if (customer.phone) result += `Phone: ${customer.phone}\n`;
  
  return result;
}

function formatOrdersList(data: any): string {
  if (!data.orders || !Array.isArray(data.orders)) {
    return 'No orders found.';
  }
  
  return `Found ${data.orders.length} orders:\n\n${
    data.orders.map((o: any, i: number) => 
      `${i+1}. ${o.type === 'quote' ? 'Quote' : 'Invoice'} #${o.number || 'Unknown'} (ID: ${o.id})`
    ).join('\n')
  }`;
}

function formatOrderDetails(data: any): string {
  const order = data.order || data.quote || data.invoice;
  if (!order) {
    return 'No order details found.';
  }
  
  const orderType = order.type === 'quote' ? 'Quote' : 'Invoice';
  let result = `${orderType} #${order.number || 'Unknown'}\n`;
  
  if (order.customer && order.customer.name) 
    result += `Customer: ${order.customer.name}\n`;
  if (order.status) 
    result += `Status: ${order.status.name || 'Unknown'}\n`;
  if (order.total) 
    result += `Total: $${parseFloat(order.total).toFixed(2)}\n`;
  
  return result;
}


