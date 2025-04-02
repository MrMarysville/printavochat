import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Compatibility route for MCP server revenue chart data endpoint
 * This handles old requests to /api/mcp/printavo/revenue/chart by forwarding them to the Agent API
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('Legacy MCP endpoint accessed - redirecting to Agent API: /api/mcp/printavo/revenue/chart');
    
    // Use the Agent Service to get orders
    const result = await AgentService.listOrders(30);
    
    if (!result.success) {
      logger.error('Error in legacy revenue chart route when forwarding to Agent API:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch orders for revenue chart'
        },
        { status: 500 }
      );
    }
    
    // Process orders for revenue chart data
    const orders = result.data?.orders || [];
    
    // Group by day and calculate revenue
    const revenueByDay = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      const total = parseFloat(order.total) || 0;
      revenueByDay[date] = (revenueByDay[date] || 0) + total;
    });
    
    const labels = Object.keys(revenueByDay);
    const data = labels.map(label => revenueByDay[label]);
    
    // Transform to match expected format
    return NextResponse.json({
      chartData: {
        labels,
        datasets: [{
          label: 'Revenue ($)',
          data,
          color: 'green'
        }]
      }
    });
    
  } catch (error) {
    logger.error('Error in legacy MCP revenue chart compatibility route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 