import { NextApiRequest, NextApiResponse } from 'next';
import { mcp_printavo_graphql_mcp_server_search_orders } from '@/lib/mcp';

interface MonthlyRevenueData {
  [key: string]: {
    total: number;
    label: string;
  };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get last 100 orders to ensure we have enough data for 6 months
    const orders = await mcp_printavo_graphql_mcp_server_search_orders({
      query: '',
      limit: 100
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Get data for the last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // Create a map of all months we want to display (even if no data)
    const revenueByMonth: MonthlyRevenueData = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      revenueByMonth[monthKey] = { 
        total: 0, 
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      };
    }
    
    // Fill in the actual data
    orders.forEach((order: any) => {
      try {
        const date = new Date(order.createdAt);
        // Only include orders from the last 6 months
        if (date >= sixMonthsAgo) {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          if (revenueByMonth[monthKey]) {
            revenueByMonth[monthKey].total += parseFloat(order.total?.toString() || '0');
          }
        }
      } catch (e) {
        console.warn(`Error processing order revenue:`, e);
      }
    });
    
    // Sort by date (oldest to newest)
    const sortedMonths = Object.keys(revenueByMonth)
      .sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        return (yearA - yearB) || (monthA - monthB);
      });
    
    // Convert to chart format
    const chartData = {
      labels: sortedMonths.map(key => revenueByMonth[key].label),
      datasets: [{
        label: 'Revenue ($)',
        data: sortedMonths.map(key => revenueByMonth[key].total),
        color: 'green'
      }]
    };

    return res.status(200).json({ chartData });
  } catch (error) {
    console.error('Error generating revenue chart data:', error);
    return res.status(500).json({ error: 'Failed to generate revenue chart data' });
  }
} 