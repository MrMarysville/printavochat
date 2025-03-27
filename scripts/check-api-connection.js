/**
 * Printavo API Connection Check
 * 
 * This script runs at application startup to verify that:
 * 1. The Printavo API URL is configured correctly
 * 2. The application can connect to the Printavo API
 * 3. The authentication credentials are valid
 */

// Suppress punycode deprecation warning
process.removeAllListeners('warning');
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && 
      warning.message && 
      warning.message.includes('punycode')) {
    // Ignore punycode deprecation warning
    return;
  }
  // Still log other warnings
  console.warn(warning.name, warning.message);
});

const fetch = require('node-fetch');
require('dotenv').config();

// Check API environment variables
const checkApiConfig = () => {
  const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL;
  const apiEmail = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
  const apiToken = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
  
  let hasErrors = false;
  
  // Check if required environment variables are set
  if (!apiUrl) {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: NEXT_PUBLIC_PRINTAVO_API_URL is not set');
    hasErrors = true;
  }
  
  if (!apiEmail) {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: NEXT_PUBLIC_PRINTAVO_EMAIL is not set');
    hasErrors = true;
  }
  
  if (!apiToken) {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: NEXT_PUBLIC_PRINTAVO_TOKEN is not set');
    hasErrors = true;
  }
  
  // Check if API URL is in the correct format
  if (apiUrl && apiUrl.startsWith('https://')) {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: NEXT_PUBLIC_PRINTAVO_API_URL should not include https://');
    console.error('\x1b[31m%s\x1b[0m', `   Current value: ${apiUrl}`);
    console.error('\x1b[31m%s\x1b[0m', '   It should be: www.printavo.com/api/v2');
    hasErrors = true;
  }
  
  if (apiUrl && apiUrl !== 'www.printavo.com/api/v2') {
    console.error('\x1b[31m%s\x1b[0m', '❌ ERROR: NEXT_PUBLIC_PRINTAVO_API_URL must be exactly www.printavo.com/api/v2');
    console.error('\x1b[31m%s\x1b[0m', `   Current value: ${apiUrl}`);
    hasErrors = true;
  }
  
  return !hasErrors;
};

// Test API connection
const testApiConnection = async () => {
  const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL;
  const apiEmail = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
  const apiToken = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
  
  if (!apiUrl || !apiEmail || !apiToken) {
    return false;
  }
  
  // Using the base URL without appending /graphql
  const url = `https://${apiUrl}`;
  
  // Test query to check if we can connect to the API
  const query = `
    query CheckConnection {
      account {
        id
        companyName
      }
    }
  `;
  
  try {
    console.log('\x1b[36m%s\x1b[0m', `Testing connection to Printavo API at ${url}...`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'email': apiEmail,
        'token': apiToken
      },
      body: JSON.stringify({
        query,
        operationName: 'CheckConnection'
      })
    });
    
    if (!response.ok) {
      console.error('\x1b[31m%s\x1b[0m', `❌ API connection failed: ${response.status} ${response.statusText}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.errors) {
      console.error('\x1b[31m%s\x1b[0m', '❌ API returned errors:');
      data.errors.forEach(error => {
        console.error('\x1b[31m%s\x1b[0m', `   - ${error.message}`);
      });
      return false;
    }
    
    if (data.data && data.data.account) {
      console.log('\x1b[32m%s\x1b[0m', '✅ Successfully connected to Printavo API');
      console.log('\x1b[32m%s\x1b[0m', `   Company: ${data.data.account.companyName}`);
      return true;
    } else {
      console.error('\x1b[31m%s\x1b[0m', '❌ No account data returned from API');
      return false;
    }
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', '❌ API connection error:');
    console.error('\x1b[31m%s\x1b[0m', `   ${error.message}`);
    return false;
  }
};

// Main function
(async () => {
  console.log('\x1b[36m%s\x1b[0m', '🔍 Checking Printavo API configuration...');
  
  // Check the API configuration
  const configValid = checkApiConfig();
  
  if (!configValid) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Printavo API configuration has errors. Please fix them before continuing.');
    process.exit(1);
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✅ Printavo API configuration looks good');
  }
  
  // Test the API connection
  const connectionSuccess = await testApiConnection();
  
  if (!connectionSuccess) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Failed to connect to Printavo API. Please check your configuration and credentials.');
    process.exit(1);
  }
  
  console.log('\x1b[32m%s\x1b[0m', '✅ Printavo API check completed successfully');
})(); 