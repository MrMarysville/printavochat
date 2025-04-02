import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';
import { logger } from '@/lib/logger';

/**
 * Compatibility route for MCP server chart data endpoint
 * This handles old requests to /api/mcp/printavo/orders/chart by forwarding them to the Agent API
 */
export async function GET(request: NextRequest) {
  try {
    logger.info('Legacy MCP endpoint accessed - redirecting to Agent API: /api/mcp/printavo/orders/chart');
    
    // Use the Agent Service to get orders
    const result = await AgentService.listOrders(30);
    
    if (!result.success) {
      logger.error('Error in legacy chart route when forwarding to Agent API:', result.error);
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to fetch orders for chart'
        },
        { status: 500 }
      );
    }
    
    // Process orders for chart data
    const orders = result.data?.orders || [];
    
    // Group by day
    const ordersByDay = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString();
      ordersByDay[date] = (ordersByDay[date] || 0) + 1;
    });
    
    const labels = Object.keys(ordersByDay);
    const data = labels.map(label => ordersByDay[label]);
    
    // Transform to match expected format
    return NextResponse.json({
      chartData: {
        labels,
        datasets: [{
          label: 'Orders',
          data,
          color: 'blue'
        }]
      }
    });
    
  } catch (error) {
    logger.error('Error in legacy MCP chart compatibility route:', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
} 