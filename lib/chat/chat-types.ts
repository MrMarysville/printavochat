/**
 * Types for chat functionality
 */

// Type for a line item in a quote
export interface QuoteLineItem {
  name: string;
  quantity: number;
  price: number;
  description?: string;
}

// Type for a customer in a quote
export interface QuoteCustomer {
  id?: string;
  name: string;
  email?: string;
  phone?: string;
}

// Type for quote creation state
export interface QuoteCreation {
  customer?: QuoteCustomer;
  lineItems: QuoteLineItem[];
  notes?: string;
  dueDate?: string;
}

// Chat context for maintaining state between messages
export interface ChatContext {
  currentOrder?: any;
  currentCustomer?: any;
  quoteCreation?: QuoteCreation;
  // Add other context properties as needed
}

// Response from a chat handler
export interface ChatResponse {
  content: string;
  context: ChatContext;
} 