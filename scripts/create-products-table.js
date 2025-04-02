/**
 * Create Products Table in Supabase
 * 
 * This script creates the products table and other necessary tables
 * using the Supabase client.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl ? 'Available' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Available' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be defined in environment');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Create tables
async function createTables() {
  try {
    // Create UUID extension
    console.log('Creating UUID extension...');
    const extensionResult = await supabase.rpc('exec_sql', {
      sql: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
    });
    
    if (extensionResult.error) {
      console.error('Error creating UUID extension:', extensionResult.error);
      // Don't necessarily return false, let the check below handle it
      // return false; 
    }
    
    console.log('UUID extension creation attempted.');

    // Verify uuid_generate_v4 function exists
    console.log('Verifying uuid_generate_v4 function existence...');
    const { data: functionCheck, error: functionError } = await supabase.rpc('exec_sql', {
      sql: `SELECT proname FROM pg_proc WHERE proname = 'uuid_generate_v4';`
    });

    // Check the structure of the response - it might be nested
    let functionExists = false;
    if (functionCheck && Array.isArray(functionCheck) && functionCheck.length > 0) {
      // Assuming exec_sql returns an array of rows
      functionExists = functionCheck.some(row => row.proname === 'uuid_generate_v4');
    } else if (typeof functionCheck === 'string' && functionCheck.includes('uuid_generate_v4')) {
       // Handle cases where it might return a simple string output
       functionExists = true; 
    }
    
    if (functionError || !functionExists) {
      console.error('Error verifying uuid_generate_v4 function:', functionError || 'Function not found after extension creation.');
      console.log('Function check result:', functionCheck); // Log the actual result for debugging
      return false;
    }

    console.log('uuid_generate_v4 function verified successfully.');
    
    // Create products table
    console.log('Creating products table...');
    const productsResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS products (
          id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
          printavo_product_id TEXT UNIQUE,
          brand TEXT,
          item_number TEXT,
          description TEXT,
          color TEXT,
          catalog TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_products_printavo_id ON products(printavo_product_id);
        CREATE INDEX IF NOT EXISTS idx_products_item_number ON products(item_number);
      `
    });
    
    if (productsResult.error) {
      console.error('Error creating products table:', productsResult.error);
      return false;
    }
    
    console.log('Products table created successfully');
    
    // Create pricing_matrices table
    console.log('Creating pricing matrices tables...');
    const matricesResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS pricing_matrices (
          id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
          printavo_matrix_id TEXT UNIQUE,
          name TEXT NOT NULL,
          type_of_work TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE TABLE IF NOT EXISTS pricing_matrix_columns (
          id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
          matrix_id UUID REFERENCES pricing_matrices(id) ON DELETE CASCADE,
          printavo_column_id TEXT,
          name TEXT NOT NULL,
          position INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(matrix_id, printavo_column_id)
        );
        
        CREATE TABLE IF NOT EXISTS pricing_matrix_cells (
          id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
          matrix_id UUID REFERENCES pricing_matrices(id) ON DELETE CASCADE,
          column_id UUID REFERENCES pricing_matrix_columns(id) ON DELETE CASCADE,
          printavo_cell_id TEXT,
          quantity INTEGER NOT NULL,
          price NUMERIC(10,2) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(matrix_id, column_id, quantity)
        );
      `
    });
    
    if (matricesResult.error) {
      console.error('Error creating pricing matrices tables:', matricesResult.error);
      return false;
    }
    
    console.log('Pricing matrices tables created successfully');
    
    // Create tasks table
    console.log('Creating tasks table...');
    const tasksResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS tasks (
          id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
          printavo_task_id TEXT UNIQUE,
          name TEXT NOT NULL,
          description TEXT,
          due_date TIMESTAMP WITH TIME ZONE,
          completed BOOLEAN DEFAULT FALSE,
          assigned_to TEXT,
          related_entity_type TEXT,
          related_entity_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_tasks_entity ON tasks(related_entity_type, related_entity_id);
      `
    });
    
    if (tasksResult.error) {
      console.error('Error creating tasks table:', tasksResult.error);
      return false;
    }
    
    console.log('Tasks table created successfully');
    
    // Create payment_terms table
    console.log('Creating payment_terms table...');
    const termsResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS payment_terms (
          id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
          printavo_term_id TEXT UNIQUE,
          name TEXT NOT NULL,
          description TEXT,
          days_until_due INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    });
    
    if (termsResult.error) {
      console.error('Error creating payment_terms table:', termsResult.error);
      return false;
    }
    
    console.log('Payment_terms table created successfully');
    
    // Add related fields to existing tables
    console.log('Updating existing tables...');
    
    // Update customer table
    const customerResult = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE IF EXISTS customers 
        ADD COLUMN IF NOT EXISTS internal_note TEXT,
        ADD COLUMN IF NOT EXISTS resale_number TEXT,
        ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS order_count INTEGER DEFAULT 0;
      `
    });
    
    if (customerResult.error) {
      console.error('Error updating customers table:', customerResult.error);
    } else {
      console.log('Customers table updated successfully');
    }
    
    // Update line_items table
    const lineItemsResult = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE IF EXISTS line_items 
        ADD COLUMN IF NOT EXISTS item_number TEXT,
        ADD COLUMN IF NOT EXISTS category TEXT,
        ADD COLUMN IF NOT EXISTS markup_percentage NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS product_status TEXT,
        ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id);
        
        CREATE INDEX IF NOT EXISTS idx_line_items_product ON line_items(product_id);
      `
    });
    
    if (lineItemsResult.error) {
      console.error('Error updating line_items table:', lineItemsResult.error);
    } else {
      console.log('Line_items table updated successfully');
    }
    
    // Update orders table
    const ordersResult = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE IF EXISTS orders 
        ADD COLUMN IF NOT EXISTS paid_in_full BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS amount_outstanding NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS discount NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS discount_is_percentage BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS customer_due_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS payment_due_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS payment_term_id UUID REFERENCES payment_terms(id),
        ADD COLUMN IF NOT EXISTS production_note TEXT,
        ADD COLUMN IF NOT EXISTS total_quantity INTEGER;
      `
    });
    
    if (ordersResult.error) {
      console.error('Error updating orders table:', ordersResult.error);
    } else {
      console.log('Orders table updated successfully');
    }
    
    // Update quotes table
    const quotesResult = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE IF EXISTS quotes 
        ADD COLUMN IF NOT EXISTS paid_in_full BOOLEAN DEFAULT FALSE,
        ADD COLUMN IF NOT EXISTS amount_outstanding NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS discount NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2),
        ADD COLUMN IF NOT EXISTS discount_is_percentage BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS customer_due_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS payment_due_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS payment_term_id UUID REFERENCES payment_terms(id),
        ADD COLUMN IF NOT EXISTS production_note TEXT,
        ADD COLUMN IF NOT EXISTS total_quantity INTEGER;
      `
    });
    
    if (quotesResult.error) {
      console.error('Error updating quotes table:', quotesResult.error);
    } else {
      console.log('Quotes table updated successfully');
    }
    
    // Create fees table
    console.log('Creating fees table...');
    const feesResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS fees (
          id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
          printavo_fee_id TEXT UNIQUE,
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          amount NUMERIC(10,2) NOT NULL,
          taxable BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          CHECK (
            (order_id IS NULL AND quote_id IS NOT NULL) OR
            (order_id IS NOT NULL AND quote_id IS NULL)
          )
        );
        
        CREATE INDEX IF NOT EXISTS idx_fees_order ON fees(order_id);
        CREATE INDEX IF NOT EXISTS idx_fees_quote ON fees(quote_id);
      `
    });
    
    if (feesResult.error) {
      console.error('Error creating fees table:', feesResult.error);
    } else {
      console.log('Fees table created successfully');
    }
    
    // Create expenses table
    console.log('Creating expenses table...');
    const expensesResult = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS expenses (
          id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
          printavo_expense_id TEXT UNIQUE,
          order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          amount NUMERIC(10,2) NOT NULL,
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_expenses_order ON expenses(order_id);
      `
    });
    
    if (expensesResult.error) {
      console.error('Error creating expenses table:', expensesResult.error);
    } else {
      console.log('Expenses table created successfully');
    }
    
    console.log('\nDatabase schema update completed.');
    return true;
  } catch (error) {
    console.error('Unexpected error during table creation:', error);
    return false;
  }
}

// Run the table creation
createTables()
  .then(success => {
    if (success) {
      console.log('\nAll tables were created or updated successfully!');
      process.exit(0);
    } else {
      console.log('\nSome tables failed to be created or updated. Check the errors above.');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Unhandled error:', err);
    process.exit(1);
  }); 