/**
 * OpenAI API Key Fix Utility
 * 
 * This script helps diagnose and fix issues with your OpenAI API key.
 * 
 * Run with: node fix-openai-key.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { exec } = require('child_process');
require('dotenv').config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask user for input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Update .env file with new API key
function updateEnvFile(newApiKey) {
  try {
    const envPath = path.join(process.cwd(), '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace the API key
    envContent = envContent.replace(
      /OPENAI_API_KEY=.*/,
      `OPENAI_API_KEY=${newApiKey}`
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(envPath, envContent);
    
    console.log('✅ .env file updated successfully.');
    return true;
  } catch (error) {
    console.error(`❌ Error updating .env file: ${error.message}`);
    return false;
  }
}

// Test if API key works
async function testApiKey(apiKey) {
  console.log('🔄 Testing new API key...');
  
  return new Promise((resolve) => {
    // Create a temporary test script
    const tempScriptPath = path.join(process.cwd(), 'temp-api-test.js');
    const testScript = `
      const https = require('https');
      
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/models',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ${apiKey}',
          'Content-Type': 'application/json'
        }
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log('API_KEY_VALID');
            process.exit(0);
          } else {
            try {
              const errorData = JSON.parse(data);
              console.error(errorData.error?.message || 'Unknown error');
            } catch (e) {
              console.error('Error parsing response');
            }
            process.exit(1);
          }
        });
      });
      
      req.on('error', (error) => {
        console.error('Connection error:', error.message);
        process.exit(1);
      });
      
      req.end();
    `;
    
    fs.writeFileSync(tempScriptPath, testScript);
    
    // Execute the test script
    exec(`node ${tempScriptPath}`, (error, stdout, stderr) => {
      // Clean up temp file
      try {
        fs.unlinkSync(tempScriptPath);
      } catch (e) {
        // Ignore cleanup errors
      }
      
      if (stdout.includes('API_KEY_VALID')) {
        console.log('✅ API key is valid!');
        resolve(true);
      } else {
        console.error('❌ API key test failed:');
        if (stderr) {
          console.error(stderr);
        }
        if (stdout && !stdout.includes('API_KEY_VALID')) {
          console.error(stdout);
        }
        resolve(false);
      }
    });
  });
}

// Main function
async function main() {
  console.log('🔧 OPENAI API KEY FIX UTILITY\n');
  console.log('This utility will help you fix issues with your OpenAI API key.\n');
  
  // Check current API key
  const currentApiKey = process.env.OPENAI_API_KEY;
  if (currentApiKey) {
    console.log(`Current API key starts with: ${currentApiKey.substring(0, 10)}...`);
  } else {
    console.log('❌ No API key is currently set in your .env file.');
  }
  
  // Guide the user
  console.log('\n🔑 OpenAI API Key Format Guidelines:');
  console.log('- Organization-scoped API keys start with "sk-org-..."');
  console.log('- Project API keys start with "sk-proj-..." (most common for assistants)');
  console.log('- Personal API keys start with "sk-..." (older format)');
  console.log('\nMake sure you are using a project-scoped API key for Assistants API.');
  console.log('You can create a new API key at: https://platform.openai.com/api-keys\n');
  
  // Ask for new API key
  const newApiKey = await askQuestion('📝 Enter your new OpenAI API key: ');
  
  if (!newApiKey) {
    console.log('❌ No API key provided. Exiting...');
    rl.close();
    return;
  }
  
  // Validate format
  if (!newApiKey.startsWith('sk-')) {
    console.log('⚠️ Warning: API key does not start with "sk-". This may not be a valid OpenAI API key.');
    const confirm = await askQuestion('Continue anyway? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Operation cancelled. Exiting...');
      rl.close();
      return;
    }
  }
  
  // Update .env file
  const updated = updateEnvFile(newApiKey);
  if (!updated) {
    console.log('❌ Failed to update .env file. Please update it manually.');
    rl.close();
    return;
  }
  
  // Test the new API key
  const isValid = await testApiKey(newApiKey);
  
  if (isValid) {
    console.log('\n✅ Your OpenAI API key has been successfully updated and verified!');
    console.log('\nNext steps:');
    console.log('1. Restart your Next.js server if it\'s running');
    console.log('2. Run node test-openai-assistants.js to verify the assistant setup');
  } else {
    console.log('\n❌ Your API key was updated in .env but the test failed.');
    console.log('Please double-check your API key and try again.');
  }
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error(`Unexpected error: ${error.message}`);
  rl.close();
}); 