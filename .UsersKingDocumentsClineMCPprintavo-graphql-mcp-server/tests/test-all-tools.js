/**
 * Comprehensive Test Suite for Printavo GraphQL MCP Server
 * 
 * This script tests all the tools provided by the MCP server to ensure they 
 * function as expected. Tests are organized by category and include both
 * success and error cases.
 */

require('dotenv').config();
const fetch = require('node-fetch');

// Configuration
const BASE_URL = 'http://localhost:3000'; // Update this based on your server URL
const MCP_ENDPOINT = `${BASE_URL}/mcp`;
const PRINTAVO_EMAIL = process.env.PRINTAVO_EMAIL || 'sales@kingclothing.com';
const PRINTAVO_TOKEN = process.env.PRINTAVO_TOKEN || 'rEPQzTtowT_MQVbY1tfLtg';

// Storage for test entities
const testEntities = {
  customerId: null,
  contactId: null,
  orderId: null,
  quoteId: null,
  invoiceId: null,
  lineItemId: null,
  lineItemGroupId: null,
  statusId: null,
};

// Utility function for calling MCP tools
async function callTool(toolName, params = {}) {
  try {
    console.log(`📡 Calling tool: ${toolName}`);
    const response = await fetch(MCP_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tool: toolName,
        params,
      }),
    });

    const result = await response.json();
    
    if (result.error) {
      console.error(`❌ Tool ${toolName} failed: ${result.error}`);
      return { success: false, error: result.error, data: null };
    }
    
    console.log(`✅ Tool ${toolName} succeeded`);
    return { success: true, error: null, data: result.data };
  } catch (error) {
    console.error(`❌ Error calling tool ${toolName}: ${error.message}`);
    return { success: false, error: error.message, data: null };
  }
}

// Utility function for assertions
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    throw new Error(message);
  } else {
    console.log(`✅ Assertion passed: ${message}`);
  }
}

// Test functions for each category
async function testBasicConnectivity() {
  console.log('\n🔍 Testing Basic Connectivity');
  
  // Test get_account
  const accountResult = await callTool('get_account');
  assert(accountResult.success, 'get_account should succeed');
  assert(accountResult.data && accountResult.data.id, 'Account should have an ID');
  
  // Test get_current_user
  const userResult = await callTool('get_current_user');
  assert(userResult.success, 'get_current_user should succeed');
  assert(userResult.data && userResult.data.email, 'User should have an email');
  
  console.log('✅ Basic connectivity tests passed');
}

async function testReadOperations() {
  console.log('\n🔍 Testing Read Operations');
  
  // Test list_customers
  const customersResult = await callTool('list_customers', { first: 5 });
  assert(customersResult.success, 'list_customers should succeed');
  assert(Array.isArray(customersResult.data), 'Customers result should be an array');
  
  if (customersResult.data && customersResult.data.length > 0) {
    // Store a customer ID for later tests
    testEntities.customerId = customersResult.data[0].id;
    console.log(`📝 Using customer ID: ${testEntities.customerId}`);
    
    // Test get_customer
    const customerResult = await callTool('get_customer', { id: testEntities.customerId });
    assert(customerResult.success, 'get_customer should succeed');
    assert(customerResult.data.id === testEntities.customerId, 'Customer ID should match');
  }
  
  // Test list_contacts if we have a customer
  if (testEntities.customerId) {
    const contactsResult = await callTool('list_contacts', { first: 5 });
    
    if (contactsResult.success && contactsResult.data && contactsResult.data.length > 0) {
      // Find a contact that belongs to our test customer
      const contact = contactsResult.data.find(c => c.customer && c.customer.id === testEntities.customerId);
      
      if (contact) {
        testEntities.contactId = contact.id;
        console.log(`📝 Using contact ID: ${testEntities.contactId}`);
        
        // Test get_contact
        const contactResult = await callTool('get_contact', { id: testEntities.contactId });
        assert(contactResult.success, 'get_contact should succeed');
        assert(contactResult.data.id === testEntities.contactId, 'Contact ID should match');
      }
    }
  }
  
  // Test list_orders
  const ordersResult = await callTool('list_orders', { first: 5 });
  assert(ordersResult.success, 'list_orders should succeed');
  assert(Array.isArray(ordersResult.data), 'Orders result should be an array');
  
  if (ordersResult.data && ordersResult.data.length > 0) {
    // Store an order ID for later tests
    testEntities.orderId = ordersResult.data[0].id;
    console.log(`📝 Using order ID: ${testEntities.orderId}`);
    
    // Get visual ID for testing
    testEntities.visualId = ordersResult.data[0].visualId;
    
    // Test get_order
    const orderResult = await callTool('get_order', { id: testEntities.orderId });
    assert(orderResult.success, 'get_order should succeed');
    assert(orderResult.data.id === testEntities.orderId, 'Order ID should match');
    
    // Test get_order_by_visual_id if we have a visual ID
    if (testEntities.visualId) {
      const visualIdResult = await callTool('get_order_by_visual_id', { visual_id: testEntities.visualId });
      assert(visualIdResult.success, 'get_order_by_visual_id should succeed');
      assert(visualIdResult.data.visualId === testEntities.visualId, 'Visual ID should match');
    }
    
    // If the order has line items, test them
    if (orderResult.data.lineItems && orderResult.data.lineItems.length > 0) {
      testEntities.lineItemId = orderResult.data.lineItems[0].id;
      console.log(`📝 Using line item ID: ${testEntities.lineItemId}`);
      
      // Test get_line_item
      const lineItemResult = await callTool('get_line_item', { id: testEntities.lineItemId });
      assert(lineItemResult.success, 'get_line_item should succeed');
      assert(lineItemResult.data.id === testEntities.lineItemId, 'Line item ID should match');
    }
    
    // If the order has line item groups, test them
    if (orderResult.data.lineItemGroups && orderResult.data.lineItemGroups.length > 0) {
      testEntities.lineItemGroupId = orderResult.data.lineItemGroups[0].id;
      console.log(`📝 Using line item group ID: ${testEntities.lineItemGroupId}`);
      
      // Test get_line_item_group
      const lineItemGroupResult = await callTool('get_line_item_group', { id: testEntities.lineItemGroupId });
      assert(lineItemGroupResult.success, 'get_line_item_group should succeed');
      assert(lineItemGroupResult.data.id === testEntities.lineItemGroupId, 'Line item group ID should match');
    }
  }
  
  // Test list_statuses
  const statusesResult = await callTool('list_statuses', { first: 5 });
  assert(statusesResult.success, 'list_statuses should succeed');
  assert(Array.isArray(statusesResult.data), 'Statuses result should be an array');
  
  if (statusesResult.data && statusesResult.data.length > 0) {
    // Store a status ID for later tests
    testEntities.statusId = statusesResult.data[0].id;
    console.log(`📝 Using status ID: ${testEntities.statusId}`);
    
    // Test get_status
    const statusResult = await callTool('get_status', { id: testEntities.statusId });
    assert(statusResult.success, 'get_status should succeed');
    assert(statusResult.data.id === testEntities.statusId, 'Status ID should match');
  }
  
  // Test search_orders
  if (testEntities.visualId) {
    const searchResult = await callTool('search_orders', { 
      query: testEntities.visualId, 
      first: 5 
    });
    assert(searchResult.success, 'search_orders should succeed');
    assert(Array.isArray(searchResult.data), 'Search result should be an array');
  }
  
  console.log('✅ Read operations tests passed');
}

async function testWriteOperations() {
  console.log('\n🔍 Testing Write Operations');
  
  // Skip write tests if we don't have the necessary IDs
  if (!testEntities.customerId || !testEntities.contactId || !testEntities.statusId) {
    console.log('⚠️ Skipping write operations tests due to missing test entities');
    return;
  }
  
  // Test quote_create
  const quoteInput = {
    customerId: testEntities.customerId,
    contactId: testEntities.contactId,
    customerNote: 'Test quote created by MCP test script',
    statusId: testEntities.statusId
  };
  
  const quoteResult = await callTool('quote_create', { input: quoteInput });
  assert(quoteResult.success, 'quote_create should succeed');
  assert(quoteResult.data && quoteResult.data.id, 'Quote should have an ID');
  
  testEntities.quoteId = quoteResult.data.id;
  console.log(`📝 Created test quote ID: ${testEntities.quoteId}`);
  
  // Get line item groups from the quote
  if (quoteResult.data.lineItemGroups && quoteResult.data.lineItemGroups.length > 0) {
    testEntities.quoteLineItemGroupId = quoteResult.data.lineItemGroups[0].id;
    
    // Test line_item_create
    const lineItemInput = {
      product: 'Test Product',
      color: 'Blue',
      description: 'Test line item created by MCP test script',
      sizes: ['S(5)', 'M(10)', 'L(5)'],
      price: 19.99,
      taxed: true
    };
    
    const lineItemResult = await callTool('line_item_create', {
      line_item_group_id: testEntities.quoteLineItemGroupId,
      input: lineItemInput
    });
    
    assert(lineItemResult.success, 'line_item_create should succeed');
    assert(lineItemResult.data && lineItemResult.data.id, 'Line item should have an ID');
    
    testEntities.testLineItemId = lineItemResult.data.id;
    console.log(`📝 Created test line item ID: ${testEntities.testLineItemId}`);
    
    // Test line_item_update
    const lineItemUpdateInput = {
      description: 'Updated test line item',
      sizes: ['S(10)', 'M(15)', 'L(10)']
    };
    
    const lineItemUpdateResult = await callTool('line_item_update', {
      id: testEntities.testLineItemId,
      input: lineItemUpdateInput
    });
    
    assert(lineItemUpdateResult.success, 'line_item_update should succeed');
    assert(lineItemUpdateResult.data.description === lineItemUpdateInput.description, 
           'Line item description should be updated');
  }
  
  // Test quote_update
  const quoteUpdateInput = {
    customerNote: 'Updated test quote'
  };
  
  const quoteUpdateResult = await callTool('quote_update', {
    id: testEntities.quoteId,
    input: quoteUpdateInput
  });
  
  assert(quoteUpdateResult.success, 'quote_update should succeed');
  assert(quoteUpdateResult.data.customerNote === quoteUpdateInput.customerNote,
         'Quote note should be updated');
  
  // Test quote_duplicate
  const quoteDuplicateResult = await callTool('quote_duplicate', {
    id: testEntities.quoteId
  });
  
  assert(quoteDuplicateResult.success, 'quote_duplicate should succeed');
  assert(quoteDuplicateResult.data && quoteDuplicateResult.data.id, 'Duplicated quote should have an ID');
  
  testEntities.duplicatedQuoteId = quoteDuplicateResult.data.id;
  console.log(`📝 Created duplicated quote ID: ${testEntities.duplicatedQuoteId}`);
  
  // Test update_status
  const updateStatusResult = await callTool('update_status', {
    parent_id: testEntities.quoteId,
    status_id: testEntities.statusId
  });
  
  assert(updateStatusResult.success, 'update_status should succeed');
  
  // Test line_item_delete
  if (testEntities.testLineItemId) {
    const lineItemDeleteResult = await callTool('line_item_delete', {
      id: testEntities.testLineItemId
    });
    
    assert(lineItemDeleteResult.success, 'line_item_delete should succeed');
  }
  
  console.log('✅ Write operations tests passed');
}

async function testConvenienceTools() {
  console.log('\n🔍 Testing Convenience Tools');
  
  // Test get_order_summary
  if (testEntities.orderId) {
    const orderSummaryResult = await callTool('get_order_summary', { id: testEntities.orderId });
    assert(orderSummaryResult.success, 'get_order_summary should succeed');
    assert(orderSummaryResult.data.order && orderSummaryResult.data.order.id === testEntities.orderId, 
           'Order ID should match in summary');
    assert(orderSummaryResult.data.summary, 'Order summary should be present');
  } else {
    console.log('⚠️ Skipping get_order_summary test due to missing order ID');
  }
  
  // Test create_quote_with_items
  if (testEntities.customerId && testEntities.contactId) {
    const lineItems = [
      {
        product: 'Test T-Shirt',
        color: 'Red',
        description: 'Test product from convenience tool',
        sizes: ['S(5)', 'M(10)', 'L(5)'],
        price: 24.99,
        taxed: true
      }
    ];
    
    const settings = {
      customerNote: 'Test quote from convenience tool',
      productionNote: 'For testing purposes only'
    };
    
    const createQuoteResult = await callTool('create_quote_with_items', {
      customer_id: testEntities.customerId,
      contact_id: testEntities.contactId,
      line_items: lineItems,
      settings
    });
    
    assert(createQuoteResult.success, 'create_quote_with_items should succeed');
    assert(createQuoteResult.data.quote && createQuoteResult.data.quote.id, 'Quote should have an ID');
    assert(createQuoteResult.data.lineItems && createQuoteResult.data.lineItems.length > 0,
           'Created quote should have line items');
    
    testEntities.convenienceQuoteId = createQuoteResult.data.quote.id;
    console.log(`📝 Created convenience quote ID: ${testEntities.convenienceQuoteId}`);
  } else {
    console.log('⚠️ Skipping create_quote_with_items test due to missing customer/contact ID');
  }
  
  // Test convert_quote_to_invoice
  if (testEntities.convenienceQuoteId && testEntities.statusId) {
    const convertResult = await callTool('convert_quote_to_invoice', {
      quote_id: testEntities.convenienceQuoteId,
      status_id: testEntities.statusId
    });
    
    assert(convertResult.success, 'convert_quote_to_invoice should succeed');
    assert(convertResult.data.invoice && convertResult.data.invoice.id, 'Invoice should have an ID');
    assert(convertResult.data.originalQuote && 
           convertResult.data.originalQuote.id === testEntities.convenienceQuoteId,
           'Original quote ID should match');
    
    testEntities.invoiceId = convertResult.data.invoice.id;
    console.log(`📝 Created invoice ID: ${testEntities.invoiceId}`);
  } else {
    console.log('⚠️ Skipping convert_quote_to_invoice test due to missing quote ID');
  }
  
  // Test search_customer_detail
  if (testEntities.customerId) {
    // Get the customer's company name to search for
    const customerResult = await callTool('get_customer', { id: testEntities.customerId });
    
    if (customerResult.success && customerResult.data.companyName) {
      const searchQuery = customerResult.data.companyName;
      
      const searchCustomerResult = await callTool('search_customer_detail', {
        query: searchQuery,
        limit: 5
      });
      
      assert(searchCustomerResult.success, 'search_customer_detail should succeed');
      assert(searchCustomerResult.data.results && searchCustomerResult.data.results.length > 0,
             'Customer search should return results');
    } else {
      console.log('⚠️ Skipping search_customer_detail test due to missing company name');
    }
  } else {
    console.log('⚠️ Skipping search_customer_detail test due to missing customer ID');
  }
  
  // Test get_order_analytics
  const analyticsResult = await callTool('get_order_analytics', { days: 30 });
  assert(analyticsResult.success, 'get_order_analytics should succeed');
  assert(analyticsResult.data.metrics, 'Analytics should include metrics');
  
  // Test get_customer_analytics
  const customerAnalyticsResult = await callTool('get_customer_analytics');
  assert(customerAnalyticsResult.success, 'get_customer_analytics should succeed');
  assert(customerAnalyticsResult.data.customerCount !== undefined, 
         'Customer analytics should include customer count');
  
  console.log('✅ Convenience tools tests passed');
}

async function testSanMarIntegration() {
  console.log('\n🔍 Testing SanMar Integration');
  
  // Skip SanMar tests if we don't have the necessary IDs
  if (!testEntities.customerId || !testEntities.contactId) {
    console.log('⚠️ Skipping SanMar integration tests due to missing test entities');
    return;
  }
  
  // Test create_quote_with_sanmar_products
  const sanmarItems = [
    {
      styleNumber: 'PC61',
      color: 'Athletic Heather',
      sizes: { 'S': 5, 'M': 10, 'L': 5 },
      checkInventory: true
    },
    {
      styleNumber: 'DT5000',
      color: 'Black',
      sizes: { 'M': 8, 'L': 8, 'XL': 4 },
      checkInventory: true
    }
  ];
  
  const settings = {
    customerNote: 'Test SanMar quote',
    productionNote: 'Created by test script'
  };
  
  const createSanmarQuoteResult = await callTool('create_quote_with_sanmar_products', {
    customer_id: testEntities.customerId,
    contact_id: testEntities.contactId,
    sanmar_items: sanmarItems,
    settings
  });
  
  assert(createSanmarQuoteResult.success, 'create_quote_with_sanmar_products should succeed');
  assert(createSanmarQuoteResult.data.quote && createSanmarQuoteResult.data.quote.id, 
         'SanMar quote should have an ID');
  assert(createSanmarQuoteResult.data.lineItems && createSanmarQuoteResult.data.lineItems.length > 0,
         'SanMar quote should have line items');
  
  testEntities.sanmarQuoteId = createSanmarQuoteResult.data.quote.id;
  console.log(`📝 Created SanMar quote ID: ${testEntities.sanmarQuoteId}`);
  
  // Test create_quote_with_sanmar_live_data (should behave the same as create_quote_with_sanmar_products)
  const createSanmarLiveQuoteResult = await callTool('create_quote_with_sanmar_live_data', {
    customer_id: testEntities.customerId,
    contact_id: testEntities.contactId,
    sanmar_items: sanmarItems,
    settings
  });
  
  assert(createSanmarLiveQuoteResult.success, 'create_quote_with_sanmar_live_data should succeed');
  assert(createSanmarLiveQuoteResult.data.quote && createSanmarLiveQuoteResult.data.quote.id, 
         'SanMar live quote should have an ID');
  
  testEntities.sanmarLiveQuoteId = createSanmarLiveQuoteResult.data.quote.id;
  console.log(`📝 Created SanMar live quote ID: ${testEntities.sanmarLiveQuoteId}`);
  
  // Get a line item from the SanMar quote to test update_line_item_sizes
  if (createSanmarQuoteResult.data.lineItems && createSanmarQuoteResult.data.lineItems.length > 0) {
    const lineItemId = createSanmarQuoteResult.data.lineItems[0].id;
    
    // Test update_line_item_sizes
    const updateSizesResult = await callTool('update_line_item_sizes', {
      line_item_id: lineItemId,
      sizes: { 'S': 10, 'M': 15, 'L': 10, 'XL': 5 }
    });
    
    assert(updateSizesResult.success, 'update_line_item_sizes should succeed');
    assert(updateSizesResult.data.lineItem && updateSizesResult.data.lineItem.id === lineItemId,
           'Updated line item ID should match');
  }
  
  console.log('✅ SanMar integration tests passed');
}

// Run all tests
async function runAllTests() {
  console.log('🧪 Starting Printavo GraphQL MCP Server Tests');

  try {
    await testBasicConnectivity();
    await testReadOperations();
    await testWriteOperations();
    await testConvenienceTools();
    await testSanMarIntegration();
    
    console.log('\n✅ All tests passed successfully!');
  } catch (error) {
    console.error(`\n❌ Tests failed: ${error.message}`);
    process.exit(1);
  }
}

runAllTests(); 