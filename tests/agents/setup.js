// Jest setup file for agent tests
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.test') });

// Suppress punycode deprecation warnings
const originalEmitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  // Check if it's a punycode deprecation warning
  if (
    warning.includes('DEP0040') || 
    warning.includes('punycode module is deprecated') ||
    (args[0] === 'DeprecationWarning' && warning.includes('punycode'))
  ) {
    // Suppress this specific warning
    return;
  }
  
  // Let all other warnings through
  return originalEmitWarning(warning, ...args);
};

// Fall back to default test values if environment variables aren't set
if (!process.env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = 'test_openai_key';
if (!process.env.PRINTAVO_API_URL) process.env.PRINTAVO_API_URL = 'https://test.printavo.com/api/v2';
if (!process.env.PRINTAVO_EMAIL) process.env.PRINTAVO_EMAIL = 'test@example.com';
if (!process.env.PRINTAVO_TOKEN) process.env.PRINTAVO_TOKEN = 'test_token';
if (!process.env.SANMAR_API_URL) process.env.SANMAR_API_URL = 'https://test-api.sanmar.com';
if (!process.env.SANMAR_USERNAME) process.env.SANMAR_USERNAME = 'test_user';
if (!process.env.SANMAR_PASSWORD) process.env.SANMAR_PASSWORD = 'test_password';
if (!process.env.SANMAR_FTP_HOST) process.env.SANMAR_FTP_HOST = 'test-ftp.sanmar.com';
if (!process.env.SANMAR_FTP_USERNAME) process.env.SANMAR_FTP_USERNAME = 'test_ftp_user';
if (!process.env.SANMAR_FTP_PASSWORD) process.env.SANMAR_FTP_PASSWORD = 'test_ftp_password';

// Increase Jest timeout for API calls
jest.setTimeout(15000);

// Mock fetch globally if needed in Node.js environment
if (typeof window === 'undefined') {
  global.fetch = require('node-fetch');
}

// Add afterEach hook to clean up setTimeout and setInterval instances
const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;
const timeoutIds = new Set();
const intervalIds = new Set();

global.setTimeout = (...args) => {
  const id = originalSetTimeout(...args);
  timeoutIds.add(id);
  return id;
};

global.setInterval = (...args) => {
  const id = originalSetInterval(...args);
  intervalIds.add(id);
  return id;
};

afterEach(() => {
  // Clear all timeouts and intervals to prevent test leaks
  timeoutIds.forEach(id => clearTimeout(id));
  intervalIds.forEach(id => clearInterval(id));
  timeoutIds.clear();
  intervalIds.clear();
});

console.log('Agent test setup complete'); 