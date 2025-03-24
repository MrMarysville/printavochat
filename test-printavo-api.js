const fetch = require('node-fetch');

// Credentials
const EMAIL = 'sales@kingclothing.com';
const TOKEN = 'rEPQzTtowT_MQVbY1tfLtg';

// API URLs to test
const ENDPOINTS = [
  'https://www.printavo.com/api/v2/graphql',
  'https://api.printavo.com/api/v2/graphql',
  'https://www.printavo.com/api/graphql',
  'https://api.printavo.com/graphql',
  'https://www.printavo.com/graphql',
  'https://www.printavo.com/api/v2',
  'https://api.printavo.com/v2'
];

// Authentication methods to test
const AUTH_METHODS = [
  {
    name: 'Headers: email + token',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'email': EMAIL,
      'token': TOKEN
    }
  },
  {
    name: 'Headers: Authorization Bearer',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    }
  },
  {
    name: 'Headers: All combined',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'email': EMAIL,
      'token': TOKEN,
      'Authorization': `Bearer ${TOKEN}`
    }
  },
  {
    name: 'Query params: email + token',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    queryParams: `?email=${encodeURIComponent(EMAIL)}&token=${encodeURIComponent(TOKEN)}`
  }
];

// Test queries
const QUERIES = [
  {
    name: 'Account query',
    query: `
      query {
        account {
          id
          name
          email
        }
      }
    `
  },
  {
    name: 'User query',
    query: `
      query {
        user {
          id
          email
        }
      }
    `
  },
  {
    name: 'Simple orders query',
    query: `
      query {
        orders(first: 1) {
          nodes {
            id
          }
        }
      }
    `
  }
];

async function testEndpoint(endpoint, authMethod, query) {
  try {
    const url = authMethod.queryParams ? `${endpoint}${authMethod.queryParams}` : endpoint;
    
    console.log(`Testing ${endpoint} with ${authMethod.name}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: authMethod.headers,
      body: JSON.stringify({
        query: query.query
      }),
      timeout: 10000 // 10 second timeout
    });
    
    console.log(`Status: ${response.status} ${response.statusText}`);
    
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      console.log('Response data:', JSON.stringify(data, null, 2));
      
      if (data.data && Object.keys(data.data).length > 0) {
        console.log('✅ SUCCESS! This endpoint and auth method worked!');
        return true;
      } else if (data.errors) {
        console.log('❌ GraphQL errors:', data.errors);
        return false;
      } else {
        console.log('❌ No data returned');
        return false;
      }
    } catch (e) {
      console.log('❌ Invalid JSON response:', text);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  for (const endpoint of ENDPOINTS) {
    for (const authMethod of AUTH_METHODS) {
      for (const query of QUERIES) {
        console.log('\n==================================================');
        console.log(`Testing ${endpoint} with ${authMethod.name} and ${query.name}`);
        console.log('==================================================');
        
        const success = await testEndpoint(endpoint, authMethod, query);
        
        if (success) {
          console.log(`
==========================================================================
✅ SUCCESS! Found working configuration:
- Endpoint: ${endpoint}
- Auth Method: ${authMethod.name}
- Query: ${query.name}
==========================================================================
          `);
          return { endpoint, authMethod, query };
        }
      }
    }
  }
  
  console.log('❌ No working configuration found. All combinations failed.');
  return null;
}

// Run the tests
runAllTests().then(result => {
  if (result) {
    console.log('Use these settings in your application:');
    console.log(`NEXT_PUBLIC_PRINTAVO_API_URL=${result.endpoint.replace('/graphql', '')}`);
    console.log('Authentication method:', result.authMethod.name);
  }
});

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