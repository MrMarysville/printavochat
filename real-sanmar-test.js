/**
 * Real Data Test for Printavo-SanMar Integration
 * 
 * This test uses real data from the Printavo API to test SanMar integration
 */

const fetch = require('node-fetch');

// Configuration from .env file
const PRINTAVO_API_URL = 'https://www.printavo.com/api/v2';
const PRINTAVO_EMAIL = 'sales@kingclothing.com';
const PRINTAVO_TOKEN = 'rEPQzTtowT_MQVbY1tfLtg';

// SanMar PC61 style number to use in tests
const SANMAR_STYLE = 'PC61';
const VISUAL_ID = '9435';

// Utility function for calling the Printavo GraphQL API directly
async function callPrintavoGraphQL(query, variables = {}) {
  console.log(`🔍 Calling Printavo GraphQL API`);
  
  try {
    const response = await fetch(`${PRINTAVO_API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'email': PRINTAVO_EMAIL,
        'token': PRINTAVO_TOKEN
      },
      body: JSON.stringify({
        query,
        variables
      })
    });
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      throw new Error(`GraphQL error: ${result.errors[0].message}`);
    }
    
    return result.data;
  } catch (error) {
    console.error(`❌ Error calling Printavo GraphQL API: ${error.message}`);
    throw error;
  }
}

// Utility function for calling the Printavo REST API directly
async function callPrintavoREST(endpoint, method = 'GET', data = null) {
  console.log(`🔍 Calling Printavo REST API: ${endpoint}`);
  
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'email': PRINTAVO_EMAIL,
        'token': PRINTAVO_TOKEN
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${PRINTAVO_API_URL}/${endpoint}`, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`REST API error (${response.status}): ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`❌ Error calling Printavo REST API: ${error.message}`);
    throw error;
  }
}

// Test 1: Get order by visual ID
async function testGetOrderByVisualId() {
  console.log(`\n== Test 1: Get Order by Visual ID ${VISUAL_ID} ==`);
  
  try {
    // GraphQL query for getting order by visual ID
    const query = `
      query GetOrderByVisualId($visualId: String!) {
        orders(
          first: 1
          filter: {
            visualIds: [$visualId]
          }
        ) {
          edges {
            node {
              id
              visualId
              customer {
                id
                companyName
              }
              status {
                id
                name
              }
              createdAt
              lineItems {
                id
                product
                description
                quantity
                price
              }
            }
          }
        }
      }
    `;
    
    const result = await callPrintavoGraphQL(query, {
      visualId: VISUAL_ID
    });
    
    if (!result.orders || !result.orders.edges || result.orders.edges.length === 0) {
      console.error(`❌ No order found with visual ID ${VISUAL_ID}`);
      return null;
    }
    
    const order = result.orders.edges[0].node;
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

// Test 2: Get customer for quote creation
async function testGetCustomer(order) {
  console.log(`\n== Test 2: Get Customer for Quote Creation ==`);
  
  try {
    if (!order || !order.customer || !order.customer.id) {
      console.error('❌ No customer ID available from order');
      
      // Fall back to searching for a customer
      console.log('Searching for a customer instead...');
      const customers = await callPrintavoREST('customers?per_page=1');
      
      if (customers && customers.length > 0) {
        const customer = customers[0];
        console.log(`✅ Found customer: ${customer.company_name}`);
        console.log(`ID: ${customer.id}`);
        
        // Find a contact for this customer
        const contacts = await callPrintavoREST(`customers/${customer.id}/contacts?per_page=1`);
        let contactId = null;
        
        if (contacts && contacts.length > 0) {
          console.log(`✅ Found contact: ${contacts[0].full_name}`);
          contactId = contacts[0].id;
        }
        
        return {
          customerId: customer.id,
          contactId
        };
      } else {
        throw new Error('No customers found');
      }
    }
    
    // Get customer details from the order
    const customerId = order.customer.id;
    const customerDetails = await callPrintavoREST(`customers/${customerId}`);
    
    console.log(`✅ Customer details retrieved:`);
    console.log(`ID: ${customerDetails.id}`);
    console.log(`Name: ${customerDetails.company_name}`);
    
    // Get a contact ID for this customer
    const contacts = await callPrintavoREST(`customers/${customerId}/contacts?per_page=1`);
    let contactId = null;
    
    if (contacts && contacts.length > 0) {
      console.log(`✅ Found contact: ${contacts[0].full_name}`);
      contactId = contacts[0].id;
    }
    
    return {
      customerId,
      contactId
    };
  } catch (error) {
    console.error(`❌ Error getting customer: ${error.message}`);
    return {
      customerId: null,
      contactId: null
    };
  }
}

// Test 3: Create quote with SanMar products (real API call)
async function testCreateQuoteWithSanMar(customerId, contactId) {
  console.log(`\n== Test 3: Create Quote with SanMar Products ==`);
  
  if (!customerId) {
    console.error('❌ No customer ID available - cannot create quote');
    return null;
  }
  
  try {
    // Prepare data for creating a quote with SanMar products
    const quoteData = {
      customer_id: customerId,
      contact_id: contactId || null,
      status_id: null, // Use default status
      notes: {
        customer_notes: "SanMar PC61 test quote - REAL DATA TEST",
        production_notes: "Test order for PC61 products"
      },
      line_items_attributes: [
        {
          product: `SanMar ${SANMAR_STYLE}`,
          description: "Port & Company Essential T-Shirt - Front Logo",
          color: "Athletic Heather",
          quantity: 20,
          price: 15.99,
          sizes: "S(5), M(10), L(5)"
        }
      ]
    };
    
    console.log('Creating quote with the following data:');
    console.log(JSON.stringify(quoteData, null, 2));
    
    // Create the quote via Printavo REST API
    const newQuote = await callPrintavoREST('quotes', 'POST', quoteData);
    
    console.log(`✅ Quote created successfully!`);
    console.log(`Quote ID: ${newQuote.id}`);
    console.log(`Visual ID: ${newQuote.visual_id}`);
    
    if (newQuote.line_items && newQuote.line_items.length > 0) {
      console.log('\n📦 Line Items:');
      newQuote.line_items.forEach((item, i) => {
        console.log(`\nItem ${i + 1}:`);
        console.log(`  ID: ${item.id}`);
        console.log(`  Product: ${item.product || 'N/A'}`);
        console.log(`  Description: ${item.description || 'N/A'}`);
        console.log(`  Color: ${item.color || 'N/A'}`);
        console.log(`  Sizes: ${item.sizes || 'N/A'}`);
        console.log(`  Quantity: ${item.quantity || 0}`);
        console.log(`  Price: $${item.price || 0}`);
      });
    }
    
    return newQuote;
  } catch (error) {
    console.error(`❌ Error creating quote: ${error.message}`);
    return null;
  }
}

// Test 4: Update line item sizes (real API call)
async function testUpdateLineItemSizes(quoteId, lineItemId) {
  console.log(`\n== Test 4: Update Line Item Sizes ==`);
  
  if (!quoteId || !lineItemId) {
    console.error('❌ No quote ID or line item ID available - cannot update sizes');
    return null;
  }
  
  try {
    // New sizes data
    const newSizes = "S(10), M(15), L(10), XL(5)";
    const newQuantity = 40; // 10 + 15 + 10 + 5
    
    // Update the line item via REST API
    const updateData = {
      line_item: {
        sizes: newSizes,
        quantity: newQuantity
      }
    };
    
    console.log(`Updating line item ${lineItemId} with sizes: ${newSizes}`);
    
    const updatedLineItem = await callPrintavoREST(`quotes/${quoteId}/line_items/${lineItemId}`, 'PUT', updateData);
    
    console.log(`✅ Line item updated successfully!`);
    console.log(`ID: ${updatedLineItem.id}`);
    console.log(`New sizes: ${updatedLineItem.sizes}`);
    console.log(`New quantity: ${updatedLineItem.quantity}`);
    
    return updatedLineItem;
  } catch (error) {
    console.error(`❌ Error updating line item sizes: ${error.message}`);
    return null;
  }
}

// Run all tests in sequence
async function runAllTests() {
  console.log('🧪 Running Real Data Tests for Printavo-SanMar Integration\n');
  
  try {
    // Test 1: Get order by visual ID
    const order = await testGetOrderByVisualId();
    
    // Test 2: Get customer for quote creation
    const { customerId, contactId } = await testGetCustomer(order);
    
    // Test 3: Create quote with SanMar products
    const quote = await testCreateQuoteWithSanMar(customerId, contactId);
    
    // Test 4: Update line item sizes (if we have a quote)
    if (quote && quote.line_items && quote.line_items.length > 0) {
      const lineItemId = quote.line_items[0].id;
      await testUpdateLineItemSizes(quote.id, lineItemId);
    }
    
    console.log('\n🎯 All real data tests completed!');
  } catch (error) {
    console.error(`\n❌ Test suite failed: ${error.message}`);
  }
}

// Run the tests
runAllTests(); 