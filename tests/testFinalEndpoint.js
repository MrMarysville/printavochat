// Final test script with correct query syntax
require('dotenv').config();
const fetch = require('node-fetch');

// Get credentials
const email = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
const token = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
const apiUrl = 'https://www.printavo.com/api/v2'; // This endpoint returned a GraphQL error

console.log('Testing Printavo API with correct query structure');
console.log('Using email:', email);
console.log('Token (first 5 chars):', token.substring(0, 5) + '...');
console.log('API URL:', apiUrl);

// Correct query with fragments for union type
// Based on API error: Fields need to match schema definitions
const query = `
  query {
    orders(first: 3) {
      nodes {
        ... on Invoice {
          id
          visualId
          status {
            name
          }
          contact {
            fullName
            email
          }
        }
        ... on Quote {
          id
          visualId
          status {
            name
          }
          contact {
            fullName
            email
          }
        }
      }
    }
  }
`;

// Test with correct query
async function testCorrectQuery() {
  try {
    console.log('\nSending POST request with correct query structure...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': email,
        'token': token
      },
      body: JSON.stringify({ query })
    });
    
    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    const body = await response.text();
    console.log('Response body:', body);
    
    if (response.ok) {
      try {
        const data = JSON.parse(body);
        if (data.data && data.data.orders && data.data.orders.nodes) {
          console.log('\n✅ SUCCESS! Found orders:');
          console.log(JSON.stringify(data.data.orders.nodes, null, 2));
          
          // If successful, try to search for order 9435
          await searchOrder('9435');
          return true;
        } else if (data.errors) {
          console.log('\n❌ GraphQL errors:', JSON.stringify(data.errors, null, 2));
        }
      } catch (err) {
        console.log('Failed to parse JSON response:', err);
      }
    }
    
    return false;
  } catch (error) {
    console.error('Request failed:', error);
    return false;
  }
}

// Search for a specific order
async function searchOrder(orderNumber) {
  console.log(`\nSearching for order ${orderNumber}...`);
  
  // Search query with correct fragments and field names
  const searchQuery = `
    query {
      orders(query: "${orderNumber}", first: 5) {
        nodes {
          ... on Invoice {
            id
            visualId
            status {
              name
            }
            contact {
              fullName
              email
            }
          }
          ... on Quote {
            id
            visualId
            status {
              name
            }
            contact {
              fullName
              email
            }
          }
        }
      }
    }
  `;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': email,
        'token': token
      },
      body: JSON.stringify({ query: searchQuery })
    });
    
    console.log(`Search response status: ${response.status} ${response.statusText}`);
    
    const body = await response.text();
    console.log('Search response body:', body);
    
    if (response.ok) {
      try {
        const data = JSON.parse(body);
        if (data.data && data.data.orders && data.data.orders.nodes) {
          const orders = data.data.orders.nodes;
          if (orders.length > 0) {
            console.log(`\n✅ Found ${orders.length} orders matching ${orderNumber}:`);
            console.log(JSON.stringify(orders, null, 2));
          } else {
            console.log(`\n⚠️ No orders found matching ${orderNumber}`);
          }
        } else if (data.errors) {
          console.log('\n❌ Search GraphQL errors:', JSON.stringify(data.errors, null, 2));
        }
      } catch (err) {
        console.log('Failed to parse search response JSON:', err);
      }
    }
  } catch (error) {
    console.error('Search request failed:', error);
  }
}

// Run the test
testCorrectQuery(); 