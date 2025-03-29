import { NextApiRequest, NextApiResponse } from 'next';
// Import the service instead of the non-existent mcp module
import { printavoService } from '@/lib/printavo-service';
import { logger } from '@/lib/logger'; // Import logger

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { visualId } = req.query;

  if (!visualId || typeof visualId !== 'string') {
    return res.status(400).json({ error: 'Visual ID is required' });
  }

  try {
    // Use the service to get the order by visual ID
    const result = await printavoService.getOrderByVisualId(visualId);

    if (!result.success) {
      logger.error(`Error fetching order by visual ID ${visualId} via service:`, result.errors);
      // Use 404 if the specific error indicates not found, otherwise 500
      const statusCode = result.error?.message?.includes('not found') ? 404 : 500;
      const errorMessage = result.errors?.[0]?.message || `Failed to fetch order by visual ID ${visualId}`;
      return res.status(statusCode).json({ error: errorMessage });
    }

    // Return the found order data
    return res.status(200).json(result.data);

  } catch (error) {
    logger.error(`API route error fetching order by visual ID ${visualId}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ error: `Server error: ${errorMessage}` });
  }
}
