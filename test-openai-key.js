/**
 * Simple OpenAI API Key Test
 * 
 * This script tests if your OpenAI API key is valid by making a direct API call.
 * 
 * Run with: node test-openai-key.js
 */

require('dotenv').config();

// Main function to test the API key
async function testOpenAIKey() {
  console.log('🔍 TESTING OPENAI API KEY\n');
  
  // Check if API key is set
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('❌ OPENAI_API_KEY is not set in .env file');
    return false;
  }
  
  // Check API key format
  if (!apiKey.startsWith('sk-')) {
    console.error('❌ OPENAI_API_KEY has incorrect format (should start with "sk-")');
    return false;
  }
  
  console.log('✅ OPENAI_API_KEY is set and has the correct format');
  
  try {
    // Make a request to the models endpoint to check if the key is valid
    console.log('🔄 Testing connection to OpenAI API...');
    
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Check the response status
    if (!response.ok) {
      const statusText = response.statusText || `${response.status}`;
      console.error(`❌ API request failed: ${statusText}`);
      
      if (response.status === 401) {
        console.error('❌ Authentication failed. Your API key is invalid or has expired.');
      } else if (response.status === 429) {
        console.error('❌ Rate limit exceeded. Your account may have reached its quota.');
      }
      
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          console.error(`❌ Error details: ${errorData.error.message}`);
        }
      } catch (e) {
        // Ignore JSON parsing errors
      }
      
      return false;
    }
    
    // Parse the response
    const data = await response.json();
    
    if (data && data.data && Array.isArray(data.data)) {
      console.log(`✅ Successfully authenticated with OpenAI API`);
      console.log(`✅ Found ${data.data.length} available models`);
      
      // Check if the model specified in .env is available
      const specifiedModel = process.env.OPENAI_MODEL;
      if (specifiedModel) {
        const modelExists = data.data.some(model => model.id === specifiedModel);
        if (modelExists) {
          console.log(`✅ Your specified model "${specifiedModel}" is available`);
        } else {
          console.log(`⚠️ Your specified model "${specifiedModel}" was not found in the available models`);
        }
      }
      
      return true;
    } else {
      console.error('❌ Unexpected response format from OpenAI API');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error testing OpenAI API key: ${error.message}`);
    return false;
  }
}

// Run the test
testOpenAIKey()
  .then(success => {
    if (success) {
      console.log('\n✅ Your OpenAI API key is valid and working!');
    } else {
      console.log('\n❌ OpenAI API key validation failed. Please check your API key.');
    }
  })
  .catch(error => {
    console.error(`\n❌ Unexpected error: ${error.message}`);
  }); 