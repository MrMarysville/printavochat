const fetch = require('node-fetch');

// Test credentials
const API_EMAIL = 'sales@kingclothing.com';
const API_TOKEN = 'rEPQzTtowT_MQVbY1tfLtg';

// List of endpoints to test
const ENDPOINTS = [
  'https://www.printavo.com/api/v2', // Correct endpoint according to documentation
  'https://www.printavo.com/api/v2/graphql',
  'https://api.printavo.com/api/v2',
  'https://www.printavo.com/api',
  'https://api.printavo.com/api',
  'https://www.printavo.com/api/v2/account',
  'https://api.printavo.com/api/v2/account',
  'https://www.printavo.com/api/account',
  'https://api.printavo.com/account',
  'https://www.printavo.com/api/v2/customers',
  'https://api.printavo.com/api/v2/customers',
  'https://www.printavo.com/api/customers',
  'https://api.printavo.com/customers',
  'https://www.printavo.com/api/v2/orders',
  'https://api.printavo.com/api/v2/orders'
];

// Auth methods to test
const AUTH_METHODS = [
  {
    name: 'Headers: email + token',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'email': API_EMAIL,
      'token': API_TOKEN
    },
    queryParams: ''
  },
  {
    name: 'Headers: Authorization Bearer',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`
    },
    queryParams: ''
  },
  {
    name: 'Headers: All combined',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'email': API_EMAIL,
      'token': API_TOKEN,
      'Authorization': `Bearer ${API_TOKEN}`
    },
    queryParams: ''
  },
  {
    name: 'Query params: email + token',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    queryParams: `?email=${encodeURIComponent(API_EMAIL)}&token=${encodeURIComponent(API_TOKEN)}`
  }
];

// Test GraphQL queries with the correct structure
const GRAPHQL_QUERIES = [
  {
    name: 'Account query',
    body: JSON.stringify({
      query: `
        query {
          account {
            id
            name
            email
          }
        }
      `
    })
  }
];

// Test function for a single endpoint
async function testEndpoint(endpoint, authMethod, query = null) {
  console.log('==================================================');
  console.log(`Testing ${endpoint} with ${authMethod.name}`);
  console.log('==================================================');

  try {
    // Construct URL with query params if any
    const url = `${endpoint}${authMethod.queryParams}`;
    
    // Set up fetch options
    const options = {
      method: query ? 'POST' : 'GET',
      headers: authMethod.headers
    };
    
    // Add body for POST requests
    if (query) {
      options.body = query.body;
    }
    
    console.log(`Testing ${endpoint} with ${authMethod.name}`);
    
    // Make the request
    const response = await fetch(url, options);
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    let data;
    try {
      data = await response.json();
      console.log(`Response data: ${JSON.stringify(data, null, 2).substring(0, 100)}...`);
      
      // Check for success
      if (response.ok && !data.errors && !data.error && !data.status) {
        console.log('✅ API Success!');
        return { success: true, endpoint, authMethod, data };
      } else if (data.errors || data.error || data.status === 404) {
        console.log('❌ API error');
        return { success: false, endpoint, authMethod, data };
      }
    } catch (e) {
      console.log(`❌ Invalid JSON response: ${e.message}`);
      return { success: false, endpoint, authMethod, error: e.message };
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return { success: false, endpoint, authMethod, error: error.message };
  }
  
  return { success: false, endpoint, authMethod };
}

// Run all tests
async function runAllTests() {
  const results = [];
  let firstSuccess = null;
  
  // Test all REST endpoints with all auth methods
  for (const endpoint of ENDPOINTS) {
    for (const authMethod of AUTH_METHODS) {
      const result = await testEndpoint(endpoint, authMethod);
      results.push(result);
      
      if (result.success && !firstSuccess) {
        firstSuccess = result;
      }
    }
  }
  
  // Test the correct GraphQL endpoint with GraphQL queries
  for (const authMethod of AUTH_METHODS) {
    for (const query of GRAPHQL_QUERIES) {
      const result = await testEndpoint('https://www.printavo.com/api/v2', authMethod, query);
      results.push(result);
      
      if (result.success && !firstSuccess) {
        firstSuccess = result;
      }
    }
  }
  
  // Log the first successful configuration
  if (firstSuccess) {
    console.log('\n==================================================');
    console.log('✅ Found a working configuration:');
    console.log(`Endpoint: ${firstSuccess.endpoint}`);
    console.log(`Auth Method: ${firstSuccess.authMethod.name}`);
    console.log('==================================================\n');
  } else {
    console.log('\n==================================================');
    console.log('❌ No working configuration found');
    console.log('==================================================\n');
  }
  
  return firstSuccess;
}

// Execute all tests
runAllTests(); 