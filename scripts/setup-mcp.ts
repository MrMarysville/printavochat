/**
 * MCP Server Setup Script
 * 
 * This script sets up MCP servers for a project.
 * It can be customized for different projects.
 */

import mcpConfig from '../lib/mcp-config';
import path from 'path';
import fs from 'fs';

// Define the MCP servers to configure
const servers = {
  // Supabase MCP Server
  supabase: mcpConfig.standardConfigs.supabase(
    // Replace with your Supabase connection string
    'postgresql://postgres:UIu9r8CH@db.bqruwlcgwzljlsjmpamv.supabase.co:5432/postgres'
  ),
  
  // Example: SanMar MCP Server (if available in this project)
  // sanmar: mcpConfig.standardConfigs.node(
  //   path.join(__dirname, '../sanmar-mcp-server/index.js')
  // ),
  
  // Example: Printavo GraphQL MCP Server (if available in this project)
  // printavo: mcpConfig.standardConfigs.node(
  //   path.join(__dirname, '../printavo-graphql-mcp-server/index.js')
  // ),
  
  // Example: File MCP Server (if needed)
  // file: mcpConfig.standardConfigs.file('.')
};

// Ensure the lib directory with client exists
function ensureClientLibrary() {
  // Paths to the source and destination files
  const sourceFiles = [
    { 
      src: path.join(__dirname, '../lib/universal-mcp-client.ts'),
      dest: 'lib/universal-mcp-client.ts'
    },
    {
      src: path.join(__dirname, '../types/global.d.ts'),
      dest: 'types/global.d.ts'
    }
  ];
  
  for (const file of sourceFiles) {
    const destPath = path.join(process.cwd(), file.dest);
    const destDir = path.dirname(destPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    // Copy the file
    if (fs.existsSync(file.src)) {
      fs.copyFileSync(file.src, destPath);
      console.log(`Copied ${file.dest}`);
    } else {
      console.error(`Source file not found: ${file.src}`);
    }
  }
}

// Update tsconfig.json to include the types
function updateTsConfig() {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  
  if (!fs.existsSync(tsConfigPath)) {
    console.log('tsconfig.json not found - skipping update');
    return;
  }
  
  try {
    const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
    
    // Ensure include array exists
    if (!tsConfig.include) {
      tsConfig.include = [];
    }
    
    // Add types/global.d.ts if not already included
    if (!tsConfig.include.includes('types/global.d.ts')) {
      tsConfig.include.push('types/global.d.ts');
      
      // Write updated config
      fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
      console.log('Updated tsconfig.json to include types/global.d.ts');
    } else {
      console.log('tsconfig.json already includes types/global.d.ts');
    }
  } catch (error) {
    console.error('Error updating tsconfig.json:', error);
  }
}

// Create example usage
function createExample() {
  const exampleDir = path.join(process.cwd(), 'examples');
  
  if (!fs.existsSync(exampleDir)) {
    fs.mkdirSync(exampleDir, { recursive: true });
  }
  
  const examplePath = path.join(exampleDir, 'mcp-usage-example.ts');
  
  const exampleContent = `/**
 * Example usage of the Universal MCP client
 */

import mcpClient from '../lib/universal-mcp-client';

// Example: Using Supabase MCP
async function exampleSupabase() {
  try {
    // Query the database
    const result = await mcpClient.mcp_supabase_query({
      sql: 'SELECT * FROM users LIMIT 5'
    });
    
    console.log('Supabase query results:', result.rows);
  } catch (error) {
    console.error('Supabase query error:', error);
  }
}

// Example: Using any MCP function dynamically
async function exampleDynamicUsage(server: string, functionName: string, params: any) {
  try {
    // Format: mcp_[server]_[functionName]
    const fullFunctionName = \`mcp_\${server}_\${functionName}\`;
    
    // Call the function via the proxy
    const result = await (mcpClient as any)[fullFunctionName](params);
    return result;
  } catch (error) {
    console.error(\`Error calling \${server} MCP function:, error);
    throw error;
  }
}

// Run the examples
async function runExamples() {
  console.log('Running Universal MCP examples...');
  
  // Supabase example
  await exampleSupabase();
  
  // You can add more examples for other MCP servers here
}

// Only run if this file is executed directly
if (require.main === module) {
  runExamples().catch(console.error);
}

export { exampleSupabase, exampleDynamicUsage, runExamples };
`;

  fs.writeFileSync(examplePath, exampleContent);
  console.log('Created example file at examples/mcp-usage-example.ts');
}

// Set up the MCP servers
async function setupMcp() {
  console.log('Setting up MCP servers...');
  
  try {
    // Write the MCP configuration
    mcpConfig.setupMcpServers(servers);
    
    // Ensure the client library is available
    ensureClientLibrary();
    
    // Update TypeScript configuration
    updateTsConfig();
    
    // Create usage example
    createExample();
    
    console.log('\nMCP setup completed successfully!');
    console.log('\nTo use in your code:');
    console.log('  import mcpClient from \'../lib/universal-mcp-client\';');
    console.log('  const result = await mcpClient.mcp_supabase_query({ sql: \'SELECT * FROM users\' });');
  } catch (error) {
    console.error('Error setting up MCP:', error);
  }
}

// Run the setup
if (require.main === module) {
  setupMcp().catch(console.error);
}

export default setupMcp; 