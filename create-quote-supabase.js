/**
 * Create Quote for OMC using Supabase
 * 
 * This script creates a quote for OMC company using the Supabase connection.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://bqruwlcgwzljlsjmpamv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnV3bGNnd3psamxzam1wYW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTM0MTAsImV4cCI6MjA1OTAyOTQxMH0.fB5Um6IoImy-sC1r61MbVR8yKQPgWg-k6w_JMwIU9Yo';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to call MCP function through Supabase
async function callMcpFunction(functionName, params) {
  try {
    console.log(`Calling MCP function: ${functionName}`);
    console.log(`Params: ${JSON.stringify(params, null, 2)}`);
    
    const { data, error } = await supabase.rpc('mcp_run_tool', {
      tool_name: functionName,
      params
    });
    
    if (error) {
      throw new Error(`Supabase RPC error: ${error.message}`);
    }
    
    console.log(`Result: ${JSON.stringify(data, null, 2)}`);
    return data;
  } catch (error) {
    console.error(`Error calling MCP function ${functionName}:`, error);
    throw error;
  }
}

// Main function to create a quote for OMC
async function createQuoteForOMC() {
  try {
    // Step 1: Search for OMC customer
    const customerSearchResult = await callMcpFunction('search_customer_detail', {
      query: 'OMC'
    });
    
    let customerId, contactId;
    
    // Check if OMC customer exists
    if (customerSearchResult && customerSearchResult.results && customerSearchResult.results.length > 0) {
      // Use the first matching customer
      const customer = customerSearchResult.results[0];
      customerId = customer.id;
      
      // Get the primary contact if available
      if (customer.contacts && customer.contacts.length > 0) {
        contactId = customer.contacts[0].id;
      }
      
      console.log(`Found existing customer: ${customer.companyName} (ID: ${customerId})`);
      if (contactId) {
        console.log(`Using contact ID: ${contactId}`);
      }
    } else {
      // Create a new customer if not found
      console.log('Customer OMC not found, creating new customer');
      
      const newCustomerResult = await callMcpFunction('customer_create', {
        input: {
          companyName: 'OMC',
          email: 'sales@omc.com',
          phone: '555-123-4567'
        }
      });
      
      if (newCustomerResult && newCustomerResult.id) {
        customerId = newCustomerResult.id;
        console.log(`Created new customer with ID: ${customerId}`);
        
        // Create a contact for the new customer
        const newContactResult = await callMcpFunction('contact_create', {
          input: {
            customerId: customerId,
            fullName: 'OMC Contact',
            email: 'contact@omc.com',
            phone: '555-123-4567'
          }
        });
        
        if (newContactResult && newContactResult.id) {
          contactId = newContactResult.id;
          console.log(`Created new contact with ID: ${contactId}`);
        }
      } else {
        throw new Error('Failed to create customer');
      }
    }
    
    // Step 2: Create a quote with line items
    const quoteResult = await callMcpFunction('create_quote_with_items', {
      customer_id: customerId,
      contact_id: contactId,
      line_items: [
        {
          product: 'T-Shirt',
          description: 'Custom T-Shirt with Logo',
          color: 'Navy',
          sizes: { 'S': 5, 'M': 10, 'L': 5 },
          price: 19.99
        },
        {
          product: 'Hoodie',
          description: 'Custom Hoodie with Logo',
          color: 'Black',
          sizes: { 'M': 5, 'L': 5, 'XL': 5 },
          price: 39.99
        }
      ],
      settings: {
        customerNote: 'Initial quote for OMC',
        productionNote: 'Standard production time',
        dueAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 14 days from now
      }
    });
    
    if (quoteResult && quoteResult.quote) {
      console.log('Quote created successfully!');
      console.log(`Quote ID: ${quoteResult.quote.id}`);
      
      // Log line items created
      if (quoteResult.lineItems) {
        console.log(`Created ${quoteResult.lineItems.length} line items:`);
        quoteResult.lineItems.forEach((item, i) => {
          console.log(`Item ${i + 1}: ${item.product} - ${item.description}`);
        });
      }
    } else {
      throw new Error('Failed to create quote');
    }
  } catch (error) {
    console.error('Error creating quote for OMC:', error);
  }
}

// Run the main function
createQuoteForOMC(); 