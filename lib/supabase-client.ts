import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';
import { mapPrintavoProductToSupabase, saveProductToSupabase } from './models/product';

// Supabase client requires URL and anon key
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Validate configuration
if (!supabaseUrl || !supabaseKey) {
  logger.error('Supabase configuration missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables.');
}

// Create a single instance of the Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);

// Types for our agent table
export interface Agent {
  id: string;
  name: string;
  assistant_id: string;
  model: string;
  instructions: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  tools: any[];
}

// Initialize Supabase client
export async function initSupabase() {
  try {
    // Test the connection
    const { data, error } = await supabase.from('agents').select('id').limit(1);
    
    if (error) {
      logger.error('Failed to connect to Supabase:', error);
      return false;
    }
    
    logger.info('Successfully connected to Supabase');
    return true;
  } catch (error) {
    logger.error('Error initializing Supabase client:', error);
    return false;
  }
}

// --- Data Saving Functions ---

/**
 * Maps Printavo customer data to the Supabase customers table schema.
 */
function mapPrintavoCustomerToSupabase(printavoCustomer: any): any {
  // Basic mapping, adjust based on actual Printavo API response and Supabase schema
  return {
    printavo_customer_id: printavoCustomer.id, // Assuming Printavo ID is 'id'
    company_name: printavoCustomer.companyName || 'N/A', // Assuming Printavo 'name' is company name
    email: printavoCustomer.email,
    phone: printavoCustomer.phone,
    // Add address fields if available in printavoCustomer object
    address: printavoCustomer.billingAddress?.address1,
    city: printavoCustomer.billingAddress?.city,
    state: printavoCustomer.billingAddress?.state,
    zip: printavoCustomer.billingAddress?.zip,
    country: printavoCustomer.billingAddress?.country,
    // Add new fields
    internal_note: printavoCustomer.internalNote,
    resale_number: printavoCustomer.resaleNumber,
    tax_exempt: printavoCustomer.taxExempt || false,
    order_count: printavoCustomer.orderCount || 0
  };
}

/**
 * Saves a Printavo customer to the Supabase customers table.
 */
export async function saveCustomerToSupabase(printavoCustomer: any): Promise<string | null> {
  if (!printavoCustomer || !printavoCustomer.id) {
    logger.error('Invalid Printavo customer data provided');
    return null;
  }

  try {
    logger.info(`Saving customer ${printavoCustomer.companyName || 'Unknown'} (ID: ${printavoCustomer.id}) to Supabase`);
    
    // Map Printavo customer data to Supabase schema
    const customerData = mapPrintavoCustomerToSupabase(printavoCustomer);
    
    // Upsert customer data to avoid duplicates
    const { data, error } = await supabase
      .from('customers')
      .upsert(customerData, { onConflict: 'printavo_customer_id' })
      .select('id')
      .single();
    
    if (error) {
      logger.error(`Error upserting customer to Supabase:`, error);
      return null;
    }
    
    logger.info(`Successfully saved customer to Supabase with UUID: ${data.id}`);
    return data.id; // Return the Supabase UUID
  } catch (err) {
    logger.error(`Exception saving customer to Supabase:`, err);
    return null;
  }
}

/**
 * Saves a Printavo product to the Supabase products table
 */
export async function saveProductToSupabaseFromPrintavo(printavoProduct: any): Promise<string | null> {
  if (!printavoProduct || !printavoProduct.id) {
    logger.error('Invalid Printavo product data provided');
    return null;
  }
  
  try {
    logger.info(`Saving product ${printavoProduct.itemNumber || 'Unknown'} (ID: ${printavoProduct.id}) to Supabase`);
    
    // Map Printavo product data to Supabase schema
    const productInput = mapPrintavoProductToSupabase(printavoProduct);
    
    // Use the product model to save
    const savedProduct = await saveProductToSupabase(supabase, productInput);
    
    if (!savedProduct) {
      logger.error(`Failed to save product to Supabase`);
      return null;
    }
    
    logger.info(`Successfully saved product to Supabase with UUID: ${savedProduct.id}`);
    return savedProduct.id; // Return the Supabase UUID
  } catch (err) {
    logger.error(`Exception saving product to Supabase:`, err);
    return null;
  }
}

/**
 * Retrieves a Supabase customer UUID by Printavo customer ID.
 */
async function getSupabaseCustomerIdByPrintavoId(printavoCustomerId: number | string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('id')
      .eq('printavo_customer_id', printavoCustomerId)
      .single(); // Assuming printavo_customer_id is unique

    if (error) {
      // Log error but don't throw, as not finding a customer might be expected
      if (error.code !== 'PGRST116') { // PGRST116: "The result contains 0 rows"
        logger.error(`Error querying Supabase for customer with Printavo ID ${printavoCustomerId}:`, error);
      } else {
        logger.info(`No Supabase customer found for Printavo ID ${printavoCustomerId}`);
      }
      return null;
    }

    if (data) {
      logger.info(`Found Supabase customer UUID for Printavo ID ${printavoCustomerId}: ${data.id}`);
      return data.id; // Return Supabase UUID
    } else {
      // This case should theoretically be covered by the error handling above for PGRST116
      logger.info(`No Supabase customer found for Printavo ID ${printavoCustomerId}`);
      return null; // Customer not found
    }
  } catch (err) {
    logger.error(`Exception querying Supabase for customer with Printavo ID ${printavoCustomerId}:`, err);
    return null;
  }
}

/**
 * Maps Printavo quote data to the Supabase quotes table schema.
 */
function mapPrintavoQuoteToSupabase(printavoQuote: any): any {
  // Basic mapping, adjust based on actual Printavo API response and Supabase schema
  return {
    printavo_quote_id: printavoQuote.id, // Assuming Printavo ID is 'id'
    name: printavoQuote.name,
    visual_id: printavoQuote.visualId, // Assuming visualId exists
    customer_id: null, // Placeholder, will be set in saveQuoteToSupabase
    status: printavoQuote.status?.name, // Assuming status object has name
    notes: printavoQuote.notes,
    subtotal: printavoQuote.subtotal,
    tax: printavoQuote.tax,
    total: printavoQuote.total,
    // Add new fields
    paid_in_full: printavoQuote.paidInFull || false,
    amount_outstanding: printavoQuote.amountOutstanding,
    amount_paid: printavoQuote.amountPaid,
    discount: printavoQuote.discount,
    discount_amount: printavoQuote.discountAmount,
    discount_is_percentage: printavoQuote.discountAsPercentage,
    customer_due_at: printavoQuote.customerDueAt,
    payment_due_at: printavoQuote.paymentDueAt,
    production_note: printavoQuote.productionNote,
    total_quantity: printavoQuote.totalQuantity
    // payment_term_id will be set later if available
  };
}

/**
 * Saves a Printavo quote to the Supabase quotes table.
 */
export async function saveQuoteToSupabase(printavoQuote: any): Promise<string | null> {
  if (!printavoQuote || !printavoQuote.id) {
    logger.error('Invalid Printavo quote data provided');
    return null;
  }

  try {
    logger.info(`Saving quote ${printavoQuote.name || 'Unknown'} (ID: ${printavoQuote.id}) to Supabase`);
    
    // Map Printavo quote data to Supabase schema
    const quoteData = mapPrintavoQuoteToSupabase(printavoQuote);
    
    // If the quote has a customer, get or create the customer in Supabase
    if (printavoQuote.contact?.customer) {
      const customerId = await saveCustomerToSupabase(printavoQuote.contact.customer);
      if (customerId) {
        quoteData.customer_id = customerId;
      }
    } else if (printavoQuote.contact?.customerId) {
      // If we only have the customer ID, try to look it up
      const customerId = await getSupabaseCustomerIdByPrintavoId(printavoQuote.contact.customerId);
      if (customerId) {
        quoteData.customer_id = customerId;
      }
    }
    
    // Upsert quote data to avoid duplicates
    const { data, error } = await supabase
      .from('quotes')
      .upsert(quoteData, { onConflict: 'printavo_quote_id' })
      .select('id')
      .single();
    
    if (error) {
      logger.error(`Error upserting quote to Supabase:`, error);
      return null;
    }
    
    logger.info(`Successfully saved quote to Supabase with UUID: ${data.id}`);
    
    // Now process line items if they exist
    if (printavoQuote.lineItemGroups?.edges) {
      await saveLineItemGroupsToSupabase(printavoQuote.lineItemGroups.edges, data.id, 'quote');
    }
    
    return data.id; // Return the Supabase UUID
  } catch (err) {
    logger.error(`Exception saving quote to Supabase:`, err);
    return null;
  }
}

/**
 * Maps a single Printavo line item to the Supabase line_items table schema.
 */
function mapPrintavoLineItemToSupabase(printavoLineItem: any, parentId: string, parentType: 'quote' | 'order'): any {
  // Basic mapping, adjust based on actual Printavo API response and Supabase schema
  const supabaseLineItem: any = {
    printavo_line_item_id: printavoLineItem.id, // Assuming Printavo ID is 'id'
    description: printavoLineItem.description,
    quantity: printavoLineItem.quantity || printavoLineItem.items, // Assuming quantity is directly available
    unit_price: printavoLineItem.price,
    color: printavoLineItem.color,
    total: printavoLineItem.quantity * printavoLineItem.price,
    // Add new fields
    item_number: printavoLineItem.itemNumber,
    category: printavoLineItem.category?.name,
    markup_percentage: printavoLineItem.markupPercentage,
    product_status: printavoLineItem.productStatus?.name,
    // product_id will be set if product exists
    group_name: printavoLineItem.lineItemGroup?.name, // Added by extractAllPrintavoLineItems
  };

  if (parentType === 'quote') {
    supabaseLineItem.quote_id = parentId;
  } else if (parentType === 'order') {
    supabaseLineItem.order_id = parentId;
  }

  // Link to product if available
  if (printavoLineItem.product) {
    // Save the product and get its ID
    saveProductToSupabaseFromPrintavo(printavoLineItem.product)
      .then(productId => {
        if (productId) {
          supabaseLineItem.product_id = productId;
        }
      })
      .catch(err => {
        logger.error(`Error saving product for line item:`, err);
      });
  }

  return supabaseLineItem;
}

/**
 * Save line item groups and their line items to Supabase
 */
async function saveLineItemGroupsToSupabase(
  lineItemGroupEdges: any[],
  parentId: string,
  parentType: 'quote' | 'order'
): Promise<void> {
  for (const edge of lineItemGroupEdges) {
    const group = edge.node;
    
    if (group && group.lineItems?.edges) {
      for (const lineItemEdge of group.lineItems.edges) {
        const lineItem = lineItemEdge.node;
        
        if (lineItem) {
          // Map and save each line item
          const lineItemData = mapPrintavoLineItemToSupabase(lineItem, parentId, parentType);
          
          // Upsert line item
          const { error } = await supabase
            .from('line_items')
            .upsert(lineItemData, { onConflict: 'printavo_line_item_id' });
          
          if (error) {
            logger.error(`Error upserting line item to Supabase:`, error);
          }
        }
      }
    }
  }
}

/**
 * Maps Printavo order data to the Supabase orders table schema.
 */
function mapPrintavoOrderToSupabase(printavoOrder: any): any {
  // Basic mapping, adjust based on actual Printavo API response and Supabase schema
  return {
    printavo_order_id: printavoOrder.id, // Assuming Printavo ID is 'id'
    name: printavoOrder.name,
    visual_id: printavoOrder.visualId, // Assuming visualId exists
    customer_id: null, // Placeholder, will be set in saveOrderToSupabase
    status: printavoOrder.status?.name, // Assuming status object has name
    notes: printavoOrder.notes,
    subtotal: printavoOrder.subtotal,
    tax: printavoOrder.tax,
    total: printavoOrder.total,
    // Add new fields
    paid_in_full: printavoOrder.paidInFull || false,
    amount_outstanding: printavoOrder.amountOutstanding,
    amount_paid: printavoOrder.amountPaid,
    discount: printavoOrder.discount,
    discount_amount: printavoOrder.discountAmount,
    discount_is_percentage: printavoOrder.discountAsPercentage,
    customer_due_at: printavoOrder.customerDueAt,
    payment_due_at: printavoOrder.paymentDueAt,
    production_note: printavoOrder.productionNote,
    total_quantity: printavoOrder.totalQuantity,
    order_date: printavoOrder.invoiceAt,
    // payment_term_id will be set later if available
  };
}

/**
 * Saves a Printavo order to the Supabase orders table.
 */
export async function saveOrderToSupabase(printavoOrder: any): Promise<string | null> {
  if (!printavoOrder || !printavoOrder.id) {
    logger.error('Invalid Printavo order data provided');
    return null;
  }

  try {
    logger.info(`Saving order ${printavoOrder.name || 'Unknown'} (ID: ${printavoOrder.id}) to Supabase`);
    
    // Map Printavo order data to Supabase schema
    const orderData = mapPrintavoOrderToSupabase(printavoOrder);
    
    // If the order has a customer, get or create the customer in Supabase
    if (printavoOrder.contact?.customer) {
      const customerId = await saveCustomerToSupabase(printavoOrder.contact.customer);
      if (customerId) {
        orderData.customer_id = customerId;
      }
    } else if (printavoOrder.contact?.customerId) {
      // If we only have the customer ID, try to look it up
      const customerId = await getSupabaseCustomerIdByPrintavoId(printavoOrder.contact.customerId);
      if (customerId) {
        orderData.customer_id = customerId;
      }
    }
    
    // Upsert order data to avoid duplicates
    const { data, error } = await supabase
      .from('orders')
      .upsert(orderData, { onConflict: 'printavo_order_id' })
      .select('id')
      .single();
    
    if (error) {
      logger.error(`Error upserting order to Supabase:`, error);
      return null;
    }
    
    logger.info(`Successfully saved order to Supabase with UUID: ${data.id}`);
    
    // Now process line items if they exist
    if (printavoOrder.lineItemGroups?.edges) {
      await saveLineItemGroupsToSupabase(printavoOrder.lineItemGroups.edges, data.id, 'order');
    }
    
    return data.id; // Return the Supabase UUID
  } catch (err) {
    logger.error(`Exception saving order to Supabase:`, err);
    return null;
  }
}
