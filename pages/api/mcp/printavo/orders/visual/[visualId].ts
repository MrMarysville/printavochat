import { NextApiRequest, NextApiResponse } from 'next';
import { mcp_printavo_graphql_mcp_server_search_orders } from '@/lib/mcp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { visualId } = req.query;

  if (!visualId || typeof visualId !== 'string') {
    return res.status(400).json({ error: 'Visual ID is required' });
  }

  try {
    // Search for orders with the visual ID
    const orders = await mcp_printavo_graphql_mcp_server_search_orders({
      query: visualId,
      limit: 1  // We only need the first match
    });

    // Find the exact match
    const order = orders.find((o: any) => o.visualId === visualId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json(order);
  } catch (error) {
    console.error(`Error fetching order by visual ID ${visualId}:`, error);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
} 