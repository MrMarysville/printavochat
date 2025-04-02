'use client';

import { useEffect, useState } from 'react';
import { ArrowPathIcon, ChartBarIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { logger } from '@/lib/logger';

interface AgentTelemetry {
  operationCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  successRate: string;
  slowestOperation: {
    operation: string;
    time: number;
  } | null;
  lastError: {
    operation: string;
    error: string;
    timestamp: Date;
  } | null;
  operationBreakdown: Array<{
    operation: string;
    count: number;
    averageTime: number;
    totalTime: number;
    percentage: number;
  }>;
}

export default function AgentMonitorPage() {
  const [telemetry, setTelemetry] = useState<AgentTelemetry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Fetch telemetry data
  const fetchTelemetry = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agent-telemetry');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.telemetry) {
        setTelemetry(data.telemetry);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || 'Failed to fetch telemetry data');
      }
    } catch (error) {
      logger.error('Error fetching agent telemetry:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Reset telemetry data
  const resetTelemetry = async () => {
    if (!confirm('Are you sure you want to reset all telemetry data?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/agent-telemetry', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refetch telemetry data after reset
        fetchTelemetry();
      } else {
        throw new Error(data.error || 'Failed to reset telemetry data');
      }
    } catch (error) {
      logger.error('Error resetting agent telemetry:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setIsLoading(false);
    }
  };
  
  // Fetch telemetry data on component mount
  useEffect(() => {
    fetchTelemetry();
    
    // Set up polling for real-time updates (every 30 seconds)
    const intervalId = setInterval(fetchTelemetry, 30000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Render loading state
  if (isLoading && !telemetry) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Agent System Monitor</h1>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  // Render error state
  if (error && !telemetry) {
    return (
      <div className="container mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Agent System Monitor</h1>
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <h2 className="text-lg font-semibold flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            Error Loading Telemetry Data
          </h2>
          <p className="mt-2">{error}</p>
          <Button 
            onClick={fetchTelemetry} 
            variant="outline" 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Agent System Monitor</h1>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <p className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
          <Button 
            onClick={fetchTelemetry} 
            variant="outline" 
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            ) : (
              <ArrowPathIcon className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button 
            onClick={resetTelemetry} 
            variant="destructive" 
            size="sm"
            disabled={isLoading}
          >
            Reset Data
          </Button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}
      
      {telemetry && (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Operations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{telemetry.operationCount}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {telemetry.successCount} successful / {telemetry.errorCount} failed
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{telemetry.successRate}</div>
                <Progress 
                  value={parseInt(telemetry.successRate)} 
                  className="mt-2"
                  indicatorClassName={
                    parseInt(telemetry.successRate) > 90 ? "bg-green-500" :
                    parseInt(telemetry.successRate) > 70 ? "bg-yellow-500" :
                    "bg-red-500"
                  }
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.round(telemetry.averageResponseTime)}ms</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {telemetry.slowestOperation ? (
                    <>Slowest: {telemetry.slowestOperation.operation} ({Math.round(telemetry.slowestOperation.time)}ms)</>
                  ) : 'No operations recorded'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last Error</CardTitle>
              </CardHeader>
              <CardContent>
                {telemetry.lastError ? (
                  <>
                    <div className="font-medium truncate">{telemetry.lastError.operation}</div>
                    <p className="text-xs text-red-500 truncate">{telemetry.lastError.error}</p>
                  </>
                ) : (
                  <div className="text-green-500 font-medium">No errors recorded</div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Detailed Data */}
          <Tabs defaultValue="operations">
            <TabsList>
              <TabsTrigger value="operations">
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Operations
              </TabsTrigger>
              <TabsTrigger value="performance">
                <ClockIcon className="w-4 h-4 mr-2" />
                Performance
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="operations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Operation Breakdown</CardTitle>
                  <CardDescription>
                    Details of all agent operations that have been executed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 font-medium">Operation</th>
                          <th className="text-center py-2 px-4 font-medium">Count</th>
                          <th className="text-center py-2 px-4 font-medium">Avg Time</th>
                          <th className="text-center py-2 px-4 font-medium">Total Time</th>
                          <th className="text-center py-2 px-4 font-medium">% of Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {telemetry.operationBreakdown.sort((a, b) => b.count - a.count).map((op) => (
                          <tr key={op.operation} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-4">{op.operation}</td>
                            <td className="text-center py-2 px-4">{op.count}</td>
                            <td className="text-center py-2 px-4">{op.averageTime}ms</td>
                            <td className="text-center py-2 px-4">{(op.totalTime / 1000).toFixed(2)}s</td>
                            <td className="text-center py-2 px-4">{op.percentage}%</td>
                          </tr>
                        ))}
                        {telemetry.operationBreakdown.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-4 text-center text-muted-foreground">
                              No operations recorded yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-muted-foreground">
                  Showing all {telemetry.operationBreakdown.length} operations
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analysis</CardTitle>
                  <CardDescription>
                    Response time analysis by operation type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {telemetry.operationBreakdown.sort((a, b) => b.averageTime - a.averageTime).map((op) => (
                      <div key={op.operation}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{op.operation}</span>
                          <span className="text-sm text-muted-foreground">{op.averageTime}ms avg</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ width: `${Math.min(Math.max(op.averageTime / 5, 5), 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {op.count} calls, {(op.totalTime / 1000).toFixed(2)}s total
                        </p>
                      </div>
                    ))}
                    {telemetry.operationBreakdown.length === 0 && (
                      <div className="py-4 text-center text-muted-foreground">
                        No operations recorded yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
} 