/**
 * Check Quotes Table Structure
 * 
 * This script checks the structure of the quotes table in Supabase.
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = 'https://bqruwlcgwzljlsjmpamv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcnV3bGNnd3psamxzam1wYW12Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NTM0MTAsImV4cCI6MjA1OTAyOTQxMH0.fB5Um6IoImy-sC1r61MbVR8yKQPgWg-k6w_JMwIU9Yo';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check quotes table structure
async function checkQuotesTable() {
  try {
    console.log('Checking quotes table structure...');
    
    // Create a test quote with minimal fields to see which ones are accepted
    const testQuote = {
      name: 'Test Quote',
      customer_id: null,
      total: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Attempting to create a test quote with fields:', Object.keys(testQuote));
    
    const { data, error } = await supabase
      .from('quotes')
      .insert([testQuote])
      .select();
    
    if (error) {
      console.error('Error creating test quote:', error);
    } else {
      console.log('Test quote created successfully!');
      console.log('Quote structure:', data[0]);
      console.log('Available columns:', Object.keys(data[0]));
    }
    
    // Get all quotes
    console.log('\nGetting all quotes:');
    
    const { data: allQuotes, error: fetchError } = await supabase
      .from('quotes')
      .select('*');
    
    if (fetchError) {
      console.error('Error fetching quotes:', fetchError);
    } else {
      console.log(`Found ${allQuotes.length} quotes in the database.`);
      if (allQuotes.length > 0) {
        console.log('First quote:', allQuotes[0]);
      }
    }
  } catch (error) {
    console.error('Error checking quotes table:', error);
  }
}

// Run the function
checkQuotesTable(); 