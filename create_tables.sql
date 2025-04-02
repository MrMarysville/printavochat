-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Changed to UUID
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

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id SERIAL PRIMARY KEY, -- Keeping SERIAL for internal reference
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE, -- References UUID customer ID
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statuses table
CREATE TABLE IF NOT EXISTS statuses (
  id SERIAL PRIMARY KEY, -- Keeping SERIAL for internal reference
  name VARCHAR(100) NOT NULL,
  color VARCHAR(20),
  description TEXT,
  type VARCHAR(50) -- e.g., 'quote', 'order', 'invoice'
);

-- Quotes table
CREATE TABLE IF NOT EXISTS quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Changed to UUID
  visual_id VARCHAR(50) UNIQUE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL, -- References UUID customer ID
  contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL, -- References SERIAL contact ID
  status_id INTEGER REFERENCES statuses(id) ON DELETE SET NULL, -- References SERIAL status ID
  description TEXT,
  customer_note TEXT,
  production_note TEXT,
  shipping_note TEXT,
  nickname VARCHAR(255), -- Added field
  tags JSONB, -- Added field
  total_quantity INTEGER, -- Added field
  public_url TEXT, -- Added field
  workorder_url TEXT, -- Added field
  -- Existing fields below
  in_production_at TIMESTAMP,
  due_at TIMESTAMP,
  total DECIMAL(10, 2),
  subtotal DECIMAL(10, 2),
  tax DECIMAL(10, 2),
  shipping DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Line item groups table
CREATE TABLE IF NOT EXISTS line_item_groups (
  id SERIAL PRIMARY KEY, -- Keeping SERIAL for internal reference
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE, -- References UUID quote ID
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Line items table
CREATE TABLE IF NOT EXISTS line_items (
  id SERIAL PRIMARY KEY, -- Keeping SERIAL for internal reference
  quote_id UUID REFERENCES quotes(id) ON DELETE CASCADE, -- References UUID quote ID
  group_id INTEGER REFERENCES line_item_groups(id) ON DELETE SET NULL, -- References SERIAL group ID
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(100),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Item sizes table (for storing size breakdown)
CREATE TABLE IF NOT EXISTS item_sizes (
  id SERIAL PRIMARY KEY, -- Keeping SERIAL for internal reference
  line_item_id INTEGER REFERENCES line_items(id) ON DELETE CASCADE, -- References SERIAL line_item ID
  size VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL
);

-- Insert some initial data (only if statuses table is empty)
INSERT INTO statuses (name, color, type, description)
SELECT 'Draft', '#CCCCCC', 'quote', 'Initial quote draft' WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'Draft' AND type = 'quote')
UNION ALL
SELECT 'Sent', '#3498DB', 'quote', 'Quote sent to customer' WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'Sent' AND type = 'quote')
UNION ALL
SELECT 'Approved', '#2ECC71', 'quote', 'Quote approved by customer' WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'Approved' AND type = 'quote')
UNION ALL
SELECT 'Rejected', '#E74C3C', 'quote', 'Quote rejected by customer' WHERE NOT EXISTS (SELECT 1 FROM statuses WHERE name = 'Rejected' AND type = 'quote');

-- Agents table (for OpenAI Assistants) - Assuming this structure is correct as per previous state
CREATE TABLE IF NOT EXISTS public.agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    assistant_id TEXT UNIQUE,
    model TEXT,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    tools JSONB
);

COMMENT ON TABLE public.agents IS 'Stores configurations for OpenAI Assistants used by the application';
COMMENT ON COLUMN public.agents.id IS 'Unique identifier for the agent configuration';
COMMENT ON COLUMN public.agents.assistant_id IS 'OpenAI Assistant ID associated with this agent';
COMMENT ON COLUMN public.agents.tools IS 'JSONB array storing the tool definitions associated with the assistant';
