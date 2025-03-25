/**
 * Simple Printavo API Test
 * 
 * This test makes a simple request to the Printavo API to verify connectivity and authentication.
 * 
 * Run with: node tests/simpleApiTest.js
 */

// Import environment variables
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

// Check if Printavo credentials are set
const API_EMAIL = process.env.PRINTAVO_EMAIL || process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
const API_TOKEN = process.env.PRINTAVO_TOKEN || process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
const API_URL = process.env.PRINTAVO_API_URL || process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';

if (!API_TOKEN || !API_EMAIL) {
  console.error('Error: Printavo credentials not set in .env file');
  console.error('Please set PRINTAVO_EMAIL and PRINTAVO_TOKEN');
  process.exit(1);
}

console.log('Using Printavo API URL:', API_URL);
console.log('API email:', API_EMAIL);
console.log('API token is set (first 5 chars):', API_TOKEN.substring(0, 5) + '...');

// Simple fetch function
async function fetchInvoices() {
  try {
    const query = `
      query {
        invoices(first: 1) {
          edges {
            node {
              id
              visualId
              total
            }
          }
        }
      }
    `;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': API_EMAIL,
        'token': API_TOKEN
      },
      body: JSON.stringify({ query }),
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return false;
    }
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
      return false;
    }

    console.log('API Response:', JSON.stringify(result.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error executing API call:', error);
    return false;
  }
}

// Simple fetch function
async function fetchAccount() {
  try {
    const query = `
      query {
        account {
          id
          companyName
          companyEmail
        }
      }
    `;

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': API_EMAIL,
        'token': API_TOKEN
      },
      body: JSON.stringify({ query }),
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return false;
    }
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
      return false;
    }

    console.log('Account Info:', JSON.stringify(result.data, null, 2));
    return true;
  } catch (error) {
    console.error('Error executing API call:', error);
    return false;
  }
}

// Run the tests
async function runTests() {
  console.log('\n=== Testing Account Info ===');
  const accountSuccess = await fetchAccount();
  
  console.log('\n=== Testing Invoices ===');
  const invoicesSuccess = await fetchInvoices();
  
  console.log('\n=== Test Results ===');
  console.log(`Account API: ${accountSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Invoices API: ${invoicesSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (accountSuccess || invoicesSuccess) {
    console.log('\n✅ CONFIRMED: Your application CAN retrieve real data from the Printavo API');
    console.log('Your API credentials are working correctly!');
  } else {
    console.log('\n❌ WARNING: Your application is NOT retrieving real data from the Printavo API');
    console.log('Please check your API credentials and connection settings.');
  }
}

// Run the test
runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
}); 