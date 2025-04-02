/**
 * OpenAI Assistants API Test
 * 
 * This script tests if your OpenAI API key can access the Assistants API.
 * 
 * Run with: node test-openai-assistants.js
 */

require('dotenv').config();

async function testOpenAIAssistants() {
  console.log('🔍 TESTING OPENAI ASSISTANTS API\n');
  
  // Check if API key is set
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in .env file');
    return false;
  }
  
  console.log('ℹ️ Organization-scoped API keys often start with "sk-org-" or "sk-proj-"');
  console.log('ℹ️ Your API key starts with:', apiKey.substring(0, 10) + '...');
  
  // Check if Assistants is enabled
  if (process.env.USE_OPENAI_ASSISTANTS !== 'true') {
    console.log('⚠️ USE_OPENAI_ASSISTANTS is not set to "true" in your .env file');
    console.log('   Setting it to "true" to continue with testing...');
  }
  
  // Check if assistant ID is set
  const assistantId = process.env.PRINTAVO_ASSISTANT_ID;
  if (!assistantId) {
    console.error('❌ PRINTAVO_ASSISTANT_ID is not set in .env file');
    return false;
  }
  
  try {
    console.log('🔄 Testing connection to OpenAI API (models endpoint)...');
    
    // First test basic API connectivity
    const modelsResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!modelsResponse.ok) {
      console.error(`❌ Models API request failed: ${modelsResponse.status} ${modelsResponse.statusText}`);
      
      try {
        const errorData = await modelsResponse.json();
        if (errorData && errorData.error) {
          console.error(`❌ Error details: ${errorData.error.message}`);
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      return false;
    }
    
    console.log('✅ Successfully connected to OpenAI API');
    
    // Now test Assistants API
    console.log(`🔄 Testing Assistants API with assistant ID: ${assistantId}`);
    
    const assistantsResponse = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });
    
    if (!assistantsResponse.ok) {
      console.error(`❌ Assistants API request failed: ${assistantsResponse.status} ${assistantsResponse.statusText}`);
      
      try {
        const errorData = await assistantsResponse.json();
        if (errorData && errorData.error) {
          console.error(`❌ Error details: ${errorData.error.message}`);
          
          if (assistantsResponse.status === 404) {
            console.error(`❌ The assistant ID "${assistantId}" was not found. Check your PRINTAVO_ASSISTANT_ID in .env`);
          } else if (assistantsResponse.status === 401) {
            console.error(`❌ Authentication failed. Your API key may not have access to the Assistants API.`);
          }
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      return false;
    }
    
    // Parse the response
    const assistantData = await assistantsResponse.json();
    
    if (assistantData && assistantData.id) {
      console.log(`✅ Successfully accessed assistant "${assistantData.name || 'Unnamed'}" (ID: ${assistantData.id})`);
      console.log(`✅ Assistant model: ${assistantData.model}`);
      console.log(`✅ Created at: ${new Date(assistantData.created_at * 1000).toLocaleString()}`);
      
      return true;
    } else {
      console.error('❌ Unexpected response format from Assistants API');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error testing OpenAI Assistants API: ${error.message}`);
    return false;
  }
}

// Run the test
testOpenAIAssistants()
  .then(success => {
    if (success) {
      console.log('\n✅ Your OpenAI API key can access the Assistants API!');
      console.log('✅ Your system is correctly configured to use OpenAI agents.');
    } else {
      console.log('\n❌ OpenAI Assistants API test failed. Please check the error messages above.');
    }
  })
  .catch(error => {
    console.error(`\n❌ Unexpected error: ${error.message}`);
  }); 