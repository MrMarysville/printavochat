import { executeGraphQL } from './index';
import { queries, mutations } from './queries';
import * as InputTypes from './inputTypes';

// Read Operations
export const getAccount = async () => {
  const data = await executeGraphQL(queries.account);
  return data.account;
};

export const getCurrentUser = async () => {
  const data = await executeGraphQL(queries.user);
  return data.user;
};

export const getCustomer = async (id: string) => {
  const data = await executeGraphQL(queries.customer, { id });
  return data.customer;
};

export const getContact = async (id: string) => {
  const data = await executeGraphQL(queries.contact, { id });
  return data.contact;
};

export const getOrder = async (id: string) => {
  const data = await executeGraphQL(queries.order, { id });
  return data.order;
};

export const getOrderByVisualId = async (visualId: string) => {
  // First search for orders with the given visualId
  const data = await executeGraphQL(queries.listOrders, { first: 10 });
  const order = data.orders.nodes.find((order: any) => order.visualId === visualId);
  if (!order) {
    throw new Error(`Order with visualId ${visualId} not found`);
  }
  // Then get the full order details
  return getOrder(order.id);
};

export const getQuote = async (id: string) => {
  const data = await executeGraphQL(queries.quote, { id });
  return data.quote;
};

export const getInvoice = async (id: string) => {
  const data = await executeGraphQL(queries.invoice, { id });
  return data.invoice;
};

export const getLineItem = async (id: string) => {
  const data = await executeGraphQL(queries.lineItem, { id });
  return data.lineItem;
};

export const getLineItemGroup = async (id: string) => {
  const data = await executeGraphQL(queries.lineItemGroup, { id });
  return data.lineItemGroup;
};

export const getStatus = async (id: string) => {
  const data = await executeGraphQL(queries.status, { id });
  return data.status;
};

export const getTask = async (id: string) => {
  const data = await executeGraphQL(queries.task, { id });
  return data.task;
};

export const getInquiry = async (id: string) => {
  const data = await executeGraphQL(queries.inquiry, { id });
  return data.inquiry;
};

export const getTransaction = async (id: string) => {
  const data = await executeGraphQL(queries.transaction, { id });
  return data.transaction;
};

export const getMerchStore = async (id: string) => {
  const data = await executeGraphQL(queries.merchStore, { id });
  return data.merchStore;
};

export const getThread = async (id: string) => {
  const data = await executeGraphQL(queries.thread, { id });
  return data.thread;
};

export const listOrders = async (first: number = 10, sortOn?: string, sortDescending?: boolean) => {
  const data = await executeGraphQL(queries.listOrders, { first, sortOn, sortDescending });
  return data.orders.nodes;
};

export const listInvoices = async (first: number = 10, sortOn?: string, sortDescending?: boolean) => {
  const data = await executeGraphQL(queries.listInvoices, { first, sortOn, sortDescending });
  return data.invoices.nodes;
};

export const listQuotes = async (first: number = 10, sortOn?: string, sortDescending?: boolean) => {
  const data = await executeGraphQL(queries.listQuotes, { first, sortOn, sortDescending });
  return data.quotes.nodes;
};

export const listCustomers = async (first: number = 10) => {
  const data = await executeGraphQL(queries.listCustomers, { first });
  return data.customers.nodes;
};

export const listContacts = async (first: number = 10, sortOn?: string, sortDescending?: boolean) => {
  const data = await executeGraphQL(queries.listContacts, { first, sortOn, sortDescending });
  return data.contacts.nodes;
};

export const listProducts = async (first: number = 10, query?: string) => {
  const data = await executeGraphQL(queries.listProducts, { first, query });
  return data.products.nodes;
};

export const listTasks = async (first: number = 10, sortOn?: string, sortDescending?: boolean) => {
  const data = await executeGraphQL(queries.listTasks, { first, sortOn, sortDescending });
  return data.tasks.nodes;
};

export const listInquiries = async (first: number = 10) => {
  const data = await executeGraphQL(queries.listInquiries, { first });
  return data.inquiries.nodes;
};

export const listTransactions = async (first: number = 10) => {
  const data = await executeGraphQL(queries.listTransactions, { first });
  return data.transactions.nodes;
};

export const listMerchStores = async (first: number = 10) => {
  const data = await executeGraphQL(queries.listMerchStores, { first });
  return data.merchStores.nodes;
};

export const listThreads = async (first: number = 10) => {
  const data = await executeGraphQL(queries.listThreads, { first });
  return data.threads.nodes;
};

export const listStatuses = async (first: number = 10, type?: string) => {
  const data = await executeGraphQL(queries.listStatuses, { first, type });
  return data.statuses.nodes;
};

export const searchOrders = async (query: string, first: number = 10) => {
  // First get all orders
  const data = await executeGraphQL(queries.listOrders, { first: 100 }); // Get a larger set to search through
  
  // Simple search through order properties
  const lowerQuery = query.toLowerCase();
  const results = data.orders.nodes.filter((order: any) => {
    return (
      (order.visualId && order.visualId.toLowerCase().includes(lowerQuery)) ||
      (order.nickName && order.nickName.toLowerCase().includes(lowerQuery)) ||
      (order.contact && order.contact.fullName && order.contact.fullName.toLowerCase().includes(lowerQuery)) ||
      (order.contact && order.contact.email && order.contact.email.toLowerCase().includes(lowerQuery))
    );
  });
  
  return results.slice(0, first); // Return only the requested number of results
};

// Write Operations

// Update status of an order, quote, or invoice
export const updateStatus = async (parentId: string, statusId: string) => {
  const data = await executeGraphQL(mutations.statusUpdate, { parentId, statusId });
  return data.statusUpdate;
};

// Contact operations
export const contactCreate = async (customerId: string, input: InputTypes.ContactCreateInput) => {
  const data = await executeGraphQL(mutations.contactCreate, { id: customerId, input });
  return data.contactCreate;
};

export const contactUpdate = async (id: string, input: InputTypes.ContactUpdateInput) => {
  const data = await executeGraphQL(mutations.contactUpdate, { id, input });
  return data.contactUpdate;
};

// Customer operations
export const customerCreate = async (input: any) => {
  const data = await executeGraphQL(mutations.customerCreate, { input });
  return data.customerCreate;
};

export const customerUpdate = async (id: string, input: InputTypes.CustomerUpdateInput) => {
  const data = await executeGraphQL(mutations.customerUpdate, { id, input });
  return data.customerUpdate;
};

// Quote operations
export const quoteCreate = async (input: InputTypes.QuoteCreateInput) => {
  const data = await executeGraphQL(mutations.quoteCreate, { input });
  return data.quoteCreate;
};

export const quoteUpdate = async (id: string, input: InputTypes.QuoteUpdateInput) => {
  const data = await executeGraphQL(mutations.quoteUpdate, { id, input });
  return data.quoteUpdate;
};

export const quoteDuplicate = async (id: string) => {
  const data = await executeGraphQL(mutations.quoteDuplicate, { id });
  return data.quoteDuplicate;
};

// Invoice operations
export const invoiceUpdate = async (id: string, input: InputTypes.InvoiceUpdateInput) => {
  const data = await executeGraphQL(mutations.invoiceUpdate, { id, input });
  return data.invoiceUpdate;
};

export const invoiceDuplicate = async (id: string) => {
  const data = await executeGraphQL(mutations.invoiceDuplicate, { id });
  return data.invoiceDuplicate;
};

// Line item operations
export const lineItemCreate = async (lineItemGroupId: string, input: InputTypes.LineItemCreateInput) => {
  const data = await executeGraphQL(mutations.lineItemCreate, { lineItemGroupId, input });
  return data.lineItemCreate;
};

export const lineItemCreates = async (input: InputTypes.LineItemCreateInput[]) => {
  const data = await executeGraphQL(mutations.lineItemCreates, { input });
  return data.lineItemCreates;
};

export const lineItemUpdate = async (id: string, input: InputTypes.LineItemUpdateInput) => {
  const data = await executeGraphQL(mutations.lineItemUpdate, { id, input });
  return data.lineItemUpdate;
};

export const lineItemDelete = async (id: string) => {
  const data = await executeGraphQL(mutations.lineItemDelete, { id });
  return data.lineItemDelete;
};

// Line item group operations
export const lineItemGroupUpdates = async (input: InputTypes.LineItemGroupUpdateInput[]) => {
  const data = await executeGraphQL(mutations.lineItemGroupUpdates, { input });
  return data.lineItemGroupUpdates;
};

// Address operations
export const customAddressCreate = async (parentId: string, input: InputTypes.CustomAddressInput) => {
  const data = await executeGraphQL(mutations.customAddressCreate, { parentId, input });
  return data.customAddressCreate;
};

export const customAddressUpdate = async (id: string, input: InputTypes.CustomAddressUpdateInput) => {
  const data = await executeGraphQL(mutations.customAddressUpdate, { id, input });
  return data.customAddressUpdate;
};

export const customAddressUpdates = async (input: InputTypes.CustomAddressUpdatesInput[]) => {
  const data = await executeGraphQL(mutations.customAddressUpdates, { input });
  return data.customAddressUpdates;
};

// Inquiry operations
export const inquiryCreate = async (input: InputTypes.InquiryCreateInput) => {
  const data = await executeGraphQL(mutations.inquiryCreate, { input });
  return data.inquiryCreate;
};

// Task operations
export const taskCreate = async (input: InputTypes.TaskCreateInput) => {
  const data = await executeGraphQL(mutations.taskCreate, { input });
  return data.taskCreate;
};

// Transaction operations
export const transactionPaymentCreate = async (input: InputTypes.TransactionPaymentCreateInput) => {
  const data = await executeGraphQL(mutations.transactionPaymentCreate, { input });
  return data.transactionPaymentCreate;
};

// Fee operations
export const feeUpdate = async (id: string, input: InputTypes.FeeUpdateInput) => {
  const data = await executeGraphQL(mutations.feeUpdate, { id, input });
  return data.feeUpdate;
};

export const feeUpdates = async (input: InputTypes.FeeUpdatesInput[]) => {
  const data = await executeGraphQL(mutations.feeUpdates, { input });
  return data.feeUpdates;
};

// Imprint operations
export const imprintCreate = async (lineItemGroupId: string, input: InputTypes.ImprintCreateInput) => {
  const data = await executeGraphQL(mutations.imprintCreate, { lineItemGroupId, input });
  return data.imprintCreate;
};

export const imprintMockupCreate = async (imprintId: string, publicImageUrl: string) => {
  const data = await executeGraphQL(mutations.imprintMockupCreate, { imprintId, publicImageUrl });
  return data.imprintMockupCreate;
};

// File operations
export const productionFileCreate = async (parentId: string, publicFileUrl: string) => {
  try {
    const variables = {
      parentId,
      publicFileUrl
    };
    
    const data = await executeGraphQL(mutations.productionFileCreate, variables);
    return data.productionFileCreate;
  } catch (error: any) {
    console.error('Error in productionFileCreate operation:', error.message);
    throw error;
  }
};

// Authentication
export const login = async (email: string, password: string, deviceName: string, deviceToken?: string) => {
  try {
    const variables = {
      email,
      password,
      deviceName,
      deviceToken: deviceToken || undefined
    };
    
    const data = await executeGraphQL(mutations.login, variables);
    return data.login;
  } catch (error: any) {
    console.error('Error in login operation:', error.message);
    throw error;
  }
}; 