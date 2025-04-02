// Simple script to test the /api/agent endpoint with the printavo_list_orders operation
const fetch = require('node-fetch');

async function testAgentApi() {
  try {
    console.log('Testing /api/agent endpoint with printavo_list_orders operation...');
    
    const response = await fetch('http://localhost:3000/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'printavo_list_orders',
        params: { 
          first: 5,
          sortOn: 'CREATED_AT_DESC'
        }
      }),
    });
    
    const responseText = await response.text();
    console.log('Raw API Response:', responseText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
    }
    
    try {
      const result = JSON.parse(responseText);
      console.log('Parsed API Response:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log(`Retrieved ${result.data?.orders?.length || 0} orders`);
        if (result.data?.orders?.length > 0) {
          console.log('First order:', JSON.stringify(result.data.orders[0], null, 2));
        }
      } else {
        console.log('API call failed:', result.error);
      }
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
    }
    
  } catch (error) {
    console.error('Error testing agent API:', error);
  }
}

testAgentApi();
