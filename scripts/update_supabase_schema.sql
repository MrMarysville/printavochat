-- Update Supabase Schema for Printavo Integration
-- This script adds missing tables and fields to match the Printavo API data model

-- First, create extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  printavo_product_id TEXT UNIQUE,
  brand TEXT,
  item_number TEXT,
  description TEXT,
  color TEXT,
  catalog TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes only if the products table was created
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_printavo_id') THEN
      CREATE INDEX idx_products_printavo_id ON products(printavo_product_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_products_item_number') THEN
      CREATE INDEX idx_products_item_number ON products(item_number);
    END IF;
  END IF;
END
$$;

-- Pricing Matrix tables
CREATE TABLE IF NOT EXISTS pricing_matrices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  printavo_matrix_id TEXT UNIQUE,
  name TEXT NOT NULL,
  type_of_work TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pricing_matrix_columns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matrix_id UUID,
  printavo_column_id TEXT,
  name TEXT NOT NULL,
  position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(matrix_id, printavo_column_id)
);

-- Add foreign key constraint only if both tables exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing_matrix_columns') 
     AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing_matrices') THEN
    
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'pricing_matrix_columns_matrix_id_fkey'
    ) THEN
      ALTER TABLE pricing_matrix_columns 
      ADD CONSTRAINT pricing_matrix_columns_matrix_id_fkey 
      FOREIGN KEY (matrix_id) REFERENCES pricing_matrices(id) ON DELETE CASCADE;
    END IF;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS pricing_matrix_cells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  matrix_id UUID,
  column_id UUID,
  printavo_cell_id TEXT,
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(matrix_id, column_id, quantity)
);

-- Add foreign key constraints only if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing_matrix_cells') THEN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing_matrices')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pricing_matrix_cells_matrix_id_fkey') THEN
      
      ALTER TABLE pricing_matrix_cells 
      ADD CONSTRAINT pricing_matrix_cells_matrix_id_fkey 
      FOREIGN KEY (matrix_id) REFERENCES pricing_matrices(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pricing_matrix_columns')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pricing_matrix_cells_column_id_fkey') THEN
      
      ALTER TABLE pricing_matrix_cells 
      ADD CONSTRAINT pricing_matrix_cells_column_id_fkey 
      FOREIGN KEY (column_id) REFERENCES pricing_matrix_columns(id) ON DELETE CASCADE;
    END IF;
  END IF;
END
$$;

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  printavo_task_id TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed BOOLEAN DEFAULT FALSE,
  assigned_to TEXT,
  related_entity_type TEXT, -- 'order', 'quote', 'customer', etc.
  related_entity_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index only if tasks table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_tasks_entity') THEN
      CREATE INDEX idx_tasks_entity ON tasks(related_entity_type, related_entity_id);
    END IF;
  END IF;
END
$$;

-- Payment Terms table
CREATE TABLE IF NOT EXISTS payment_terms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  printavo_term_id TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  days_until_due INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Fees table
CREATE TABLE IF NOT EXISTS fees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  printavo_fee_id TEXT UNIQUE,
  order_id UUID,
  quote_id UUID,
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

-- Add foreign key constraints only if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'fees') THEN
    -- Add indexes
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fees_order') THEN
      CREATE INDEX idx_fees_order ON fees(order_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fees_quote') THEN
      CREATE INDEX idx_fees_quote ON fees(quote_id);
    END IF;
    
    -- Add foreign key constraints
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fees_order_id_fkey') THEN
      
      ALTER TABLE fees 
      ADD CONSTRAINT fees_order_id_fkey 
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
    
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fees_quote_id_fkey') THEN
      
      ALTER TABLE fees 
      ADD CONSTRAINT fees_quote_id_fkey 
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE;
    END IF;
  END IF;
END
$$;

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  printavo_expense_id TEXT UNIQUE,
  order_id UUID,
  name TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint only if tables exist
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'expenses') THEN
    -- Add index
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_expenses_order') THEN
      CREATE INDEX idx_expenses_order ON expenses(order_id);
    END IF;
    
    -- Add foreign key constraint
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders')
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expenses_order_id_fkey') THEN
      
      ALTER TABLE expenses 
      ADD CONSTRAINT expenses_order_id_fkey 
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;
    END IF;
  END IF;
END
$$;

-- Update existing tables with missing fields

-- Update customers table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'customers') THEN
    -- Add columns that don't exist yet
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'internal_note') THEN
        ALTER TABLE customers ADD COLUMN internal_note TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'resale_number') THEN
        ALTER TABLE customers ADD COLUMN resale_number TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'tax_exempt') THEN
        ALTER TABLE customers ADD COLUMN tax_exempt BOOLEAN DEFAULT FALSE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'order_count') THEN
        ALTER TABLE customers ADD COLUMN order_count INTEGER DEFAULT 0;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignore errors
    END;
  END IF;
END
$$;

-- Update line_items table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'line_items') THEN
    -- Add columns that don't exist yet
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'line_items' AND column_name = 'item_number') THEN
        ALTER TABLE line_items ADD COLUMN item_number TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'line_items' AND column_name = 'category') THEN
        ALTER TABLE line_items ADD COLUMN category TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'line_items' AND column_name = 'markup_percentage') THEN
        ALTER TABLE line_items ADD COLUMN markup_percentage NUMERIC(10,2);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'line_items' AND column_name = 'product_status') THEN
        ALTER TABLE line_items ADD COLUMN product_status TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'line_items' AND column_name = 'product_id') 
         AND EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
        ALTER TABLE line_items ADD COLUMN product_id UUID REFERENCES products(id);
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignore errors
    END;
    
    -- Create index if products table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'products') THEN
      IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'line_items' AND column_name = 'product_id')
         AND NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_line_items_product') THEN
        CREATE INDEX idx_line_items_product ON line_items(product_id);
      END IF;
    END IF;
  END IF;
END
$$;

-- Update orders table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'orders') THEN
    -- Add columns that don't exist yet
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'paid_in_full') THEN
        ALTER TABLE orders ADD COLUMN paid_in_full BOOLEAN DEFAULT FALSE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'amount_outstanding') THEN
        ALTER TABLE orders ADD COLUMN amount_outstanding NUMERIC(10,2);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'amount_paid') THEN
        ALTER TABLE orders ADD COLUMN amount_paid NUMERIC(10,2);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount') THEN
        ALTER TABLE orders ADD COLUMN discount NUMERIC(10,2);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount') THEN
        ALTER TABLE orders ADD COLUMN discount_amount NUMERIC(10,2);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_is_percentage') THEN
        ALTER TABLE orders ADD COLUMN discount_is_percentage BOOLEAN DEFAULT TRUE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'customer_due_at') THEN
        ALTER TABLE orders ADD COLUMN customer_due_at TIMESTAMP WITH TIME ZONE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_due_at') THEN
        ALTER TABLE orders ADD COLUMN payment_due_at TIMESTAMP WITH TIME ZONE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'production_note') THEN
        ALTER TABLE orders ADD COLUMN production_note TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_quantity') THEN
        ALTER TABLE orders ADD COLUMN total_quantity INTEGER;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignore errors
    END;
    
    -- Add payment_term_id if payment_terms table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_terms') THEN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'payment_term_id') THEN
        ALTER TABLE orders ADD COLUMN payment_term_id UUID REFERENCES payment_terms(id);
      END IF;
    END IF;
  END IF;
END
$$;

-- Update quotes table if it exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'quotes') THEN
    -- Add columns that don't exist yet
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'paid_in_full') THEN
        ALTER TABLE quotes ADD COLUMN paid_in_full BOOLEAN DEFAULT FALSE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'amount_outstanding') THEN
        ALTER TABLE quotes ADD COLUMN amount_outstanding NUMERIC(10,2);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'amount_paid') THEN
        ALTER TABLE quotes ADD COLUMN amount_paid NUMERIC(10,2);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'discount') THEN
        ALTER TABLE quotes ADD COLUMN discount NUMERIC(10,2);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'discount_amount') THEN
        ALTER TABLE quotes ADD COLUMN discount_amount NUMERIC(10,2);
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'discount_is_percentage') THEN
        ALTER TABLE quotes ADD COLUMN discount_is_percentage BOOLEAN DEFAULT TRUE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'customer_due_at') THEN
        ALTER TABLE quotes ADD COLUMN customer_due_at TIMESTAMP WITH TIME ZONE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'payment_due_at') THEN
        ALTER TABLE quotes ADD COLUMN payment_due_at TIMESTAMP WITH TIME ZONE;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'production_note') THEN
        ALTER TABLE quotes ADD COLUMN production_note TEXT;
      END IF;
      
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'total_quantity') THEN
        ALTER TABLE quotes ADD COLUMN total_quantity INTEGER;
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        -- Ignore errors
    END;
    
    -- Add payment_term_id if payment_terms table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payment_terms') THEN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'quotes' AND column_name = 'payment_term_id') THEN
        ALTER TABLE quotes ADD COLUMN payment_term_id UUID REFERENCES payment_terms(id);
      END IF;
    END IF;
  END IF;
END
$$; 