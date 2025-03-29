import { NextApiRequest, NextApiResponse } from 'next';
// Import the service instead of the non-existent mcp module
import { printavoService } from '@/lib/printavo-service';
import { logger } from '@/lib/logger'; // Import logger

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (typeof id !== 'string' || !id) {
    return res.status(400).json({ error: 'Invalid or missing order ID' });
  }

  try {
    // Use the service to get the order
    const result = await printavoService.getOrder(id);

    if (!result.success) {
      logger.error(`Error fetching order ${id} via service:`, result.errors);
      const statusCode = result.error?.name === 'PrintavoNotFoundError' ? 404 : 500;
      const errorMessage = result.errors?.[0]?.message || `Failed to fetch order ${id}`;
      return res.status(statusCode).json({ error: errorMessage });
    }

    // Return the order data
    return res.status(200).json(result.data);

  } catch (error) {
    logger.error(`API route error fetching order ${id}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ error: `Server error: ${errorMessage}` });
  }
}
