/**
 * Check existing tables in Supabase
 * 
 * This script lists the existing tables in Supabase and their structure.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://bqruwlcgwzljlsjmpamv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnV3bGNnd3psamxzam1wYW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTM0MTAsImV4cCI6MjA1OTAyOTQxMH0.fB5Um6IoImy-sC1r61MbVR8yKQPgWg-k6w_JMwIU9Yo';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// List all existing tables
async function listTables() {
  try {
    console.log('Checking existing tables in Supabase...');
    
    // Check the customers table
    console.log('\nChecking customers table:');
    const { data: customersData, error: customersError } = await supabase
      .from('customers')
      .select('*')
      .limit(10);
    
    if (customersError) {
      console.error('Error accessing customers table:', customersError);
    } else {
      console.log('Customers table exists with structure:');
      if (customersData && customersData.length > 0) {
        console.log('Sample data:', customersData[0]);
        console.log('Column names:', Object.keys(customersData[0]));
      } else {
        console.log('No data in customers table.');
      }
    }
    
    // Check the contacts table
    console.log('\nChecking contacts table:');
    const { data: contactsData, error: contactsError } = await supabase
      .from('contacts')
      .select('*')
      .limit(10);
    
    if (contactsError) {
      console.error('Error accessing contacts table:', contactsError);
    } else {
      console.log('Contacts table exists with structure:');
      if (contactsData && contactsData.length > 0) {
        console.log('Sample data:', contactsData[0]);
        console.log('Column names:', Object.keys(contactsData[0]));
      } else {
        console.log('No data in contacts table.');
      }
    }
    
    // Check the statuses table
    console.log('\nChecking statuses table:');
    const { data: statusesData, error: statusesError } = await supabase
      .from('statuses')
      .select('*')
      .limit(10);
    
    if (statusesError) {
      console.error('Error accessing statuses table:', statusesError);
    } else {
      console.log('Statuses table exists with structure:');
      if (statusesData && statusesData.length > 0) {
        console.log('Sample data:', statusesData[0]);
        console.log('Column names:', Object.keys(statusesData[0]));
      } else {
        console.log('No data in statuses table.');
      }
    }
    
    // Check the quotes table
    console.log('\nChecking quotes table:');
    const { data: quotesData, error: quotesError } = await supabase
      .from('quotes')
      .select('*')
      .limit(10);
    
    if (quotesError) {
      console.error('Error accessing quotes table:', quotesError);
    } else {
      console.log('Quotes table exists with structure:');
      if (quotesData && quotesData.length > 0) {
        console.log('Sample data:', quotesData[0]);
        console.log('Column names:', Object.keys(quotesData[0]));
      } else {
        console.log('No data in quotes table.');
      }
    }
    
    // Check for meta_tables table
    console.log('\nChecking meta_tables:');
    const { data: metaData, error: metaError } = await supabase
      .from('meta_tables')
      .select('*')
      .limit(10);
    
    if (metaError) {
      console.error('Error accessing meta_tables:', metaError);
    } else {
      console.log('Meta_tables exists with structure:');
      if (metaData && metaData.length > 0) {
        console.log('Sample data:', metaData[0]);
        console.log('Column names:', Object.keys(metaData[0]));
      } else {
        console.log('No data in meta_tables.');
      }
    }
    
    // List all available tables in Supabase
    console.log('\nTrying to list all tables in Supabase:');
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_schema')
      .eq('table_schema', 'public')
      .order('table_name', { ascending: true });
    
    if (tablesError) {
      console.error('Error accessing information_schema:', tablesError);
    } else {
      console.log('Available tables:', tablesData);
    }
    
    console.log('\nCheck completed!');
  } catch (error) {
    console.error('Error checking tables:', error);
  }
}

// Run the function
listTables(); 