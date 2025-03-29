import { NextApiRequest, NextApiResponse } from 'next';
// Import the service instead of the non-existent mcp module
import { printavoService } from '@/lib/printavo-service';
import { logger } from '@/lib/logger'; // Import logger
import { PrintavoOrder } from '@/lib/types'; // Import type

interface MonthlyOrderData {
  [key: string]: {
    count: number;
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
      logger.error('Error fetching orders for chart data via service:', result.errors);
      const errorMessage = result.errors?.[0]?.message || 'Failed to fetch orders for chart';
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
    const ordersByMonth: MonthlyOrderData = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      ordersByMonth[monthKey] = { 
        count: 0, 
        label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
      };
    }

    // Fill in the actual data
    orders.forEach((order: PrintavoOrder) => { // Use PrintavoOrder type
      try {
        // Ensure createdAt exists before processing
        if (!order.createdAt) {
            logger.warn(`Skipping order ${order.id || 'unknown'} due to missing createdAt date.`);
            return;
        }
        const date = new Date(order.createdAt);
        // Only include orders from the last 6 months
        if (date >= sixMonthsAgo) {
          const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
          if (ordersByMonth[monthKey]) {
            ordersByMonth[monthKey].count++;
          }
        }
      } catch (e) {
        console.warn(`Error processing order date:`, e);
      }
    });
    
    // Sort by date (oldest to newest)
    const sortedMonths = Object.keys(ordersByMonth)
      .sort((a, b) => {
        const [yearA, monthA] = a.split('-').map(Number);
        const [yearB, monthB] = b.split('-').map(Number);
        return (yearA - yearB) || (monthA - monthB);
      });
    
    // Convert to chart format
    const chartData = {
      labels: sortedMonths.map(key => ordersByMonth[key].label),
      datasets: [{
        label: 'Orders',
        data: sortedMonths.map(key => ordersByMonth[key].count),
        color: 'blue'
      }]
    };

    return res.status(200).json({ chartData });

  } catch (error) {
    logger.error('API route error generating orders chart data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ error: `Server error: ${errorMessage}` });
  }
}
