export interface Contact {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  fax?: string;
  firstName?: string;
  lastName?: string;
  orderCount?: number;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface Customer {
  id: string;
  companyName: string;
  defaultPaymentTerm?: string;
  internalNote?: string;
  orderCount?: number;
  owner?: string;
  primaryContact?: Contact;
  publicUrl?: string;
  resaleNumber?: string;
  salesTax?: number;
  shippingAddress?: Address;
  taxExempt?: boolean;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface Address {
  id: string;
  address1: string;
  address2?: string;
  city: string;
  companyName?: string;
  country: string;
  countryIso: string;
  customerName?: string;
  name?: string;
  state: string;
  stateIso: string;
  zipCode: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface LineItem {
  id: string;
  category?: string;
  color?: string;
  description?: string;
  itemNumber?: string;
  items?: any[];
  lineItemGroup?: LineItemGroup;
  markupPercentage?: number;
  merch?: any;
  personalizations?: any[];
  poLineItem?: any;
  position?: number;
  price: number;
  priceReceipt?: number;
  product?: any;
  productStatus?: string;
  sizes?: any[];
  taxed?: boolean;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface LineItemGroup {
  id: string;
  enabledColumns?: string[];
  order?: any;
  position?: number;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface Quote {
  id: string;
  amountOutstanding?: number;
  amountPaid?: number;
  billingAddress?: Address;
  contact?: Contact;
  contractorProfile?: any;
  createdAt?: string;
  customerDueAt?: string;
  customerNote?: string;
  deliveryMethod?: string;
  discount?: number;
  discountAmount?: number;
  discountAsPercentage?: boolean;
  dueAt?: string;
  invoiceAt?: string;
  merch?: any;
  nickname?: string;
  owner?: string;
  packingSlipUrl?: string;
  paidInFull?: boolean;
  paymentDueAt?: string;
  paymentRequest?: any;
  paymentTerm?: string;
  productionNote?: string;
  publicHash?: string;
  publicPdf?: string;
  publicUrl?: string;
  salesTax?: number;
  salesTaxAmount?: number;
  shippingAddress?: Address;
  startAt?: string;
  status?: Status;
  subtotal?: number;
  tags?: string[];
  threadSummary?: any;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
  total?: number;
  totalQuantity?: number;
  totalUntaxed?: number;
  url?: string;
  visualId?: string;
  visualPoNumber?: string;
  workorderUrl?: string;
}

export interface Status {
  id: string;
  name: string;
  type?: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface Task {
  id: string;
  assignedTo?: string;
  completed?: boolean;
  completedAt?: string;
  completedBy?: string;
  dueAt?: string;
  name: string;
  sourcePresetTaskGroupTitle?: string;
  taskable?: any;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface Inquiry {
  id: string;
  email: string;
  name: string;
  phone?: string;
  request: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
  unread?: boolean;
}

export interface Transaction {
  id: string;
  amount?: number;
  category?: string;
  description?: string;
  originatingPaymentTransaction?: any;
  processing?: boolean;
  source?: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
  transactedFor?: any;
  transactionDate?: string;
}

export interface MerchStore {
  id: string;
  name: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface Thread {
  id: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface Account {
  id: string;
  name: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
} 