// This is the GraphQL client for Printavo
import { 
  PrintavoAPIResponse, 
  QuoteCreateInput, 
  LineItemGroupCreateInput,
  LineItemCreateInput,
  CustomAddressInput,
  ImprintCreateInput,
  TaskCreateInput,
  PrintavoOrder,
  PrintavoCustomer,
  PaymentRequestCreateInput,
  PrintavoPaymentRequest,
  ApprovalRequestCreateInput,
  PrintavoApprovalRequest,
  FeeInput,
  PrintavoFee,
  PrintavoThread,
  DeliveryMethodInput,
  PrintavoProduct,
  PrintavoLineItem,
  PrintavoLineItemGroup,
  LineItemGroupPricingInput,
  LineItemPricing,
  ProductSearchParams
} from './types';

const PRINTAVO_API_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';

export type GraphQLResponse<T = any> = {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
};

// Mock data representing Printavo's API structure
const mockData = {
  orders: {
    edges: [
      {
        node: {
          id: "order_1",
          orderNumber: "ORD-001",
          status: { id: "1", name: "In Production" },
          createdAt: "2023-08-15T14:30:00Z",
          customer: {
            id: "cust_1",
            name: "John Smith",
            email: "john@example.com"
          },
          lineItemGroups: {
            edges: [
              {
                node: {
                  id: "lig_1",
                  name: "T-Shirts Order",
                  lineItems: {
                    edges: [
                      {
                        node: {
                          id: "li_1",
                          name: "Custom T-Shirt",
                          quantity: 100,
                          unitPrice: "15.99"
                        }
                      }
                    ]
                  }
                }
              }
            ]
          }
        }
      }
    ]
  },
  customers: {
    edges: [
      {
        node: {
          id: "cust_1",
          name: "John Smith",
          email: "john@example.com",
          phone: "555-123-4567",
          orders: {
            edges: [
              {
                node: {
                  id: "order_1",
                  orderNumber: "ORD-001",
                  status: { id: "1", name: "In Production" }
                }
              }
            ]
          }
        }
      }
    ]
  },
  products: {
    edges: [
      {
        node: {
          id: "prod_1",
          name: "Custom T-Shirt",
          description: "High quality cotton t-shirt with custom printing",
          price: "25.99"
        }
      }
    ]
  }
};

// Returns mock data based on the query and parameters
function getMockResponse(endpoint: string, params: Record<string, any> = {}) {
  let data = {};
  
  switch (endpoint) {
    case '/query/orders':
    case '/query/quotes':
    case '/query/invoices':
      data = { orders: mockData.orders };
      break;
    case '/query/customers':
      data = { customers: mockData.customers };
      break;
    case '/query/products':
      data = { products: mockData.products };
      break;
    default:
      data = { viewer: { name: "Test User", email: "test@example.com" } };
  }
  
  return { data };
}

export const printavoClient = {
  async query<T = any>(endpoint: string, params: Record<string, any> = {}): Promise<PrintavoAPIResponse<T>> {
    // Check if we have the API email and token
    const apiEmail = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
    const apiToken = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
    
    // If credentials are missing, return mock data
    if (!apiEmail || !apiToken || apiEmail === 'youremail@email.com' || apiToken === 'your_api_token_here') {
      console.log("Using mock data for Printavo API");
      return getMockResponse(endpoint, params) as PrintavoAPIResponse<T>;
    }
    
    try {
      const url = new URL(endpoint, PRINTAVO_API_URL);
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'email': apiEmail,
          'token': apiToken
        }
      });

      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return {
        errors: [
          {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
          },
        ],
      };
    }
  },

  async mutate<T = any>(endpoint: string, data: Record<string, any>): Promise<PrintavoAPIResponse<T>> {
    const apiEmail = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
    const apiToken = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
    
    if (!apiEmail || !apiToken || apiEmail === 'youremail@email.com' || apiToken === 'your_api_token_here') {
      console.log("Using mock data for Printavo API");
      return getMockResponse(endpoint) as PrintavoAPIResponse<T>;
    }
    
    try {
      const response = await fetch(new URL(endpoint, PRINTAVO_API_URL).toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'email': apiEmail,
          'token': apiToken
        },
        body: JSON.stringify(data)
      });

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      return {
        errors: [
          {
            message: error instanceof Error ? error.message : 'Unknown error occurred',
          },
        ],
      };
    }
  },

  // Quote Creation and Management
  async createQuote(input: QuoteCreateInput): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    return this.mutate('/mutation/quotecreate', { input });
  },

  async addLineItemGroup(parentId: string, input: LineItemGroupCreateInput): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/lineitemgroupcreate', { parentId, input });
  },

  async addLineItem(lineItemGroupId: string, input: LineItemCreateInput): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/lineitemcreate', { lineItemGroupId, input });
  },

  async addCustomAddress(parentId: string, input: CustomAddressInput): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/customaddresscreate', { parentId, input });
  },

  async addImprint(lineItemGroupId: string, input: ImprintCreateInput): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/imprintcreate', { lineItemGroupId, input });
  },

  async updateStatus(parentId: string, statusId: string): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/statusupdate', { parentId, statusId });
  },

  // Task Management
  async createTask(input: TaskCreateInput): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/taskcreate', { input });
  },

  // Customer Queries
  async getCustomer(id: string): Promise<PrintavoAPIResponse<PrintavoCustomer>> {
    return this.query('/query/customer', { id });
  },

  async getCustomers(params: { 
    first?: number; 
    after?: string; 
    before?: string; 
    last?: number;
  } = {}): Promise<PrintavoAPIResponse<{ customers: { edges: Array<{ node: PrintavoCustomer }> } }>> {
    return this.query('/query/customers', params);
  },

  async getOrdersByCustomer(customerId: string) {
    const customerResponse = await this.getCustomer(customerId);
    if (customerResponse.data && customerResponse.data.orders) {
      return customerResponse.data.orders;
    }
    return null;
  },

  // Order Queries
  async getOrder(id: string): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    return this.query('/query/order', { id });
  },

  async getOrders(params: {
    first?: number;
    inProductionAfter?: string;
    inProductionBefore?: string;
    statusIds?: string[];
    sortOn?: string;
  } = {}): Promise<PrintavoAPIResponse<{ orders: { edges: Array<{ node: PrintavoOrder }> } }>> {
    return this.query('/query/orders', params);
  },

  async getDueOrders(params: {
    first?: number;
    statusIds?: string[];
    sortOn?: string;
  } = {}) {
    const now = new Date().toISOString();
    return await this.getOrders({ ...params, inProductionBefore: now });
  },

  async getInvoices(params: { 
    first?: number;
    sortOn?: string;
  } = {}) {
    return await this.query('/query/invoices', params);
  },

  async getDueInvoices(params: {
    first?: number;
    sortOn?: string;
  } = {}) {
    const now = new Date().toISOString();
    return await this.query('/query/invoices', { ...params, inProductionBefore: now });
  },

  async getInvoice(id: string): Promise<PrintavoAPIResponse<any>> {
    return await this.query('/query/invoice', { id });
  },

  // Helper method for creating a complete quote with line items
  async createCompleteQuote(
    quoteInput: QuoteCreateInput,
    lineItemGroups: Array<{
      group: LineItemGroupCreateInput;
      items: LineItemCreateInput[];
      imprints?: ImprintCreateInput[];
    }>
  ): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    try {
      // Create the quote first
      const quoteResponse = await this.createQuote(quoteInput);
      if (!quoteResponse.data || quoteResponse.errors) {
        return quoteResponse;
      }

      const quoteId = quoteResponse.data.id;

      // Add each line item group and its items
      for (const groupData of lineItemGroups) {
        // Create line item group
        const groupResponse = await this.addLineItemGroup(quoteId, groupData.group);
        if (!groupResponse.data || groupResponse.errors) {
          continue;
        }

        const groupId = groupResponse.data.id;

        // Add line items to the group
        for (const item of groupData.items) {
          await this.addLineItem(groupId, item);
        }

        // Add imprints if provided
        if (groupData.imprints) {
          for (const imprint of groupData.imprints) {
            await this.addImprint(groupId, imprint);
          }
        }
      }

      // Return the final quote with all items
      return this.getOrder(quoteId);
    } catch (error) {
      return {
        errors: [{
          message: error instanceof Error ? error.message : 'Failed to create complete quote'
        }]
      };
    }
  },

  // Payment Request Methods
  async createPaymentRequest(parentId: string, input: PaymentRequestCreateInput): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/paymentrequestcreate', { parentId, input });
  },

  async getPaymentRequests(params: {
    first?: number;
    after?: string;
    before?: string;
    last?: number;
  } = {}): Promise<PrintavoAPIResponse<{ paymentRequests: { edges: Array<{ node: PrintavoPaymentRequest }> } }>> {
    return this.query('/query/paymentrequests', params);
  },

  // Approval Request Methods
  async createApprovalRequest(parentId: string, input: ApprovalRequestCreateInput): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/approvalrequestcreate', { parentId, input });
  },

  async getApprovalRequests(orderId: string): Promise<PrintavoAPIResponse<{ approvalRequests: { edges: Array<{ node: PrintavoApprovalRequest }> } }>> {
    return this.query(`/invoice/${orderId}/approvalrequests`);
  },

  // Fee Management
  async createFee(parentId: string, input: FeeInput): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/feecreate', { parentId, input });
  },

  async updateFee(id: string, input: FeeInput): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/feeupdate', { id, input });
  },

  async deleteFee(id: string): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/feedelete', { id });
  },

  async getFees(orderId: string): Promise<PrintavoAPIResponse<{ fees: { edges: Array<{ node: PrintavoFee }> } }>> {
    return this.query(`/invoice/${orderId}/fees`);
  },

  // Thread/Message Management
  async getThreads(params: {
    first?: number;
    after?: string;
    before?: string;
    last?: number;
    onlyWithUnread?: boolean;
  } = {}): Promise<PrintavoAPIResponse<{ threads: { edges: Array<{ node: PrintavoThread }> } }>> {
    return this.query('/query/threads', params);
  },

  async updateThreadStatus(id: string, unread: boolean): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/threadupdate', { id, unread });
  },

  async getThread(id: string): Promise<PrintavoAPIResponse<PrintavoThread>> {
    return this.query('/query/thread', { id });
  },

  // Delivery Methods
  async createDeliveryMethod(input: DeliveryMethodInput): Promise<PrintavoAPIResponse<any>> {
    return this.mutate('/mutation/deliverymethodcreate', { input });
  },

  // Product Management
  async searchProducts(params: ProductSearchParams): Promise<PrintavoAPIResponse<{ products: { edges: Array<{ node: PrintavoProduct }> } }>> {
    return this.query('/query/products', params);
  },

  async getProduct(id: string): Promise<PrintavoAPIResponse<PrintavoProduct>> {
    return this.query('/query/product', { id });
  },

  // Line Item Management
  async getLineItem(id: string): Promise<PrintavoAPIResponse<PrintavoLineItem>> {
    return this.query('/query/lineitem', { id });
  },

  async getLineItemGroup(id: string): Promise<PrintavoAPIResponse<PrintavoLineItemGroup>> {
    return this.query('/query/lineitemgroup', { id });
  },

  async calculatePricing(lineItemGroup: LineItemGroupPricingInput): Promise<PrintavoAPIResponse<LineItemPricing>> {
    return this.query('/query/lineitemgrouppricing', { lineItemGroup });
  },

  // Helper method for creating a quote with products
  async createQuoteFromProducts(
    quoteInput: QuoteCreateInput,
    items: Array<{
      productId: string;
      quantity: number;
      unitPrice?: number;
      imprints?: ImprintCreateInput[];
    }>
  ): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    try {
      // Create the quote first
      const quoteResponse = await this.createQuote(quoteInput);
      if (!quoteResponse.data || quoteResponse.errors) {
        return quoteResponse;
      }

      const quoteId = quoteResponse.data.id;

      // Create a single line item group for all products
      const groupResponse = await this.addLineItemGroup(quoteId, {
        name: 'Product Order',
        description: 'Order created from product catalog'
      });

      if (!groupResponse.data || groupResponse.errors) {
        return quoteResponse;
      }

      const groupId = groupResponse.data.id;

      // Add each product as a line item
      for (const item of items) {
        // Get product details
        const product = await this.getProduct(item.productId);
        if (!product.data) continue;

        // Create line item with product details
        await this.addLineItem(groupId, {
          name: product.data.name,
          description: product.data.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice || product.data.price || 0,
          productId: item.productId
        });

        // Add imprints if provided
        if (item.imprints) {
          for (const imprint of item.imprints) {
            await this.addImprint(groupId, imprint);
          }
        }
      }

      // Return the final quote with all items
      return this.getOrder(quoteId);
    } catch (error) {
      return {
        errors: [{
          message: error instanceof Error ? error.message : 'Failed to create quote from products'
        }]
      };
    }
  },

  // Additional helper method for line item pricing
  async calculateQuoteTotal(
    lineItems: Array<{
      name: string;
      quantity: number;
      unitPrice: number;
    }>
  ): Promise<PrintavoAPIResponse<LineItemPricing>> {
    return this.calculatePricing({
      items: lineItems
    });
  },

  // Additional helper methods
  async createQuoteWithPayment(
    quoteInput: QuoteCreateInput,
    lineItemGroups: Array<{
      group: LineItemGroupCreateInput;
      items: LineItemCreateInput[];
      imprints?: ImprintCreateInput[];
    }>,
    paymentRequest?: PaymentRequestCreateInput
  ): Promise<PrintavoAPIResponse<PrintavoOrder>> {
    try {
      // Create the quote first
      const quoteResponse = await this.createCompleteQuote(quoteInput, lineItemGroups);
      if (!quoteResponse.data || quoteResponse.errors) {
        return quoteResponse;
      }

      // Add payment request if provided
      if (paymentRequest) {
        await this.createPaymentRequest(quoteResponse.data.id, paymentRequest);
      }

      // Return the final quote with all items
      return this.getOrder(quoteResponse.data.id);
    } catch (error) {
      return {
        errors: [{
          message: error instanceof Error ? error.message : 'Failed to create quote with payment'
        }]
      };
    }
  },

  async createInvoice(input: any): Promise<PrintavoAPIResponse<any>> {
    return await this.mutate('/mutation/invoicecreate', { input });
  },

  async updateInvoice(id: string, input: any): Promise<PrintavoAPIResponse<any>> {
    return await this.mutate('/mutation/invoiceupdate', { id, input });
  },

  async deleteInvoice(id: string): Promise<PrintavoAPIResponse<any>> {
    return await this.mutate('/mutation/invoicedelete', { id });
  },

  async getPaymentHistory(params: { 
    first?: number; 
    after?: string; 
    before?: string; 
    last?: number
  } = {}): Promise<PrintavoAPIResponse<any>> {
    // Alias to getPaymentRequests for now
    return await this.getPaymentRequests(params);
  },

  async updateInvoiceStatus(id: string, statusId: string): Promise<PrintavoAPIResponse<any>> {
    return await this.mutate('/mutation/invoiceupdatestatus', { id, statusId });
  },

  async updateOrderStatus(id: string, statusId: string): Promise<PrintavoAPIResponse<any>> {
    return await this.mutate('/mutation/orderupdatestatus', { id, statusId });
  },
};

// Ensure the mutate function is defined or imported
async function mutate<T = any>(endpoint: string, data: Record<string, any>): Promise<T> {
  // Mock implementation for mutate
  return {} as T;
}

// Exporting createCompleteQuote function
export async function createCompleteQuote(quoteData: {
  input: QuoteCreateInput;
  lineItemGroups: Array<{
    group: LineItemGroupCreateInput;
    items: LineItemCreateInput[];
    imprints?: ImprintCreateInput[];
  }>;
}) {
  const { input, lineItemGroups } = quoteData;
  
  try {
    // First create the quote
    const quote = await mutate('/mutation/quotecreate', {
      input
    });

    // Then create line item groups and their items
    const groups = await Promise.all(lineItemGroups.map(async ({ group, items, imprints }) => {
      const lineItemGroup = await mutate('/mutation/lineitemgroupcreate', {
        input: group,
        parentId: quote.id
      });

      // Create line items for the group
      const lineItems = await Promise.all(items.map(item =>
        mutate('/mutation/lineitemcreate', {
          input: item,
          lineItemGroupId: lineItemGroup.id
        })
      ));

      // Create imprints if any
      const groupImprints = imprints ? await Promise.all(imprints.map(imprint =>
        mutate('/mutation/imprintcreate', {
          input: imprint,
          lineItemGroupId: lineItemGroup.id
        })
      )) : [];

      return {
        group: lineItemGroup,
        items: lineItems,
        imprints: groupImprints
      };
    }));

    return {
      quote,
      groups
    };
  } catch (error) {
    console.error('Error creating quote:', error);
    throw error;
  }
}