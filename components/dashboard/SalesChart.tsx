"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface SalesChartProps {
  ordersData?: ChartData;
  revenueData?: ChartData;
  isLoading?: boolean;
  error?: string | null;
}

export default function SalesChart({ ordersData, revenueData, isLoading, error }: SalesChartProps) {
  // Common chart options
  const options: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Revenue chart specific options
  const revenueOptions: ChartOptions<'line'> = {
    ...options,
    scales: {
      ...options.scales,
      y: {
        ...options.scales?.y,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  // Default chart data if none provided
  const defaultChartData: ChartData = {
    labels: ['No Data'],
    datasets: [{ 
      label: 'No Data Available',
      data: [0],
      backgroundColor: 'rgba(200, 200, 200, 0.2)',
      borderColor: 'rgba(200, 200, 200, 1)',
      borderWidth: 1
    }]
  };

  // Process revenue data to ensure proper colors
  const processedRevenueData = revenueData ? {
    ...revenueData,
    datasets: revenueData.datasets.map(dataset => ({
      ...dataset,
      borderColor: 'rgba(34, 197, 94, 1)',
      backgroundColor: 'rgba(34, 197, 94, 0.2)'
    }))
  } : defaultChartData;

  // Process orders data to ensure proper colors
  const processedOrdersData = ordersData ? {
    ...ordersData,
    datasets: ordersData.datasets.map(dataset => ({
      ...dataset,
      borderColor: 'rgba(59, 130, 246, 1)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)'
    }))
  } : defaultChartData;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Sales Analytics</CardTitle>
        <CardDescription>Overview of orders and revenue over time</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-3">Loading chart data...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-[300px] text-red-500">
            <p>Error loading chart data: {error}</p>
          </div>
        ) : (
          <Tabs defaultValue="revenue" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="orders">Order Volume</TabsTrigger>
            </TabsList>
            <TabsContent value="revenue" className="w-full">
              <div className="h-[300px]">
                <Line options={revenueOptions} data={processedRevenueData} />
              </div>
            </TabsContent>
            <TabsContent value="orders" className="w-full">
              <div className="h-[300px]">
                <Bar options={options} data={processedOrdersData} />
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
} 