// Test alternative GraphQL endpoint URLs
require('dotenv').config();
const fetch = require('node-fetch');

// Get credentials
const email = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
const token = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;

console.log('Testing alternative GraphQL endpoints');
console.log('Using email:', email);
console.log('Token (first 5 chars):', token.substring(0, 5) + '...');

// Alternative endpoint possibilities
const endpoints = [
  'https://www.printavo.com/api/v2',                  // Base API v2 URL
  'https://www.printavo.com/api/v2/graphql',          // Standard GraphQL endpoint
  'https://www.printavo.com/api/graphql',             // Without v2
  'https://www.printavo.com/graphql',                 // Direct GraphQL endpoint
  'https://app.printavo.com/api/v2/graphql',          // App subdomain
  'https://app.printavo.com/graphql',                 // App direct
  'https://api.printavo.com/v2/graphql',              // API subdomain
  'https://api.printavo.com/graphql'                  // API direct
];

// Simple GraphQL query
const query = `
  query {
    orders(first: 3) {
      nodes {
        id
        visualId
      }
    }
  }
`;

// Test function
async function testEndpoint(url) {
  console.log(`\n\nTesting endpoint: ${url}`);
  try {
    // First try a GET request
    console.log('Sending GET request...');
    const getResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'email': email,
        'token': token
      }
    }).catch(err => {
      console.log('GET request failed:', err.message);
      return null;
    });
    
    if (getResponse) {
      console.log(`GET Status: ${getResponse.status} ${getResponse.statusText}`);
      if (getResponse.ok) {
        const text = await getResponse.text();
        const preview = text.length > 200 ? text.substring(0, 200) + '...' : text;
        console.log('GET Response:', preview);
      }
    }
    
    // Now try a GraphQL POST request
    console.log('Sending POST GraphQL request...');
    const postResponse = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': email,
        'token': token
      },
      body: JSON.stringify({ query })
    }).catch(err => {
      console.log('POST request failed:', err.message);
      return null;
    });
    
    if (!postResponse) return false;
    
    console.log(`POST Status: ${postResponse.status} ${postResponse.statusText}`);
    
    const body = await postResponse.text();
    const preview = body.length > 200 ? body.substring(0, 200) + '...' : body;
    console.log('POST Response:', preview);
    
    if (postResponse.ok) {
      try {
        const data = JSON.parse(body);
        if (data.data && data.data.orders && data.data.orders.nodes) {
          console.log('✅ SUCCESS! Found GraphQL endpoint:', url);
          console.log('Orders:', JSON.stringify(data.data.orders.nodes, null, 2));
          return true;
        }
      } catch (err) {
        console.log('Failed to parse JSON response');
      }
    }
    
    return false;
  } catch (error) {
    console.error('Request completely failed:', error.message);
    return false;
  }
}

// Test all endpoints sequentially
async function testAllEndpoints() {
  let success = false;
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    if (result) {
      success = true;
      console.log('\n✅ Found working endpoint:', endpoint);
      // Try to search for order 9435
      await searchOrder(endpoint, '9435');
      break;
    }
  }
  
  if (!success) {
    console.log('\n❌ No working GraphQL endpoints found. Possible issues:');
    console.log('1. API credentials (email/token) may be incorrect');
    console.log('2. Your account may not have API access');
    console.log('3. The API endpoint may have changed');
    console.log('4. The API may be down or restricted');
  }
}

// Search for specific order
async function searchOrder(endpoint, orderNumber) {
  console.log(`\nSearching for order ${orderNumber} on endpoint ${endpoint}`);
  
  const searchQuery = `
    query {
      orders(query: "${orderNumber}", first: 5) {
        nodes {
          id
          visualId
          ... on Invoice {
            orderNumber
          }
        }
      }
    }
  `;
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': email,
        'token': token
      },
      body: JSON.stringify({ query: searchQuery })
    });
    
    console.log(`Search Status: ${response.status} ${response.statusText}`);
    
    const body = await response.text();
    const preview = body.length > 200 ? body.substring(0, 200) + '...' : body;
    console.log('Search Response:', preview);
    
    if (response.ok) {
      try {
        const data = JSON.parse(body);
        if (data.data && data.data.orders && data.data.orders.nodes) {
          const orders = data.data.orders.nodes;
          if (orders.length > 0) {
            console.log(`✅ Found ${orders.length} orders matching ${orderNumber}:`);
            console.log(JSON.stringify(orders, null, 2));
          } else {
            console.log(`⚠️ No orders found matching ${orderNumber}`);
          }
        }
      } catch (err) {
        console.log('Failed to parse search response JSON');
      }
    }
  } catch (error) {
    console.error('Search request failed:', error.message);
  }
}

// Start testing
testAllEndpoints(); 