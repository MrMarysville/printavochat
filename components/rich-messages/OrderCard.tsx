"use client";

import React, { useState } from 'react';
import { Printer, Clock, DollarSign, User, ChevronDown, ChevronUp, Copy, Package } from 'lucide-react';
import { Button } from '../ui/button';
import { PrintavoOrder } from '@/lib/types';
import { StatusSelect } from '../ui/status-select';
import { useToast } from '../ui/use-toast';
import { getStatusColorClass } from '@/lib/status-utils';

interface OrderCardProps {
  order: PrintavoOrder;
  onViewDetails?: (_orderId: string) => void;
  onViewCustomer?: (_customerId: string) => void;
  onUpdateStatus?: (_orderId: string, _statusId: string, _statusName: string) => void;
  enableStatusUpdate?: boolean;
}

export function OrderCard({
  order,
  onViewDetails,
  onViewCustomer,
  onUpdateStatus,
  enableStatusUpdate = true
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(true); // Start with expanded view by default
  const [isCopied, setIsCopied] = useState(false);
  const [currentStatus, setCurrentStatus] = useState({
    id: order.status?.id || '',
    name: order.status?.name || 'Unknown'
  });
  const { toast } = useToast();

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

  // Handle status change
  const handleStatusChange = (statusId: string, statusName: string) => {
    setCurrentStatus({ id: statusId, name: statusName });
    
    if (onUpdateStatus) {
      onUpdateStatus(order.id, statusId, statusName);
    }
    
    toast({
      title: 'Status updated',
      description: `Order ${order.visualId} status changed to ${statusName}`,
    });
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
      {/* Header */}
      <div className="p-4 flex justify-between items-center bg-blue-50 border-b">
        <div className="flex items-center">
          <Printer className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <h3 className="font-medium text-lg text-blue-800">
              Order {order.visualId} 
            </h3>
            <div className="flex items-center text-xs text-gray-600">
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
        <div className="flex items-center gap-2">
          {enableStatusUpdate ? (
            <StatusSelect 
              currentStatusId={currentStatus.id}
              currentStatusName={currentStatus.name}
              orderId={order.id}
              onStatusChange={handleStatusChange}
              className="w-40"
            />
          ) : (
            <span 
              className={`text-sm px-3 py-1 rounded-full font-medium ${getStatusColorClass(currentStatus.name)}`}
            >
              {currentStatus.name}
            </span>
          )}
        </div>
      </div>

      {/* Summary Row */}
      <div className="p-4 grid grid-cols-3 gap-4 bg-gray-50 border-b">
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

      {/* Order Details Section - Always visible */}
      <div className="p-4 border-b">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Customer Information</h4>
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-sm font-medium">{order.customer?.name || 'N/A'}</p>
              {order.customer?.email && <p className="text-xs text-gray-600">{order.customer.email}</p>}
              {order.customer?.phone && <p className="text-xs text-gray-600">{order.customer.phone}</p>}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Order Summary</h4>
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span> 
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span> 
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping:</span> 
                <span>{formatCurrency(order.shipping)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold mt-1 pt-1 border-t">
                <span>Total:</span> 
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {(order.productionNote || order.customerNote) && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Notes</h4>
            <div className="bg-gray-50 p-3 rounded">
              {order.productionNote && (
                <div className="mb-2">
                  <span className="text-xs font-medium text-gray-500">Production Note:</span>
                  <p className="text-sm">{order.productionNote}</p>
                </div>
              )}
              {order.customerNote && (
                <div>
                  <span className="text-xs font-medium text-gray-500">Customer Note:</span>
                  <p className="text-sm">{order.customerNote}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Line Items Section - Always visible */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 flex items-center mb-2">
            <Package className="h-4 w-4 mr-1 text-gray-500" /> Line Items
          </h4>
          {!order.lineItemGroups || order.lineItemGroups.length === 0 ? (
            <p className="text-sm text-gray-500">No line items available</p>
          ) : (
            <div className="border rounded overflow-hidden divide-y">
              {order.lineItemGroups.map((group, groupIndex) => (
                <div key={group.id || groupIndex} className="bg-white">
                  <div className="bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 flex justify-between items-center">
                    <span>{group.name || `Group ${groupIndex + 1}`}</span>
                    {group.quantity && (
                      <span className="text-xs font-normal bg-gray-200 px-2 py-1 rounded">
                        Qty: {group.quantity}
                      </span>
                    )}
                  </div>
                  <div className="divide-y">
                    {group.lineItems?.map((item, itemIndex) => (
                      <div key={item.id || itemIndex} className="px-3 py-3 flex flex-col md:flex-row md:justify-between">
                        <div className="flex-1 mb-2 md:mb-0">
                          <p className="text-sm font-medium">{item.name}</p>
                          {item.description && typeof item.description === 'string' && (
                            <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center mt-1">
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded mr-2">
                              Qty: {item.quantity}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatCurrency(item.price)} each
                            </span>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-right">
                          {formatCurrency((item.quantity || 0) * (item.price || 0))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Additional Details (Optional) */}
      {isExpanded && order.shippingAddress && (
        <div className="p-4 border-t">
          <div className="grid md:grid-cols-2 gap-4">
            {order.shippingAddress && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Shipping Address</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}
            {order.billingAddress && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Billing Address</h4>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>{order.billingAddress.name}</p>
                  <p>{order.billingAddress.address1}</p>
                  {order.billingAddress.address2 && <p>{order.billingAddress.address2}</p>}
                  <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}</p>
                  <p>{order.billingAddress.country}</p>
                </div>
              </div>
            )}
          </div>
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