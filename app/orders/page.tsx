"use client";

import React, { useState, useEffect } from 'react';
import { printavoService } from '@/lib/printavo-service';
import { OrderCard } from '@/components/rich-messages/OrderCard';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await printavoService.getOrders();
        if (response.success && response.data) {
          // Extract orders array from the edges
          if (response.data.orders?.edges) {
            const ordersList = response.data.orders.edges.map((edge: any) => edge.node);
            setOrders(ordersList);
          } else {
            setOrders([]);
          }
        } else {
          setError('Failed to load orders');
          toast({
            title: 'Error',
            description: 'Failed to load orders',
            variant: 'destructive',
          });
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('An error occurred while fetching orders');
        toast({
          title: 'Error',
          description: 'An error occurred while fetching orders',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  const handleUpdateStatus = async (orderId: string, statusId: string, statusName: string) => {
    try {
      // No need to do anything here - the StatusSelect component already handles the API call
      // Just update the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? {
                ...order,
                status: {
                  id: statusId,
                  name: statusName
                }
              }
            : order
        )
      );
      
      // No need for a toast here as it's already shown from the StatusSelect
    } catch (err) {
      console.error('Error updating status:', err);
      toast({
        title: 'Error',
        description: 'Failed to update order status',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-8">Orders Management</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-3 text-lg">Loading orders...</span>
        </div>
      ) : error ? (
        <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800">{error}</p>
          <Button 
            className="mt-4" 
            variant="outline" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-8 bg-blue-50 rounded-lg">
          <p className="text-lg">No orders found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              enableStatusUpdate={true}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
} 