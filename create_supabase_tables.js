/**
 * Create Tables in Supabase for Printavo Quote System
 * 
 * This script creates the necessary tables in Supabase to support the Printavo quote system.
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://bqruwlcgwzljlsjmpamv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnV3bGNnd3psamxzam1wYW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTM0MTAsImV4cCI6MjA1OTAyOTQxMH0.fB5Um6IoImy-sC1r61MbVR8yKQPgWg-k6w_JMwIU9Yo';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Read the SQL file
const sqlFile = fs.readFileSync('create_tables.sql', 'utf8');

// Split the SQL statements
const sqlStatements = sqlFile.split(';').filter(stmt => stmt.trim() !== '');

// Execute each SQL statement
async function executeSql() {
  try {
    console.log('Starting to create tables in Supabase...');
    
    for (let i = 0; i < sqlStatements.length; i++) {
      const stmt = sqlStatements[i];
      if (stmt.trim() === '') continue;
      
      console.log(`Executing statement ${i + 1}/${sqlStatements.length}`);
      console.log(stmt);
      
      const { data, error } = await supabase.rpc('exec_sql', { sql: stmt });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
      } else {
        console.log(`Statement ${i + 1} executed successfully:`, data);
      }
    }
    
    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
  }
}

// Run the function
executeSql(); 