"use client";

import React, { useEffect, useState } from 'react';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentOrdersSummary } from '@/components/dashboard/RecentOrdersSummary';
import { fetchRecentOrders, fetchOrdersChartData, fetchRevenueChartData } from '@/lib/graphql-client';
import { Printer, DollarSign } from 'lucide-react';

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

type ChartData = {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    color: string;
  }>;
};

type DashboardMetric = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date()
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [orders, ordersChart, revenueChart] = await Promise.all([
        fetchRecentOrders(),
        fetchOrdersChartData(),
        fetchRevenueChartData()
      ]);
      setRecentOrders(orders);

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum: number, order: Order) => sum + order.total, 0);

      const fetchedMetrics: DashboardMetric[] = [
        {
          label: 'Total Orders',
          value: totalOrders,
          icon: <Printer className="h-5 w-5" />,
          color: 'bg-blue-500'
        },
        {
          label: 'Total Revenue',
          value: `$${totalRevenue.toFixed(2)}`,
          icon: <DollarSign className="h-5 w-5" />,
          color: 'bg-green-500'
        }
      ];

      setMetrics(fetchedMetrics);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const handleDateRangeChange = (newRange: { start: Date; end: Date }) => {
    setDateRange(newRange);
  };

  const handleRefresh = () => {
    loadData();
  };

  const handleViewOrder = (orderId: string) => {
    console.log(`Viewing order: ${orderId}`);
    // In a real app, you would navigate to the order details page
  };

  const handleViewAllOrders = () => {
    console.log('Viewing all orders');
    // In a real app, you would navigate to the orders page
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Dashboard</h1>
        <div className="space-x-2">
          <button
            className="px-4 py-2 bg-white border rounded-md shadow-sm hover:bg-gray-50 text-sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <RecentOrdersSummary
            orders={recentOrders}
            isLoading={isLoading}
            onViewOrder={handleViewOrder}
            onViewAll={handleViewAllOrders}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <QuickActions />
        </div>
      </div>

      {/* Analytics */}
      <div className="mb-6">
        <AnalyticsDashboard
          metrics={metrics}
        />
      </div>
    </div>
  );
}