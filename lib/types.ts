export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'system' | 'assistant';
  timestamp: Date;
}

export interface PrintavoData {
  [key: string]: any;
}

export interface ChatHistory {
  messages: ChatMessage[];
}

// Printavo API Input Types
export interface QuoteCreateInput {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  description?: string;
  inProductionAt?: string;
  dueAt?: string;
  productionNotes?: string;
  shippingNotes?: string;
  customerNotes?: string;
  tags?: string[];
}

export interface LineItemGroupCreateInput {
  name: string;
  description?: string;
  notes?: string;
}

export interface LineItemCreateInput {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  productId?: string;
}

export interface CustomAddressInput {
  name: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ImprintCreateInput {
  name: string;
  description?: string;
  location?: string;
  width?: number;
  height?: number;
  colors?: number;
  printMethod?: string;
  notes?: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  assigneeId?: string;
  dueAt?: string;
  parentId?: string;
}

// Payment Request Types
export interface PaymentRequestCreateInput {
  amount: number;
  description?: string;
  dueAt?: string;
  notifyCustomer?: boolean;
}

// Approval Request Types
export interface ApprovalRequestCreateInput {
  description?: string;
  dueAt?: string;
  notifyCustomer?: boolean;
  type: 'ARTWORK' | 'QUOTE' | 'INVOICE';
}

// Fee Types
export interface FeeInput {
  name: string;
  amount: number;
  description?: string;
  type?: 'FLAT' | 'PERCENTAGE';
}

// Thread/Message Types
export interface ThreadUpdateInput {
  unread: boolean;
}

export interface DeliveryMethodInput {
  name: string;
  description?: string;
  fee?: number;
}

// API Response Types
export interface PrintavoAPIResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    path?: string[];
  }>;
}

export interface PrintavoConnection<T> {
  edges: Array<{
    node: T;
    cursor: string;
  }>;
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export interface PrintavoCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  addresses?: PrintavoConnection<CustomAddressInput>;
  orders?: PrintavoConnection<PrintavoOrder>;
}

export interface PrintavoOrder {
  id: string;
  orderNumber: string;
  status: {
    id: string;
    name: string;
  };
  createdAt: string;
  inProductionAt?: string;
  dueAt?: string;
  customer?: PrintavoCustomer;
  lineItemGroups?: PrintavoConnection<PrintavoLineItemGroup>;
}

export interface PrintavoLineItemGroup {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  subtotal?: number;
  total?: number;
  lineItems?: PrintavoConnection<PrintavoLineItem>;
  imprints?: PrintavoConnection<PrintavoImprint>;
  expenses?: PrintavoConnection<{
    id: string;
    name: string;
    amount: number;
    description?: string;
    paidAt?: string;
  }>;
}

export interface PrintavoLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  subtotal?: number;
  total?: number;
  product?: PrintavoProduct;
  tax?: number;
  fees?: PrintavoConnection<PrintavoFee>;
}

export interface PrintavoImprint {
  id: string;
  name: string;
  description?: string;
  location?: string;
  width?: number;
  height?: number;
  colors?: number;
  printMethod?: string;
  notes?: string;
  mockups?: PrintavoConnection<{
    id: string;
    url: string;
  }>;
}

export interface PrintavoPaymentRequest {
  id: string;
  amount: number;
  description?: string;
  dueAt?: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  createdAt: string;
}

export interface PrintavoApprovalRequest {
  id: string;
  description?: string;
  dueAt?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: 'ARTWORK' | 'QUOTE' | 'INVOICE';
  createdAt: string;
}

export interface PrintavoFee {
  id: string;
  name: string;
  amount: number;
  description?: string;
  type: 'FLAT' | 'PERCENTAGE';
}

export interface PrintavoThread {
  id: string;
  subject?: string;
  unread: boolean;
  lastMessageAt: string;
  messages?: PrintavoConnection<{
    id: string;
    content: string;
    createdAt: string;
    sender: {
      name: string;
      email: string;
    };
  }>;
}

// Line Item Group Input Types
export interface LineItemGroupPricingInput {
  name?: string;
  description?: string;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
}

// Product Types
export interface ProductVariant {
  id: string;
  name: string;
  sku?: string;
  price?: number;
  cost?: number;
}

export interface PrintavoProduct {
  id: string;
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  cost?: number;
  category?: string;
  tags?: string[];
  variants?: PrintavoConnection<ProductVariant>;
}

export interface ProductCreateInput {
  name: string;
  description?: string;
  sku?: string;
  price?: number;
  cost?: number;
  category?: string;
  tags?: string[];
}

export interface ProductSearchParams {
  query: string;
  first?: number;
  after?: string;
  before?: string;
  last?: number;
}

export interface LineItemPricing {
  subtotal: number;
  total: number;
  tax?: number;
  fees: Array<{
    name: string;
    amount: number;
  }>;
}

// Expense Types
export interface ExpenseInput {
  name: string;
  amount: number;
  description?: string;
  paidAt?: string;
  vendorId?: string;
}