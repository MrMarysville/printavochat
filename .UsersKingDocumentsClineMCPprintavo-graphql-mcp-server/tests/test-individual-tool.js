/**
 * Individual Tool Tester for Printavo GraphQL MCP Server
 * 
 * This script allows testing a single tool with custom parameters.
 * Usage: node test-individual-tool.js [toolName] [paramsJson]
 * Example: node test-individual-tool.js get_customer {"id": "123456"}
 */

require('dotenv').config();
const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Update based on your server URL
const MCP_ENDPOINT = `${BASE_URL}/mcp`;

// Parse command line arguments
const toolName = process.argv[2];
let params = {};

if (process.argv[3]) {
  try {
    params = JSON.parse(process.argv[3]);
  } catch (error) {
    console.error(`❌ Error parsing parameters: ${error.message}`);
    console.error('Parameters must be valid JSON');
    process.exit(1);
  }
}

if (!toolName) {
  console.error('❌ No tool name provided');
  console.log('Usage: node test-individual-tool.js [toolName] [paramsJson]');
  console.log('Example: node test-individual-tool.js get_customer {"id": "123456"}');
  process.exit(1);
}

// Function to call an MCP tool
async function callTool(name, parameters) {
  try {
    console.log(`📡 Calling tool: ${name}`);
    console.log(`📋 Parameters: ${JSON.stringify(parameters, null, 2)}`);
    
    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: name,
        params: parameters,
      }),
    });

    const result = await response.json();
    
    if (result.error) {
      console.error(`❌ Tool execution failed: ${result.error}`);
      return { success: false, error: result.error, data: null };
    }
    
    console.log(`✅ Tool execution succeeded`);
    return { success: true, error: null, data: result.data };
  } catch (error) {
    console.error(`❌ Error calling tool: ${error.message}`);
    return { success: false, error: error.message, data: null };
  }
}

// Run the test
async function runTest() {
  console.log(`🧪 Testing tool: ${toolName}`);
  
  const result = await callTool(toolName, params);
  
  if (result.success) {
    console.log('\n📊 Result:');
    console.log(JSON.stringify(result.data, null, 2));
    console.log('\n✅ Test completed successfully');
  } else {
    console.error('\n❌ Test failed');
    process.exit(1);
  }
}

runTest(); 