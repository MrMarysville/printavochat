import { GraphQLClient } from 'graphql-request';
import { logger } from '../logger';

const API_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const API_EMAIL = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL || '';
const API_TOKEN = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '';

if (!API_EMAIL || !API_TOKEN) {
  logger.warn('Printavo API credentials not set correctly in environment variables.');
  logger.warn('Make sure NEXT_PUBLIC_PRINTAVO_EMAIL and NEXT_PUBLIC_PRINTAVO_TOKEN are set in your .env file.');
} else {
  logger.info('Printavo API client initialized with credentials for:', API_EMAIL);
}

export const printavoClient = new GraphQLClient(`${API_URL}/graphql`, {
  headers: {
    'Content-Type': 'application/json',
    'email': API_EMAIL,
    'token': API_TOKEN,
  },
});

export const operations = {
  // Operations will be imported from separate files
};
