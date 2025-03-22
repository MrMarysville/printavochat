"use client";

import React, { useState } from 'react';
import { AnalyticsDashboard } from '@/components/dashboard/AnalyticsDashboard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentOrdersSummary } from '@/components/dashboard/RecentOrdersSummary';

// Mock data for demonstration
const mockRecentOrders = [
  {
    id: "ORD-001",
    name: "T-Shirt Order - Acme Corp Event",
    customer: {
      name: "Acme Corporation",
      id: "CUST-001"
    },
    date: "2023-10-15",
    status: "In Production",
    total: 1250.99,
    items: 150
  },
  {
    id: "ORD-002",
    name: "Event Merchandise Pack",
    customer: {
      name: "TechConf 2023",
      id: "CUST-002"
    },
    date: "2023-10-12",
    status: "Completed",
    total: 3450.50,
    items: 250
  },
  {
    id: "ORD-003",
    name: "Promotional Hats",
    customer: {
      name: "Local Sports Team",
      id: "CUST-003"
    },
    date: "2023-10-09",
    status: "Pending",
    total: 850.00,
    items: 100
  }
];

// Mock chart data
const mockOrdersChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Orders',
      data: [65, 59, 80, 81, 56, 55],
      color: 'blue'
    }
  ]
};

const mockRevenueChartData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Revenue',
      data: [2500, 3200, 2800, 5100, 4200, 3800],
      color: 'green'
    }
  ]
};

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    end: new Date()
  });

  const handleDateRangeChange = (newRange: { start: Date; end: Date }) => {
    setDateRange(newRange);
    // In a real app, you would fetch new data based on the date range
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
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
            orders={mockRecentOrders}
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
          ordersChartData={mockOrdersChartData}
          revenueChartData={mockRevenueChartData}
          recentOrders={mockRecentOrders.map(order => ({
            id: order.id,
            name: order.name,
            customer: order.customer.name,
            status: order.status,
            total: order.total,
            date: order.date
          }))}
          isLoading={isLoading}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onRefresh={handleRefresh}
        />
      </div>
    </div>
  );
} 