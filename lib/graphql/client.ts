import { GraphQLClient } from 'graphql-request';

const PRINTAVO_API_URL = process.env.PRINTAVO_API_URL || 'https://printavo.com/api/v2';

export const printavoClient = new GraphQLClient(PRINTAVO_API_URL, {
  headers: {
    'Authorization': `Bearer ${process.env.PRINTAVO_TOKEN || ''}`,
    'Content-Type': 'application/json',
  },
});
