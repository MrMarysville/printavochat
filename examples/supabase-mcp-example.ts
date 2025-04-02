/**
 * Example usage of the Supabase MCP client
 * 
 * This file demonstrates how to use the Supabase MCP globally in your project.
 */

import supabaseMcp from '../lib/supabase-mcp-client';

// Example 1: Using the imported client
async function exampleWithImport() {
  try {
    // Fetch customers from the database using the client
    const customers = await supabaseMcp.fetchRecords('customers', '*', 'created_at > NOW() - INTERVAL \'7 days\'', 10);
    console.log('Recent customers:', customers);
    
    // Get a specific record by ID
    const quote = await supabaseMcp.getRecordById('quotes', 'some-uuid-here');
    console.log('Quote details:', quote);
    
    // Execute a custom query
    const result = await supabaseMcp.executeSqlQuery(`
      SELECT c.company_name, COUNT(q.id) as quote_count
      FROM customers c
      LEFT JOIN quotes q ON c.id = q.customer_id
      GROUP BY c.id, c.company_name
      ORDER BY quote_count DESC
      LIMIT 5
    `);
    console.log('Top customers by quotes:', result.rows);
  } catch (error) {
    console.error('Error in example with import:', error);
  }
}

// Example 2: Using the global MCP function directly
async function exampleWithGlobalMcp() {
  try {
    // Execute a query directly using the global MCP function
    const result = await mcp_supabase_query({
      sql: 'SELECT * FROM orders WHERE created_at > NOW() - INTERVAL \'30 days\' ORDER BY created_at DESC'
    });
    
    console.log('Recent orders:', result.rows);
    console.log('Order count:', result.rowCount);
  } catch (error) {
    console.error('Error in example with global MCP:', error);
  }
}

// Run the examples
async function runExamples() {
  console.log('Running Supabase MCP examples...');
  
  // Example with the imported client
  console.log('\n=== Example with imported client ===');
  await exampleWithImport();
  
  // Example with global MCP function
  console.log('\n=== Example with global MCP function ===');
  await exampleWithGlobalMcp();
  
  console.log('\nExamples completed!');
}

// Only run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export { exampleWithImport, exampleWithGlobalMcp, runExamples }; 