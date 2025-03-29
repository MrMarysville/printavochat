"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionPaymentCreate = exports.taskCreate = exports.inquiryCreate = exports.customAddressUpdates = exports.customAddressUpdate = exports.customAddressCreate = exports.lineItemGroupUpdates = exports.lineItemDelete = exports.lineItemUpdate = exports.lineItemCreates = exports.lineItemCreate = exports.invoiceDuplicate = exports.invoiceUpdate = exports.quoteDuplicate = exports.quoteUpdate = exports.quoteCreate = exports.customerUpdate = exports.customerCreate = exports.contactUpdate = exports.contactCreate = exports.updateStatus = exports.searchOrders = exports.listStatuses = exports.listThreads = exports.listMerchStores = exports.listTransactions = exports.listInquiries = exports.listTasks = exports.listProducts = exports.listContacts = exports.listCustomers = exports.listQuotes = exports.listInvoices = exports.listOrders = exports.getThread = exports.getMerchStore = exports.getTransaction = exports.getInquiry = exports.getTask = exports.getStatus = exports.getLineItemGroup = exports.getLineItem = exports.getInvoice = exports.getQuote = exports.getOrderByVisualId = exports.getOrder = exports.getContact = exports.getCustomer = exports.getCurrentUser = exports.getAccount = void 0;
exports.login = exports.productionFileCreate = exports.imprintMockupCreate = exports.imprintCreate = exports.feeUpdates = exports.feeUpdate = void 0;
const index_1 = require("./index");
const queries_1 = require("./queries");
// Read Operations
const getAccount = async () => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.account);
    return data.account;
};
exports.getAccount = getAccount;
const getCurrentUser = async () => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.user);
    return data.user;
};
exports.getCurrentUser = getCurrentUser;
const getCustomer = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.customer, { id });
    return data.customer;
};
exports.getCustomer = getCustomer;
const getContact = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.contact, { id });
    return data.contact;
};
exports.getContact = getContact;
const getOrder = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.order, { id });
    return data.order;
};
exports.getOrder = getOrder;
const getOrderByVisualId = async (visualId) => {
    // First search for orders with the given visualId
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listOrders, { first: 10 });
    const order = data.orders.nodes.find((order) => order.visualId === visualId);
    if (!order) {
        throw new Error(`Order with visualId ${visualId} not found`);
    }
    // Then get the full order details
    return (0, exports.getOrder)(order.id);
};
exports.getOrderByVisualId = getOrderByVisualId;
const getQuote = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.quote, { id });
    return data.quote;
};
exports.getQuote = getQuote;
const getInvoice = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.invoice, { id });
    return data.invoice;
};
exports.getInvoice = getInvoice;
const getLineItem = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.lineItem, { id });
    return data.lineItem;
};
exports.getLineItem = getLineItem;
const getLineItemGroup = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.lineItemGroup, { id });
    return data.lineItemGroup;
};
exports.getLineItemGroup = getLineItemGroup;
const getStatus = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.status, { id });
    return data.status;
};
exports.getStatus = getStatus;
const getTask = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.task, { id });
    return data.task;
};
exports.getTask = getTask;
const getInquiry = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.inquiry, { id });
    return data.inquiry;
};
exports.getInquiry = getInquiry;
const getTransaction = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.transaction, { id });
    return data.transaction;
};
exports.getTransaction = getTransaction;
const getMerchStore = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.merchStore, { id });
    return data.merchStore;
};
exports.getMerchStore = getMerchStore;
const getThread = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.thread, { id });
    return data.thread;
};
exports.getThread = getThread;
const listOrders = async (first = 10, sortOn, sortDescending) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listOrders, { first, sortOn, sortDescending });
    return data.orders.nodes;
};
exports.listOrders = listOrders;
const listInvoices = async (first = 10, sortOn, sortDescending) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listInvoices, { first, sortOn, sortDescending });
    return data.invoices.nodes;
};
exports.listInvoices = listInvoices;
const listQuotes = async (first = 10, sortOn, sortDescending) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listQuotes, { first, sortOn, sortDescending });
    return data.quotes.nodes;
};
exports.listQuotes = listQuotes;
const listCustomers = async (first = 10) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listCustomers, { first });
    return data.customers.nodes;
};
exports.listCustomers = listCustomers;
const listContacts = async (first = 10, sortOn, sortDescending) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listContacts, { first, sortOn, sortDescending });
    return data.contacts.nodes;
};
exports.listContacts = listContacts;
const listProducts = async (first = 10, query) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listProducts, { first, query });
    return data.products.nodes;
};
exports.listProducts = listProducts;
const listTasks = async (first = 10, sortOn, sortDescending) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listTasks, { first, sortOn, sortDescending });
    return data.tasks.nodes;
};
exports.listTasks = listTasks;
const listInquiries = async (first = 10) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listInquiries, { first });
    return data.inquiries.nodes;
};
exports.listInquiries = listInquiries;
const listTransactions = async (first = 10) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listTransactions, { first });
    return data.transactions.nodes;
};
exports.listTransactions = listTransactions;
const listMerchStores = async (first = 10) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listMerchStores, { first });
    return data.merchStores.nodes;
};
exports.listMerchStores = listMerchStores;
const listThreads = async (first = 10) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listThreads, { first });
    return data.threads.nodes;
};
exports.listThreads = listThreads;
const listStatuses = async (first = 10, type) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listStatuses, { first, type });
    return data.statuses.nodes;
};
exports.listStatuses = listStatuses;
const searchOrders = async (query, first = 10) => {
    // First get all orders
    const data = await (0, index_1.executeGraphQL)(queries_1.queries.listOrders, { first: 100 }); // Get a larger set to search through
    // Simple search through order properties
    const lowerQuery = query.toLowerCase();
    const results = data.orders.nodes.filter((order) => {
        return ((order.visualId && order.visualId.toLowerCase().includes(lowerQuery)) ||
            (order.nickName && order.nickName.toLowerCase().includes(lowerQuery)) ||
            (order.contact && order.contact.fullName && order.contact.fullName.toLowerCase().includes(lowerQuery)) ||
            (order.contact && order.contact.email && order.contact.email.toLowerCase().includes(lowerQuery)));
    });
    return results.slice(0, first); // Return only the requested number of results
};
exports.searchOrders = searchOrders;
// Write Operations
// Update status of an order, quote, or invoice
const updateStatus = async (parentId, statusId) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.statusUpdate, { parentId, statusId });
    return data.statusUpdate;
};
exports.updateStatus = updateStatus;
// Contact operations
const contactCreate = async (customerId, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.contactCreate, { id: customerId, input });
    return data.contactCreate;
};
exports.contactCreate = contactCreate;
const contactUpdate = async (id, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.contactUpdate, { id, input });
    return data.contactUpdate;
};
exports.contactUpdate = contactUpdate;
// Customer operations
const customerCreate = async (input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.customerCreate, { input });
    return data.customerCreate;
};
exports.customerCreate = customerCreate;
const customerUpdate = async (id, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.customerUpdate, { id, input });
    return data.customerUpdate;
};
exports.customerUpdate = customerUpdate;
// Quote operations
const quoteCreate = async (input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.quoteCreate, { input });
    return data.quoteCreate;
};
exports.quoteCreate = quoteCreate;
const quoteUpdate = async (id, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.quoteUpdate, { id, input });
    return data.quoteUpdate;
};
exports.quoteUpdate = quoteUpdate;
const quoteDuplicate = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.quoteDuplicate, { id });
    return data.quoteDuplicate;
};
exports.quoteDuplicate = quoteDuplicate;
// Invoice operations
const invoiceUpdate = async (id, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.invoiceUpdate, { id, input });
    return data.invoiceUpdate;
};
exports.invoiceUpdate = invoiceUpdate;
const invoiceDuplicate = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.invoiceDuplicate, { id });
    return data.invoiceDuplicate;
};
exports.invoiceDuplicate = invoiceDuplicate;
// Line item operations
const lineItemCreate = async (lineItemGroupId, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.lineItemCreate, { lineItemGroupId, input });
    return data.lineItemCreate;
};
exports.lineItemCreate = lineItemCreate;
const lineItemCreates = async (input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.lineItemCreates, { input });
    return data.lineItemCreates;
};
exports.lineItemCreates = lineItemCreates;
const lineItemUpdate = async (id, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.lineItemUpdate, { id, input });
    return data.lineItemUpdate;
};
exports.lineItemUpdate = lineItemUpdate;
const lineItemDelete = async (id) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.lineItemDelete, { id });
    return data.lineItemDelete;
};
exports.lineItemDelete = lineItemDelete;
// Line item group operations
const lineItemGroupUpdates = async (input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.lineItemGroupUpdates, { input });
    return data.lineItemGroupUpdates;
};
exports.lineItemGroupUpdates = lineItemGroupUpdates;
// Address operations
const customAddressCreate = async (parentId, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.customAddressCreate, { parentId, input });
    return data.customAddressCreate;
};
exports.customAddressCreate = customAddressCreate;
const customAddressUpdate = async (id, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.customAddressUpdate, { id, input });
    return data.customAddressUpdate;
};
exports.customAddressUpdate = customAddressUpdate;
const customAddressUpdates = async (input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.customAddressUpdates, { input });
    return data.customAddressUpdates;
};
exports.customAddressUpdates = customAddressUpdates;
// Inquiry operations
const inquiryCreate = async (input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.inquiryCreate, { input });
    return data.inquiryCreate;
};
exports.inquiryCreate = inquiryCreate;
// Task operations
const taskCreate = async (input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.taskCreate, { input });
    return data.taskCreate;
};
exports.taskCreate = taskCreate;
// Transaction operations
const transactionPaymentCreate = async (input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.transactionPaymentCreate, { input });
    return data.transactionPaymentCreate;
};
exports.transactionPaymentCreate = transactionPaymentCreate;
// Fee operations
const feeUpdate = async (id, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.feeUpdate, { id, input });
    return data.feeUpdate;
};
exports.feeUpdate = feeUpdate;
const feeUpdates = async (input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.feeUpdates, { input });
    return data.feeUpdates;
};
exports.feeUpdates = feeUpdates;
// Imprint operations
const imprintCreate = async (lineItemGroupId, input) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.imprintCreate, { lineItemGroupId, input });
    return data.imprintCreate;
};
exports.imprintCreate = imprintCreate;
const imprintMockupCreate = async (imprintId, publicImageUrl) => {
    const data = await (0, index_1.executeGraphQL)(queries_1.mutations.imprintMockupCreate, { imprintId, publicImageUrl });
    return data.imprintMockupCreate;
};
exports.imprintMockupCreate = imprintMockupCreate;
// File operations
const productionFileCreate = async (parentId, publicFileUrl) => {
    try {
        const variables = {
            parentId,
            publicFileUrl
        };
        const data = await (0, index_1.executeGraphQL)(queries_1.mutations.productionFileCreate, variables);
        return data.productionFileCreate;
    }
    catch (error) {
        console.error('Error in productionFileCreate operation:', error.message);
        throw error;
    }
};
exports.productionFileCreate = productionFileCreate;
// Authentication
const login = async (email, password, deviceName, deviceToken) => {
    try {
        const variables = {
            email,
            password,
            deviceName,
            deviceToken: deviceToken || undefined
        };
        const data = await (0, index_1.executeGraphQL)(queries_1.mutations.login, variables);
        return data.login;
    }
    catch (error) {
        console.error('Error in login operation:', error.message);
        throw error;
    }
};
exports.login = login;
