/**
 * Environment variable loading utility
 * This file ensures environment variables are properly loaded
 */

import dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env files with priority
console.log('Loading environment variables...');

// Path to .env files
const envPath = path.resolve(process.cwd(), '.env');
const envLocalPath = path.resolve(process.cwd(), '.env.local');

// Check which files exist
console.log('.env exists:', fs.existsSync(envPath));
console.log('.env.local exists:', fs.existsSync(envLocalPath));

// Load .env first, then override with .env.local if it exists
dotenv.config({ path: envPath });
if (fs.existsSync(envLocalPath)) {
  console.log('Loading .env.local for overrides');
  dotenv.config({ path: envLocalPath });
}

// Re-export environment variables with default values for easy access
export const SANMAR_USERNAME = process.env.SANMAR_USERNAME || '';
export const SANMAR_PASSWORD = process.env.SANMAR_PASSWORD || '';
export const SANMAR_CUSTOMER_NUMBER = process.env.SANMAR_CUSTOMER_NUMBER || '';
export const SANMAR_CUSTOMER_IDENTIFIER = process.env.SANMAR_CUSTOMER_IDENTIFIER || '';

export const SANMAR_FTP_HOST = process.env.SANMAR_FTP_HOST || '';
export const SANMAR_FTP_USERNAME = process.env.SANMAR_FTP_USERNAME || '';
export const SANMAR_FTP_PASSWORD = process.env.SANMAR_FTP_PASSWORD || '';
export const SANMAR_FTP_PORT = process.env.SANMAR_FTP_PORT || '22';

// Log environment status (sanitized for security)
console.log('Environment variables loaded:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('SANMAR_USERNAME:', SANMAR_USERNAME ? 'Set' : 'Not set');
console.log('SANMAR_PASSWORD:', SANMAR_PASSWORD ? 'Set' : 'Not set');
console.log('SANMAR_CUSTOMER_NUMBER:', SANMAR_CUSTOMER_NUMBER ? 'Set' : 'Not set');
console.log('SANMAR_CUSTOMER_IDENTIFIER:', SANMAR_CUSTOMER_IDENTIFIER ? 'Set' : 'Not set');
console.log('SANMAR_FTP_HOST:', SANMAR_FTP_HOST ? 'Set' : 'Not set');
console.log('SANMAR_FTP_USERNAME:', SANMAR_FTP_USERNAME ? 'Set' : 'Not set');
console.log('SANMAR_FTP_PASSWORD:', SANMAR_FTP_PASSWORD ? 'Set' : 'Not set');
console.log('SANMAR_FTP_PORT:', SANMAR_FTP_PORT); 