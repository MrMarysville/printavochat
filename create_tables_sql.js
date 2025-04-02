/**
 * Create Tables in Supabase for Printavo Quote System using SQL Queries
 * 
 * This script creates the necessary tables in Supabase for the Printavo quote system
 * by using SQL queries.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://bqruwlcgwzljlsjmpamv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnV3bGNnd3psamxzam1wYW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTM0MTAsImV4cCI6MjA1OTAyOTQxMH0.fB5Um6IoImy-sC1r61MbVR8yKQPgWg-k6w_JMwIU9Yo';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Execute SQL query
async function executeSql(sql, description) {
  console.log(`Executing SQL: ${description}`);
  
  try {
    const { data, error } = await supabase.from('_sql').select('*').eq('query', sql).maybeSingle();
    
    if (error) {
      console.error(`Error executing SQL (${description}):`, error);
      return false;
    }
    
    console.log(`SQL executed successfully: ${description}`);
    return true;
  } catch (error) {
    console.error(`Error executing SQL (${description}):`, error);
    return false;
  }
}

// Create Tables using SQL
async function createTables() {
  try {
    console.log('Starting to create tables in Supabase...');

    // Create customers table
    const createCustomersTable = `
      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        address VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(50),
        zip VARCHAR(20),
        country VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await executeSql(createCustomersTable, 'Create customers table');
    
    // Create contacts table
    const createContactsTable = `
      CREATE TABLE IF NOT EXISTS contacts (
        id SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        phone VARCHAR(50),
        is_primary BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await executeSql(createContactsTable, 'Create contacts table');
    
    // Create statuses table
    const createStatusesTable = `
      CREATE TABLE IF NOT EXISTS statuses (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        color VARCHAR(20),
        description TEXT,
        type VARCHAR(50)
      );
    `;
    await executeSql(createStatusesTable, 'Create statuses table');
    
    // Create quotes table
    const createQuotesTable = `
      CREATE TABLE IF NOT EXISTS quotes (
        id SERIAL PRIMARY KEY,
        visual_id VARCHAR(50) UNIQUE,
        customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
        contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
        status_id INTEGER REFERENCES statuses(id) ON DELETE SET NULL,
        description TEXT,
        customer_note TEXT,
        production_note TEXT,
        shipping_note TEXT,
        in_production_at TIMESTAMP,
        due_at TIMESTAMP,
        total DECIMAL(10, 2),
        subtotal DECIMAL(10, 2),
        tax DECIMAL(10, 2),
        shipping DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await executeSql(createQuotesTable, 'Create quotes table');
    
    // Create line item groups table
    const createLineItemGroupsTable = `
      CREATE TABLE IF NOT EXISTS line_item_groups (
        id SERIAL PRIMARY KEY,
        quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await executeSql(createLineItemGroupsTable, 'Create line item groups table');
    
    // Create line items table
    const createLineItemsTable = `
      CREATE TABLE IF NOT EXISTS line_items (
        id SERIAL PRIMARY KEY,
        quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
        group_id INTEGER REFERENCES line_item_groups(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        color VARCHAR(100),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        total DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    await executeSql(createLineItemsTable, 'Create line items table');
    
    // Create item sizes table
    const createItemSizesTable = `
      CREATE TABLE IF NOT EXISTS item_sizes (
        id SERIAL PRIMARY KEY,
        line_item_id INTEGER REFERENCES line_items(id) ON DELETE CASCADE,
        size VARCHAR(50) NOT NULL,
        quantity INTEGER NOT NULL
      );
    `;
    await executeSql(createItemSizesTable, 'Create item sizes table');
    
    // Insert initial data
    
    // Insert statuses
    const insertStatuses = `
      INSERT INTO statuses (name, color, type, description)
      VALUES 
        ('Draft', '#CCCCCC', 'quote', 'Initial quote draft'),
        ('Sent', '#3498DB', 'quote', 'Quote sent to customer'),
        ('Approved', '#2ECC71', 'quote', 'Quote approved by customer'),
        ('Rejected', '#E74C3C', 'quote', 'Quote rejected by customer')
      ON CONFLICT (id) DO NOTHING;
    `;
    await executeSql(insertStatuses, 'Insert statuses');
    
    // Insert OMC customer
    const insertCustomer = `
      INSERT INTO customers (company_name, email, phone)
      VALUES ('OMC', 'sales@omc.com', '555-123-4567')
      ON CONFLICT (id) DO NOTHING
      RETURNING id;
    `;
    await executeSql(insertCustomer, 'Insert OMC customer');
    
    console.log('All table creation operations completed!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Run the function
createTables(); 