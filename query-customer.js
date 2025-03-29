const fetch = require('node-fetch');
require('dotenv').config();

const API_URL = process.env.PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const EMAIL = process.env.PRINTAVO_EMAIL || 'sales@kingclothing.com';
const TOKEN = process.env.PRINTAVO_TOKEN || 'rEPQzTtowT_MQVbY1tfLtg';

async function searchCustomers(query) {
  const graphqlQuery = `
    query SearchCustomers($query: String!, $first: Int!) {
      customers(first: $first) {
        edges {
          node {
            id
            companyName
            primaryContact {
              id
              fullName
              email
            }
          }
        }
      }
    }
  `;

  const variables = {
    query: query,
    first: 20
  };

  try {
    const response = await fetch(`${API_URL}/graphql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'email': EMAIL,
        'token': TOKEN
      },
      body: JSON.stringify({
        query: graphqlQuery,
        variables
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.error('GraphQL errors:', result.errors);
      return [];
    }

    const customers = result.data.customers.edges.map(edge => edge.node);
    
    // Filter customers by name containing the search query
    return customers.filter(customer => 
      customer.companyName && 
      customer.companyName.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching customers:', error);
    return [];
  }
}

async function main() {
  const searchQuery = 'OMC';
  console.log(`Searching for customers matching "${searchQuery}"...`);
  
  const customers = await searchCustomers(searchQuery);
  
  if (customers.length === 0) {
    console.log('No customers found matching the query.');
    return;
  }
  
  console.log(`Found ${customers.length} matching customers:`);
  
  customers.forEach((customer, index) => {
    console.log(`\nCustomer ${index + 1}:`);
    console.log(`ID: ${customer.id}`);
    console.log(`Company Name: ${customer.companyName}`);
    
    if (customer.primaryContact) {
      console.log(`Primary Contact ID: ${customer.primaryContact.id}`);
      console.log(`Primary Contact Name: ${customer.primaryContact.fullName}`);
      console.log(`Primary Contact Email: ${customer.primaryContact.email}`);
    } else {
      console.log('No primary contact found');
    }
  });
}

main(); 