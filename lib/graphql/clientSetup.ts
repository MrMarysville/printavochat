import { GraphQLClient } from 'graphql-request';

// Configure the GraphQL client
const endpoint = process.env.NEXT_PUBLIC_PRINTAVO_API_URL 
  ? `${process.env.NEXT_PUBLIC_PRINTAVO_API_URL}/graphql` 
  : 'https://www.printavo.com/api/v2/graphql';

export const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'email': process.env.NEXT_PUBLIC_PRINTAVO_EMAIL || '',
    'token': process.env.NEXT_PUBLIC_PRINTAVO_TOKEN || '',
  },
});

// If you have any direct client.request calls, update them like this:
export const executeDirectRequest = async (query, variables, operationName) => {
  return client.request({
    document: query,
    variables,
    operationName,
  });
});
