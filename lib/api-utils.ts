// Helper functions for API operations

/**
 * Maps operation names (used in the chat interface and by GPT)
 * to their corresponding Printavo API endpoints.
 *
 * This function acts as a central registry for all supported API operations,
 * ensuring consistent endpoint routing throughout the application.
 *
 * @param {string} operation - The name of the operation (e.g., 'getOrders', 'createCustomer').
 * @returns {string} The Printavo API endpoint path for the given operation.
 *                    Returns the operation name itself if no mapping is found (fallback).
 */
export function mapOperationToEndpoint(operation: string): string {
  const endpointMap: Record<string, string> = {
    // Query operations
    'getOrder': '/query/order',
    'getQuote': '/query/quote',
    'getOrders': '/query/orders',
    'getQuotes': '/query/quotes',
    'getCustomer': '/query/customer',
    'getCustomers': '/query/customers',
    'getInquiry': '/query/inquiry',
    'getInquiries': '/query/inquiries',
    'getInvoice': '/query/invoice',
    'getInvoices': '/query/invoices',
    'getTask': '/query/task',
    'getTasks': '/query/tasks',
    'getThread': '/query/thread',
    'getThreads': '/query/threads',
    'getTransaction': '/query/transaction',
    'getTransactions': '/query/transactions',
    'getUser': '/query/user',
    'getMerchStore': '/query/merchstore',
    'getMerchStores': '/query/merchstores',
    'getPaymentRequests': '/query/paymentrequests',
    'getProducts': '/query/products',
    'getStatuses': '/query/statuses',

    // Mutation operations
    'createQuote': '/mutation/quotecreate',
    'updateStatus': '/mutation/statusupdate',
    'createTask': '/mutation/taskcreate',
    'createImprint': '/mutation/imprintcreate',
    'createImprintMockup': '/mutation/imprintmockupcreate',
    'createLineItemGroup': '/mutation/lineitemgroupcreate',
    'createLineItem': '/mutation/lineitemcreate',
    'createFee': '/mutation/feecreate',
    'updateFee': '/mutation/feeupdate',
    'deleteFee': '/mutation/feedelete',
    'createPaymentRequest': '/mutation/paymentrequestcreate',
    'createApprovalRequest': '/mutation/approvalrequestcreate',
    'createCustomAddress': '/mutation/customaddresscreate',
    'createDeliveryMethod': '/mutation/deliverymethodcreate',
    'updateThread': '/mutation/threadupdate',
    'updateInquiry': '/mutation/inquiryupdate',
    'login': '/mutation/login',

    // Customer related - Example of direct paths - Adjust as needed based on your API usage
    'getCustomerContacts': '/customer/contacts',
    'getCustomerOrders': '/customer/orders',
    'getCustomerReminders': '/customer/reminders',

    // Invoice related - Example of direct paths
    'getInvoiceApprovalRequests': '/invoice/approvalrequests',
    'getInvoiceCustomAddresses': '/invoice/customaddresses',
    'getInvoiceExpenses': '/invoice/expenses',
    'getInvoiceFees': '/invoice/fees',
    'getInvoiceLineItemGroups': '/invoice/lineitemgroups',
    'getInvoiceProductionFiles': '/invoice/productionfiles',
    'getInvoiceTasks': '/invoice/tasks',
    'getInvoiceTransactions': '/invoice/transactions',

    // Quote related - If similar direct paths exist, add them here.
  };
  
  return endpointMap[operation] || operation;
}

/**
 * Prepares and adjusts parameters before sending them to the Printavo API.
 *
 * This function handles operation-specific parameter modifications,
 * such as setting default pagination limits or formatting parameters
 * as required by the Printavo API.
 *
 * @param {string} operation - The name of the API operation being performed.
 * @param {any} params - The parameters provided for the operation (can be of any type).
 * @returns {any} The prepared parameters object, ready to be sent to the API.
 */
export function prepareRequestParams(operation: string, params: any): any {
  // Default parameters for specific operations
  switch (operation) {
    case 'getOrders':
    case 'getQuotes':
    case 'getInquiries':
    case 'getInvoices':
    case 'getMerchStores':
    case 'getPaymentRequests':
    case 'getProducts':
    case 'getTasks':
    case 'getThreads':
    case 'getTransactions':
    case 'getCustomerContacts':
    case 'getCustomerOrders':
    case 'getCustomerReminders':
    case 'getInvoiceApprovalRequests':
    case 'getInvoiceCustomAddresses':
    case 'getInvoiceExpenses':
    case 'getInvoiceFees':
    case 'getInvoiceLineItemGroups':
    case 'getInvoiceProductionFiles':
    case 'getInvoiceTasks':
    case 'getInvoiceTransactions':
    case 'getStatuses':
      // Add default pagination (first 10 or 20) if not provided
      return {
        first: params.first || (['getCustomers', 'getCustomerContacts', 'getCustomerOrders', 'getCustomerReminders'].includes(operation) ? 20 : 10),
        ...params
      };
    case 'getCustomers': // Keep specific default for getCustomers as before if needed
      return {
        first: params.first || 20,
        ...params
      };
    default:
      return params;
  }
}