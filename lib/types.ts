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
  lineItems?: LineItemCreateInput[];
  lineItemGroups?: LineItemGroupWithItemsInput[];
  paymentTermId?: string;
}

export interface LineItemGroupWithItemsInput extends LineItemGroupCreateInput {
  lineItems?: LineItemCreateInput[];
  imprint?: ImprintInput;
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
export interface PrintavoAPIResponse<T> {
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

export interface CustomerCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: {
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
}

export interface PrintavoCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  createdAt: string;
  updatedAt: string;
  addresses?: PrintavoConnection<CustomAddressInput>;
  orders?: PrintavoConnection<PrintavoOrder>;
}

export interface PrintavoOrder {
  id: string;
  visualId: string;  // Added visualId field
  name: string;
  orderNumber?: string;  // Added orderNumber field
  status: {
    id: string;
    name: string;
  };
  customer: PrintavoCustomer;
  createdAt: string;
  updatedAt: string;
  total: number;
  subtotal?: number;  // Added subtotal field
  tax?: number;  // Added tax field
  shipping?: number;  // Added shipping field
  discount?: number;  // Added discount field
  notes?: string;  // Added notes field
  dueAt?: string;  // Added dueAt field
  customerDueAt?: string;  // Added customerDueAt field
  productionNote?: string;  // Added productionNote field
  customerNote?: string;  // Added customerNote field
  paymentStatus?: string;  // Added paymentStatus field
  paymentDueAt?: string;  // Added paymentDueAt field
  lineItemGroups: PrintavoLineItemGroup[];
  billingAddress?: {  // Added billingAddress field
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  shippingAddress?: {  // Added shippingAddress field
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  threadSummary?: {  // Added threadSummary field
    lastMessage?: string;
    previewText?: string;
    updatedAt?: string;
  };
  // Add other fields as needed
}

export interface PrintavoLineItemGroup {
  id: string;
  name: string;
  lineItems: PrintavoLineItem[];
  style?: { // Added style property
    style_number?: string;
    color?: string;
    sizes?: any;
  };
  quantity?: number; // Added quantity property
  price?: number; // Added price property
  // Add other fields as needed
}

export interface PrintavoLineItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  total: number;
  // Add other fields as needed
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

// Response type mapping for Printavo API endpoints
export const responseTypeMap: Record<string, string> = {
  '/query/order': 'PrintavoOrder',
  '/query/quote': 'PrintavoOrder',
  '/query/orders': 'PrintavoOrder[]',
  '/query/customer': 'PrintavoCustomer',
  '/query/customers': 'PrintavoCustomer[]',
  '/query/products': 'PrintavoProduct[]',
  '/query/lineitem': 'PrintavoLineItem',
  '/query/lineitemgroup': 'PrintavoLineItemGroup',
  '/query/lineitemgrouppricing': 'LineItemPricing',
  '/query/paymentrequests': 'PrintavoPaymentRequest[]',
  '/mutation/paymentrequestcreate': 'PrintavoPaymentRequest',
  '/mutation/approvalrequestcreate': 'PrintavoApprovalRequest',
  '/mutation/quotecreate': 'PrintavoOrder',
  '/mutation/feecreate': 'PrintavoFee',
  '/mutation/feeupdate': 'PrintavoFee',
  '/mutation/lineitemgroupcreate': 'PrintavoLineItemGroup',
  '/mutation/lineitemcreate': 'PrintavoLineItem'
};

export interface ImprintInput {
  typeOfWork: string;
  details?: string;
  pricingMatrixColumnId?: string;
  mockupUrls?: string[];
}
