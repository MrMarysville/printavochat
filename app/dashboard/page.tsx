"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { fetchRecentOrders, fetchOrdersChartData, fetchRevenueChartData } from '@/lib/graphql-client';
import { executeGraphQL } from '@/lib/printavo-api';
import { printavoMcpClient } from '@/lib/printavo-mcp-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, LineChart, ShoppingBag, Users, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { websocketService } from '@/lib/websocket-service';
import { SmartPoller, DataChanges } from '@/lib/smart-poller';
import { logger } from '@/lib/logger';
import { useToast } from '@/components/ui/use-toast';
import SalesChart from '@/components/dashboard/SalesChart';
import PrintavoConnectionStatus from '@/components/dashboard/PrintavoConnectionStatus';

type Order = {
  id: string;
  name: string;
  customer: {
    name: string;
    id: string;
  };
  date: string;
  status: string;
  total: number;
};

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(60000); // 1 minute default
  const [isAutoRefreshEnabled, setIsAutoRefreshEnabled] = useState<boolean>(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [wsStatus, setWsStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'error'>('disconnected');
  const [hasNewUpdates, setHasNewUpdates] = useState<boolean>(false);
  const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
  const [changedOrdersCount, setChangedOrdersCount] = useState<number>(0);
  const pollerRef = useRef<SmartPoller<Order> | null>(null);
  const { toast } = useToast();
  // Add state for order sort direction
  const [sortDirection, setSortDirection] = useState<'newest' | 'oldest'>('newest');

  // Add new state for chart data
  const [ordersChartData, setOrdersChartData] = useState<any>(null);
  const [revenueChartData, setRevenueChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(true);
  const [chartError, setChartError] = useState<string | null>(null);

  // Add mock data generator for fallback when API is unavailable
  const generateMockData = useCallback(() => {
    logger.info('Generating mock data for dashboard fallback');
    
    // Create 10 mock orders
    const mockOrders = Array.from({ length: 10 }, (_, i) => ({
      id: `mock-${i + 1}`,
      name: `Mock Order #${1000 + i}`,
      customer: {
        id: `mock-customer-${i + 1}`,
        name: `Sample Customer ${i + 1}`
      },
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(), // Each a day apart
      status: ['New', 'In Progress', 'Completed', 'Delivered'][Math.floor(Math.random() * 4)],
      total: Math.floor(Math.random() * 1000) + 100 // Random price between $100-$1100
    }));
    
    // Return sorted by date (newest first)
    return mockOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  // Modify the fetchOrders function to include fallback
  const fetchOrders = useCallback(async () => {
    try {
      logger.info('Fetching orders from Printavo API');
      
      try {
        const result = await fetchRecentOrders();
        
        // If we got empty results (API error), use mock data instead
        if (!result || result.length === 0) {
          logger.warn('Received empty results from Printavo API, using fallback mock data');
          return generateMockData();
        }
        
        return result;
      } catch (error) {
        // Enhanced error handling
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error('Error fetching orders from Printavo API:', { 
          error: errorMessage,
          timestamp: new Date().toISOString()
        });
        
        // Show a non-intrusive toast notification about the API error
        toast({
          title: 'API Connection Issue',
          description: 'Using sample data while we reconnect to Printavo',
          variant: 'destructive',
        });
        
        // Return mock data as fallback
        return generateMockData();
      }
    } catch (error) {
      // This should catch any errors in the mock data generation
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Dashboard error:', errorMessage);
      setError('Failed to load orders data. Please refresh the page.');
      
      // Return empty array as last resort
      return [];
    }
  }, [generateMockData, toast]);

  // Handle data changes
  const handleDataChanges = useCallback((newData: Order[], changes: DataChanges<Order>) => {
    setOrders(newData);
    setLastRefreshed(new Date());
    setLoading(false);
    setHasNewUpdates(false);

    // Update counts for notifications
    if (changes.newItems.length > 0) {
      setNewOrdersCount(changes.newItems.length);
      toast({
        title: `${changes.newItems.length} new order${changes.newItems.length > 1 ? 's' : ''}`,
        description: "New orders have been received",
        variant: "default",
      });
    }

    if (changes.changedItems.length > 0) {
      setChangedOrdersCount(changes.changedItems.length);
      toast({
        title: `${changes.changedItems.length} order${changes.changedItems.length > 1 ? 's' : ''} updated`,
        description: "Order details have changed",
        variant: "default",
      });
    }

    logger.info(`Data updated: ${changes.newItems.length} new, ${changes.changedItems.length} changed, ${changes.removedItems.length} removed`);
  }, [toast]);

  // Handle polling errors
  const handlePollingError = useCallback((error: Error) => {
    setError(`Error fetching data: ${error.message}`);
    setLoading(false);
  }, []);

  // Initialize smart poller
  useEffect(() => {
    // Create poller if it doesn't exist
    if (!pollerRef.current) {
      pollerRef.current = new SmartPoller<Order>({
        fetchFn: fetchOrders,
        interval: refreshInterval,
        onChanges: handleDataChanges,
        onError: handlePollingError,
        // Extract ID for change detection
        idExtractor: (order) => order.id,
        // Extract fields that matter for change detection
        fingerprintExtractor: (order) => ({
          id: order.id,
          status: order.status,
          total: order.total,
          name: order.name
        }),
        enableBackoff: true,
        maxBackoffInterval: 300000, // 5 minutes max
        resetBackoffOnChanges: true
      });
    }

    // Start polling if auto-refresh is enabled
    if (isAutoRefreshEnabled && pollerRef.current) {
      pollerRef.current.start();
    }

    // First load
    if (loading && orders.length === 0) {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Add a try/catch specific for the first load to handle operation name errors
      (async () => {
        try {
          logger.info('Initial dashboard data load');
          const result = await fetchOrders();
          
          logger.info(`Loaded ${result.length} orders for dashboard`);
          // Make sure orders are sorted according to user preference
          const sortedOrders = result.sort((a: Order, b: Order) => {
            try {
              const dateA = new Date(a.date).getTime();
              const dateB = new Date(b.date).getTime();
              return sortDirection === 'newest' 
                ? dateB - dateA  // Newest first
                : dateA - dateB; // Oldest first
            } catch (e) {
              console.error('Date sorting error:', e);
              return 0;
            }
          });
          setOrders(sortedOrders);
          setLastRefreshed(new Date());
          setLoading(false);
        } catch (err) {
          // Specific handling for the "No operation named" error
          const errorMessage = err instanceof Error ? err.message : String(err);
          
          if (errorMessage.includes('No operation named')) {
            console.error('GraphQL operation name error detected, attempting recovery');
            
            // Try again with a more explicit approach using executeGraphQL directly
            try {
              const operationName = "GetDashboardOrders";
              const query = `
                query ${operationName} {
                  invoices(first: 50, sortDescending: true) {
                    edges {
                      node {
                        id
                        visualId
                        nickname
                        createdAt
                        total
                        contact {
                          id
                          fullName
                          email
                        }
                        status {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              `;
              
              // Use executeGraphQL directly with explicit operation name
              const data = await executeGraphQL(query, {}, operationName);
              
              if (data && data.invoices && data.invoices.edges) {
                // Transform the data
                const recoveredOrders = data.invoices.edges.map((edge: any) => ({
                  id: edge.node.id,
                  name: edge.node.nickname || `Order #${edge.node.visualId || 'Unknown'}`,
                  customer: {
                    id: edge.node.contact?.id || 'unknown',
                    name: edge.node.contact?.fullName || 'Unknown Customer'
                  },
                  date: edge.node.createdAt || new Date().toISOString(),
                  status: edge.node.status?.name || 'Unknown Status',
                  total: parseFloat(edge.node.total || '0')
                }));
                
                // Sort and update state
                const sortedOrders = recoveredOrders.sort((a: Order, b: Order) => {
                  const dateA = new Date(a.date).getTime();
                  const dateB = new Date(b.date).getTime();
                  return sortDirection === 'newest' ? dateB - dateA : dateA - dateB;
                });
                
                setOrders(sortedOrders);
                setLastRefreshed(new Date());
                setLoading(false);
                logger.info('Successfully recovered from operation name error');
                return;
              }
            } catch (recoveryErr) {
              console.error('Recovery attempt failed:', recoveryErr);
            }
          }
          
          // If we reach here, either it wasn't an operation name error or recovery failed
          console.error('Initial load error:', err);
          setError('Failed to load initial data: ' + (err instanceof Error ? err.message : String(err)));
          setLoading(false);
          
          // Use mock data as last resort
          const mockData = generateMockData();
          setOrders(mockData);
        }
      })();
    }

    // Cleanup
    return () => {
      if (pollerRef.current) {
        pollerRef.current.stop();
      }
    };
  }, [fetchOrders, handleDataChanges, handlePollingError, isAutoRefreshEnabled, loading, orders.length, refreshInterval, sortDirection, generateMockData]);

  // Update polling interval when changed
  useEffect(() => {
    if (pollerRef.current) {
      pollerRef.current.setInterval(refreshInterval);
    }
  }, [refreshInterval]);

  // Set up WebSocket connection
  useEffect(() => {
    // Listen for WebSocket connection status changes
    const statusListener = websocketService.addEventListener('connection_status', (data) => {
      setWsStatus(data.status);
    });

    // Listen for order updates from WebSocket
    const orderListener = websocketService.addEventListener('orders_updated', (data) => {
      // When we get a notification about new orders, set the flag
      setHasNewUpdates(true);
      // Force a poll now to get the latest data
      if (pollerRef.current) {
        pollerRef.current.pollNow();
      }
    });

    // Initialize connection
    websocketService.connect();

    // Clean up listeners when component unmounts
    return () => {
      statusListener();
      orderListener();
    };
  }, []);

  // Format the time since last refresh
  const formatLastRefreshed = () => {
    const seconds = Math.floor((new Date().getTime() - lastRefreshed.getTime()) / 1000);
    if (seconds < 60) return `${seconds} seconds ago`;
    return `${Math.floor(seconds / 60)} minutes ago`;
  };

  // Get WebSocket connection status icon
  const getConnectionStatusIcon = () => {
    switch (wsStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'disconnected':
      case 'error':
      default:
        return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  // Refresh data manually
  const refreshData = useCallback(() => {
    if (pollerRef.current) {
      setLoading(true);
      setError(null); // Clear any previous errors
      
      // Add a log to help with debugging
      logger.info('Manually refreshing dashboard data');
      
      pollerRef.current.pollNow();
    }
  }, []);

  // Calculate summary metrics from the actual orders
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingOrders = orders.filter(order => 
    order.status.toLowerCase() !== 'completed' && 
    order.status.toLowerCase() !== 'delivered' && 
    order.status.toLowerCase() !== 'closed'
  );
  
  // Improved sorting with error handling for recent orders
  const recentOrders = React.useMemo(() => {
    try {
      const sorted = [...orders].sort((a: Order, b: Order) => {
        try {
          // Use sort direction to determine order
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return sortDirection === 'newest' 
            ? dateB - dateA  // Newest first
            : dateA - dateB; // Oldest first
        } catch (e) {
          logger.warn(`Error sorting orders by date: ${e instanceof Error ? e.message : String(e)}`);
          return 0;
        }
      }).slice(0, 5);
      
      logger.debug(`Showing ${sorted.length} recent orders on dashboard (sorted by ${sortDirection})`);
      return sorted;
    } catch (e) {
      logger.error(`Failed to sort recent orders: ${e instanceof Error ? e.message : String(e)}`);
      return orders.slice(0, 5); // Fallback to first 5 unsorted orders
    }
  }, [orders, sortDirection]);

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete') || statusLower.includes('deliver')) return 'bg-green-100 text-green-800';
    if (statusLower.includes('cancel')) return 'bg-red-100 text-red-800';
    if (statusLower.includes('pending') || statusLower.includes('progress')) return 'bg-yellow-100 text-yellow-800';
    if (statusLower.includes('new') || statusLower.includes('draft')) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Update useEffect for chart data to use fallbacks
  useEffect(() => {
    const loadChartData = async () => {
      setChartLoading(true);
      setChartError(null);
      
      try {
        // Create mock chart data for fallback
        const mockOrdersChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Orders (Fallback)',
            data: [5, 8, 12, 9, 11, 10],
            color: 'blue'
          }]
        };
        
        const mockRevenueChartData = {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Revenue $ (Fallback)',
            data: [1200, 1800, 2400, 1900, 2100, 2500],
            color: 'green'
          }]
        };

        // Get orders and create chart data
        let ordersData;
        let revenueData;
        
        try {
          // Try using the MCP client to search for orders (last 100 orders)
          const mcpResult = await printavoMcpClient.searchOrders("", 100);
          logger.info('Using MCP client for chart data');
          
          if (mcpResult.success && mcpResult.data && Array.isArray(mcpResult.data)) {
            // Process orders for chart data
            const orders = mcpResult.data;
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            // Get data for the last 6 months
            const now = new Date();
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            
            // Create maps for order counts and revenue by month with proper typing
            const ordersByMonth: Record<string, { count: number; label: string }> = {};
            const revenueByMonth: Record<string, { total: number; label: string }> = {};
            
            for (let i = 0; i < 6; i++) {
              const date = new Date(now);
              date.setMonth(date.getMonth() - i);
              const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
              ordersByMonth[monthKey] = { 
                count: 0, 
                label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
              };
              revenueByMonth[monthKey] = { 
                total: 0, 
                label: `${monthNames[date.getMonth()]} ${date.getFullYear()}`
              };
            }
            
            // Fill in the actual data
            orders.forEach(order => {
              try {
                if (!order.createdAt) return;
                
                const date = new Date(order.createdAt);
                // Only include orders from the last 6 months
                if (date >= sixMonthsAgo) {
                  const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
                  if (ordersByMonth[monthKey]) {
                    ordersByMonth[monthKey].count++;
                    // Add to revenue if we have a total
                    if (order.total) {
                      const total = typeof order.total === 'string' ? parseFloat(order.total) : order.total;
                      revenueByMonth[monthKey].total += total || 0;
                    }
                  }
                }
              } catch (e) {
                logger.warn(`Error processing order date: ${e}`);
              }
            });
            
            // Sort by date (oldest to newest)
            const sortedMonths = Object.keys(ordersByMonth)
              .sort((a, b) => {
                const [yearA, monthA] = a.split('-').map(Number);
                const [yearB, monthB] = b.split('-').map(Number);
                return (yearA - yearB) || (monthA - monthB);
              });
            
            // Convert to chart format - orders
            const orderLabels = sortedMonths.map(key => ordersByMonth[key].label);
            const orderChartData = sortedMonths.map(key => ordersByMonth[key].count);
            
            // Convert to chart format - revenue
            const revenueLabels = sortedMonths.map(key => revenueByMonth[key].label);
            const revenueChartData = sortedMonths.map(key => revenueByMonth[key].total);
            
            // Create chart data objects
            ordersData = {
              labels: orderLabels,
              datasets: [{
                label: 'Orders',
                data: orderChartData,
                color: 'blue'
              }]
            };
            
            revenueData = {
              labels: revenueLabels,
              datasets: [{
                label: 'Revenue ($)',
                data: revenueChartData,
                color: 'green'
              }]
            };
          } else {
            // Fall back to default chart data
            throw new Error("MCP client returned invalid data");
          }
        } catch (err) {
          logger.warn('MCP client chart data error, trying direct API:', err);
          
          try {
            // Fall back to using direct API calls
            ordersData = await fetchOrdersChartData();
            await new Promise(resolve => setTimeout(resolve, 500)); // Add delay
            revenueData = await fetchRevenueChartData();
          } catch (directErr) {
            logger.error('Direct API chart data error, using fallback:', directErr);
            // Use mock data if both methods fail
            ordersData = mockOrdersChartData;
            revenueData = mockRevenueChartData;
          }
        }
        
        setOrdersChartData(ordersData);
        setRevenueChartData(revenueData);
        setChartLoading(false);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error('Error loading chart data:', err);
        setChartError('Failed to load chart data');
        setChartLoading(false);
      }
    };
    
    loadChartData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto py-6 px-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Printavo Dashboard</h1>
            <div className="flex gap-2 items-center">
              <div className="flex items-center text-sm text-gray-500 mr-2">
                <span className="mr-1">Real-time:</span>
                {getConnectionStatusIcon()}
                {hasNewUpdates && (
                  <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                    Updates available
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 mt-1 mr-2">
                Last updated: {formatLastRefreshed()}
              </div>
              <div className="flex items-center mr-2">
                <input
                  type="checkbox"
                  id="autoRefresh"
                  checked={isAutoRefreshEnabled}
                  onChange={() => {
                    const newValue = !isAutoRefreshEnabled;
                    setIsAutoRefreshEnabled(newValue);
                    if (newValue && pollerRef.current) {
                      pollerRef.current.start();
                    } else if (!newValue && pollerRef.current) {
                      pollerRef.current.stop();
                    }
                  }}
                  className="mr-2"
                />
                <label htmlFor="autoRefresh" className="text-sm">Auto-refresh</label>
              </div>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="text-sm border rounded px-2 py-1"
                disabled={!isAutoRefreshEnabled}
              >
                <option value={30000}>30 seconds</option>
                <option value={60000}>1 minute</option>
                <option value={300000}>5 minutes</option>
                <option value={600000}>10 minutes</option>
              </select>
              <Button 
                variant="outline"
                onClick={refreshData}
                disabled={loading}
              >
                {loading ? 'Refreshing...' : 'Refresh Now'}
              </Button>
              <Button 
                onClick={() => {
                  const chatButton = document.querySelector('.fixed.bottom-4.right-4 button');
                  if (chatButton instanceof HTMLElement) {
                    chatButton.click();
                  }
                }}
              >
                Open Chat
              </Button>
            </div>
          </div>
          <p className="text-gray-500 mt-2">Overview of your Printavo orders and business metrics</p>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4">
        {loading && orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Loading your Printavo data...</p>
          </div>
        ) : error ? (
          <div className="grid gap-6 lg:grid-cols-4">
            <div className="lg:col-span-3">
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700">{error}</p>
                </div>
                <Button 
                  variant="outline" 
                  className="mt-2" 
                  onClick={refreshData}
                >
                  Try Again
                </Button>
              </div>
            </div>
            <div className="lg:col-span-1">
              <PrintavoConnectionStatus />
            </div>
          </div>
        ) : (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">From {orders.length} orders</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${averageOrderValue.toFixed(2)}</div>
                  <p className="text-xs text-muted-foreground">Per order average</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingOrders.length}</div>
                  <p className="text-xs text-muted-foreground">Awaiting completion</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders & Charts */}
            <Tabs defaultValue="recent-orders" className="space-y-4">
              <TabsList>
                <TabsTrigger value="recent-orders">Recent Orders</TabsTrigger>
                <TabsTrigger value="charts">Analytics</TabsTrigger>
              </TabsList>
              <TabsContent value="recent-orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Recent Orders</CardTitle>
                        <CardDescription>Showing your {recentOrders.length} most recent orders from Printavo</CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <select
                          value={sortDirection}
                          onChange={(e) => setSortDirection(e.target.value as 'newest' | 'oldest')}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                        </select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="flex justify-center p-4">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : recentOrders.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        No orders found. Create an order in Printavo to see it here.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="pb-3 text-left">Order</th>
                              <th className="pb-3 text-left">Customer</th>
                              <th className="pb-3 text-left">Status</th>
                              <th className="pb-3 text-left">Date</th>
                              <th className="pb-3 text-right">Amount</th>
                              <th className="pb-3 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.map((order) => (
                              <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="py-3">
                                  <Link href={`/orders/${order.id}`} className="font-medium text-blue-600 hover:underline">
                                    {order.name}
                                  </Link>
                                </td>
                                <td className="py-3">{order.customer.name}</td>
                                <td className="py-3">
                                  <Badge className={getStatusColor(order.status)}>
                                    {order.status}
                                  </Badge>
                                </td>
                                <td className="py-3" title={new Date(order.date).toLocaleString()}>
                                  {formatRelativeTime(order.date)}
                                </td>
                                <td className="py-3 text-right">${order.total.toFixed(2)}</td>
                                <td className="py-3 text-right">
                                  <Link href={`/orders/${order.id}`}>
                                    <Button variant="ghost" size="sm">View</Button>
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Link href="/orders" className="text-blue-600 hover:underline text-sm">
                      View all orders
                    </Link>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="charts" className="space-y-4">
                <SalesChart 
                  ordersData={ordersChartData} 
                  revenueData={revenueChartData} 
                  isLoading={chartLoading} 
                  error={chartError}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </main>
  );
}
