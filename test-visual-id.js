/**
 * Test script to look up a Printavo order by visual ID
 */

const fetch = require('node-fetch');

// Configuration
const API_URL = 'http://localhost:3000/mcp';
const VISUAL_ID = '9435';

async function testGetOrderByVisualId() {
  console.log(`🔍 Testing get_order_by_visual_id for visual ID: ${VISUAL_ID}`);
  
  try {
    // Call the MCP server
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        tool: 'get_order_by_visual_id',
        params: {
          visual_id: VISUAL_ID
        }
      })
    });
    
    // Parse the response
    const result = await response.json();
    
    if (!result.success) {
      console.error(`❌ Error: ${result.error}`);
      return;
    }
    
    // Display the order details
    const order = result.data;
    console.log('\n✅ Order found successfully!');
    console.log('📋 Order details:');
    console.log(`ID: ${order.id}`);
    console.log(`Visual ID: ${order.visualId}`);
    console.log(`Customer: ${order.customer?.companyName || 'Unknown'}`);
    console.log(`Status: ${order.status?.name || 'Unknown'}`);
    console.log(`Created: ${order.createdAt}`);
    
    // Display line items if available
    if (order.lineItems && order.lineItems.length > 0) {
      console.log('\n📦 Line Items:');
      order.lineItems.forEach((item, i) => {
        console.log(`\nItem ${i + 1}:`);
        console.log(`  Product: ${item.product || 'N/A'}`);
        console.log(`  Description: ${item.description || 'N/A'}`);
        console.log(`  Quantity: ${item.quantity || 0}`);
        console.log(`  Price: $${item.price || 0}`);
      });
    }
    
    return order;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    
    // Provide a helpful message for common errors
    if (error.message.includes('ECONNREFUSED')) {
      console.error('Make sure the MCP server is running on http://localhost:3000');
    } else if (error.message.includes('Unexpected token')) {
      console.error('The MCP server returned an unexpected response format');
    }
  }
}

// Run the test
testGetOrderByVisualId(); 