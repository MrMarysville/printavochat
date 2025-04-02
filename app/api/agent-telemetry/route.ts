import { NextRequest, NextResponse } from 'next/server';
import { AgentService } from '@/lib/agent-service';

/**
 * API route for retrieving agent telemetry data
 */
export async function GET() {
  try {
    // Get telemetry data from the agent service
    const telemetry = AgentService.getTelemetry();
    
    // Calculate success rate as percentage
    const successRate = telemetry.operationCount > 0
      ? Math.round((telemetry.successCount / telemetry.operationCount) * 100)
      : 0;
    
    // Return the telemetry data along with some computed metrics
    return NextResponse.json({
      success: true,
      telemetry: {
        ...telemetry,
        successRate: `${successRate}%`,
        operationBreakdown: Object.entries(telemetry.operationTimings).map(([operation, stats]) => ({
          operation,
          count: stats.count,
          averageTime: Math.round(stats.averageTime),
          totalTime: Math.round(stats.totalTime),
          percentage: telemetry.operationCount > 0
            ? Math.round((stats.count / telemetry.operationCount) * 100)
            : 0
        }))
      }
    });
  } catch (error) {
    console.error('Error retrieving agent telemetry:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
}

/**
 * API route for resetting agent telemetry data
 */
export async function POST() {
  try {
    // Reset telemetry data
    AgentService.resetTelemetry();
    
    return NextResponse.json({
      success: true,
      message: 'Telemetry data reset successfully'
    });
  } catch (error) {
    console.error('Error resetting agent telemetry:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: (error as Error).message
      },
      { status: 500 }
    );
  }
} 