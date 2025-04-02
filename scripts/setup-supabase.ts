import { supabase } from '../lib/supabase-client';
import { logger } from '../lib/logger';

/**
 * This script sets up the required Supabase schema for the application.
 * It creates the agents table if it doesn't exist and ensures the schema is correct.
 */
async function setupSupabase() {
  logger.info('Setting up Supabase schema...');
  
  try {
    // Check if the agents table exists
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'agents');
    
    if (tableError) {
      logger.error('Error checking for agents table:', tableError);
      process.exit(1);
    }
    
    if (!tables || tables.length === 0) {
      logger.info('Agents table not found, creating it...');
      
      // Create the agents table
      const createTableSQL = `
        CREATE TABLE agents (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name TEXT NOT NULL,
          assistant_id TEXT NOT NULL,
          model TEXT NOT NULL,
          instructions TEXT NOT NULL,
          tools JSONB,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE UNIQUE INDEX idx_agents_name ON agents(name) WHERE is_active = TRUE;
        CREATE UNIQUE INDEX idx_agents_assistant_id ON agents(assistant_id);
      `;
      
      const { error: createError } = await supabase.rpc('execute_sql', { 
        sql: createTableSQL 
      });
      
      if (createError) {
        logger.error('Error creating agents table:', createError);
        
        // If rpc method isn't available, instruct the user to run the SQL manually
        logger.warn('If your Supabase instance doesn\'t allow RPC calls, please run this SQL manually in the Supabase dashboard:');
        logger.warn(createTableSQL);
        
        process.exit(1);
      }
      
      logger.info('Successfully created agents table');
    } else {
      logger.info('Agents table already exists, checking schema...');
      
      // Check schema to ensure all required columns exist
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'agents');
      
      if (columnsError) {
        logger.error('Error checking agents table schema:', columnsError);
        process.exit(1);
      }
      
      // Required columns with their data types
      const requiredColumns = [
        { name: 'id', type: 'uuid' },
        { name: 'name', type: 'text' },
        { name: 'assistant_id', type: 'text' },
        { name: 'model', type: 'text' },
        { name: 'instructions', type: 'text' },
        { name: 'tools', type: 'jsonb' },
        { name: 'is_active', type: 'boolean' },
        { name: 'created_at', type: 'timestamp with time zone' },
        { name: 'updated_at', type: 'timestamp with time zone' }
      ];
      
      // Convert columns to a Map for easy lookup
      const columnMap = new Map();
      columns?.forEach(col => {
        columnMap.set(col.column_name, col.data_type);
      });
      
      // Check if any required columns are missing
      const missingColumns = requiredColumns.filter(col => 
        !columnMap.has(col.name) || 
        !columnMap.get(col.name).includes(col.type)
      );
      
      if (missingColumns.length > 0) {
        logger.warn('Missing or incorrect columns in agents table:');
        missingColumns.forEach(col => {
          logger.warn(`- ${col.name} (${col.type})`);
        });
        
        logger.warn('Please add these columns manually or recreate the agents table.');
      } else {
        logger.info('Agents table schema is correct');
      }
    }
    
    logger.info('Supabase schema setup complete');
    return true;
  } catch (error) {
    logger.error('Error setting up Supabase schema:', error);
    return false;
  }
}

// Run the setup if executed directly
if (require.main === module) {
  setupSupabase()
    .then(success => {
      if (success) {
        logger.info('Supabase setup completed successfully');
        process.exit(0);
      } else {
        logger.error('Supabase setup failed');
        process.exit(1);
      }
    })
    .catch(error => {
      logger.error('Unhandled error during Supabase setup:', error);
      process.exit(1);
    });
}

export default setupSupabase; 