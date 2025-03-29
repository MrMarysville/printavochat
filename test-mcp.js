const fetch = require('node-fetch');

// Configuration
const MCP_SERVER_URL = 'http://localhost:3000/mcp';
const VISUAL_ID = '9435'; // Using the same visual ID from our previous tests

// Utility function for calling the MCP server
async function callMCP(tool, params = {}) {
  console.log(`🔍 Calling MCP tool: ${tool}`);
  console.log(`Parameters:`, params);
  
  try {
    const response = await fetch(MCP_SERVER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tool,
        params
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MCP server error (${response.status}): ${errorText}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Tool error: ${result.error}`);
    }
    
    return result.data;
  } catch (error) {
    console.error(`❌ Error calling MCP server: ${error.message}`);
    throw error;
  }
}

// Run the test
async function runTest() {
  console.log('🧪 Testing MCP Server Connection\n');
  
  try {
    // Test 1: Get order by visual ID
    console.log(`\n== Test 1: Get Order by Visual ID ${VISUAL_ID} ==`);
    
    const order = await callMCP('get_order_by_visual_id', {
      visual_id: VISUAL_ID
    });
    
    console.log('✅ Order found successfully!');
    console.log('📋 Order details:');
    console.log(`ID: ${order.id}`);
    console.log(`Visual ID: ${order.visualId}`);
    console.log(`Customer: ${order.customer?.companyName || 'Unknown'}`);
    console.log(`Status: ${order.status?.name || 'Unknown'}`);
    console.log(`Created: ${order.createdAt}`);
    
    if (order.lineItems && order.lineItems.length > 0) {
      console.log('\n📦 Line Items:');
      order.lineItems.forEach((item, i) => {
        console.log(`\nItem ${i + 1}:`);
        console.log(`  ID: ${item.id}`);
        console.log(`  Product: ${item.product || 'N/A'}`);
        console.log(`  Description: ${item.description || 'N/A'}`);
        console.log(`  Quantity: ${item.quantity || 0}`);
        console.log(`  Price: $${item.price || 0}`);
      });
    }
    
    console.log('\n🎯 Test completed successfully!');
  } catch (error) {
    console.error(`\n❌ Test failed: ${error.message}`);
  }
}

// Run the test
runTest(); 