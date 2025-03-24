"use client";

import React, { useState } from 'react';
import { Printer, Clock, DollarSign, User, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Button } from '../ui/button';
import { PrintavoOrder } from '@/lib/types';

interface OrderCardProps {
  order: PrintavoOrder;
  onViewDetails?: (_orderId: string) => void;
  onViewCustomer?: (_customerId: string) => void;
  _onUpdateStatus?: (_orderId: string, _statusId: string) => void;
}

export function OrderCard({
  order,
  onViewDetails,
  onViewCustomer,
  _onUpdateStatus,
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle status color
  const getStatusColor = (statusName?: string) => {
    if (!statusName) return 'bg-gray-200 text-gray-800';
    
    switch (statusName.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in production':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
      {/* Header */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="flex items-center">
          <Printer className="h-5 w-5 text-primary mr-2" />
          <div>
            <h3 className="font-medium truncate">
              {order.name || `Order #${order.id.split('-').pop()}`}
            </h3>
            <div className="flex items-center text-xs text-gray-500">
              <span className="truncate">ID: {order.id}</span>
              <button 
                onClick={copyOrderId} 
                className="ml-1 text-gray-400 hover:text-gray-600"
              >
                {isCopied ? (
                  <span className="text-green-500 text-xs">Copied!</span>
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          {order.status && (
            <span 
              className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status.name)}`}
            >
              {order.status.name}
            </span>
          )}
        </div>
      </div>

      {/* Summary Row */}
      <div className="p-4 grid grid-cols-3 gap-2 bg-gray-50">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Date
          </span>
          <span className="text-sm font-medium">
            {formatDate(order.createdAt)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 flex items-center">
            <DollarSign className="h-3 w-3 mr-1" /> Total
          </span>
          <span className="text-sm font-medium">
            {formatCurrency(order.total)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 flex items-center">
            <User className="h-3 w-3 mr-1" /> Customer
          </span>
          <span className="text-sm font-medium truncate">
            {order.customer?.name || 'N/A'}
          </span>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="p-4 border-t">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">Customer</h4>
              <p className="text-sm">{order.customer?.name || 'N/A'}</p>
              <p className="text-xs text-gray-500">{order.customer?.email || 'No email'}</p>
              <p className="text-xs text-gray-500">{order.customer?.phone || 'No phone'}</p>
            </div>
            <div>
              <h4 className="text-xs font-medium text-gray-500 mb-1">Order Details</h4>
              <p className="text-sm flex justify-between">
                <span>Subtotal:</span> 
                <span>{formatCurrency(order.total * 0.9)}</span>
              </p>
              <p className="text-sm flex justify-between">
                <span>Tax:</span> 
                <span>{formatCurrency(order.total * 0.07)}</span>
              </p>
              <p className="text-sm flex justify-between">
                <span>Shipping:</span> 
                <span>{formatCurrency(order.total * 0.03)}</span>
              </p>
              <p className="text-sm flex justify-between font-medium">
                <span>Total:</span> 
                <span>{formatCurrency(order.total)}</span>
              </p>
            </div>
          </div>

          {/* Line Items Summary (if available) */}
          {order.lineItemGroups && order.lineItemGroups.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-medium text-gray-500 mb-2">Line Items</h4>
              <div className="border rounded overflow-hidden">
                {order.lineItemGroups.map((group, groupIndex) => (
                  <div key={group.id || groupIndex} className="border-b last:border-b-0">
                    <div className="bg-gray-50 px-3 py-2 text-xs font-medium">
                      {group.name || `Group ${groupIndex + 1}`}
                    </div>
                    <div className="divide-y">
                      {group.lineItems?.map((item, itemIndex) => (
                        <div key={item.id || itemIndex} className="px-3 py-2 flex justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                          <div className="text-sm font-medium">
                            {formatCurrency(
                              (item.quantity || 0) * (item.price || 0)
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="p-3 flex justify-between items-center border-t bg-gray-50">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-gray-600 flex items-center gap-1"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" /> 
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" /> 
              Show More
            </>
          )}
        </Button>
        <div className="flex gap-2">
          {onViewCustomer && order.customer && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewCustomer(order.customer.id)}
              className="text-xs"
            >
              Customer
            </Button>
          )}
          {onViewDetails && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onViewDetails(order.id)}
              className="text-xs"
            >
              View Details
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 