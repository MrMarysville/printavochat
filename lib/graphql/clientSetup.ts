import { logger } from '../logger';
import { GraphQLClient } from 'graphql-request';

// This is the GraphQL client for Printavo
// Types are imported in other files where they are used
import Ajv from 'ajv';

// Use our proxy API endpoint instead of calling Printavo directly
const PRINTAVO_API_URL = '/api/proxy/printavo';

// Initialize JSON schema validator
const ajv = new Ajv();

// Parameter validation schemas based on Printavo API requirements
const _parameterSchemas: Record<string, any> = {
  '/query/order': {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' }
    }
  },
  '/mutation/quotecreate': {
    type: 'object',
    required: ['input'],
    properties: {
      input: {
        type: 'object',
        properties: {
          customerId: { type: 'string' },
          name: { type: 'string' }
        }
      }
    }
  }
};

// Validate parameters against schema before sending request
function _validateParams(params: any, schema: any) {
  const validate = ajv.compile(schema);
  const valid = validate(params);

  if (!valid && validate.errors) {
    logger.error('Parameter validation errors:', validate.errors);
  }

  return !!valid;
}

// Define the PrintavoAPIResponse type with the success property
export type PrintavoAPIResponse<T = any> = {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
  }>;
  path?: string[];
  extensions?: Record<string, any>;
};

// Get API credentials from environment variables
function _getApiCredentials() {
  const apiEmail = process.env.PRINTAVO_EMAIL;
  const apiToken = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '';

  if (!apiEmail || !apiToken) {
    throw new Error('Printavo API credentials not configured. Please set PRINTAVO_EMAIL and PRINTAVO_TOKEN environment variables.');
  }

  return { apiEmail, apiToken };
}

// Initialize GraphQL client
const apiToken = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '';
logger.info(`Printavo API credentials found. Using proxy endpoint: ${PRINTAVO_API_URL}`);
logger.info(`Token length: ${apiToken.length} characters`);

export const printavoClient = new GraphQLClient(PRINTAVO_API_URL, {
  headers: {
    'email': process.env.NEXT_PUBLIC_PRINTAVO_EMAIL || '',
    'token': process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '',
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  fetch: (url, options) => {
    logger.info(`Making request to: ${url}`);
    return fetch(url, options).then(response => {
      logger.info(`Response status: ${response.status} ${response.statusText}`);
      return response;
    }).catch(error => {
      logger.error(`Network error:`, error);
      throw error;
    });
  }
});
