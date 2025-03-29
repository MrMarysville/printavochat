/**
 * Test script for Printavo MCP Server using real data
 * This script calls the running MCP server to test SanMar integration
 */

const fetch = require('node-fetch');

// Configuration
const MCP_SERVER_URL = 'http://localhost:3000/mcp';
const VISUAL_ID = '9435';
const SANMAR_STYLE = 'PC61';

// Utility function for calling the MCP server
async function callMCP(tool, params = {}) {
  console.log(`🔍 Calling MCP tool: ${tool}`);
  console.log(`Parameters: ${JSON.stringify(params, null, 2)}`);
  
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

// Test 1: Get order by visual ID
async function testGetOrderByVisualId() {
  console.log(`\n== Test 1: Get Order by Visual ID ${VISUAL_ID} ==`);
  
  try {
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
    
    return order;
  } catch (error) {
    console.error(`❌ Error getting order: ${error.message}`);
    return null;
  }
}

// Test 2: Create quote with SanMar products
async function testCreateQuoteWithSanMar() {
  console.log(`\n== Test 2: Create Quote with SanMar Products ==`);
  
  try {
    // Get a customer ID from the system
    const customers = await callMCP('list_customers', {
      per_page: 1
    });
    
    if (!customers || !customers.length) {
      throw new Error('No customers found in the system');
    }
    
    const customerId = customers[0].id;
    console.log(`Using customer ID: ${customerId}`);
    
    // Get a contact ID for this customer
    const contacts = await callMCP('list_contacts', {
      customer_id: customerId,
      per_page: 1
    });
    
    let contactId = null;
    if (contacts && contacts.length > 0) {
      contactId = contacts[0].id;
      console.log(`Using contact ID: ${contactId}`);
    }
    
    // Create the quote with SanMar products
    const quoteResult = await callMCP('create_quote_with_sanmar_products', {
      customer_id: customerId,
      contact_id: contactId,
      sanmar_items: [
        {
          styleNumber: SANMAR_STYLE,
          color: 'Athletic Heather',
          sizes: { 'S': 5, 'M': 10, 'L': 5 },
          checkInventory: true,
          description: 'Front logo, left chest - REAL TEST',
          price: 15.99
        }
      ],
      settings: {
        customerNote: 'SanMar PC61 test order - Real MCP Test',
        productionNote: 'Rush order - 5 day turnaround'
      }
    });
    
    console.log('✅ Quote created successfully!');
    console.log('📋 Quote details:');
    console.log(`ID: ${quoteResult.quote.id}`);
    console.log(`Customer ID: ${quoteResult.quote.customerId}`);
    
    console.log('\n📦 Line Items:');
    quoteResult.lineItems.forEach((item, i) => {
      console.log(`\nItem ${i + 1}:`);
      console.log(`  ID: ${item.id}`);
      console.log(`  Product: ${item.product}`);
      console.log(`  Description: ${item.description}`);
      console.log(`  Color: ${item.color}`);
      console.log(`  Sizes: ${item.sizes.join(', ')}`);
      console.log(`  Quantity: ${item.quantity}`);
      console.log(`  Price: $${item.price}`);
    });
    
    if (quoteResult.inventoryWarnings && quoteResult.inventoryWarnings.length > 0) {
      console.log('\n⚠️ Inventory Warnings:');
      quoteResult.inventoryWarnings.forEach((warning, i) => {
        console.log(`${i + 1}. ${warning.message}`);
      });
    } else {
      console.log('\n✅ No inventory warnings');
    }
    
    return quoteResult;
  } catch (error) {
    console.error(`❌ Error creating quote: ${error.message}`);
    return null;
  }
}

// Test 3: Update line item sizes
async function testUpdateLineItemSizes(lineItemId) {
  console.log(`\n== Test 3: Update Line Item Sizes ==`);
  
  if (!lineItemId) {
    console.error('❌ No line item ID available - cannot update sizes');
    return null;
  }
  
  try {
    const newSizes = { 'S': 10, 'M': 15, 'L': 10, 'XL': 5 };
    
    console.log(`Updating line item ${lineItemId} with sizes:`, newSizes);
    
    const updatedLineItem = await callMCP('update_line_item_sizes', {
      line_item_id: lineItemId,
      sizes: newSizes
    });
    
    console.log('✅ Line item updated successfully!');
    console.log('📋 Updated Line Item:');
    console.log(`ID: ${updatedLineItem.lineItem.id}`);
    console.log(`Sizes: ${updatedLineItem.lineItem.sizes.join(', ')}`);
    console.log(`Message: ${updatedLineItem.message}`);
    
    return updatedLineItem;
  } catch (error) {
    console.error(`❌ Error updating line item sizes: ${error.message}`);
    return null;
  }
}

// Run all tests in sequence
async function runAllTests() {
  console.log('🧪 Running Real MCP Server Tests for Printavo-SanMar Integration\n');
  
  try {
    // Test 1: Get order by visual ID
    await testGetOrderByVisualId();
    
    // Test 2: Create quote with SanMar products
    const quoteResult = await testCreateQuoteWithSanMar();
    
    // Test 3: Update line item sizes (if we have a line item from the quote)
    if (quoteResult && quoteResult.lineItems && quoteResult.lineItems.length > 0) {
      const lineItemId = quoteResult.lineItems[0].id;
      await testUpdateLineItemSizes(lineItemId);
    }
    
    console.log('\n🎯 All MCP server tests completed!');
  } catch (error) {
    console.error(`\n❌ Test suite failed: ${error.message}`);
  }
}

// Run the tests
runAllTests(); 