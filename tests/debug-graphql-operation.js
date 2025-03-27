/**
 * Debug script for GraphQL operation name issue
 * This script makes a direct call to the Printavo GraphQL API
 * to test operation name handling
 */

// Load environment variables from .env
require('dotenv').config();

// Use node-fetch for API requests in Node.js
const fetch = require('node-fetch');

// API credentials from environment variables
const API_EMAIL = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
const API_ENDPOINT_RAW = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'www.printavo.com/api/v2';
// Ensure the URL has the proper protocol
const API_ENDPOINT = API_ENDPOINT_RAW.startsWith('http') ? API_ENDPOINT_RAW : `https://${API_ENDPOINT_RAW}`;

// Test query with explicit operation name
const testNamedQuery = `
  query TestGetOrders {
    invoices(first: 5) {
      edges {
        node {
          id
          visualId
          nickname
        }
      }
    }
  }
`;

// Test query without operation name (anonymous)
const testAnonymousQuery = `
  {
    invoices(first: 5) {
      edges {
        node {
          id
          visualId
          nickname
        }
      }
    }
  }
`;

// Function to extract operation name from query
function extractOperationName(query) {
  const operationMatch = query.match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)\b/i);
  if (operationMatch && operationMatch[1]) {
    return operationMatch[1];
  }
  return null;
}

// Generate a simple hash for a string
function hashString(str) {
  let hash = 0;
  if (str.length === 0) return hash;
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(16).substring(0, 8);
}

// Generate an operation name based on query content
function generateOperationName(query) {
  return `GraphQLQuery_${hashString(query)}`;
}

// Test execution functions
async function testNamedOperation() {
  console.log('Testing query with explicit operation name...');
  
  const operationName = extractOperationName(testNamedQuery);
  console.log(`Extracted operation name: ${operationName}`);
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': API_EMAIL,
        'token': API_TOKEN
      },
      body: JSON.stringify({
        query: testNamedQuery,
        variables: {},
        operationName
      })
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    try {
      const data = JSON.parse(result);
      console.log('Named query response:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
      }
    } catch (e) {
      console.error('Failed to parse response:', result.substring(0, 500));
    }
  } catch (error) {
    console.error('Error executing named query:', error);
  }
}

async function testAnonymousOperation() {
  console.log('\nTesting anonymous query (no operation name)...');
  
  // Let's extract or generate an operation name
  let operationName = extractOperationName(testAnonymousQuery);
  if (!operationName) {
    operationName = generateOperationName(testAnonymousQuery);
    console.log(`Generated operation name: ${operationName}`);
  }
  
  try {
    // Test with generated operation name
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': API_EMAIL,
        'token': API_TOKEN
      },
      body: JSON.stringify({
        query: testAnonymousQuery,
        variables: {},
        operationName // Include the generated name
      })
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    try {
      const data = JSON.parse(result);
      console.log('Anonymous query response:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
      }
    } catch (e) {
      console.error('Failed to parse response:', result.substring(0, 500));
    }
  } catch (error) {
    console.error('Error executing anonymous query:', error);
  }
  
  // Now let's try rewriting the query to include the operation name
  console.log('\nTesting anonymous query with modified query to include operation name...');
  
  const modifiedQuery = `
    query ${operationName} {
      invoices(first: 5) {
        edges {
          node {
            id
            visualId
            nickname
          }
        }
      }
    }
  `;
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': API_EMAIL,
        'token': API_TOKEN
      },
      body: JSON.stringify({
        query: modifiedQuery,
        variables: {},
        operationName
      })
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    try {
      const data = JSON.parse(result);
      console.log('Modified query response:', JSON.stringify(data, null, 2).substring(0, 500) + '...');
      if (data.errors) {
        console.error('GraphQL errors:', data.errors);
      }
    } catch (e) {
      console.error('Failed to parse response:', result.substring(0, 500));
    }
  } catch (error) {
    console.error('Error executing modified query:', error);
  }
}

// Run tests
async function runTests() {
  console.log('Printavo API Endpoint:', API_ENDPOINT);
  console.log('Email:', API_EMAIL ? API_EMAIL.substring(0, 3) + '...' : 'not set');
  console.log('Token:', API_TOKEN ? `${API_TOKEN.length} characters` : 'not set');
  console.log('-----------------------------------');
  
  if (!API_EMAIL || !API_TOKEN) {
    console.error('API credentials not set. Please check your .env file.');
    return;
  }
  
  await testNamedOperation();
  await testAnonymousOperation();
}

runTests().then(() => {
  console.log('-----------------------------------');
  console.log('Tests completed');
}); 