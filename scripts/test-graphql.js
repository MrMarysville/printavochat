#!/usr/bin/env node

/**
 * GraphQL API Test Script
 * 
 * This script directly tests the Printavo GraphQL API connection,
 * ensuring that all queries include proper operation names.
 */

require('dotenv').config();

// Configuration
const API_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const API_EMAIL = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
const GRAPHQL_ENDPOINT = `${API_URL}/graphql`;

if (!API_EMAIL || !API_TOKEN) {
  console.error('❌ API credentials missing. Please check your .env file');
  process.exit(1);
}

console.log('🔍 Testing GraphQL API connection...');
console.log(`URL: ${GRAPHQL_ENDPOINT}`);
console.log(`Email: ${API_EMAIL}`);
console.log(`Token: ${API_TOKEN ? '✓ Set' : '❌ Missing'}`);

/**
 * Execute a GraphQL query with proper error handling
 */
async function executeGraphQL(query, variables, operationName) {
  console.log(`\n📡 Executing GraphQL query: ${operationName}`);
  
  try {
    const startTime = Date.now();
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'email': API_EMAIL,
        'token': API_TOKEN
      },
      body: JSON.stringify({
        query,
        variables,
        operationName
      })
    });
    const duration = Date.now() - startTime;
    
    // Check for HTTP errors
    if (!response.ok) {
      console.error(`❌ HTTP error ${response.status}: ${response.statusText}`);
      try {
        const errorText = await response.text();
        console.error('Error details:', errorText);
      } catch (e) {
        console.error('Could not parse error response');
      }
      return null;
    }
    
    // Parse the JSON response
    const data = await response.json();
    
    // Check for GraphQL errors
    if (data.errors) {
      console.error('❌ GraphQL errors:', JSON.stringify(data.errors, null, 2));
      return null;
    }
    
    console.log(`✅ Query successful (${duration}ms)`);
    return data;
  } catch (error) {
    console.error('❌ Request failed:', error.message);
    return null;
  }
}

/**
 * Test 1: Account Info Query
 */
async function testAccountInfo() {
  console.log('\n🧪 TEST 1: Account Info Query');
  
  const query = `
    query GetAccountInfo {
      account {
        id
        companyName
        companyEmail
      }
    }
  `;
  
  const result = await executeGraphQL(query, {}, "GetAccountInfo");
  
  if (result?.data?.account) {
    console.log('✅ Account info retrieved successfully');
    console.log(`Company: ${result.data.account.companyName}`);
    console.log(`Email: ${result.data.account.companyEmail}`);
    return true;
  } else {
    console.error('❌ Failed to retrieve account info');
    return false;
  }
}

/**
 * Test 2: Recent Orders Query
 */
async function testRecentOrders() {
  console.log('\n🧪 TEST 2: Recent Orders Query');
  
  const query = `
    query GetRecentOrders {
      invoices(first: 5, sortDescending: true) {
        edges {
          node {
            id
            visualId
            nickname
            createdAt
            total
          }
        }
      }
    }
  `;
  
  const result = await executeGraphQL(query, {}, "GetRecentOrders");
  
  if (result?.data?.invoices?.edges) {
    const orders = result.data.invoices.edges;
    console.log(`✅ Retrieved ${orders.length} recent orders`);
    orders.forEach((edge, i) => {
      console.log(`Order ${i+1}: ID ${edge.node.visualId}, Name: ${edge.node.nickname}, Total: ${edge.node.total}`);
    });
    return true;
  } else {
    console.error('❌ Failed to retrieve recent orders');
    return false;
  }
}

/**
 * Test 3: Chart Data Query
 */
async function testChartData() {
  console.log('\n🧪 TEST 3: Chart Data Query');
  
  const query = `
    query GetOrdersChartData {
      invoices(first: 10, sortDescending: true) {
        edges {
          node {
            id
            createdAt
            total
          }
        }
      }
    }
  `;
  
  const result = await executeGraphQL(query, {}, "GetOrdersChartData");
  
  if (result?.data?.invoices?.edges) {
    console.log(`✅ Chart data retrieved successfully (${result.data.invoices.edges.length} data points)`);
    return true;
  } else {
    console.error('❌ Failed to retrieve chart data');
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n🚀 STARTING API TESTS\n');
  
  const results = {
    accountInfo: await testAccountInfo(),
    recentOrders: await testRecentOrders(),
    chartData: await testChartData()
  };
  
  console.log('\n📊 TEST RESULTS SUMMARY');
  console.log('-----------------------');
  console.log(`Account Info: ${results.accountInfo ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Recent Orders: ${results.recentOrders ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Chart Data: ${results.chartData ? '✅ PASS' : '❌ FAIL'}`);
  
  const passCount = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\nOverall: ${passCount}/${totalTests} tests passed`);
  
  if (passCount === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! GraphQL API is working correctly.');
    return 0;
  } else {
    console.error(`\n❌ ${totalTests - passCount} TESTS FAILED. Check the logs above for details.`);
    return 1;
  }
}

// Run all tests
runTests()
  .then(exitCode => process.exit(exitCode))
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  }); 