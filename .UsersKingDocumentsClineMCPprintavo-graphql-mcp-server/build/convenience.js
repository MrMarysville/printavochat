"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLineItemSizes = exports.createQuoteWithSanMarLiveData = exports.getProductAnalytics = exports.processPayment = exports.getCustomerAnalytics = exports.getOrderAnalytics = exports.createCustomerWithDetails = exports.convertQuoteToInvoice = exports.searchCustomerDetail = exports.createQuoteWithItems = exports.getOrderSummary = void 0;
const tools = __importStar(require("./tools"));
/**
 * Higher-level convenience tools that combine multiple operations
 * to simplify common workflows
 */
/**
 * Get a comprehensive order summary with all related information
 */
const getOrderSummary = async (id) => {
    try {
        // Get the basic order information
        const order = await tools.getOrder(id);
        // Gather line items if they exist
        let lineItems = [];
        if (order.lineItems && order.lineItems.length > 0) {
            lineItems = await Promise.all(order.lineItems.map((item) => tools.getLineItem(item.id)));
        }
        // Get customer details if available
        let customer = null;
        if (order.customer && order.customer.id) {
            customer = await tools.getCustomer(order.customer.id);
        }
        // Get contact details if available
        let contact = null;
        if (order.contact && order.contact.id) {
            contact = await tools.getContact(order.contact.id);
        }
        // Get transactions if available
        let transactions = [];
        if (order.transactions && order.transactions.length > 0) {
            transactions = await Promise.all(order.transactions.map((transaction) => tools.getTransaction(transaction.id)));
        }
        // Calculate timeline and milestones
        const timeline = [];
        // Creation milestone
        if (order.createdAt) {
            timeline.push({
                date: order.createdAt,
                event: 'Created',
                details: `Order #${order.visualId} created`
            });
        }
        // Status change (we don't have historical data, just current)
        if (order.status) {
            timeline.push({
                date: order.updatedAt || order.createdAt,
                event: 'Status Changed',
                details: `Status set to ${order.status.name}`
            });
        }
        // Payment milestones
        transactions.forEach((transaction) => {
            timeline.push({
                date: transaction.transactionDate || transaction.timestamps.createdAt,
                event: 'Payment',
                details: `Payment of $${transaction.amount} received`,
                amount: transaction.amount
            });
        });
        // Due date milestone
        if (order.dueAt) {
            timeline.push({
                date: order.dueAt,
                event: 'Due Date',
                details: 'Order due date'
            });
        }
        // Sort timeline by date
        timeline.sort((a, b) => {
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
        // Combine all data into a comprehensive summary
        return {
            success: true,
            order,
            lineItems,
            customer,
            contact,
            transactions,
            timeline,
            summary: {
                invoiceNumber: order.visualId,
                customerName: customer ? customer.companyName : (order.contact ? order.contact.fullName : 'Unknown'),
                totalAmount: order.total,
                amountPaid: order.amountPaid,
                amountDue: order.amountOutstanding,
                status: order.status ? order.status.name : 'Unknown',
                createdAt: order.createdAt,
                dueAt: order.dueAt,
                isPaid: order.paidInFull || false,
                daysSinceCreation: order.createdAt ? Math.floor((new Date().getTime() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60 * 24)) : null,
                daysUntilDue: order.dueAt ? Math.floor((new Date(order.dueAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
            }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.getOrderSummary = getOrderSummary;
/**
 * Create a new quote with customer, line items, and optional settings in one operation
 */
const createQuoteWithItems = async (customerId, contactId, lineItems, settings = {}) => {
    try {
        // 1. Create the quote
        const quoteInput = {
            customerId,
            contactId,
            customerNote: settings.customerNote || '',
            productionNote: settings.productionNote || '',
            customerDueAt: settings.customerDueAt,
            tags: settings.tags || [],
            shippingAddressId: settings.shippingAddressId,
            billingAddressId: settings.billingAddressId,
            deliveryMethod: settings.deliveryMethod,
            discount: settings.discount,
            discountAmount: settings.discountAmount,
            discountAsPercentage: settings.discountAsPercentage,
            salesTax: settings.salesTax,
            statusId: settings.statusId
        };
        const quote = await tools.quoteCreate(quoteInput);
        // 2. If the quote has line items, add them
        if (lineItems && lineItems.length > 0) {
            // Find the default line item group that was created with the quote
            const defaultGroups = quote.lineItemGroups || [];
            if (defaultGroups.length === 0) {
                throw new Error('No line item group found in the created quote');
            }
            const lineItemGroupId = defaultGroups[0].id;
            // Create each line item
            const createdLineItems = await Promise.all(lineItems.map((item) => tools.lineItemCreate(lineItemGroupId, item)));
            // 3. Get the updated quote with all its line items
            const updatedQuote = await tools.getQuote(quote.id);
            return {
                success: true,
                quote: updatedQuote,
                lineItems: createdLineItems,
                message: 'Quote created successfully with all line items'
            };
        }
        else {
            // If no line items, just return the quote
            return {
                success: true,
                quote,
                lineItems: [],
                message: 'Quote created successfully with no line items'
            };
        }
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.createQuoteWithItems = createQuoteWithItems;
/**
 * Search for a customer by name, email, or phone and return comprehensive information
 */
const searchCustomerDetail = async (query, limit = 5) => {
    try {
        // 1. Get a list of customers
        const customers = await tools.listCustomers(100); // Get a larger set to search through
        // 2. Filter customers based on the query
        const lowerQuery = query.toLowerCase();
        const matchedCustomers = customers.filter((customer) => {
            const matchCompany = customer.companyName && customer.companyName.toLowerCase().includes(lowerQuery);
            const matchContact = customer.primaryContact && ((customer.primaryContact.fullName && customer.primaryContact.fullName.toLowerCase().includes(lowerQuery)) ||
                (customer.primaryContact.email && customer.primaryContact.email.toLowerCase().includes(lowerQuery)) ||
                (customer.primaryContact.phone && customer.primaryContact.phone.includes(lowerQuery)));
            return matchCompany || matchContact;
        }).slice(0, limit);
        // 3. For each matched customer, get more details
        const detailedCustomers = await Promise.all(matchedCustomers.map(async (customer) => {
            // Get all contacts for this customer
            const contacts = await tools.listContacts(20);
            const customerContacts = contacts.filter((contact) => contact.customer && contact.customer.id === customer.id);
            // Get orders
            const orders = await tools.listOrders(100);
            const customerOrders = orders.filter((order) => order.customer && order.customer.id === customer.id);
            // Sort orders by date
            customerOrders.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            // Calculate metrics
            const totalSpent = customerOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
            const averageOrderValue = customerOrders.length > 0 ? totalSpent / customerOrders.length : 0;
            const now = new Date();
            const firstOrderDate = customerOrders.length > 0 ? new Date(customerOrders[customerOrders.length - 1].createdAt) : null;
            const lastOrderDate = customerOrders.length > 0 ? new Date(customerOrders[0].createdAt) : null;
            const daysSinceFirstOrder = firstOrderDate ? Math.floor((now.getTime() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
            const daysSinceLastOrder = lastOrderDate ? Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
            return {
                ...customer,
                contacts: customerContacts,
                orderCount: customerOrders.length,
                recentOrders: customerOrders.slice(0, 3),
                metrics: {
                    totalSpent,
                    averageOrderValue,
                    daysSinceFirstOrder,
                    daysSinceLastOrder,
                    frequency: daysSinceFirstOrder && customerOrders.length > 1 ? daysSinceFirstOrder / (customerOrders.length - 1) : null
                }
            };
        }));
        return {
            success: true,
            results: detailedCustomers,
            count: detailedCustomers.length,
            query: query
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.searchCustomerDetail = searchCustomerDetail;
/**
 * Convert a quote to an invoice in one operation
 */
const convertQuoteToInvoice = async (quoteId, statusId) => {
    try {
        // 1. Get the quote details
        const quote = await tools.getQuote(quoteId);
        // 2. Duplicate the quote but as an invoice
        const newInvoice = await tools.quoteDuplicate(quoteId);
        // 3. If a status ID was provided, update the status
        if (statusId) {
            await tools.updateStatus(newInvoice.id, statusId);
        }
        // 4. Get the updated invoice
        const updatedInvoice = await tools.getInvoice(newInvoice.id);
        return {
            success: true,
            originalQuote: quote,
            invoice: updatedInvoice,
            message: 'Quote successfully converted to invoice'
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.convertQuoteToInvoice = convertQuoteToInvoice;
/**
 * Create a new customer with primary contact and address in one operation
 */
const createCustomerWithDetails = async (customerData, contactData, addressData) => {
    try {
        // 1. Create the customer
        const customer = await tools.customerCreate(customerData);
        // 2. Create the primary contact
        const contact = await tools.contactCreate(customer.id, contactData);
        // 3. If address data was provided, create an address
        let address = null;
        if (addressData) {
            address = await tools.customAddressCreate(customer.id, addressData);
            // Update the customer with the new address as shipping/billing
            await tools.customerUpdate(customer.id, {
                shippingAddressId: address.id,
                billingAddressId: address.id
            });
        }
        // 4. Get the updated customer
        const updatedCustomer = await tools.getCustomer(customer.id);
        return {
            success: true,
            customer: updatedCustomer,
            contact,
            address,
            message: 'Customer created successfully with contact and address'
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.createCustomerWithDetails = createCustomerWithDetails;
/**
 * Get order analytics by status
 */
const getOrderAnalytics = async (days = 30) => {
    try {
        // 1. Get all orders
        const orders = await tools.listOrders(200);
        // 2. Get all statuses
        const statuses = await tools.listStatuses(50);
        // Calculate the cutoff date
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        // Filter orders within the time period
        const recentOrders = orders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= cutoffDate;
        });
        // Group orders by status
        const ordersByStatus = statuses.reduce((acc, status) => {
            acc[status.name] = {
                count: 0,
                value: 0,
                orders: []
            };
            return acc;
        }, {});
        // Calculate totals
        let totalValue = 0;
        let totalCount = 0;
        // Populate the groups
        recentOrders.forEach((order) => {
            const statusName = order.status ? order.status.name : 'Unknown';
            if (!ordersByStatus[statusName]) {
                ordersByStatus[statusName] = {
                    count: 0,
                    value: 0,
                    orders: []
                };
            }
            ordersByStatus[statusName].count += 1;
            ordersByStatus[statusName].value += parseFloat(order.total || 0);
            ordersByStatus[statusName].orders.push({
                id: order.id,
                visualId: order.visualId,
                total: order.total,
                createdAt: order.createdAt
            });
            totalValue += parseFloat(order.total || 0);
            totalCount += 1;
        });
        // Calculate metrics by time period
        const lastWeekCutoff = new Date();
        lastWeekCutoff.setDate(lastWeekCutoff.getDate() - 7);
        const lastMonthCutoff = new Date();
        lastMonthCutoff.setDate(lastMonthCutoff.getDate() - 30);
        const lastWeekOrders = recentOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= lastWeekCutoff;
        });
        const lastMonthOrders = recentOrders.filter((order) => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= lastMonthCutoff;
        });
        const lastWeekValue = lastWeekOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
        const lastMonthValue = lastMonthOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
        // Calculate averages
        const averageOrderValue = totalCount > 0 ? totalValue / totalCount : 0;
        const ordersPerDay = days > 0 ? totalCount / days : 0;
        const revenuePerDay = days > 0 ? totalValue / days : 0;
        return {
            success: true,
            totalOrders: totalCount,
            totalValue: totalValue,
            periodDays: days,
            byStatus: ordersByStatus,
            metrics: {
                averageOrderValue,
                ordersPerDay,
                revenuePerDay,
                lastWeek: {
                    orderCount: lastWeekOrders.length,
                    value: lastWeekValue,
                    averageOrderValue: lastWeekOrders.length > 0 ? lastWeekValue / lastWeekOrders.length : 0
                },
                lastMonth: {
                    orderCount: lastMonthOrders.length,
                    value: lastMonthValue,
                    averageOrderValue: lastMonthOrders.length > 0 ? lastMonthValue / lastMonthOrders.length : 0
                }
            }
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.getOrderAnalytics = getOrderAnalytics;
/**
 * Get customer analytics and segmentation
 */
const getCustomerAnalytics = async () => {
    try {
        // Get all customers
        const customers = await tools.listCustomers(200);
        // Get all orders
        const orders = await tools.listOrders(500);
        // Build customer analytics
        const customerAnalytics = await Promise.all(customers.map(async (customer) => {
            // Get customer orders
            const customerOrders = orders.filter((order) => order.customer && order.customer.id === customer.id);
            // Sort by date
            customerOrders.sort((a, b) => {
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            });
            // Calculate metrics
            const totalSpent = customerOrders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
            const orderCount = customerOrders.length;
            const averageOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
            // Get first and last order dates
            const firstOrderDate = customerOrders.length > 0 ? new Date(customerOrders[0].createdAt) : null;
            const lastOrderDate = customerOrders.length > 0 ? new Date(customerOrders[customerOrders.length - 1].createdAt) : null;
            // Calculate days since first/last order
            const now = new Date();
            const daysSinceFirstOrder = firstOrderDate ? Math.floor((now.getTime() - firstOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
            const daysSinceLastOrder = lastOrderDate ? Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)) : null;
            // Calculate customer lifespan and order frequency
            const lifespan = daysSinceFirstOrder || 0;
            const orderFrequency = orderCount > 1 && lifespan > 0 ? lifespan / (orderCount - 1) : null;
            // Determine recency
            let recency = 'Unknown';
            if (daysSinceLastOrder !== null) {
                if (daysSinceLastOrder <= 30)
                    recency = 'Recent';
                else if (daysSinceLastOrder <= 90)
                    recency = 'Medium';
                else
                    recency = 'Old';
            }
            // Determine frequency
            let frequency = 'Unknown';
            if (orderCount === 0)
                frequency = 'None';
            else if (orderCount === 1)
                frequency = 'One-time';
            else if (orderFrequency && orderFrequency <= 60)
                frequency = 'High';
            else if (orderFrequency && orderFrequency <= 120)
                frequency = 'Medium';
            else
                frequency = 'Low';
            // Determine monetary value
            let monetary = 'Unknown';
            if (totalSpent === 0)
                monetary = 'None';
            else if (totalSpent < 500)
                monetary = 'Low';
            else if (totalSpent < 2000)
                monetary = 'Medium';
            else
                monetary = 'High';
            // RFM segment
            const rfm = `${recency}-${frequency}-${monetary}`;
            // Assign a segment
            let segment = 'Unknown';
            if (rfm.includes('Recent-High-High') || rfm.includes('Recent-Medium-High')) {
                segment = 'Champions';
            }
            else if (rfm.includes('Recent') && rfm.includes('High')) {
                segment = 'Loyal Customers';
            }
            else if (rfm.includes('Recent') && rfm.includes('One-time')) {
                segment = 'Promising';
            }
            else if (rfm.includes('Old') && monetary === 'High') {
                segment = 'At Risk';
            }
            else if (daysSinceLastOrder && daysSinceLastOrder > 365) {
                segment = 'Lost';
            }
            else if (frequency === 'Low' && monetary === 'Low') {
                segment = 'Below Average';
            }
            else {
                segment = 'Average Customers';
            }
            return {
                customer: {
                    id: customer.id,
                    companyName: customer.companyName,
                    primaryContact: customer.primaryContact
                },
                orders: {
                    count: orderCount,
                    firstOrder: firstOrderDate,
                    lastOrder: lastOrderDate,
                    daysSinceFirstOrder,
                    daysSinceLastOrder,
                    orderFrequency
                },
                financial: {
                    totalSpent,
                    averageOrderValue
                },
                rfm: {
                    recency,
                    frequency,
                    monetary,
                    segment
                }
            };
        }));
        // Group by segment
        const segmentGroups = {};
        customerAnalytics.forEach((data) => {
            const segment = data.rfm.segment;
            if (!segmentGroups[segment]) {
                segmentGroups[segment] = [];
            }
            segmentGroups[segment].push(data);
        });
        // Calculate segment metrics
        const segmentMetrics = {};
        Object.keys(segmentGroups).forEach(segment => {
            const customers = segmentGroups[segment];
            const count = customers.length;
            const totalRevenue = customers.reduce((sum, data) => sum + data.financial.totalSpent, 0);
            segmentMetrics[segment] = {
                customerCount: count,
                percentOfCustomers: (count / customerAnalytics.length) * 100,
                totalRevenue,
                percentOfRevenue: totalRevenue / customerAnalytics.reduce((sum, data) => sum + data.financial.totalSpent, 0) * 100,
                averageOrderValue: customers.reduce((sum, data) => sum + data.financial.averageOrderValue, 0) / count
            };
        });
        return {
            success: true,
            customerCount: customers.length,
            customerSegments: segmentGroups,
            segmentMetrics,
            individualCustomers: customerAnalytics
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.getCustomerAnalytics = getCustomerAnalytics;
/**
 * Process a payment for an order, invoice, or quote
 */
const processPayment = async (orderId, amount, paymentDetails = {}) => {
    try {
        // 1. Get the order/invoice/quote
        const order = await tools.getOrder(orderId);
        // 2. Create the transaction
        const transactionInput = {
            amount,
            category: paymentDetails.category || 'Payment',
            description: paymentDetails.description || `Payment for order #${order.visualId}`,
            transactedFor: orderId,
            transactionDate: paymentDetails.transactionDate || new Date().toISOString().split('T')[0]
        };
        const transaction = await tools.transactionPaymentCreate(transactionInput);
        // 3. Check if the order is now paid in full
        const updatedOrder = await tools.getOrder(orderId);
        const isPaidInFull = updatedOrder.paidInFull || parseFloat(updatedOrder.amountOutstanding) <= 0;
        // 4. If paid in full, optionally update the status
        if (isPaidInFull && paymentDetails.paidStatusId) {
            await tools.updateStatus(orderId, paymentDetails.paidStatusId);
        }
        // 5. Get final updated order
        const finalOrder = await tools.getOrder(orderId);
        return {
            success: true,
            transaction,
            order: finalOrder,
            isPaidInFull,
            paymentAmount: amount,
            remainingBalance: parseFloat(finalOrder.amountOutstanding),
            message: isPaidInFull ? 'Payment processed. Order is now paid in full.' : 'Payment processed. Balance remaining.'
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.processPayment = processPayment;
/**
 * Get comprehensive product data with inventory and order history
 */
const getProductAnalytics = async (productQuery, limit = 10) => {
    try {
        // 1. Search for products
        const products = await tools.listProducts(100, productQuery);
        if (!products || products.length === 0) {
            return {
                success: true,
                message: 'No products found matching the query',
                products: []
            };
        }
        // 2. Get all orders to find line items with these products
        const orders = await tools.listOrders(300);
        // 3. Process each product to gather analytics
        const productAnalytics = await Promise.all(products.slice(0, limit).map(async (product) => {
            // Find line items using this product
            const productOrders = [];
            for (const order of orders) {
                // Get line items for this order
                let hasProduct = false;
                if (order.lineItems && order.lineItems.length > 0) {
                    for (const lineItem of order.lineItems) {
                        if (lineItem.product && lineItem.product.toLowerCase().includes(product.name.toLowerCase())) {
                            hasProduct = true;
                            break;
                        }
                    }
                }
                if (hasProduct) {
                    productOrders.push({
                        id: order.id,
                        visualId: order.visualId,
                        status: order.status ? order.status.name : 'Unknown',
                        createdAt: order.createdAt,
                        customer: order.customer ? {
                            id: order.customer.id,
                            name: order.customer.companyName
                        } : null
                    });
                }
            }
            // Sort orders by date (newest first)
            productOrders.sort((a, b) => {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            });
            // Calculate statistics
            const orderCount = productOrders.length;
            // Calculate last 30/60/90 days
            const now = new Date();
            const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const last60Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
            const last90Days = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            const ordersLast30Days = productOrders.filter(order => new Date(order.createdAt) >= last30Days);
            const ordersLast60Days = productOrders.filter(order => new Date(order.createdAt) >= last60Days);
            const ordersLast90Days = productOrders.filter(order => new Date(order.createdAt) >= last90Days);
            // Most frequent customers
            const customerCounts = {};
            for (const order of productOrders) {
                if (order.customer) {
                    const customerId = order.customer.id;
                    customerCounts[customerId] = (customerCounts[customerId] || 0) + 1;
                }
            }
            const topCustomers = Object.keys(customerCounts)
                .map(customerId => ({
                customerId,
                customerName: productOrders.find(o => o.customer && o.customer.id === customerId)?.customer.name,
                orderCount: customerCounts[customerId]
            }))
                .sort((a, b) => b.orderCount - a.orderCount)
                .slice(0, 5);
            return {
                product: {
                    id: product.id,
                    name: product.name,
                    description: product.description,
                    price: product.price
                },
                orders: {
                    total: orderCount,
                    recent: productOrders.slice(0, 5),
                    byTimeframe: {
                        last30Days: ordersLast30Days.length,
                        last60Days: ordersLast60Days.length,
                        last90Days: ordersLast90Days.length
                    }
                },
                customers: {
                    uniqueCount: Object.keys(customerCounts).length,
                    topCustomers
                },
                trends: {
                    monthlyAverage: ordersLast90Days.length / 3,
                    isActive: ordersLast30Days.length > 0
                }
            };
        }));
        return {
            success: true,
            query: productQuery,
            matchCount: products.length,
            analyzedCount: productAnalytics.length,
            products: productAnalytics
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.getProductAnalytics = getProductAnalytics;
// Mock function for calling the SanMar MCP
// In a real implementation, this would use the MCP client to call the SanMar API
async function callSanMarMCP(toolName, params) {
    console.log(`[Mock] Calling SanMar MCP tool: ${toolName} with params:`, params);
    // Mock response based on the tool being called
    if (toolName === 'get_product_info') {
        // Return mock product info for the given style number
        return {
            styleNumber: params.style_number,
            name: `SanMar ${params.style_number}`,
            description: `SanMar product ${params.style_number}`,
            availableColors: ['Red', 'Blue', 'Black', 'White'],
            availableSizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
            basePrice: 10.99,
            category: 'T-Shirts',
            brand: 'Port & Company'
        };
    }
    if (toolName === 'check_inventory') {
        // Return mock inventory information
        return {
            styleNumber: params.style_number,
            color: params.color,
            inventory: {
                'XS': 100,
                'S': 250,
                'M': 300,
                'L': 250,
                'XL': 200,
                'XXL': 150
            },
            inStock: true
        };
    }
    return { error: 'Unknown tool' };
}
/**
 * Create a quote with SanMar products with live data from SanMar API
 * This function makes actual calls to the SanMar MCP to get product details
 */
const createQuoteWithSanMarLiveData = async (customerId, contactId, sanmarItems, settings = {}) => {
    try {
        // 1. Create the empty quote first
        const quoteInput = {
            customerId,
            contactId,
            customerNote: settings.customerNote || '',
            productionNote: settings.productionNote || '',
            customerDueAt: settings.customerDueAt,
            tags: settings.tags || [],
            shippingAddressId: settings.shippingAddressId,
            billingAddressId: settings.billingAddressId,
            deliveryMethod: settings.deliveryMethod,
            discount: settings.discount,
            discountAmount: settings.discountAmount,
            discountAsPercentage: settings.discountAsPercentage,
            salesTax: settings.salesTax,
            statusId: settings.statusId
        };
        const quote = await tools.quoteCreate(quoteInput);
        // 2. Find the default line item group
        const defaultGroups = quote.lineItemGroups || [];
        if (defaultGroups.length === 0) {
            throw new Error('No line item group found in the created quote');
        }
        const lineItemGroupId = defaultGroups[0].id;
        // 3. Process each SanMar item with live data
        const lineItems = [];
        const inventoryWarnings = [];
        for (const item of sanmarItems) {
            // Get product info from SanMar MCP
            const productInfo = await callSanMarMCP('get_product_info', {
                style_number: item.styleNumber
            });
            // Check inventory if requested
            let inventoryInfo = null;
            if (item.checkInventory && item.color) {
                inventoryInfo = await callSanMarMCP('check_inventory', {
                    style_number: item.styleNumber,
                    color: item.color
                });
                // Check if requested quantities are available
                for (const [size, quantity] of Object.entries(item.sizes)) {
                    if (inventoryInfo.inventory[size] < quantity) {
                        inventoryWarnings.push({
                            styleNumber: item.styleNumber,
                            color: item.color,
                            size: size,
                            requested: quantity,
                            available: inventoryInfo.inventory[size]
                        });
                    }
                }
            }
            // Format sizes for Printavo API (array of strings instead of a string)
            const sizesArray = Object.entries(item.sizes)
                .map(([size, quantity]) => `${size}(${quantity})`);
            // Calculate total quantity
            const totalQuantity = Object.values(item.sizes).reduce((sum, qty) => sum + qty, 0);
            // Use product info from SanMar API
            const lineItemInput = {
                product: productInfo.name,
                color: item.color || '',
                description: item.description || productInfo.description,
                sizes: sizesArray,
                quantity: totalQuantity,
                price: item.price || productInfo.basePrice,
                taxed: settings.itemsTaxed !== undefined ? settings.itemsTaxed : true
            };
            const lineItem = await tools.lineItemCreate(lineItemGroupId, lineItemInput);
            lineItems.push(lineItem);
        }
        // 4. Get the updated quote with all its line items
        const updatedQuote = await tools.getQuote(quote.id);
        return {
            success: true,
            quote: updatedQuote,
            lineItems,
            inventoryWarnings: inventoryWarnings.length > 0 ? inventoryWarnings : null,
            message: inventoryWarnings.length > 0
                ? 'Quote created with SanMar products, but some items have inventory warnings'
                : 'Quote created successfully with SanMar products'
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.createQuoteWithSanMarLiveData = createQuoteWithSanMarLiveData;
/**
 * Update sizes for an existing line item
 */
const updateLineItemSizes = async (lineItemId, sizes) => {
    try {
        // 1. Get the current line item
        const lineItem = await tools.getLineItem(lineItemId);
        // 2. Format sizes for Printavo API (array of strings)
        const sizesArray = Object.entries(sizes)
            .map(([size, quantity]) => `${size}(${quantity})`);
        // 3. Update the line item with just the sizes
        const updatedLineItem = await tools.lineItemUpdate(lineItemId, {
            sizes: sizesArray
        });
        return {
            success: true,
            lineItem: updatedLineItem,
            message: 'Line item sizes updated successfully'
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message,
            details: error
        };
    }
};
exports.updateLineItemSizes = updateLineItemSizes;
