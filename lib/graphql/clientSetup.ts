import { logger } from '../logger';
import { GraphQLClient } from 'graphql-request';

// This is the GraphQL client for Printavo
// Types are imported in other files where they are used
import Ajv from 'ajv';

// Get API URL from environment variables with fallback
const PRINTAVO_API_URL = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
const GRAPHQL_ENDPOINT = `${PRINTAVO_API_URL}/graphql`;

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
  const apiEmail = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
  const apiToken = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;

  if (!apiEmail || !apiToken) {
    throw new Error('Printavo API credentials not configured. Please set NEXT_PUBLIC_PRINTAVO_EMAIL and NEXT_PUBLIC_PRINTAVO_TOKEN environment variables.');
  }

  return { apiEmail, apiToken };
}

// Initialize GraphQL client
const apiEmail = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL || '';
const apiToken = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '';
logger.info(`Printavo API credentials found. Using GraphQL endpoint: ${GRAPHQL_ENDPOINT}`);
logger.info(`Using email: ${apiEmail}`);
logger.info(`Token length: ${apiToken.length} characters`);

export const printavoClient = new GraphQLClient(GRAPHQL_ENDPOINT, {
  headers: {
    'email': apiEmail,
    'token': apiToken,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  fetch: (url, options) => {
    logger.debug(`Making request to: ${url}`);
    return fetch(url, options).then(response => {
      logger.debug(`Response status: ${response.status} ${response.statusText}`);
      return response;
    }).catch(error => {
      logger.error(`Network error:`, error);
      throw error;
    });
  }
});
