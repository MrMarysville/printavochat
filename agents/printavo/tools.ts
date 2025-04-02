/**
 * Tool definitions for Printavo operations.
 */
import { z } from "zod";
import { AgentTool } from "../types";
import * as queries from "./queries";
import { executeGraphQL } from "./graphql-client";

export type ToolContext = {
  executeGraphQL: typeof executeGraphQL;
};

export const createToolContext = (): ToolContext => {
  return {
    executeGraphQL: executeGraphQL
  };
};

// Types for tools
export interface PrintavoTool {
  name: string;
  description: string;
  handler: (params: any, context: ToolContext) => Promise<any>;
}

// Create the tools array
export const printavoTools: PrintavoTool[] = [
  // Account information
  {
    name: 'get_account',
    description: 'Get information about the current Printavo account',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(queries.GET_ACCOUNT);
      return result.account;
    }
  },
  
  // Current user
  {
    name: 'get_current_user',
    description: 'Get information about the current Printavo user',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(queries.GET_CURRENT_USER);
      return result.currentUser;
    }
  },
  
  // Orders
  {
    name: 'get_order',
    description: 'Get an order by ID',
    handler: async (params: { id: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.GET_ORDER,
        { id: params.id },
        'GetOrder'
      );
      return result.order;
    }
  },
  
  {
    name: 'get_order_by_visual_id',
    description: 'Get an order by its visual ID',
    handler: async (params: { visualId: string }, { executeGraphQL }: ToolContext) => {
      // Try to find by invoice Visual ID first
      try {
        const result = await executeGraphQL(
          queries.GET_ORDER_BY_VISUAL_ID,
          { visualId: params.visualId },
          'GetOrderByVisualId'
        );
        
        if (result.invoices?.edges?.length > 0) {
          return result.invoices.edges[0].node;
        }
        
        return null;
      } catch (error) {
        // If not found, return null
        return null;
      }
    }
  },
  
  {
    name: 'search_orders',
    description: 'Search for orders by query string',
    handler: async (params: { query: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.SEARCH_ORDERS,
        { query: params.query },
        'SearchOrders'
      );
      
      return result.orders?.edges?.map((edge: any) => edge.node) || [];
    }
  },
  
  {
    name: 'list_orders',
    description: 'List orders with pagination',
    handler: async (params: { first?: number, after?: string, sortOn?: string }, { executeGraphQL }: ToolContext) => {
      console.log('Executing list_orders with params:', params);
      
      const variables = {
        first: params.first || 10,
        after: params.after,
        sortOn: params.sortOn || 'CREATED_AT_DESC'
      };
      
      console.log('GraphQL variables:', variables);
      
      // Get the LIST_ORDERS query from the queries module
      const LIST_ORDERS = `
        query ListOrders($first: Int!, $after: String, $sortOn: String) {
          orders(first: $first, after: $after, sortOn: $sortOn) {
            nodes {
              id
              name
              visualId
              createdAt
              updatedAt
              dueDate
              status {
                id
                name
                color
              }
              customer {
                id
                name
                email
              }
              total
            }
            pageInfo {
              hasNextPage
              endCursor
            }
          }
        }
      `;
      
      console.log('Using query:', LIST_ORDERS);
      
      const result = await executeGraphQL(
        LIST_ORDERS,
        variables,
        'ListOrders'
      );
      
      console.log('GraphQL result:', JSON.stringify(result).substring(0, 200) + '...');
      
      const orders = result.orders?.nodes || [];
      console.log(`Retrieved ${orders.length} orders`);
      
      return {
        orders: orders,
        pageInfo: result.orders?.pageInfo
      };
    }
  },
  
  // Customers
  {
    name: 'get_customer',
    description: 'Get a customer by ID',
    handler: async (params: { id: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.GET_CUSTOMER,
        { id: params.id },
        'GetCustomer'
      );
      return result.customer;
    }
  },
  
  {
    name: 'get_customer_by_email',
    description: 'Get a customer by email',
    handler: async (params: { email: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.SEARCH_CUSTOMERS,
        { query: params.email },
        'SearchCustomers'
      );
      
      const customers = result.customers?.edges?.map((edge: any) => edge.node) || [];
      const customer = customers.find((c: any) => 
        c.email?.toLowerCase() === params.email.toLowerCase()
      );
      
      return customer || null;
    }
  },
  
  {
    name: 'create_customer',
    description: 'Create a new customer',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const input = {
        name: params.name,
        email: params.email,
        phone: params.phone,
        address: params.address,
        notes: params.notes
      };
      
      const result = await executeGraphQL(
        queries.CREATE_CUSTOMER,
        { input },
        'CreateCustomer'
      );
      
      return result.customerCreate.customer;
    }
  },
  
  // Quotes
  {
    name: 'create_quote',
    description: 'Create a new quote',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const input = {
        customerId: params.customerId,
        name: params.name,
        orderDate: params.orderDate || new Date().toISOString().split('T')[0]
      };
      
      // Create quote
      const result = await executeGraphQL(
        queries.CREATE_QUOTE,
        { input },
        'CreateQuote'
      );
      
      const quote = result.quoteCreate.quote;
      
      // Add line items if provided
      if (params.lineItems && params.lineItems.length > 0) {
        for (const item of params.lineItems) {
          const lineItemInput = {
            quoteId: quote.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            description: item.description
          };
          
          await executeGraphQL(
            queries.CREATE_LINE_ITEM,
            { input: lineItemInput },
            'CreateLineItem'
          );
        }
        
        // Fetch updated quote with line items
        const updatedResult = await executeGraphQL(
          queries.GET_QUOTE,
          { id: quote.id },
          'GetQuote'
        );
        
        return updatedResult.quote;
      }
      
      return quote;
    }
  },
  
  // Statuses
  {
    name: 'update_status',
    description: 'Update the status of an order, quote, or invoice',
    handler: async (params: { id: string, statusId: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.UPDATE_STATUS,
        { 
          input: {
            id: params.id,
            statusId: params.statusId
          }
        },
        'UpdateStatus'
      );
      
      return result.statusUpdate.order || 
             result.statusUpdate.quote || 
             result.statusUpdate.invoice;
    }
  },
  
  {
    name: 'list_statuses',
    description: 'List available statuses',
    handler: async (params: { type?: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.LIST_STATUSES,
        { type: params.type },
        'ListStatuses'
      );
      
      return result.statuses?.edges?.map((edge: any) => edge.node) || [];
    }
  },

  // Additional Tools for Full Parity
  
  // Invoices
  {
    name: 'get_invoice',
    description: 'Get an invoice by ID',
    handler: async (params: { id: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.GET_INVOICE,
        { id: params.id },
        'GetInvoice'
      );
      return result.invoice;
    }
  },
  
  {
    name: 'list_invoices',
    description: 'List invoices with pagination',
    handler: async (params: { first?: number, after?: string }, { executeGraphQL }: ToolContext) => {
      const variables = {
        first: params.first || 10,
        after: params.after
      };
      
      const result = await executeGraphQL(
        queries.LIST_INVOICES,
        variables,
        'ListInvoices'
      );
      
      return {
        invoices: result.invoices?.edges?.map((edge: any) => edge.node) || [],
        pageInfo: result.invoices?.pageInfo
      };
    }
  },
  
  {
    name: 'convert_quote_to_invoice',
    description: 'Convert a quote to an invoice',
    handler: async (params: { quoteId: string }, { executeGraphQL }: ToolContext) => {
      const input = {
        quoteId: params.quoteId
      };
      
      const result = await executeGraphQL(
        queries.CONVERT_QUOTE_TO_INVOICE,
        { input },
        'ConvertQuoteToInvoice'
      );
      
      return result.quoteDuplicateAsInvoice.invoice;
    }
  },
  
  // Quotes Management
  {
    name: 'get_quote',
    description: 'Get a quote by ID',
    handler: async (params: { id: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.GET_QUOTE,
        { id: params.id },
        'GetQuote'
      );
      return result.quote;
    }
  },
  
  {
    name: 'update_quote',
    description: 'Update an existing quote',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const input = {
        id: params.id,
        name: params.name,
        orderDate: params.orderDate,
        notes: params.notes,
        productionNotes: params.productionNotes
      };
      
      const result = await executeGraphQL(
        queries.UPDATE_QUOTE,
        { input },
        'UpdateQuote'
      );
      
      return result.quoteUpdate.quote;
    }
  },
  
  {
    name: 'duplicate_quote',
    description: 'Duplicate an existing quote',
    handler: async (params: { quoteId: string }, { executeGraphQL }: ToolContext) => {
      const input = {
        quoteId: params.quoteId
      };
      
      const result = await executeGraphQL(
        queries.DUPLICATE_QUOTE,
        { input },
        'DuplicateQuote'
      );
      
      return result.quoteDuplicate.quote;
    }
  },
  
  // LineItem Management
  {
    name: 'create_line_item',
    description: 'Create a new line item',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const input = {
        quoteId: params.quoteId,
        orderId: params.orderId,
        invoiceId: params.invoiceId,
        name: params.name,
        description: params.description,
        quantity: params.quantity,
        price: params.price
      };
      
      const result = await executeGraphQL(
        queries.CREATE_LINE_ITEM,
        { input },
        'CreateLineItem'
      );
      
      return result.lineItemCreate.lineItem;
    }
  },
  
  {
    name: 'update_line_item',
    description: 'Update an existing line item',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const input = {
        id: params.id,
        name: params.name,
        description: params.description,
        quantity: params.quantity,
        price: params.price
      };
      
      const result = await executeGraphQL(
        queries.UPDATE_LINE_ITEM,
        { input },
        'UpdateLineItem'
      );
      
      return result.lineItemUpdate.lineItem;
    }
  },
  
  {
    name: 'delete_line_item',
    description: 'Delete a line item',
    handler: async (params: { id: string }, { executeGraphQL }: ToolContext) => {
      const input = {
        id: params.id
      };
      
      const result = await executeGraphQL(
        queries.DELETE_LINE_ITEM,
        { input },
        'DeleteLineItem'
      );
      
      return { success: result.lineItemDelete.success };
    }
  },
  
  // Customers Management
  {
    name: 'list_customers',
    description: 'List customers with pagination',
    handler: async (params: { first?: number, after?: string }, { executeGraphQL }: ToolContext) => {
      const variables = {
        first: params.first || 10,
        after: params.after
      };
      
      const result = await executeGraphQL(
        queries.LIST_CUSTOMERS,
        variables,
        'ListCustomers'
      );
      
      return {
        customers: result.customers?.edges?.map((edge: any) => edge.node) || [],
        pageInfo: result.customers?.pageInfo
      };
    }
  },
  
  {
    name: 'update_customer',
    description: 'Update an existing customer',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const input = {
        id: params.id,
        name: params.name,
        email: params.email,
        phone: params.phone,
        address: params.address,
        notes: params.notes
      };
      
      const result = await executeGraphQL(
        queries.UPDATE_CUSTOMER,
        { input },
        'UpdateCustomer'
      );
      
      return result.customerUpdate.customer;
    }
  },
  
  // Contacts Management
  {
    name: 'get_contact',
    description: 'Get a contact by ID',
    handler: async (params: { id: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.GET_CONTACT,
        { id: params.id },
        'GetContact'
      );
      return result.contact;
    }
  },
  
  {
    name: 'list_contacts',
    description: 'List contacts for a customer',
    handler: async (params: { customerId: string, first?: number }, { executeGraphQL }: ToolContext) => {
      const variables = {
        customerId: params.customerId,
        first: params.first || 10
      };
      
      const result = await executeGraphQL(
        queries.LIST_CONTACTS,
        variables,
        'ListContacts'
      );
      
      return result.customer?.contacts?.edges?.map((edge: any) => edge.node) || [];
    }
  },
  
  {
    name: 'create_contact',
    description: 'Create a new contact for a customer',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const input = {
        customerId: params.customerId,
        name: params.name,
        email: params.email,
        phone: params.phone,
        isPrimary: params.isPrimary
      };
      
      const result = await executeGraphQL(
        queries.CREATE_CONTACT,
        { input },
        'CreateContact'
      );
      
      return result.contactCreate.contact;
    }
  },
  
  {
    name: 'update_contact',
    description: 'Update an existing contact',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const input = {
        id: params.id,
        name: params.name,
        email: params.email,
        phone: params.phone,
        isPrimary: params.isPrimary
      };
      
      const result = await executeGraphQL(
        queries.UPDATE_CONTACT,
        { input },
        'UpdateContact'
      );
      
      return result.contactUpdate.contact;
    }
  },
  
  // Products
  {
    name: 'get_product',
    description: 'Get a product by ID',
    handler: async (params: { id: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.GET_PRODUCT,
        { id: params.id },
        'GetProduct'
      );
      return result.product;
    }
  },
  
  {
    name: 'list_products',
    description: 'List products with pagination and optional search',
    handler: async (params: { first?: number, after?: string, query?: string }, { executeGraphQL }: ToolContext) => {
      const variables = {
        first: params.first || 10,
        after: params.after,
        query: params.query
      };
      
      const result = await executeGraphQL(
        queries.LIST_PRODUCTS,
        variables,
        'ListProducts'
      );
      
      return {
        products: result.products?.edges?.map((edge: any) => edge.node) || [],
        pageInfo: result.products?.pageInfo
      };
    }
  },
  
  // Tasks
  {
    name: 'get_task',
    description: 'Get a task by ID',
    handler: async (params: { id: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.GET_TASK,
        { id: params.id },
        'GetTask'
      );
      return result.task;
    }
  },
  
  {
    name: 'list_tasks',
    description: 'List tasks with pagination',
    handler: async (params: { first?: number, after?: string }, { executeGraphQL }: ToolContext) => {
      const variables = {
        first: params.first || 10,
        after: params.after
      };
      
      const result = await executeGraphQL(
        queries.LIST_TASKS,
        variables,
        'ListTasks'
      );
      
      return {
        tasks: result.tasks?.edges?.map((edge: any) => edge.node) || [],
        pageInfo: result.tasks?.pageInfo
      };
    }
  },
  
  {
    name: 'create_task',
    description: 'Create a new task',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const input = {
        title: params.title,
        description: params.description,
        dueDate: params.dueDate,
        status: params.status,
        assignedToId: params.assignedToId
      };
      
      const result = await executeGraphQL(
        queries.CREATE_TASK,
        { input },
        'CreateTask'
      );
      
      return result.taskCreate.task;
    }
  },
  
  // Inquiries
  {
    name: 'get_inquiry',
    description: 'Get an inquiry by ID',
    handler: async (params: { id: string }, { executeGraphQL }: ToolContext) => {
      const result = await executeGraphQL(
        queries.GET_INQUIRY,
        { id: params.id },
        'GetInquiry'
      );
      return result.inquiry;
    }
  },
  
  {
    name: 'list_inquiries',
    description: 'List inquiries with pagination',
    handler: async (params: { first?: number, after?: string }, { executeGraphQL }: ToolContext) => {
      const variables = {
        first: params.first || 10,
        after: params.after
      };
      
      const result = await executeGraphQL(
        queries.LIST_INQUIRIES,
        variables,
        'ListInquiries'
      );
      
      return {
        inquiries: result.inquiries?.edges?.map((edge: any) => edge.node) || [],
        pageInfo: result.inquiries?.pageInfo
      };
    }
  },
  
  // Payments
  {
    name: 'create_payment',
    description: 'Create a payment for an order or invoice',
    handler: async (params: any, { executeGraphQL }: ToolContext) => {
      const input = {
        orderId: params.orderId,
        amount: params.amount,
        date: params.date || new Date().toISOString().split('T')[0],
        paymentMethod: params.paymentMethod
      };
      
      const result = await executeGraphQL(
        queries.CREATE_PAYMENT,
        { input },
        'CreatePayment'
      );
      
      return result.transactionCreate.transaction;
    }
  },
  
  {
    name: 'list_payments',
    description: 'List payments for an order',
    handler: async (params: { orderId: string, first?: number }, { executeGraphQL }: ToolContext) => {
      const variables = {
        orderId: params.orderId,
        first: params.first || 10
      };
      
      const result = await executeGraphQL(
        queries.LIST_PAYMENTS,
        variables,
        'ListPayments'
      );
      
      return result.order?.transactions?.edges?.map((edge: any) => edge.node) || [];
    }
  },
  
  // Composite operations
  {
    name: 'get_order_summary',
    description: 'Get a comprehensive order summary with all related information',
    handler: async (params: { id: string }, { executeGraphQL }: ToolContext) => {
      // Fetch the order with line items, customer info, etc.
      const orderResult = await executeGraphQL(
        queries.GET_ORDER,
        { id: params.id },
        'GetOrder'
      );
      
      if (!orderResult.order) {
        return null;
      }
      
      // Get payment information
      const paymentsResult = await executeGraphQL(
        queries.LIST_PAYMENTS,
        { orderId: params.id, first: 10 },
        'ListPayments'
      );
      
      const payments = paymentsResult.order?.transactions?.edges?.map((edge: any) => edge.node) || [];
      
      // Calculate metrics
      const createdDate = new Date(orderResult.order.createdAt);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      let daysUntilDue = 0;
      if (orderResult.order.dueDate) {
        const dueDate = new Date(orderResult.order.dueDate);
        daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
      
      // Build timeline
      const timeline = [
        { date: orderResult.order.createdAt, event: 'Order Created' }
      ];
      
      if (orderResult.order.updatedAt !== orderResult.order.createdAt) {
        timeline.push({ date: orderResult.order.updatedAt, event: 'Order Updated' });
      }
      
      if (orderResult.order.dueDate) {
        timeline.push({ date: orderResult.order.dueDate, event: 'Order Due' });
      }
      
      for (const payment of payments) {
        timeline.push({ date: payment.date, event: `Payment of $${payment.amount} (${payment.paymentMethod})` });
      }
      
      // Sort timeline by date
      timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Build and return the comprehensive summary
      return {
        order: orderResult.order,
        payments,
        metrics: {
          daysSinceCreation,
          daysUntilDue,
          isPaid: orderResult.order.balanceRemaining <= 0,
          hasPastDueDate: daysUntilDue < 0
        },
        timeline
      };
    }
  },
  
  // Template Management Tools
  {
    name: 'list_quote_templates',
    description: 'List all available quote templates',
    async handler(params: any, context: ToolContext): Promise<any> {
      try {
        // Initialize the template manager if needed
        await templateManager.initialize();
        
        // Get all templates
        const templates = await templateManager.getTemplates();
        
        return templates.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description,
          itemCount: template.lineItems.length,
          tags: template.tags,
          createdAt: template.createdAt
        }));
      } catch (error) {
        throw new Error(`Failed to list quote templates: ${(error as Error).message}`);
      }
    }
  },
  
  {
    name: 'get_quote_template',
    description: 'Get a quote template by ID or name',
    async handler(params: any, context: ToolContext): Promise<any> {
      try {
        if (!params.id && !params.name) {
          throw new Error('Either template ID or name is required');
        }
        
        // Initialize the template manager if needed
        await templateManager.initialize();
        
        let template: QuoteTemplate | null = null;
        
        // Look up by ID or name
        if (params.id) {
          template = await templateManager.getTemplate(params.id);
        } else if (params.name) {
          template = await templateManager.getTemplateByName(params.name);
        }
        
        if (!template) {
          throw new Error(`Template not found: ${params.id || params.name}`);
        }
        
        return template;
      } catch (error) {
        throw new Error(`Failed to get quote template: ${(error as Error).message}`);
      }
    }
  },
  
  {
    name: 'search_quote_templates',
    description: 'Search for quote templates by query',
    async handler(params: any, context: ToolContext): Promise<any> {
      try {
        if (!params.query) {
          throw new Error('Search query is required');
        }
        
        // Initialize the template manager if needed
        await templateManager.initialize();
        
        // Search templates
        const templates = await templateManager.searchTemplates(params.query);
        
        return templates.map(template => ({
          id: template.id,
          name: template.name,
          description: template.description,
          itemCount: template.lineItems.length,
          tags: template.tags,
          createdAt: template.createdAt
        }));
      } catch (error) {
        throw new Error(`Failed to search quote templates: ${(error as Error).message}`);
      }
    }
  },
  
  {
    name: 'create_quote_template',
    description: 'Create a new quote template',
    async handler(params: any, context: ToolContext): Promise<any> {
      try {
        if (!params.name || !params.lineItems || !Array.isArray(params.lineItems)) {
          throw new Error('Template name and line items are required');
        }
        
        // Validate line items
        for (const item of params.lineItems) {
          if (!item.product || typeof item.quantity !== 'number' || typeof item.price !== 'number') {
            throw new Error('Each line item must have a product, quantity, and price');
          }
        }
        
        // Initialize the template manager if needed
        await templateManager.initialize();
        
        // Create the template
        const template = await templateManager.createTemplate(
          params.name,
          params.lineItems,
          {
            description: params.description,
            defaultNotes: params.defaultNotes,
            tags: params.tags,
            settings: params.settings
          }
        );
        
        return template;
      } catch (error) {
        throw new Error(`Failed to create quote template: ${(error as Error).message}`);
      }
    }
  },
  
  {
    name: 'update_quote_template',
    description: 'Update an existing quote template',
    async handler(params: any, context: ToolContext): Promise<any> {
      try {
        if (!params.id) {
          throw new Error('Template ID is required');
        }
        
        // Initialize the template manager if needed
        await templateManager.initialize();
        
        // Check if template exists
        const existingTemplate = await templateManager.getTemplate(params.id);
        if (!existingTemplate) {
          throw new Error(`Template not found: ${params.id}`);
        }
        
        // Prepare updates
        const updates: any = {};
        
        if (params.name) updates.name = params.name;
        if (params.description !== undefined) updates.description = params.description;
        if (params.lineItems) updates.lineItems = params.lineItems;
        if (params.defaultNotes !== undefined) updates.defaultNotes = params.defaultNotes;
        if (params.tags) updates.tags = params.tags;
        if (params.settings) updates.settings = params.settings;
        
        // Update the template
        const updatedTemplate = await templateManager.updateTemplate(params.id, updates);
        
        return updatedTemplate;
      } catch (error) {
        throw new Error(`Failed to update quote template: ${(error as Error).message}`);
      }
    }
  },
  
  {
    name: 'delete_quote_template',
    description: 'Delete a quote template',
    async handler(params: any, context: ToolContext): Promise<any> {
      try {
        if (!params.id) {
          throw new Error('Template ID is required');
        }
        
        // Initialize the template manager if needed
        await templateManager.initialize();
        
        // Delete the template
        const success = await templateManager.deleteTemplate(params.id);
        
        if (!success) {
          throw new Error(`Template not found: ${params.id}`);
        }
        
        return { success, id: params.id };
      } catch (error) {
        throw new Error(`Failed to delete quote template: ${(error as Error).message}`);
      }
    }
  },
  
  {
    name: 'create_quote_from_template',
    description: 'Create a new quote using a template',
    async handler(params: any, context: ToolContext): Promise<any> {
      try {
        if (!params.templateId && !params.templateName) {
          throw new Error('Either template ID or name is required');
        }
        
        if (!params.customerId) {
          throw new Error('Customer ID is required');
        }
        
        // Initialize the template manager if needed
        await templateManager.initialize();
        
        // Get the template
        let template: QuoteTemplate | null;
        if (params.templateId) {
          template = await templateManager.getTemplate(params.templateId);
        } else {
          template = await templateManager.getTemplateByName(params.templateName);
        }
        
        if (!template) {
          throw new Error(`Template not found: ${params.templateId || params.templateName}`);
        }
        
        // Prepare quote data
        const quoteData = {
          customerId: params.customerId,
          lineItems: template.lineItems.map(item => ({
            name: item.product,
            description: item.description || '',
            quantity: item.quantity,
            price: item.price,
            metadata: {
              color: item.color,
              sizes: item.sizes,
              styleNumber: item.styleNumber,
              customization: item.customization
            }
          })),
          notes: params.notes || template.defaultNotes || '',
          tag: params.tag || (template.tags && template.tags[0]) || undefined
        };
        
        // Create the quote
        const result = await context.executeGraphQL(
          `mutation CreateQuote($input: QuoteCreateInput!) {
            quoteCreate(input: $input) {
              quote {
                id
                visualId
                name
                totalPrice
                customer {
                  id
                  name
                }
                lineItems {
                  id
                  name
                  description
                  quantity
                  price
                }
              }
              errors {
                field
                message
              }
            }
          }`,
          { input: quoteData }
        );
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        
        if (result.quoteCreate.errors && result.quoteCreate.errors.length > 0) {
          throw new Error(`Failed to create quote: ${result.quoteCreate.errors[0].message}`);
        }
        
        return result.quoteCreate.quote;
      } catch (error) {
        throw new Error(`Failed to create quote from template: ${(error as Error).message}`);
      }
    }
  },
  
  {
    name: 'save_quote_as_template',
    description: 'Save an existing quote as a template',
    async handler(params: any, context: ToolContext): Promise<any> {
      try {
        if (!params.quoteId) {
          throw new Error('Quote ID is required');
        }
        
        if (!params.templateName) {
          throw new Error('Template name is required');
        }
        
        // Get the quote details
        const result = await context.executeGraphQL(
          queries.GET_QUOTE,
          { id: params.quoteId }
        );
        
        if (result.errors) {
          throw new Error(result.errors[0].message);
        }
        
        const quote = result.quote;
        if (!quote) {
          throw new Error(`Quote not found: ${params.quoteId}`);
        }
        
        // Extract line items
        const lineItems = quote.lineItems.edges.map((edge: any) => {
          const node = edge.node;
          
          // Parse metadata if available
          let color, sizes, styleNumber, customization;
          if (node.metadata) {
            try {
              const metadata = JSON.parse(node.metadata);
              color = metadata.color;
              sizes = metadata.sizes;
              styleNumber = metadata.styleNumber;
              customization = metadata.customization;
            } catch (e) {
              // Ignore metadata parsing errors
            }
          }
          
          return {
            product: node.name,
            description: node.description || '',
            quantity: node.quantity,
            price: node.price,
            color,
            sizes,
            styleNumber,
            customization
          };
        });
        
        // Initialize the template manager if needed
        await templateManager.initialize();
        
        // Create the template
        const template = await templateManager.createTemplate(
          params.templateName,
          lineItems,
          {
            description: params.description || `Template created from Quote #${quote.visualId}`,
            defaultNotes: quote.notes || '',
            tags: params.tags || []
          }
        );
        
        return template;
      } catch (error) {
        throw new Error(`Failed to save quote as template: ${(error as Error).message}`);
      }
    }
  }
]; 
