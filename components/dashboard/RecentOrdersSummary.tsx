"use client";

import React, { useState } from 'react';
import { 
  FileText,
  ArrowRight,
  Calendar,
  User,
  DollarSign,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';

interface OrderSummary {
  id: string;
  name: string;
  customer: {
    name: string;
    id: string;
  };
  date: string;
  status: string;
  total: number;
  items?: number;
}

interface RecentOrdersSummaryProps {
  title?: string;
  maxItems?: number;
  onViewOrder?: (_orderId: string) => void;
  onViewAll?: () => void;
  orders?: OrderSummary[];
  isLoading?: boolean;
  error?: boolean;
}

export function RecentOrdersSummary({
  title = 'Recent Orders',
  maxItems = 5,
  onViewOrder,
  onViewAll,
  orders = [],
  isLoading = false,
  error = false
}: RecentOrdersSummaryProps) {
  // Filter out orders with "quote" or "completed" statuses
  const filteredOrders = orders.filter(order => {
    const statusName = order.status?.toLowerCase() || '';
    return !statusName.includes('quote') && !statusName.includes('completed');
  });
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('complete') || statusLower.includes('finished')) {
      return 'bg-green-100 text-green-800';
    }
    if (statusLower.includes('production') || statusLower.includes('progress')) {
      return 'bg-blue-100 text-blue-800';
    }
    if (statusLower.includes('pending') || statusLower.includes('waiting')) {
      return 'bg-yellow-100 text-yellow-800';
    }
    if (statusLower.includes('cancel') || statusLower.includes('reject')) {
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-800';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="font-medium flex items-center">
          <FileText className="h-4 w-4 mr-2 text-gray-500" />
          {title}
        </h3>
        {onViewAll && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onViewAll}
            className="text-xs flex items-center gap-1"
          >
            View All <ArrowRight className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="p-8 text-center">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mx-auto"></div>
          </div>
          <p className="text-sm text-gray-500 mt-4">Loading recent orders...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-red-600">Can't retrieve data</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-gray-500">No active orders found</p>
        </div>
      ) : (
        <div className="divide-y">
          {filteredOrders.map((order) => (
            <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-sm">{order.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(order.date)}
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <User className="h-3 w-3 mr-1" />
                  {order.customer.name}
                </div>
                <div className="flex items-center text-xs text-gray-500 justify-end">
                  <DollarSign className="h-3 w-3 mr-1" />
                  {formatCurrency(order.total)}
                </div>
              </div>
              
              {order.items && (
                <p className="text-xs text-gray-500 mb-2">
                  {order.items} item{order.items !== 1 && 's'}
                </p>
              )}
              
              {onViewOrder && (
                <div className="flex justify-end mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onViewOrder(order.id)}
                    className="text-xs h-7"
                  >
                    View Order
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 