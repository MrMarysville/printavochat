import React, { useState, useEffect } from 'react';
import { Printer, DollarSign, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { printavoService } from '../../lib/printavo-service';

// Type definitions
interface DashboardMetric {
  label: string;
  value: string | number;
  previousValue?: string | number;
  percentChange?: number;
  icon: React.ReactNode;
  color: string;
}

interface AnalyticsDashboardProps {
  metrics?: DashboardMetric[];
}

export function AnalyticsDashboard({
  metrics = []
}: AnalyticsDashboardProps) {
  const [metricsData, setMetricsData] = useState<DashboardMetric[]>([]);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const ordersResponse = await printavoService.getOrders();
        const customersResponse = await printavoService.getCustomers();

        const orders = ordersResponse.data?.orders.edges.map(edge => edge.node) || [];
        const customers = customersResponse.data?.customers.edges.map(edge => edge.node) || [];

        const revenue = orders.reduce((sum, order) => sum + order.total, 0);

        const fetchedMetrics: DashboardMetric[] = [
          {
            label: 'Total Orders',
            value: orders.length,
            icon: <Printer className="h-5 w-5" />,
            color: 'bg-blue-500'
          },
          {
            label: 'Total Revenue',
            value: `$${revenue.toFixed(2)}`,
            icon: <DollarSign className="h-5 w-5" />,
            color: 'bg-green-500'
          },
          {
            label: 'Active Customers',
            value: customers.length,
            icon: <Users className="h-5 w-5" />,
            color: 'bg-purple-500'
          }
        ];
        setMetricsData(fetchedMetrics);
      } catch (error) {
        console.error('Error fetching metrics:', error);
      }
    }
    fetchMetrics();
  }, []);

  const displayMetrics = metricsData.length > 0 ? metricsData : metrics;

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

  // Render the dashboard
  return (
    <div>
      <h1>Analytics Dashboard</h1>
      <div className="metrics">
        {displayMetrics.map((metric) => (
          <div key={metric.label} className={`metric ${metric.color}`}>
            <div className="icon">{metric.icon}</div>
            <div className="value">{metric.value}</div>
            <div className="label">{metric.label}</div>
            {renderPercentChange(metric.percentChange)}
          </div>
        ))}
      </div>
      {/* Additional rendering logic for charts and recent orders */}
      {/* Placeholder for chart rendering */}
    </div>
  );
}