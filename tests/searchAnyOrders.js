// Script to search for any available orders in Printavo
// Run with: node tests/searchAnyOrders.js

// Import environment variables and required packages
require('dotenv').config();
const fetch = require('node-fetch');

// Check if Printavo credentials are set
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
const API_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const GRAPHQL_ENDPOINT = `${API_URL}/graphql`;

if (!API_TOKEN) {
  console.error('Error: NEXT_PUBLIC_PRINTAVO_TOKEN is not set in .env file');
  process.exit(1);
}

console.log('Using Printavo API URL:', API_URL);
console.log('API token is set (first 5 chars):', API_TOKEN.substring(0, 5) + '...');

// Helper function to make GraphQL requests
async function executeGraphQL(query, variables) {
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
        variables,
      }),
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return { error: errorText };
    }
    
    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', JSON.stringify(result.errors, null, 2));
      return { error: result.errors };
    }
    
    return result.data;
  } catch (error) {
    console.error('Error executing GraphQL:', error);
    return { error: error.message };
  }
}

// Get all recent orders
async function getAllRecentOrders() {
  console.log('\n=== Getting Recent Orders ===');
  
  const query = `
    query GetRecentOrders {
      orders(first: 5) {
        edges {
          node {
            id
            visualId
            name
            ... on Invoice {
              orderNumber
            }
            status {
              id
              name
            }
            customer {
              id
              name
              email
            }
            createdAt
            updatedAt
            total
          }
        }
      }
    }
  `;
  
  const data = await executeGraphQL(query, {});
  
  if (data.error) {
    console.log('Failed to get recent orders');
    return [];
  }
  
  const orders = data?.orders?.edges?.map(edge => edge.node) || [];
  console.log(`Found ${orders.length} recent orders`);
  
  if (orders.length > 0) {
    orders.forEach((order, index) => {
      console.log(`\nOrder #${index + 1}:`);
      console.log(`ID: ${order.id}`);
      console.log(`Visual ID: ${order.visualId}`);
      console.log(`Name: ${order.name}`);
      console.log(`Order Number: ${order.orderNumber}`);
      console.log(`Status: ${order.status?.name}`);
      console.log(`Customer: ${order.customer?.name}`);
      console.log(`Total: ${order.total}`);
      console.log(`Created: ${order.createdAt}`);
    });
  }
  
  return orders;
}

// Get all products
async function getAllProducts() {
  console.log('\n=== Getting Products ===');
  
  const query = `
    query GetProducts {
      products(first: 5) {
        edges {
          node {
            id
            name
            description
            price
            cost
          }
        }
      }
    }
  `;
  
  const data = await executeGraphQL(query, {});
  
  if (data.error) {
    console.log('Failed to get products');
    return [];
  }
  
  const products = data?.products?.edges?.map(edge => edge.node) || [];
  console.log(`Found ${products.length} products`);
  
  if (products.length > 0) {
    products.forEach((product, index) => {
      console.log(`\nProduct #${index + 1}:`);
      console.log(`ID: ${product.id}`);
      console.log(`Name: ${product.name}`);
      console.log(`Price: ${product.price}`);
    });
  }
  
  return products;
}

// Get all customers
async function getAllCustomers() {
  console.log('\n=== Getting Customers ===');
  
  const query = `
    query GetCustomers {
      customers(first: 5) {
        edges {
          node {
            id
            name
            email
            phone
          }
        }
      }
    }
  `;
  
  const data = await executeGraphQL(query, {});
  
  if (data.error) {
    console.log('Failed to get customers');
    return [];
  }
  
  const customers = data?.customers?.edges?.map(edge => edge.node) || [];
  console.log(`Found ${customers.length} customers`);
  
  if (customers.length > 0) {
    customers.forEach((customer, index) => {
      console.log(`\nCustomer #${index + 1}:`);
      console.log(`ID: ${customer.id}`);
      console.log(`Name: ${customer.name}`);
      console.log(`Email: ${customer.email}`);
    });
  }
  
  return customers;
}

// Get account info
async function getAccountInfo() {
  console.log('\n=== Getting Account Info ===');
  
  const query = `
    query GetAccountInfo {
      account {
        id
        name
        email
        phone
      }
    }
  `;
  
  const data = await executeGraphQL(query, {});
  
  if (data.error) {
    console.log('Failed to get account info');
    return null;
  }
  
  console.log('Account Info:', JSON.stringify(data.account, null, 2));
  return data.account;
}

// Run all methods
async function runTests() {
  console.log('\n======= SEARCHING FOR ANY AVAILABLE DATA =======\n');
  
  const accountInfo = await getAccountInfo();
  const orders = await getAllRecentOrders();
  const products = await getAllProducts();
  const customers = await getAllCustomers();
  
  console.log('\n======= SEARCH RESULTS SUMMARY =======');
  console.log(`Account Info: ${accountInfo ? 'Found' : 'Not Found'}`);
  console.log(`Orders: ${orders.length} found`);
  console.log(`Products: ${products.length} found`);
  console.log(`Customers: ${customers.length} found`);
  
  if (orders.length > 0) {
    console.log('\nIf you want to search for a specific order, try using one of these IDs:');
    orders.forEach((order, index) => {
      console.log(`${index + 1}. ID: ${order.id}, Visual ID: ${order.visualId || 'N/A'}`);
    });
  }
}

// Run the tests
runTests().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1); 