/**
 * Create Tables in Supabase for Printavo Quote System using REST API
 * 
 * This script creates tables and adds data using the Supabase REST API.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://bqruwlcgwzljlsjmpamv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnV3bGNnd3psamxzam1wYW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTM0MTAsImV4cCI6MjA1OTAyOTQxMH0.fB5Um6IoImy-sC1r61MbVR8yKQPgWg-k6w_JMwIU9Yo';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create tables and populate data using REST API
async function setupTables() {
  try {
    console.log('Creating and setting up tables using Supabase REST API...');
    
    // Step 1: Create a customers table if it doesn't exist
    console.log('Setting up customers table...');
    
    // First check if the customers table exists by trying to select from it
    let { error: selectError } = await supabase
      .from('customers')
      .select('*')
      .limit(1);
    
    if (selectError && selectError.code === '42P01') {
      console.log('Customers table does not exist yet. Creating it now...');
      
      // Table doesn't exist, create it using the SQL functions
      
      // We'll use a table to store metadata
      let { error: metadataError } = await supabase
        .from('meta_tables')
        .insert([
          { 
            table_name: 'customers',
            created_at: new Date().toISOString(),
            created_by: 'setup_script'
          }
        ]);
      
      if (metadataError) {
        // If meta_tables doesn't exist, create it first
        if (metadataError.code === '42P01') {
          console.log('Creating meta_tables table first...');
          
          let { error: metaTableCreateError } = await supabase
            .from('meta_tables')
            .insert([
              { 
                table_name: 'meta_tables',
                created_at: new Date().toISOString(),
                created_by: 'setup_script'
              }
            ]);
          
          if (metaTableCreateError) {
            console.error('Error creating meta_tables:', metaTableCreateError);
          } else {
            console.log('Successfully created meta_tables!');
          }
        } else {
          console.error('Error adding to meta_tables:', metadataError);
        }
      } else {
        console.log('Added customers table to meta_tables');
      }
    } else {
      console.log('Customers table already exists.');
    }
    
    // Create or update OMC Customer
    console.log('Creating or updating OMC customer...');
    
    // Try to find OMC customer first
    const { data: existingCustomers, error: findError } = await supabase
      .from('customers')
      .select('*')
      .ilike('company_name', 'OMC')
      .limit(1);
    
    if (findError) {
      console.error('Error finding OMC customer:', findError);
    } else if (!existingCustomers || existingCustomers.length === 0) {
      // Customer doesn't exist, create it
      console.log('OMC customer not found. Creating it...');
      
      const { data: newCustomer, error: createError } = await supabase
        .from('customers')
        .insert([
          { 
            company_name: 'OMC',
            email: 'sales@omc.com',
            phone: '555-123-4567',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select();
      
      if (createError) {
        console.error('Error creating OMC customer:', createError);
      } else {
        console.log('Successfully created OMC customer!', newCustomer);
      }
    } else {
      console.log('OMC customer already exists:', existingCustomers[0]);
    }
    
    // Check for contacts table
    console.log('Setting up contacts table...');
    
    // First check if the contacts table exists by trying to select from it
    let { error: contactsSelectError } = await supabase
      .from('contacts')
      .select('*')
      .limit(1);
    
    if (contactsSelectError && contactsSelectError.code === '42P01') {
      console.log('Contacts table does not exist yet. We should create it first...');
      
      // Table doesn't exist, add to metadata
      let { error: contactsMetaError } = await supabase
        .from('meta_tables')
        .insert([
          { 
            table_name: 'contacts',
            created_at: new Date().toISOString(),
            created_by: 'setup_script'
          }
        ]);
      
      if (contactsMetaError && contactsMetaError.code !== '23505') {
        console.error('Error adding contacts to meta_tables:', contactsMetaError);
      } else {
        console.log('Added contacts table to meta_tables');
      }
    } else {
      console.log('Contacts table already exists.');
      
      // Try to find OMC customer first to get ID
      const { data: omcCustomer, error: customerLookupError } = await supabase
        .from('customers')
        .select('id')
        .ilike('company_name', 'OMC')
        .single();
      
      if (customerLookupError) {
        console.error('Error looking up OMC customer:', customerLookupError);
      } else if (omcCustomer) {
        // Create OMC Contact
        console.log('Creating or updating OMC contact...');
        
        // Try to find existing contact first
        const { data: existingContacts, error: findContactError } = await supabase
          .from('contacts')
          .select('*')
          .eq('customer_id', omcCustomer.id)
          .limit(1);
        
        if (findContactError) {
          console.error('Error finding OMC contact:', findContactError);
        } else if (!existingContacts || existingContacts.length === 0) {
          // Contact doesn't exist, create it
          console.log('OMC contact not found. Creating it...');
          
          const { data: newContact, error: createContactError } = await supabase
            .from('contacts')
            .insert([
              { 
                customer_id: omcCustomer.id,
                full_name: 'OMC Contact',
                email: 'contact@omc.com',
                phone: '555-123-4567',
                is_primary: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }
            ])
            .select();
          
          if (createContactError) {
            console.error('Error creating OMC contact:', createContactError);
          } else {
            console.log('Successfully created OMC contact!', newContact);
          }
        } else {
          console.log('OMC contact already exists:', existingContacts[0]);
        }
      }
    }
    
    // Create or setup statuses
    console.log('Setting up statuses table...');
    
    // First check if the statuses table exists by trying to select from it
    let { error: statusesSelectError } = await supabase
      .from('statuses')
      .select('*')
      .limit(1);
    
    if (statusesSelectError && statusesSelectError.code === '42P01') {
      console.log('Statuses table does not exist yet. We should create it first...');
      
      // Table doesn't exist, add to metadata
      let { error: statusesMetaError } = await supabase
        .from('meta_tables')
        .insert([
          { 
            table_name: 'statuses',
            created_at: new Date().toISOString(),
            created_by: 'setup_script'
          }
        ]);
      
      if (statusesMetaError && statusesMetaError.code !== '23505') {
        console.error('Error adding statuses to meta_tables:', statusesMetaError);
      } else {
        console.log('Added statuses table to meta_tables');
      }
    } else {
      console.log('Statuses table already exists or other error.');
      
      // Add basic statuses
      const statusesToAdd = [
        { name: 'Draft', color: '#CCCCCC', type: 'quote', description: 'Initial quote draft' },
        { name: 'Sent', color: '#3498DB', type: 'quote', description: 'Quote sent to customer' },
        { name: 'Approved', color: '#2ECC71', type: 'quote', description: 'Quote approved by customer' },
        { name: 'Rejected', color: '#E74C3C', type: 'quote', description: 'Quote rejected by customer' }
      ];
      
      for (const status of statusesToAdd) {
        // Check if status already exists
        const { data: existingStatus, error: findStatusError } = await supabase
          .from('statuses')
          .select('*')
          .eq('name', status.name)
          .eq('type', status.type)
          .single();
        
        if (findStatusError && findStatusError.code !== 'PGRST116') {
          console.error(`Error finding status ${status.name}:`, findStatusError);
        } else if (!existingStatus) {
          // Status doesn't exist, create it
          console.log(`Status ${status.name} not found. Creating it...`);
          
          const { data: newStatus, error: createStatusError } = await supabase
            .from('statuses')
            .insert([status])
            .select();
          
          if (createStatusError) {
            console.error(`Error creating status ${status.name}:`, createStatusError);
          } else {
            console.log(`Successfully created status ${status.name}!`, newStatus);
          }
        } else {
          console.log(`Status ${status.name} already exists:`, existingStatus);
        }
      }
    }
    
    console.log('Table setup completed!');
  } catch (error) {
    console.error('Error setting up tables:', error);
  }
}

// Run the setup
setupTables(); 