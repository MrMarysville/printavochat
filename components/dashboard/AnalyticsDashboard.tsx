"use client";

import React, { useState } from 'react';
import { 
  BarChart, 
  Printer, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Button } from '../ui/button';

// Type definitions
interface DashboardMetric {
  label: string;
  value: string | number;
  previousValue?: string | number;
  percentChange?: number;
  icon: React.ReactNode;
  color: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

interface AnalyticsDashboardProps {
  metrics?: DashboardMetric[];
  ordersChartData?: ChartData;
  revenueChartData?: ChartData;
  recentOrders?: {
    id: string;
    name: string;
    customer: string;
    status: string;
    total: number;
    date: string;
  }[];
  onRefresh?: () => void;
  isLoading?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  onDateRangeChange?: (dateRange: { start: Date; end: Date }) => void;
}

export function AnalyticsDashboard({
  metrics = [],
  ordersChartData,
  revenueChartData,
  recentOrders = [],
  onRefresh,
  isLoading = false,
  dateRange,
  onDateRangeChange
}: AnalyticsDashboardProps) {
  const [showFilters, setShowFilters] = useState(false);

  // Default metrics if none provided
  const defaultMetrics: DashboardMetric[] = [
    {
      label: 'Total Orders',
      value: '156',
      previousValue: '142',
      percentChange: 9.86,
      icon: <Printer className="h-5 w-5" />,
      color: 'bg-blue-500'
    },
    {
      label: 'Total Revenue',
      value: '$24,568',
      previousValue: '$21,453',
      percentChange: 14.5,
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-green-500'
    },
    {
      label: 'Active Customers',
      value: '78',
      previousValue: '65',
      percentChange: 20.0,
      icon: <Users className="h-5 w-5" />,
      color: 'bg-purple-500'
    },
    {
      label: 'Avg. Order Value',
      value: '$157.49',
      previousValue: '$151.32',
      percentChange: 4.1,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'bg-orange-500'
    }
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  // Helper for rendering percent change
  const renderPercentChange = (change?: number) => {
    if (change === undefined) return null;
    
    const isPositive = change >= 0;
    return (
      <div className={`flex items-center text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
        {Math.abs(change).toFixed(1)}%
      </div>
    );
  };

  // Simplified chart rendering as we don't have actual chart library here
  const renderSimpleChart = (data?: ChartData, title?: string) => {
    if (!data) return null;

    // This is a very simplified visualization - in a real app, use a chart library
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
        <div className="h-48 flex items-end space-x-2">
          {data.datasets[0].data.map((value, index) => {
            const height = (value / Math.max(...data.datasets[0].data)) * 100;
            return (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${height}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">{data.labels[index]}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Date range filter component
  const renderDateFilter = () => {
    if (!dateRange || !onDateRangeChange) return null;
    
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-700">Date Range</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center text-xs gap-1"
          >
            <Filter className="h-3 w-3" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Start Date</label>
              <input 
                type="date"
                className="w-full p-2 text-sm border rounded"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (onDateRangeChange) {
                    onDateRangeChange({
                      start: new Date(e.target.value),
                      end: dateRange.end
                    });
                  }
                }}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">End Date</label>
              <input 
                type="date"
                className="w-full p-2 text-sm border rounded"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (onDateRangeChange) {
                    onDateRangeChange({
                      start: dateRange.start,
                      end: new Date(e.target.value)
                    });
                  }
                }}
              />
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            <Calendar className="h-3 w-3 inline mr-1" />
            {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
          </span>
          {onRefresh && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh}
              disabled={isLoading}
              className="text-xs flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Format currency for table
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      {/* Date range filters */}
      {renderDateFilter()}
      
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className={`h-2 ${metric.color}`}></div>
            <div className="p-4">
              <div className="flex justify-between">
                <p className="text-sm font-medium text-gray-500">{metric.label}</p>
                <div className={`${metric.color} bg-opacity-20 p-2 rounded-full text-sm`}>
                  {React.cloneElement(metric.icon as React.ReactElement, { 
                    className: 'h-4 w-4 text-gray-700' 
                  })}
                </div>
              </div>
              <p className="text-2xl font-bold mt-2">{metric.value}</p>
              <div className="flex items-baseline mt-1">
                <p className="text-xs text-gray-500 mr-2">vs. Previous Period:</p>
                {renderPercentChange(metric.percentChange)}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {renderSimpleChart(ordersChartData, 'Order Trends')}
        {renderSimpleChart(revenueChartData, 'Revenue Trends')}
      </div>
      
      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium">Recent Orders</h3>
          <Button variant="outline" size="sm" className="text-xs">
            View All
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">{order.id}</td>
                    <td className="px-4 py-3 text-sm">{order.customer}</td>
                    <td className="px-4 py-3">
                      <span 
                        className={`px-2 py-1 text-xs rounded-full 
                          ${order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                            order.status === 'In Production' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{order.date}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(order.total)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 