// Script to test Printavo API connection
require('dotenv').config({ path: '.env.local' });
const fetch = require('node-fetch');

const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL;
const email = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
const token = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;

console.log('Testing Printavo API connection with:');
console.log(`API URL: ${apiUrl}`);
console.log(`Email: ${email}`);
console.log(`Token: ${token ? '✓ Set' : '✗ Not set'}`);

async function testConnection() {
  try {
    // Make a request to the Printavo API to get account info
    const response = await fetch(`${apiUrl}/customers?limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'email': email,
        'token': token,
      },
    });

    console.log(`Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Connection successful!');
      console.log('Account data:', JSON.stringify(data, null, 2));
      return true;
    } else {
      const errorText = await response.text();
      console.error('Connection failed!');
      console.error('Error:', errorText);
      return false;
    }
  } catch (error) {
    console.error('Error connecting to Printavo API:', error);
    return false;
  }
}

testConnection();
