import { logger } from './logger';
import { executeGraphQL } from './graphql-client';

export const StatusesAPI = {
  async getStatuses(): Promise<any> {
    logger.info(`[StatusesAPI] Getting available statuses`);
    
    const query = `
      query GetStatuses {
        statuses(type: INVOICE) {
          edges {
            node {
              id
              name
              color
              position
            }
          }
        }
      }
    `;
    
    try {
      const data = await executeGraphQL(query, {}, "GetStatuses");
      
      if (data.statuses?.edges) {
        const statuses = data.statuses.edges
          .sort((a: any, b: any) => a.node.position - b.node.position)
          .map((edge: any) => ({
            id: edge.node.id,
            name: edge.node.name,
            color: edge.node.color
          }));
        
        logger.info(`[StatusesAPI] Retrieved ${statuses.length} statuses`);
        return statuses;
      }
      
      logger.warn('[StatusesAPI] No statuses returned from API');
      return [];
    } catch (error) {
      logger.error(`[StatusesAPI] Error getting statuses:`, error);
      throw error;
    }
  }
}; 