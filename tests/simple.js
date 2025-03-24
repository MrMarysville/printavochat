// Simple test for Printavo API
require('dotenv').config();
const fetch = require('node-fetch');

// Get credentials
const token = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';

console.log('Using API URL:', apiUrl);
console.log('Token set:', !!token);

// Simple query to get recent orders
const query = `
  query {
    orders(first: 3) {
      edges {
        node {
          id
          visualId
        }
      }
    }
  }
`;

// Make the request with timeout
async function test() {
  // Set a timeout to kill the process after 10 seconds
  const timeoutId = setTimeout(() => {
    console.error('Request timed out after 10 seconds');
    process.exit(1);
  }, 10000);

  try {
    console.log('Making GraphQL request...');
    
    const controller = new AbortController();
    const signal = controller.signal;
    
    // Set a shorter timeout for the fetch operation
    setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
      signal
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    const body = await response.text();
    console.log('Response body:', body);
    
    if (response.ok) {
      const data = JSON.parse(body);
      console.log('Found orders:', JSON.stringify(data.data?.orders?.edges || [], null, 2));
    }
    
    // Clear the timeout since we got a response
    clearTimeout(timeoutId);
  } catch (error) {
    console.error('Request failed:', error);
    // Clear the timeout to allow the process to exit naturally after logging the error
    clearTimeout(timeoutId);
  }
}

test(); 