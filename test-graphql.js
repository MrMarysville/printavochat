const fetch = require('node-fetch');

// Test credentials
const API_EMAIL = 'sales@kingclothing.com';
const API_TOKEN = 'rEPQzTtowT_MQVbY1tfLtg';

// Function to test the GraphQL endpoint with the correct field names
async function testGraphQLEndpoint() {
  const endpoint = 'https://www.printavo.com/api/v2';
  
  // Headers based on documentation
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'email': API_EMAIL,
    'token': API_TOKEN
  };
  
  // Query using correct fields from Account schema
  const query = `
    query {
      account {
        id
        companyName
        companyEmail
        phone
        website
        timestamps {
          createdAt
          updatedAt
        }
      }
    }
  `;
  
  console.log('Testing GraphQL endpoint:', endpoint);
  console.log('Headers:', JSON.stringify(headers, null, 2));
  console.log('Query:', query);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({ query })
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.data && data.data.account) {
        console.log('✅ SUCCESS! Account data received');
        return true;
      } else if (data.errors) {
        console.log('❌ GraphQL errors:', data.errors);
        return false;
      } else {
        console.log('❌ No account data returned');
        return false;
      }
    } catch (e) {
      console.log('❌ Invalid JSON response:', text.substring(0, 500));
      return false;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return false;
  }
}

// Run the test
testGraphQLEndpoint().then(success => {
  if (success) {
    console.log('Test successful! API connection works.');
  } else {
    console.log('Test failed. API connection not working.');
  }
}); 