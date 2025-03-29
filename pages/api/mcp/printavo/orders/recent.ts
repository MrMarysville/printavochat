import { NextApiRequest, NextApiResponse } from 'next';
// Import the service instead of the non-existent mcp module
import { printavoService } from '@/lib/printavo-service';
import { logger } from '@/lib/logger'; // Import logger

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Use the service to search orders. Pass appropriate parameters.
    // An empty query might not be the best way to get "recent" orders.
    // Let's assume for now it fetches the latest based on default sorting.
    // Consider adding specific sorting/filtering if the MCP tool supports it.
    const result = await printavoService.searchOrders({
      query: '', // Or perhaps a specific query/filter for recent?
      first: 50 // Keep the limit
    });

    if (!result.success) {
      logger.error('Error fetching recent orders via service:', result.errors);
      // Use the error message from the service result if available
      const errorMessage = result.errors?.[0]?.message || 'Failed to fetch recent orders';
      return res.status(500).json({ error: errorMessage });
    }

    // Extract the actual orders from the nested structure
    const orders = result.data?.quotes?.edges?.map(edge => edge.node) || [];
    return res.status(200).json({ orders });

  } catch (error) {
    logger.error('API route error fetching recent orders:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ error: `Server error: ${errorMessage}` });
  }
}
