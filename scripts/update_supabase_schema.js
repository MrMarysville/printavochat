/**
 * Update Supabase Schema Script
 * 
 * This script executes the SQL commands in update_supabase_schema.sql
 * to update the Supabase database schema for Printavo integration.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be defined in .env file');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Execute a SQL statement
 * 
 * @param {string} sql The SQL statement to execute
 * @param {string} description Description of the statement
 * @returns {Promise<boolean>} Success status
 */
async function executeSql(sql, description) {
  console.log(`Executing: ${description}`);
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error executing SQL (${description}):`, error);
      return false;
    }
    
    console.log(`Success: ${description}`);
    return true;
  } catch (error) {
    console.error(`Exception executing SQL (${description}):`, error);
    return false;
  }
}

/**
 * Split SQL file into statements and execute each one
 */
async function updateSchema() {
  const sqlFilePath = path.join(__dirname, 'update_supabase_schema.sql');
  
  // Check if the SQL file exists
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`Error: SQL file not found at ${sqlFilePath}`);
    process.exit(1);
  }
  
  // Read the SQL file
  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
  
  // Split into statements (excluding comments and whitespace)
  const statements = sqlContent
    .replace(/--.*$/gm, '') // Remove SQL comments
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);
  
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  // Execute each statement
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const description = `Statement ${i + 1}/${statements.length}`;
    
    const success = await executeSql(stmt, description);
    
    if (success) {
      successCount++;
    } else {
      failCount++;
    }
  }
  
  console.log('\nSchema update completed:');
  console.log(`- Successfully executed: ${successCount} statements`);
  console.log(`- Failed: ${failCount} statements`);
  
  if (failCount > 0) {
    console.log('\nSome statements failed. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('\nSchema update successful!');
  }
}

// Execute the update
updateSchema().catch(error => {
  console.error('Unhandled error during schema update:', error);
  process.exit(1);
}); 