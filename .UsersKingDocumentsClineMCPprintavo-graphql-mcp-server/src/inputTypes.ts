export interface ContactUpdateInput {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  fax?: string;
}

export interface InvoiceUpdateInput {
  contactId?: string;
  customerNote?: string;
  productionNote?: string;
  customerDueAt?: string;
  tags?: string[];
  shippingAddressId?: string;
}

export interface LineItemCreateInput {
  category?: string;
  color?: string;
  description?: string;
  itemNumber?: string;
  items?: string[];
  markupPercentage?: number;
  merch?: boolean;
  personalizations?: string[];
  poLineItem?: string;
  position?: number;
  price?: number;
  priceReceipt?: number;
  product?: string;
  productStatus?: string;
  sizes?: string[];
  taxed?: boolean;
}

export interface InquiryCreateInput {
  email: string;
  name: string;
  phone?: string;
  request: string;
}

export interface TransactionPaymentCreateInput {
  amount: number;
  category: string;
  description?: string;
  transactedFor: string;
  transactionDate: string;
}

export interface CustomAddressUpdateInput {
  address1?: string;
  address2?: string;
  city?: string;
  companyName?: string;
  country?: string;
  countryIso?: string;
  customerName?: string;
  name?: string;
  state?: string;
  stateIso?: string;
  zipCode?: string;
}

export interface FeeUpdateInput {
  amount?: number;
  description?: string;
  quantity?: number;
  taxable?: boolean;
  unitPrice?: number;
  unitPriceAsPercentage?: number;
}

export interface LineItemGroupUpdateInput {
  enabledColumns?: string[];
  order?: number;
  position?: number;
}

export interface FeeUpdatesInput {
  amount?: number;
  description?: string;
  quantity?: number;
  taxable?: boolean;
  unitPrice?: number;
  unitPriceAsPercentage?: number;
}

export interface ImprintCreateInput {
  details?: string;
  pricingMatrixColumn?: string;
  typeOfWork?: string;
}

export interface CustomerUpdateInput {
  companyName?: string;
  defaultPaymentTerm?: string;
  internalNote?: string;
  owner?: string;
  publicUrl?: string;
  resaleNumber?: string;
  salesTax?: number;
  taxExempt?: boolean;
  billingAddressId?: string;
  shippingAddressId?: string;
}

export interface LineItemUpdateInput {
  category?: string;
  color?: string;
  description?: string;
  itemNumber?: string;
  items?: string[];
  markupPercentage?: number;
  merch?: boolean;
  personalizations?: string[];
  poLineItem?: string;
  position?: number;
  price?: number;
  priceReceipt?: number;
  product?: string;
  productStatus?: string;
  sizes?: string[];
  taxed?: boolean;
}

export interface CustomAddressUpdatesInput {
  address1?: string;
  address2?: string;
  city?: string;
  companyName?: string;
  country?: string;
  countryIso?: string;
  customerName?: string;
  name?: string;
  state?: string;
  stateIso?: string;
  zipCode?: string;
}

export interface ContactCreateInput {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  fax?: string;
}

export interface TaskCreateInput {
  assignedTo?: string;
  dueAt?: string;
  name: string;
  taskable: string;
}

export interface QuoteUpdateInput {
  contactId?: string;
  customerNote?: string;
  productionNote?: string;
  customerDueAt?: string;
  tags?: string[];
  shippingAddressId?: string;
}

export interface CustomAddressInput {
  address1: string;
  address2?: string;
  city: string;
  companyName?: string;
  country?: string;
  countryIso?: string;
  customerName?: string;
  name: string;
  state?: string;
  stateIso?: string;
  zipCode: string;
}

export interface QuoteCreateInput {
  contactId: string;
  customerNote?: string;
  productionNote?: string;
  customerDueAt?: string;
  tags?: string[];
  shippingAddressId: string;
  billingAddressId: string;
  customerId: string;
  deliveryMethod?: string;
  discount?: number;
  discountAmount?: number;
  discountAsPercentage?: number;
  dueAt?: string;
  invoiceAt?: string;
  merch?: boolean;
  nickname?: string;
  owner?: string;
  paymentTerm?: string;
  salesTax?: number;
  startAt?: string;
  statusId?: string;
} 