// Script to search for real order 9435 using multiple methods
// Run with: node tests/searchRealOrder.js

// Import environment variables and required packages
require('dotenv').config();
const fetch = require('node-fetch');

// Check if Printavo credentials are set
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const GRAPHQL_ENDPOINT = `${API_URL}/graphql`;

if (!API_TOKEN) {
  console.error('Error: NEXT_PUBLIC_PRINTAVO_TOKEN is not set in .env file');
  process.exit(1);
}

console.log('Using Printavo API URL:', API_URL);
console.log('API token is set (first 5 chars):', API_TOKEN.substring(0, 5) + '...');

// Helper function to make GraphQL requests
async function executeGraphQL(query, variables) {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { error: errorText };
    }
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
      return { error: result.errors };
    }
    
    return result.data;
  } catch (error) {
    console.error('Error executing GraphQL:', error);
    return { error: error.message };
  }
}

// Method 1: Search orders with number = 9435
async function searchOrderByNumber() {
  console.log('\n=== Method 1: Search by Order Number ===');
  
  const query = `
    query SearchOrdersByNumber($query: String!) {
      orders(query: $query, first: 10) {
        edges {
          node {
            id
            visualId
            name
            orderNumber
            status {
              id
              name
            }
            customer {
              id
              name
              email
            }
            createdAt
            updatedAt
            total
          }
        }
      }
    }
  `;
  
  const data = await executeGraphQL(query, { query: '9435' });
  console.log('Search by number results:', JSON.stringify(data, null, 2));
  
  return data;
}

// Method 2: Search all orders and filter client-side
async function searchAllRecentOrders() {
  console.log('\n=== Method 2: Search Recent Orders ===');
  
  const query = `
    query GetRecentOrders {
      orders(first: 20, sortOn: "created_at", sortDescending: true) {
        edges {
          node {
            id
            visualId
            name
            orderNumber
            status {
              id
              name
            }
            customer {
              id
              name
              email
            }
            createdAt
            updatedAt
            total
          }
        }
      }
    }
  `;
  
  const data = await executeGraphQL(query, {});
  
  // Look for order with visualId = 9435
  const orders = data?.orders?.edges || [];
  const targetOrder = orders.find(edge => edge.node.visualId === '9435' || 
                                         edge.node.orderNumber === '9435' || 
                                         edge.node.id === '9435');
  
  if (targetOrder) {
    console.log('Found order with ID 9435 in recent orders:', JSON.stringify(targetOrder.node, null, 2));
    return targetOrder.node;
  } else {
    console.log('Order with ID 9435 not found in recent orders');
    return null;
  }
}

// Method 3: Try to get order directly by ID
async function getOrderDirectly() {
  console.log('\n=== Method 3: Get Order Directly ===');
  
  // Try different potential ID formats
  const potentialIds = [
    '9435',        // Raw number
    'INV-9435',    // Invoice prefix
    'Q-9435',      // Quote prefix
    'ORD-9435'     // Order prefix
  ];
  
  for (const id of potentialIds) {
    console.log(`Trying to get order with ID: ${id}`);
    
    const query = `
      query GetOrder($id: ID!) {
        order(id: $id) {
          id
          visualId
          name
          orderNumber
          status {
            id
            name
          }
          customer {
            id
            name
            email
          }
          createdAt
          updatedAt
          total
        }
      }
    `;
    
    const data = await executeGraphQL(query, { id });
    
    if (data?.order) {
      console.log(`Found order with ID ${id}:`, JSON.stringify(data.order, null, 2));
      return data.order;
    }
  }
  
  console.log('Order not found with any direct ID format');
  return null;
}

// Method 4: Try searching with partial matches
async function searchWithPartialMatches() {
  console.log('\n=== Method 4: Search with Partial Matches ===');
  
  // Try various search terms
  const searchTerms = [
    '9435',       // Exact number
    '943',        // Partial number
    '#9435',      // With hashtag
    'id:9435'     // With ID prefix
  ];
  
  for (const term of searchTerms) {
    console.log(`Searching for orders with term: "${term}"`);
    
    const query = `
      query SearchOrders($query: String!) {
        invoices(query: $query, first: 10) {
          edges {
            node {
              id
              visualId
              nickname
              total
              status {
                id
                name
              }
              contact {
                name
                email
              }
              createdAt
            }
          }
        }
      }
    `;
    
    const data = await executeGraphQL(query, { query: term });
    
    const orders = data?.invoices?.edges || [];
    if (orders.length > 0) {
      console.log(`Found ${orders.length} orders with search term "${term}":`, JSON.stringify(orders[0].node, null, 2));
      return orders[0].node;
    }
  }
  
  console.log('No orders found with any search term');
  return null;
}

// Run all methods
async function runTests() {
  console.log('\n======= SEARCHING FOR ORDER 9435 =======\n');
  
  // Try all methods
  const results = await Promise.all([
    searchOrderByNumber(),
    searchAllRecentOrders(),
    getOrderDirectly(),
    searchWithPartialMatches()
  ]);
  
  // Check if any method succeeded
  const foundOrder = results.find(result => result && !result.error);
  
  if (foundOrder) {
    console.log('\n✅ FOUND ORDER 9435 with at least one method');
  } else {
    console.log('\n❌ FAILED TO FIND ORDER 9435 with any method');
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
}); 