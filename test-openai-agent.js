/**
 * OpenAI Agent Configuration Test
 * 
 * This script tests if your OpenAI API key is correctly configured
 * and if the agents can successfully execute operations.
 * 
 * Run with: node test-openai-agent.js
 */

require('dotenv').config();
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Check if OpenAI API key is set
const checkApiKey = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in .env file');
    return false;
  }
  
  if (apiKey.startsWith('sk-') === false) {
    console.error('❌ OPENAI_API_KEY does not have the correct format (should start with "sk-")');
    return false;
  }
  
  console.log('✅ OPENAI_API_KEY is set and has the correct format');
  return true;
};

// Test direct OpenAI API connection
const testOpenAIConnection = async () => {
  try {
    console.log('🔄 Testing direct connection to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: `HTTP error ${response.status}` }}));
      console.error('❌ Failed to connect to OpenAI API:', error.error?.message || 'Unknown error');
      return false;
    }
    
    const data = await response.json().catch(() => ({}));
    
    if (data.data && Array.isArray(data.data)) {
      console.log(`✅ Successfully connected to OpenAI API. Found ${data.data.length} models.`);
      return true;
    } else {
      console.error('❌ Unexpected response format from OpenAI API');
      console.error('Response:', JSON.stringify(data).slice(0, 100) + '...');
      return false;
    }
  } catch (error) {
    console.error('❌ Error connecting to OpenAI API:', error.message);
    return false;
  }
};

// Test agent endpoint
const testAgentEndpoint = async () => {
  try {
    console.log('🔄 Testing agent endpoint...');
    
    // Simple operation that should work with any properly configured agent
    const operation = 'printavo_list_statuses';
    
    const response = await fetch('http://localhost:3000/api/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        operation,
        params: {}
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => `HTTP error ${response.status}`);
      console.error('❌ Failed to call agent endpoint:', errorText);
      return false;
    }
    
    const result = await response.json().catch(() => ({ success: false, error: 'Failed to parse JSON response' }));
    
    if (result.success) {
      console.log('✅ Agent endpoint working. Response received:', JSON.stringify(result.data, null, 2).slice(0, 150) + '...');
      return true;
    } else {
      console.error('❌ Agent operation failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing agent endpoint:', error.message);
    console.log('⚠️ Make sure your Next.js server is running on port 3000');
    return false;
  }
};

// Execute a direct agent operation
const testDirectAgentOperation = async () => {
  try {
    console.log('🔄 Testing direct agent operation with OpenAI...');
    
    // For this test, we'll use the OpenAI API directly with a simple completion request
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that verifies OpenAI API connectivity.'
          },
          {
            role: 'user',
            content: 'Respond with "OpenAI API connection successful" if you receive this message.'
          }
        ],
        max_tokens: 50
      })
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: `HTTP error ${response.status}` }}));
      console.error('❌ Failed to execute OpenAI completion:', error.error?.message || 'Unknown error');
      console.error('Status:', response.status);
      return false;
    }
    
    const data = await response.json().catch(() => ({}));
    
    if (data.choices && data.choices.length > 0) {
      const message = data.choices[0].message.content.trim();
      console.log(`✅ OpenAI API completion successful. Response: "${message}"`);
      return true;
    } else {
      console.error('❌ Unexpected response format from OpenAI API completion');
      console.error('Response:', JSON.stringify(data).slice(0, 100) + '...');
      return false;
    }
  } catch (error) {
    console.error('❌ Error executing OpenAI completion:', error.message);
    return false;
  }
};

// Test OpenAI Assistants API if enabled
const testAssistantsAPI = async () => {
  if (process.env.USE_OPENAI_ASSISTANTS !== 'true') {
    console.log('ℹ️ OpenAI Assistants API is not enabled in .env');
    return true; // Not a failure
  }
  
  const assistantId = process.env.PRINTAVO_ASSISTANT_ID;
  if (!assistantId) {
    console.error('❌ PRINTAVO_ASSISTANT_ID is not set in .env file');
    return false;
  }
  
  try {
    console.log('🔄 Testing OpenAI Assistants API...');
    
    // Get assistant details
    const response = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v1'
      }
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: `HTTP error ${response.status}` }}));
      console.error('❌ Failed to retrieve assistant:', error.error?.message || 'Unknown error');
      return false;
    }
    
    const data = await response.json().catch(() => ({}));
    
    if (data.id) {
      console.log(`✅ Successfully connected to Assistants API. Assistant name: "${data.name || 'Unnamed'}"`);
      return true;
    } else {
      console.error('❌ Unexpected response format from Assistants API');
      console.error('Response:', JSON.stringify(data).slice(0, 100) + '...');
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing Assistants API:', error.message);
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('🔍 STARTING OPENAI AGENT CONFIGURATION TEST\n');
  
  // Test 1: Check API key format
  const apiKeyValid = checkApiKey();
  if (!apiKeyValid) {
    console.log('\n❌ API key check failed. Please check your .env file.');
    process.exit(1);
  }
  console.log();
  
  // Test 2: Test OpenAI API connection
  const openaiConnected = await testOpenAIConnection();
  if (!openaiConnected) {
    console.log('\n❌ OpenAI API connection test failed. Please check your API key and internet connection.');
    process.exit(1);
  }
  console.log();
  
  // Test 3: Test direct agent operation
  const directOperationSuccessful = await testDirectAgentOperation();
  if (!directOperationSuccessful) {
    console.log('\n❌ Direct OpenAI operation test failed. Please check your API key permissions.');
    process.exit(1);
  }
  console.log();
  
  // Test 4: Test Assistants API if enabled
  const assistantsApiWorking = await testAssistantsAPI();
  if (!assistantsApiWorking && process.env.USE_OPENAI_ASSISTANTS === 'true') {
    console.log('\n❌ OpenAI Assistants API test failed. Please check your assistant ID and API permissions.');
    process.exit(1);
  }
  console.log();
  
  // Test 5: Test agent endpoint (requires server to be running)
  console.log('⚠️ The next test requires your Next.js server to be running on http://localhost:3000');
  console.log('⚠️ If your server is not running, press Ctrl+C to exit or run the server in another terminal');
  console.log('⚠️ Press Enter to continue or Ctrl+C to exit...');
  
  await new Promise(resolve => {
    process.stdin.once('data', () => {
      resolve();
    });
  });
  
  const agentEndpointWorking = await testAgentEndpoint();
  if (!agentEndpointWorking) {
    console.log('\n⚠️ Agent endpoint test failed. This could be because the server is not running or there are issues with the agent implementation.');
  }
  
  console.log('\n🎉 All OpenAI API tests completed!\n');
  
  if (apiKeyValid && openaiConnected && directOperationSuccessful && 
      (assistantsApiWorking || process.env.USE_OPENAI_ASSISTANTS !== 'true')) {
    console.log('✅ Your OpenAI API key is correctly configured and working!');
    
    if (agentEndpointWorking) {
      console.log('✅ The agent endpoint is also working correctly!');
    } else {
      console.log('⚠️ The agent endpoint test failed, but this could be because the server is not running.');
      console.log('   To test the agent endpoint, make sure your Next.js server is running and try again.');
    }
  } else {
    console.log('❌ There were issues with your OpenAI API configuration. Please review the errors above.');
  }
};

// Run the tests
runTests().catch(error => {
  console.error('Unexpected error during tests:', error);
  process.exit(1);
}); 