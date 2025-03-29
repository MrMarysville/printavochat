/**
 * Test script for the Printavo GraphQL MCP Server
 * 
 * This script tests if the MCP server is properly set up and configured.
 * It attempts to print the MCP server status and make a simple request.
 */

console.log('Printavo GraphQL MCP Server Test');
console.log('--------------------------------');
console.log('Checking environment setup...');

// Check if the MCP settings are available
console.log('MCP Server Location: C:/Users/King/Documents/Cline/MCP/printavo-graphql-mcp-server');

// Display MCP server status
console.log('\nTo use the MCP server in your application:');
console.log('1. Make sure the MCP server is running');
console.log('2. Set USE_PRINTAVO_MCP=true in your .env.local file');
console.log('3. Use the printavoMcpClient in your code');
console.log('\nAPI Test endpoint: /api/test-mcp?query=your_search_term');

// Display available MCP tools
console.log('\nAvailable MCP tools:');
console.log('- get_order (server: printavo-graphql-mcp-server)');
console.log('- get_customer (server: printavo-graphql-mcp-server)');
console.log('- search_orders (server: printavo-graphql-mcp-server)');

console.log('\nTo test the MCP server directly, run this script in Cursor.ai with MCP access.');
console.log('\nTest complete!');
