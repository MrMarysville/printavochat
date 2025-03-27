import { logger } from './logger';

// Add this to your executeGraphQL function
export async function executeGraphQL(query: string, variables = {}, operationName?: string) {
  // Extract operation name from query if not provided
  if (!operationName || operationName.trim() === '') {
    const operationMatch = query.match(/\b(?:query|mutation)\s+([A-Za-z0-9_]+)\b/i);
    if (operationMatch && operationMatch[1]) {
      operationName = operationMatch[1];
      logger.debug(`Extracted GraphQL operation name from query: ${operationName}`);
    } else {
      // Generate a fallback name
      const queryHash = hashQuery(query);
      operationName = `GraphQLQuery_${queryHash}`;
      
      // Log this as a warning so you can find and fix these instances
      logger.warn(`Missing operation name in GraphQL query, using generated name: ${operationName}`, {
        query: query.substring(0, 100),
        stack: new Error().stack
      });
    }
  }
  
  // Rest of function...
}