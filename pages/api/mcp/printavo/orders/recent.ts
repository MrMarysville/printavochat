import { NextApiRequest, NextApiResponse } from 'next';
import { mcp_printavo_graphql_mcp_server_search_orders } from '@/lib/mcp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const data = await mcp_printavo_graphql_mcp_server_search_orders({
      query: '',  // Empty query to get all recent orders
      limit: 50
    });

    return res.status(200).json({ orders: data });
  } catch (error) {
    console.error('Error fetching recent orders:', error);
    return res.status(500).json({ error: 'Failed to fetch recent orders' });
  }
} 