// Manual test for Visual ID search
// Run with: node tests/manualVisualIdTest.js

// Import environment variables and required packages
require('dotenv').config();
const fetch = require('node-fetch');

// Check if Printavo credentials are set
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';

if (!API_TOKEN) {
  console.error('Error: NEXT_PUBLIC_PRINTAVO_TOKEN is not set in .env file');
  process.exit(1);
}

console.log('Using Printavo API URL:', API_URL);
console.log('API token is set (first 5 chars):', API_TOKEN.substring(0, 5) + '...');

// Function to search for an order by Visual ID
async function testVisualIdSearch(visualId) {
  console.log(`\nSearching for order with Visual ID: ${visualId}`);
  
  const GRAPHQL_ENDPOINT = `${API_URL}/graphql`;
  
  // Prepare GraphQL query for visual ID search
  const query = `
    query GetOrdersByVisualId($query: String) {
      orders(first: 10, query: $query) {
        nodes {
          ... on Invoice {
            id
            visualId
            nickname
            total
            subtotal
            createdAt
            status {
              id
              name
            }
            contact {
              name
              email
              phoneNumber
            }
          }
          ... on Quote {
            id
            visualId
            name
            total
            status {
              id
              name
            }
            contact {
              name
              email
            }
          }
        }
      }
    }
  `;
  
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
        variables: { query: visualId },
      }),
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return null;
    }
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
      return null;
    }
    
    console.log('API Response:', JSON.stringify(result.data, null, 2));
    
    const orders = result.data?.orders?.nodes || [];
    
    if (orders.length === 0) {
      console.log(`No orders found with Visual ID: ${visualId}`);
      return null;
    }
    
    // Find exact match for the visual ID
    const exactMatch = orders.find(order => order.visualId === visualId);
    
    if (exactMatch) {
      console.log(`Found exact match for Visual ID ${visualId}:`, JSON.stringify(exactMatch, null, 2));
      return exactMatch;
    } else {
      console.log(`No exact match for Visual ID ${visualId}, using first result:`, JSON.stringify(orders[0], null, 2));
      return orders[0];
    }
  } catch (error) {
    console.error('Error searching for Visual ID:', error);
    return null;
  }
}

// Test with the Visual ID 9435
async function runTest() {
  const visualIds = ['9435', '1234', '5678']; // Test multiple Visual IDs
  
  for (const visualId of visualIds) {
    console.log(`\n=== Testing Visual ID: ${visualId} ===`);
    const result = await testVisualIdSearch(visualId);
    
    if (result) {
      console.log(`✅ Successfully found order with Visual ID ${visualId}`);
    } else {
      console.log(`❌ Could not find order with Visual ID ${visualId}`);
    }
  }
}

runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
}); 