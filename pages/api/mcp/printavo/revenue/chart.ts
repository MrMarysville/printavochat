import { NextApiRequest, NextApiResponse } from 'next';
// Import the service instead of the non-existent mcp module
import { printavoService } from '@/lib/printavo-service';
import { logger } from '@/lib/logger'; // Import logger
import { PrintavoOrder } from '@/lib/types'; // Import type

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
    // Use the service to get the last 100 orders
    const result = await printavoService.searchOrders({
      query: '', // Assuming empty query gets recent orders
      first: 100
    });

    if (!result.success) {
      logger.error('Error fetching orders for revenue chart data via service:', result.errors);
      const errorMessage = result.errors?.[0]?.message || 'Failed to fetch orders for revenue chart';
      return res.status(500).json({ error: errorMessage });
    }

    // Extract the actual orders from the nested structure
    const orders: PrintavoOrder[] = result.data?.quotes?.edges?.map(edge => edge.node) || [];

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
    orders.forEach((order: PrintavoOrder) => { // Use PrintavoOrder type
      try {
        // Ensure createdAt and total exist before processing
        if (!order.createdAt || order.total === undefined || order.total === null) {
            logger.warn(`Skipping order ${order.id || 'unknown'} for revenue chart due to missing data.`);
            return;
        }
        const date = new Date(order.createdAt);
        // Only include orders from the last 6 months
        if (date >= sixMonthsAgo) {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          if (revenueByMonth[monthKey]) {
            // Add to revenue
            const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
            revenueByMonth[monthKey].total += total || 0; // Add nullish coalescing for safety
          }
        }
      } catch (e) {
        logger.warn(`Error processing order revenue:`, e);
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
    logger.error('API route error generating revenue chart data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ error: `Server error: ${errorMessage}` });
  }
}
