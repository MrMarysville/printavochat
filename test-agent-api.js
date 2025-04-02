// Simple script to test the /api/agent endpoint with the printavo_list_orders operation
const fetch = require('node-fetch');

async function testAgentApi() {
  try {
    console.log('Testing /api/agent endpoint with printavo_list_orders operation...');
    
    const response = await fetch('http://localhost:3001/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'printavo_list_orders',
        params: { first: 5 }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API Response:', JSON.stringify(result, null, 2));
    
    return result;
  } catch (error) {
    console.error('Error testing agent API:', error);
    throw error;
  }
}

testAgentApi()
  .then(result => {
    console.log('Test completed successfully!');
    if (result.success) {
      console.log(`Retrieved ${result.data?.orders?.length || 0} orders`);
    } else {
      console.log('API call failed:', result.error);
    }
  })
  .catch(error => {
    console.error('Test failed:', error);
  });
