import { NextApiRequest, NextApiResponse } from 'next';
import { mcp_printavo_graphql_mcp_server_get_order } from '@/lib/mcp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    const data = await mcp_printavo_graphql_mcp_server_get_order({
      orderId: id
    });

    if (!data) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error(`Error fetching order ${id}:`, error);
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
} 