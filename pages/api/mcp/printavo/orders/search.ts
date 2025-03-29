import { NextApiRequest, NextApiResponse } from 'next';
// Import the service instead of the non-existent mcp module
import { printavoService } from '@/lib/printavo-service';
import { logger } from '@/lib/logger'; // Import logger

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q, limit } = req.query; // Get limit as well

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query parameter "q" is required' });
  }

  // Validate limit if provided
  let searchLimit = 10; // Default limit
  if (limit) {
      if (typeof limit !== 'string' || isNaN(parseInt(limit, 10)) || parseInt(limit, 10) <= 0) {
          return res.status(400).json({ error: 'Invalid limit parameter. Must be a positive integer.' });
      }
      searchLimit = parseInt(limit, 10);
  }


  try {
    // Use the service to search orders
    const result = await printavoService.searchOrders({
      query: q,
      first: searchLimit // Use parsed limit
    });

    if (!result.success) {
      logger.error(`Error searching orders with query "${q}" via service:`, result.errors);
      const errorMessage = result.errors?.[0]?.message || 'Failed to search orders';
      return res.status(500).json({ error: errorMessage });
    }

    // Extract the actual orders from the nested structure
    const orders = result.data?.quotes?.edges?.map(edge => edge.node) || [];
    return res.status(200).json(orders); // Return the array of orders directly

  } catch (error) {
    logger.error(`API route error searching orders with query "${q}":`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ error: `Server error: ${errorMessage}` });
  }
}
