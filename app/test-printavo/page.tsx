"use client";

import { useState } from 'react';
import { testPrintavoConnection } from '@/lib/test-printavo';

export default function TestPrintavoPage() {
  const [visualId, setVisualId] = useState('9435');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const testResult = await testPrintavoConnection(visualId);
      setResult(testResult);
      
      if (!testResult.success) {
        setError(testResult.message || 'Test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Printavo API Connection Test</h1>
      
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="visualId" className="block mb-2 text-sm font-medium">
              Visual ID to Test
            </label>
            <input
              id="visualId"
              type="text"
              value={visualId}
              onChange={(e) => setVisualId(e.target.value)}
              className="w-full p-2 border rounded-md"
              placeholder="Enter visual ID (e.g., 9435)"
            />
          </div>
          <button
            onClick={runTest}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Run Test'}
          </button>
        </div>
        
        {error && (
          <div className="p-4 mb-4 bg-red-100 border border-red-300 text-red-700 rounded-md">
            <h3 className="font-bold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {result && (
          <div className={`p-4 mb-4 rounded-md ${result.success ? 'bg-green-100 border-green-300 text-green-700' : 'bg-red-100 border-red-300 text-red-700'}`}>
            <h3 className="font-bold mb-2">Test Result</h3>
            <p className="mb-2">{result.message}</p>
            
            {result.success && result.orderDetails && (
              <div className="mt-4 p-4 bg-white rounded-md">
                <h4 className="font-bold mb-2">Order Details</h4>
                <ul className="space-y-1">
                  <li><strong>ID:</strong> {result.orderDetails.id}</li>
                  <li><strong>Visual ID:</strong> {result.orderDetails.visualId}</li>
                  <li><strong>Name:</strong> {result.orderDetails.name}</li>
                  <li><strong>Customer:</strong> {result.orderDetails.customer}</li>
                  <li><strong>Status:</strong> {result.orderDetails.status}</li>
                  <li><strong>Total:</strong> ${result.orderDetails.total}</li>
                  <li><strong>Created:</strong> {new Date(result.orderDetails.createdAt).toLocaleString()}</li>
                </ul>
              </div>
            )}
            
            {!result.success && result.error && (
              <div className="mt-2">
                <strong>Error Details:</strong>
                <pre className="mt-1 p-2 bg-red-50 rounded overflow-auto text-xs">
                  {typeof result.error === 'string' 
                    ? result.error 
                    : JSON.stringify(result.error, null, 2)
                  }
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Environment Status</h2>
        <p className="text-sm mb-4">
          This section shows whether the required environment variables are set properly.
        </p>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 border rounded-md">
            <h3 className="font-bold mb-2">API URL</h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${process.env.NEXT_PUBLIC_PRINTAVO_API_URL ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {process.env.NEXT_PUBLIC_PRINTAVO_API_URL ? 'Set' : 'Not Set'}
            </div>
            {process.env.NEXT_PUBLIC_PRINTAVO_API_URL && (
              <p className="mt-2 text-sm break-all">
                {process.env.NEXT_PUBLIC_PRINTAVO_API_URL}
              </p>
            )}
          </div>
          
          <div className="p-4 border rounded-md">
            <h3 className="font-bold mb-2">API Token</h3>
            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${process.env.NEXT_PUBLIC_PRINTAVO_TOKEN ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {process.env.NEXT_PUBLIC_PRINTAVO_TOKEN ? 'Set' : 'Not Set'}
            </div>
            {process.env.NEXT_PUBLIC_PRINTAVO_TOKEN && (
              <p className="mt-2 text-sm">
                {process.env.NEXT_PUBLIC_PRINTAVO_TOKEN.substring(0, 5)}...{process.env.NEXT_PUBLIC_PRINTAVO_TOKEN.substring(process.env.NEXT_PUBLIC_PRINTAVO_TOKEN.length - 5)} 
                ({process.env.NEXT_PUBLIC_PRINTAVO_TOKEN.length} characters)
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 