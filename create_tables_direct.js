/**
 * Create Tables in Supabase for Printavo Quote System (Direct Method)
 * 
 * This script creates the necessary tables in Supabase to support the Printavo quote system
 * by running each SQL statement directly with the Supabase client.
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://bqruwlcgwzljlsjmpamv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnV3bGNnd3psamxzam1wYW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTM0MTAsImV4cCI6MjA1OTAyOTQxMH0.fB5Um6IoImy-sC1r61MbVR8yKQPgWg-k6w_JMwIU9Yo';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create Tables Directly
async function createTables() {
  try {
    console.log('Starting to create tables in Supabase...');
    
    // Customers table
    console.log('Creating customers table...');
    let { error } = await supabase.from('customers').delete().neq('id', 0);
    
    let { error: createError } = await supabase
      .from('customers')
      .insert([
        { 
          company_name: 'OMC', 
          email: 'sales@omc.com', 
          phone: '555-123-4567'
        }
      ]);
    
    if (createError) {
      console.error('Error creating customers:', createError);
    } else {
      console.log('Customers table created and populated!');
    }
    
    // Contacts table
    console.log('Creating contacts table...');
    
    // First, get the customer ID for OMC
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .eq('company_name', 'OMC')
      .single();
    
    if (customerError) {
      console.error('Error getting OMC customer ID:', customerError);
    } else {
      const customerId = customerData.id;
      
      let { error: contactError } = await supabase
        .from('contacts')
        .insert([
          { 
            customer_id: customerId, 
            full_name: 'OMC Contact', 
            email: 'contact@omc.com', 
            phone: '555-123-4567',
            is_primary: true
          }
        ]);
      
      if (contactError) {
        console.error('Error creating contacts:', contactError);
      } else {
        console.log('Contacts table created and populated!');
      }
    }
    
    // Statuses table
    console.log('Creating statuses table...');
    let { error: statusError } = await supabase
      .from('statuses')
      .insert([
        { name: 'Draft', color: '#CCCCCC', type: 'quote', description: 'Initial quote draft' },
        { name: 'Sent', color: '#3498DB', type: 'quote', description: 'Quote sent to customer' },
        { name: 'Approved', color: '#2ECC71', type: 'quote', description: 'Quote approved by customer' },
        { name: 'Rejected', color: '#E74C3C', type: 'quote', description: 'Quote rejected by customer' }
      ]);
    
    if (statusError) {
      console.error('Error creating statuses:', statusError);
    } else {
      console.log('Statuses table created and populated!');
    }
    
    // Create a quote for OMC
    console.log('Creating a quote for OMC...');
    
    // Get the contact ID
    const { data: contactData, error: contactFetchError } = await supabase
      .from('contacts')
      .select('id')
      .eq('full_name', 'OMC Contact')
      .single();
    
    if (contactFetchError) {
      console.error('Error getting contact ID:', contactFetchError);
    } else {
      const contactId = contactData.id;
      
      // Get the draft status ID
      const { data: statusData, error: statusFetchError } = await supabase
        .from('statuses')
        .select('id')
        .eq('name', 'Draft')
        .single();
      
      if (statusFetchError) {
        console.error('Error getting status ID:', statusFetchError);
      } else {
        const statusId = statusData.id;
        
        // Create the quote
        const { data: quoteData, error: quoteError } = await supabase
          .from('quotes')
          .insert([
            { 
              visual_id: '1001',
              customer_id: customerId,
              contact_id: contactId,
              status_id: statusId,
              description: 'Quote for OMC',
              customer_note: 'Initial quote for OMC',
              production_note: 'Standard production time',
              in_production_at: new Date().toISOString(),
              due_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              total: 999.65,
              subtotal: 999.65
            }
          ])
          .select()
          .single();
        
        if (quoteError) {
          console.error('Error creating quote:', quoteError);
        } else {
          console.log('Quote created successfully!', quoteData);
          
          // Create a line item group
          const { data: groupData, error: groupError } = await supabase
            .from('line_item_groups')
            .insert([
              {
                quote_id: quoteData.id,
                name: 'Default Group',
                description: 'Default group for line items'
              }
            ])
            .select()
            .single();
          
          if (groupError) {
            console.error('Error creating line item group:', groupError);
          } else {
            console.log('Line item group created successfully!', groupData);
            
            // Create line items
            const { data: lineItemsData, error: lineItemsError } = await supabase
              .from('line_items')
              .insert([
                {
                  quote_id: quoteData.id,
                  group_id: groupData.id,
                  name: 'T-Shirt',
                  description: 'Custom T-Shirt with Logo',
                  color: 'Navy',
                  quantity: 20,
                  unit_price: 19.99,
                  total: 399.80
                },
                {
                  quote_id: quoteData.id,
                  group_id: groupData.id,
                  name: 'Hoodie',
                  description: 'Custom Hoodie with Logo',
                  color: 'Black',
                  quantity: 15,
                  unit_price: 39.99,
                  total: 599.85
                }
              ])
              .select();
            
            if (lineItemsError) {
              console.error('Error creating line items:', lineItemsError);
            } else {
              console.log('Line items created successfully!', lineItemsData);
              
              // Create item sizes for T-Shirt
              const tshirtId = lineItemsData[0].id;
              const { error: tshirtSizesError } = await supabase
                .from('item_sizes')
                .insert([
                  { line_item_id: tshirtId, size: 'S', quantity: 5 },
                  { line_item_id: tshirtId, size: 'M', quantity: 10 },
                  { line_item_id: tshirtId, size: 'L', quantity: 5 }
                ]);
              
              if (tshirtSizesError) {
                console.error('Error creating T-Shirt sizes:', tshirtSizesError);
              } else {
                console.log('T-Shirt sizes created successfully!');
              }
              
              // Create item sizes for Hoodie
              const hoodieId = lineItemsData[1].id;
              const { error: hoodieSizesError } = await supabase
                .from('item_sizes')
                .insert([
                  { line_item_id: hoodieId, size: 'M', quantity: 5 },
                  { line_item_id: hoodieId, size: 'L', quantity: 5 },
                  { line_item_id: hoodieId, size: 'XL', quantity: 5 }
                ]);
              
              if (hoodieSizesError) {
                console.error('Error creating Hoodie sizes:', hoodieSizesError);
              } else {
                console.log('Hoodie sizes created successfully!');
              }
            }
          }
        }
      }
    }
    
    console.log('All operations completed!');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
createTables(); 