'use client';

import { useState, useEffect } from 'react';

export default function TestOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching orders...');
        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            operation: 'printavo_list_orders',
            params: { first: 5, sortOn: 'CREATED_AT_DESC' }
          }),
        });
        
        // Log the raw response for debugging
        const responseText = await response.text();
        console.log('Raw API Response:', responseText);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
        }
        
        try {
          const result = JSON.parse(responseText);
          console.log('Parsed API Response:', result);
          
          if (result.success) {
            console.log(`Retrieved ${result.data?.orders?.length || 0} orders`);
            setOrders(result.data?.orders || []);
          } else {
            throw new Error(result.error || 'Unknown error');
          }
        } catch (parseError) {
          console.error('Error parsing JSON response:', parseError);
          throw new Error(`Failed to parse API response: ${(parseError as Error).message}`);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        setError((error as Error).message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Orders API</h1>
      
      {loading && (
        <div className="p-4 bg-blue-50 rounded mb-4">
          <p>Loading orders...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded mb-4">
          <h2 className="font-bold">Error:</h2>
          <p>{error}</p>
        </div>
      )}
      
      {!loading && !error && orders.length === 0 && (
        <div className="p-4 bg-yellow-50 rounded mb-4">
          <p>No orders found.</p>
        </div>
      )}
      
      {orders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Orders ({orders.length})</h2>
          <div className="grid gap-4">
            {orders.map((order) => (
              <div key={order.id} className="border rounded p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{order.name}</h3>
                  <span className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {order.status?.name || 'Unknown Status'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>ID: {order.id}</p>
                  <p>Visual ID: {order.visualId}</p>
                  <p>Customer: {order.customer?.name || 'Unknown'}</p>
                  <p>Total: ${order.total?.toFixed(2) || '0.00'}</p>
                  <p>Created: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-2">Raw Response Data</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
          {JSON.stringify(orders, null, 2)}
        </pre>
      </div>
    </div>
  );
}
