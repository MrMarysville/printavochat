// Test script for Printavo API with correct authentication
require('dotenv').config();
const fetch = require('node-fetch');

// Get credentials
const email = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
const token = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';

// According to docs, the base URL should be www.printavo.com/api/v2
// Try both with and without www prefix
const urlsToTry = [
  `${apiUrl}/graphql`, 
  'https://www.printavo.com/api/v2/graphql',
  'https://printavo.com/api/v2/graphql'
];

console.log('Using email:', email);
console.log('Token set (first 5 chars):', token.substring(0, 5) + '...');
console.log('Will try these URLs:', urlsToTry);

// Simple query to get recent orders - this should work with correct auth
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

// Make the request with correct auth headers
async function test() {
  const timeoutId = setTimeout(() => {
    console.error('Request timed out after 30 seconds');
    process.exit(1);
  }, 30000);

  // Try each URL in sequence
  for (const url of urlsToTry) {
    try {
      console.log(`\n\nTrying URL: ${url}`);
      console.log('Making GraphQL request with correct authentication headers...');
      
      const controller = new AbortController();
      const signal = controller.signal;
      
      const abortTimeout = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'email': email,
          'token': token,
        },
        body: JSON.stringify({ query }),
        signal
      });
      
      clearTimeout(abortTimeout);
      
      console.log('Response status:', response.status, response.statusText);
      
      const body = await response.text();
      const bodyPreview = body.length > 200 ? body.substring(0, 200) + '...' : body;
      console.log('Response body preview:', bodyPreview);
      
      if (response.ok) {
        try {
          const data = JSON.parse(body);
          console.log('Found orders:', JSON.stringify(data?.data?.orders?.nodes || [], null, 2));
          
          if (data?.data?.orders?.nodes && data.data.orders.nodes.length > 0) {
            console.log(`\n✅ SUCCESS! API connection working with URL: ${url}`);
            
            // If successful, try to search for order 9435
            await searchOrder9435(url);
            break; // Exit the loop if successful
          } else {
            console.log('\n⚠️ API returned successfully but no orders found');
          }
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
        }
      }
    } catch (error) {
      console.error(`Request to ${url} failed:`, error);
    }
  }
  
  clearTimeout(timeoutId);
  console.log('\nFinished trying all URLs.');
}

// Search specifically for order 9435
async function searchOrder9435(workingUrl) {
  console.log('\n=== Searching for Order 9435 ===');
  
  const searchQuery = `
    query {
      orders(query: "9435", first: 5) {
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
    const response = await fetch(workingUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'email': email,
        'token': token,
      },
      body: JSON.stringify({ query: searchQuery })
    });
    
    console.log('Search response status:', response.status, response.statusText);
    
    const body = await response.text();
    const bodyPreview = body.length > 200 ? body.substring(0, 200) + '...' : body;
    console.log('Search response body preview:', bodyPreview);
    
    if (response.ok) {
      try {
        const data = JSON.parse(body);
        const orders = data?.data?.orders?.nodes || [];
        
        if (orders.length > 0) {
          console.log('\n✅ Found order 9435 in search results!');
          console.log('Orders:', JSON.stringify(orders, null, 2));
        } else {
          console.log('\n⚠️ Order 9435 not found in search results');
        }
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
      }
    }
  } catch (error) {
    console.error('Search request failed:', error);
  }
}

// Run the test
test(); 