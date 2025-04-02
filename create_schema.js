/**
 * Create Schema in Supabase for Printavo Quote System
 * 
 * This script sets up the schema for the Printavo quote system tables.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://bqruwlcgwzljlsjmpamv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnV3bGNnd3psamxzam1wYW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTM0MTAsImV4cCI6MjA1OTAyOTQxMH0.fB5Um6IoImy-sC1r61MbVR8yKQPgWg-k6w_JMwIU9Yo';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create Schema and Tables
async function createSchema() {
  try {
    console.log('Starting to create schema in Supabase...');

    // Create printavo schema
    const createSchema = `
      CREATE SCHEMA IF NOT EXISTS printavo;
    `;
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: createSchema
    });

    if (error) {
      console.error('Error creating schema:', error);
    } else {
      console.log('Schema created successfully!');
      
      // Create function to execute any SQL
      const createFunction = `
        CREATE OR REPLACE FUNCTION printavo.exec_sql(sql text)
        RETURNS json
        LANGUAGE plpgsql
        SECURITY DEFINER SET search_path = public
        AS $$
        BEGIN
          EXECUTE sql;
          RETURN '{"status": "success"}'::json;
        EXCEPTION
          WHEN OTHERS THEN
            RETURN json_build_object(
              'status', 'error',
              'message', SQLERRM,
              'detail', SQLSTATE
            );
        END;
        $$;
        
        -- Grant access to authenticated users
        GRANT EXECUTE ON FUNCTION printavo.exec_sql TO authenticated;
        GRANT EXECUTE ON FUNCTION printavo.exec_sql TO anon;
      `;
      
      const { data: funcData, error: funcError } = await supabase.rpc('exec_sql', { 
        sql: createFunction 
      });
      
      if (funcError) {
        console.error('Error creating SQL execution function:', funcError);
      } else {
        console.log('SQL execution function created successfully!');
      }
    }
    
    console.log('Schema creation completed!');
  } catch (error) {
    console.error('Error creating schema:', error);
  }
}

// Run the function
createSchema(); 