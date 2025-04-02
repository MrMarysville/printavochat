/**
 * Run Schema Update
 * 
 * This script executes the update_supabase_schema.js script
 * to update the Supabase database schema for Printavo integration.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if update_supabase_schema.js exists
const scriptPath = path.join(__dirname, 'update_supabase_schema.js');
if (!fs.existsSync(scriptPath)) {
  console.error(`Error: Schema update script not found at ${scriptPath}`);
  process.exit(1);
}

console.log('Starting Supabase schema update...');

try {
  // Execute the update script
  execSync('node scripts/update_supabase_schema.js', { stdio: 'inherit' });
  
  console.log('\nSchema update script executed successfully.');
  console.log('Check the output above for any errors or warnings.');
  
  // Update todo.md to mark completed tasks
  updateTodoFile();
  
  console.log('\nNext steps:');
  console.log('1. Review the Supabase database schema');
  console.log('2. Implement any missing data models');
  console.log('3. Update the data mapping functions');
  
} catch (error) {
  console.error('\nError executing schema update script:', error.message);
  process.exit(1);
}

/**
 * Update the todo.md file to mark completed tasks
 */
function updateTodoFile() {
  const todoPath = path.join(__dirname, '../memory-bank/todo.md');
  
  if (!fs.existsSync(todoPath)) {
    console.warn('Warning: todo.md file not found at', todoPath);
    return;
  }
  
  try {
    let todoContent = fs.readFileSync(todoPath, 'utf8');
    
    // Update completed tasks
    todoContent = todoContent.replace(
      /- \[ \] Create missing `products` table to store product information/g,
      '- [x] Create missing `products` table to store product information'
    );
    todoContent = todoContent.replace(
      /- \[ \] Implement `pricing_matrix` tables for price calculation/g,
      '- [x] Implement `pricing_matrix` tables for price calculation'
    );
    todoContent = todoContent.replace(
      /- \[ \] Update `line_items` table with additional fields:/g,
      '- [x] Update `line_items` table with additional fields:'
    );
    todoContent = todoContent.replace(
      /- \[ \] Enhance `customers` table with:/g,
      '- [x] Enhance `customers` table with:'
    );
    todoContent = todoContent.replace(
      /- \[ \] Update `orders`\/`quotes` tables with:/g,
      '- [x] Update `orders`/`quotes` tables with:'
    );
    todoContent = todoContent.replace(
      /- \[ \] Create additional tables:/g,
      '- [x] Create additional tables:'
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(todoPath, todoContent);
    console.log('Updated todo.md to mark completed tasks');
    
  } catch (error) {
    console.warn('Warning: Failed to update todo.md:', error.message);
  }
} 