'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select } from './ui/select';

export default function PrintavoTester() {
  const [operation, setOperation] = useState('getOrders');
  const [id, setId] = useState('');
  const [limit, setLimit] = useState('10');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const operations = [
    { value: 'getOrders', label: 'Get Orders' },
    { value: 'getOrder', label: 'Get Order by ID' },
    { value: 'getCustomers', label: 'Get Customers' },
    { value: 'getCustomer', label: 'Get Customer by ID' }
  ];

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      let url = `/api/printavo-test?operation=${operation}`;
      
      if (operation === 'getOrder' || operation === 'getCustomer') {
        if (!id) {
          setError('ID is required for this operation');
          setLoading(false);
          return;
        }
        url += `&id=${id}`;
      }
      
      url += `&limit=${limit}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Unknown error occurred');
      }
      
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">Printavo API Tester</h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="operation">Operation</Label>
          <Select
            id="operation"
            value={operation}
            onValueChange={setOperation}
          >
            {operations.map(op => (
              <option key={op.value} value={op.value}>{op.label}</option>
            ))}
          </Select>
        </div>
        
        {(operation === 'getOrder' || operation === 'getCustomer') && (
          <div>
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter ID"
            />
          </div>
        )}
        
        <div>
          <Label htmlFor="limit">Limit</Label>
          <Input
            id="limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="10"
          />
        </div>
        
        <Button onClick={handleTest} disabled={loading}>
          {loading ? 'Testing...' : 'Test API'}
        </Button>
        
        {error && (
          <div className="p-4 bg-red-100 text-red-800 rounded">
            <p className="font-bold">Error:</p>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className="p-4 bg-green-100 text-green-800 rounded">
            <p className="font-bold">Result:</p>
            <pre className="mt-2 overflow-auto max-h-96">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}