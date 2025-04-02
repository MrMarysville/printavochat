"use client";

import React, { useState, useEffect } from 'react';
import { printavoService } from '@/lib/printavo-service';
import { OrderCard } from '@/components/rich-messages/OrderCard';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight, Search, X, Filter } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrintavoOrder } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { VisualIdSearch } from '@/components/VisualIdSearch';

interface PageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: string;
  endCursor: string;
}

interface OrdersResponse {
  quotes?: {
    edges: Array<{ node: PrintavoOrder }>;
    pageInfo?: PageInfo;
    totalCount?: number;
  };
  orders?: {
    edges: Array<{ node: PrintavoOrder }>;
    pageInfo?: PageInfo;
    totalCount?: number;
  };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<PrintavoOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [startCursor, setStartCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [statuses, setStatuses] = useState<Array<{id: string, name: string}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchStatuses();
  }, [pageSize, currentPage]);

  useEffect(() => {
    // Reset pagination when filters change
    setCurrentPage(1);
    fetchOrders();
  }, [searchQuery, statusFilter]);

  const fetchStatuses = async () => {
    try {
      const response = await printavoService.getStatuses();
      if (response.success && response.data?.statuses) {
        setStatuses(response.data.statuses);
      }
    } catch (error) {
      console.error('Error fetching statuses:', error);
    }
  };

  const fetchOrders = async (cursor?: string, direction: 'next' | 'prev' = 'next') => {
    setLoading(true);
    try {
      // Construct query string based on filters
      let queryString = searchQuery;
      if (statusFilter) {
        const statusObj = statuses.find(s => s.id === statusFilter);
        if (statusObj) {
          queryString += ` status:${statusObj.name}`;
        }
      }

      const response = await printavoService.searchOrders({
        first: pageSize,
        query: queryString.trim() || '',
        ...(direction === 'next' && cursor ? { after: cursor } : {}),
        ...(direction === 'prev' && cursor ? { before: cursor } : {})
      });

      if (response.success && response.data) {
        const data = response.data as OrdersResponse;
        // Extract orders array from the edges - check both orders and quotes
        const edges = data.orders?.edges || data.quotes?.edges;
        const pageInfo = data.orders?.pageInfo || data.quotes?.pageInfo;
        const totalCount = data.orders?.totalCount || data.quotes?.totalCount || 0;
        
        if (edges) {
          // Filter out orders with "quote" or "completed" statuses
          const filteredOrdersList = edges
            .map(edge => edge.node)
            .filter(order => {
              const statusName = order.status?.name?.toLowerCase() || '';
              return !statusName.includes('quote') && !statusName.includes('completed');
            });
          
          setOrders(filteredOrdersList);

          // Update total count for pagination
          setTotalOrders(filteredOrdersList.length);

          // Handle pagination info
          if (pageInfo) {
            setHasNextPage(pageInfo.hasNextPage);
            setHasPreviousPage(pageInfo.hasPreviousPage);
            setEndCursor(pageInfo.endCursor);
            setStartCursor(pageInfo.startCursor);
          }
        } else {
          setOrders([]);
          setTotalOrders(0);
        }
      } else {
        setError('Can\'t retrieve data');
        toast({
          title: 'Error',
          description: 'Can\'t retrieve data',
          variant: 'destructive',
        });
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Can\'t retrieve data');
      toast({
        title: 'Error',
        description: 'Can\'t retrieve data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage && endCursor) {
      setCurrentPage(prev => prev + 1);
      fetchOrders(endCursor, 'next');
    }
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage && startCursor) {
      setCurrentPage(prev => prev - 1);
      fetchOrders(startCursor, 'prev');
    }
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value, 10));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
  };

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">Orders Management</h1>
        
        <div className="flex items-center gap-2">
          <label htmlFor="page-size" className="text-sm text-gray-600">Show:</label>
          <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
            <SelectTrigger id="page-size" className="w-20">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search and filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search by customer name, order number..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <div className="w-full sm:w-64">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                {statuses.map(status => (
                  <SelectItem key={status.id} value={status.id}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {(searchQuery || statusFilter) && (
            <Button variant="outline" size="icon" onClick={clearFilters} title="Clear filters">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-col">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Filter className="h-4 w-4 mr-1" /> Visual ID Quick Search
            </h3>
            <VisualIdSearch 
              onResultsFound={(foundOrders) => {
                if (foundOrders.length > 0) {
                  setOrders(foundOrders);
                  setTotalOrders(foundOrders.length);
                  setHasNextPage(false);
                  setHasPreviousPage(false);
                  setSearchQuery(''); // Clear other search when using Visual ID
                  setStatusFilter('');
                }
              }}
              placeholder="Enter 4-digit Visual ID"
              buttonText="Find Order"
            />
            <p className="text-xs text-gray-500 mt-2">
              Quickly find orders by their 4-digit Visual ID, bypassing all other filters
            </p>
          </div>
        </div>
      </div>
      
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
            onClick={() => fetchOrders()}
          >
            Try Again
          </Button>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-8 bg-blue-50 rounded-lg">
          <p className="text-lg">No orders found</p>
          {(searchQuery || statusFilter) && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={clearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 mb-6">
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                enableStatusUpdate={true}
                onUpdateStatus={handleUpdateStatus}
              />
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-8">
            <div className="text-sm text-gray-600">
              {totalOrders > 0 ? (
                <span>Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalOrders)} of {totalOrders} orders</span>
              ) : (
                <span>No orders found</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={!hasPreviousPage}
                onClick={handlePreviousPage}
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={!hasNextPage}
                onClick={handleNextPage}
              >
                Next <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
