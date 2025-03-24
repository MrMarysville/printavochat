// Test script for basic Printavo API connectivity
require('dotenv').config();
const fetch = require('node-fetch');

console.log('Testing basic Printavo API connectivity...');

// Try accessing base API endpoint without GraphQL
const urlsToTest = [
  'https://www.printavo.com/api/v2',
  'https://printavo.com/api/v2',
  'https://api.printavo.com/v2',
  'https://api.printavo.com'
];

async function testEndpoint(url) {
  console.log(`\nTesting endpoint: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const text = await response.text();
      console.log('Response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      return true;
    } else {
      const text = await response.text();
      console.log('Error response:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      return false;
    }
  } catch (error) {
    console.error('Request failed:', error.message);
    return false;
  }
}

async function testAllEndpoints() {
  for (const url of urlsToTest) {
    await testEndpoint(url);
  }
  
  // Also check if the main website is accessible
  console.log('\nChecking if main Printavo website is accessible:');
  await testEndpoint('https://www.printavo.com');
  
  console.log('\nTesting complete!');
}

testAllEndpoints(); 