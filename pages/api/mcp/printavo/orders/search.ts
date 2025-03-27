import { NextApiRequest, NextApiResponse } from 'next';
import { mcp_printavo_graphql_mcp_server_search_orders } from '@/lib/mcp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const data = await mcp_printavo_graphql_mcp_server_search_orders({
      query: q,
      limit: 10
    });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error searching orders:', error);
    return res.status(500).json({ error: 'Failed to search orders' });
  }
} 