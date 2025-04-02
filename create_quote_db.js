/**
 * Create Quote for OMC in Supabase
 * 
 * This script creates a quote for OMC company using the existing Supabase tables.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://bqruwlcgwzljlsjmpamv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnV3bGNnd3psamxzam1wYW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTM0MTAsImV4cCI6MjA1OTAyOTQxMH0.fB5Um6IoImy-sC1r61MbVR8yKQPgWg-k6w_JMwIU9Yo';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create a quote for OMC
async function createQuoteForOMC() {
  try {
    console.log('Creating a quote for OMC...');
    
    // Step 1: Create or find OMC customer
    console.log('Finding or creating OMC customer...');
    
    let customerId;
    const { data: existingCustomers, error: findError } = await supabase
      .from('customers')
      .select('id, name, email')
      .eq('name', 'OMC')
      .limit(1);
    
    if (findError) {
      console.error('Error finding customer:', findError);
      return;
    }
    
    if (!existingCustomers || existingCustomers.length === 0) {
      // Create the customer
      console.log('OMC customer not found. Creating it...');
      
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert([
          { 
            name: 'OMC',
            email: 'sales@omc.com',
            phone: '555-123-4567',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (createError) {
        console.error('Error creating OMC customer:', createError);
        return;
      }
      
      console.log('Created OMC customer:', newCustomer[0]);
      customerId = newCustomer[0].id;
    } else {
      console.log('Found existing OMC customer:', existingCustomers[0]);
      customerId = existingCustomers[0].id;
    }
    
    // Step 2: Create a quote
    console.log('Creating quote...');
    
    // Generate a visual ID (4-digit number)
    const visualId = Math.floor(1000 + Math.random() * 9000).toString();
    
    const { data: newQuote, error: quoteError } = await supabase
      .from('quotes')
      .insert([
        {
          customer_id: customerId,
          name: `Quote for OMC - ${visualId}`,
          description: 'Custom T-Shirts and Hoodies with Logo',
          notes: 'Initial quote for OMC. Customer needs 20 T-shirts and 15 hoodies with company logo.',
          total: 999.65,
          visual_id: visualId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select();
    
    if (quoteError) {
      console.error('Error creating quote:', quoteError);
      return;
    }
    
    console.log('Quote created successfully!');
    console.log('Quote details:', newQuote[0]);
    
    return newQuote[0];
  } catch (error) {
    console.error('Error creating quote for OMC:', error);
  }
}

// Run the function
createQuoteForOMC()
  .then(quote => {
    if (quote) {
      console.log('\n===== Quote Created Successfully =====');
      console.log(`Quote ID: ${quote.id}`);
      console.log(`Visual ID: ${quote.visual_id}`);
      console.log(`Name: ${quote.name}`);
      console.log(`Description: ${quote.description}`);
      console.log(`Total: $${quote.total}`);
      console.log('======================================\n');
    }
  })
  .catch(error => {
    console.error('Error in quote creation process:', error);
  }); 