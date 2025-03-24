// Manual test for chat widget Visual ID search
// Run with: node tests/manualChatWidgetTest.js

// Import environment variables and required packages
require('dotenv').config();
const fetch = require('node-fetch');

// Check if API route is available
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

console.log('Using API URL:', API_URL);

// Function to simulate a chat widget message
async function testChatWidgetVisualIdSearch(message) {
  console.log(`\nSending chat message: "${message}"`);
  
  const CHAT_API_ENDPOINT = `${API_URL}/api/chat`;
  
  // Generate a unique user ID
  const userId = 'test-' + Math.random().toString(36).substr(2, 9);
  
  // Create a chat request
  const chatRequest = {
    messages: [
      {
        id: userId,
        content: message,
        role: 'user',
        timestamp: new Date().toISOString()
      }
    ]
  };
  
  try {
    const response = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chatRequest),
    });
    
    console.log('Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return null;
    }
    
    const result = await response.json();
    console.log('Chat API Response:', JSON.stringify(result, null, 2));
    
    // Check if we have order data
    if (result.richData && (result.richData.type === 'order' || result.richData.type === 'orderList')) {
      console.log('Order data found in response!');
      return result.richData.content;
    } else {
      console.log('No order data found in response');
      return null;
    }
  } catch (error) {
    console.error('Error calling chat API:', error);
    return null;
  }
}

// Test with various Visual ID commands
async function runTest() {
  const testCases = [
    '9435', // Standalone Visual ID
    'visual id 9435', // Visual ID with prefix
    'show order 9435', // Show order with Visual ID
    'search orders with visual id 9435', // Search orders with Visual ID filter
    'find order with visual id 9435' // Find with Visual ID command
  ];
  
  for (const testCase of testCases) {
    console.log(`\n=== Testing chat command: "${testCase}" ===`);
    const result = await testChatWidgetVisualIdSearch(testCase);
    
    if (result) {
      console.log(`✅ Successfully retrieved order data with command: "${testCase}"`);
    } else {
      console.log(`❌ Could not retrieve order data with command: "${testCase}"`);
    }
  }
}

// Run the tests
runTest().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
}); 