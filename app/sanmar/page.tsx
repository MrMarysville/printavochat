import { Metadata } from 'next';
import ProductLookup from '@/components/sanmar/ProductLookup';

export const metadata: Metadata = {
  title: 'SanMar API Demo',
  description: 'Demonstration of SanMar API integration',
};

// Log environment variables to check if they're available (server-side)
console.log('Server-side environment check:');
console.log('SANMAR_USERNAME:', process.env.SANMAR_USERNAME ? 'Set' : 'Not set');
console.log('SANMAR_PASSWORD:', process.env.SANMAR_PASSWORD ? 'Set' : 'Not set');
console.log('SANMAR_CUSTOMER_NUMBER:', process.env.SANMAR_CUSTOMER_NUMBER ? 'Set' : 'Not set');

export default function SanMarPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">SanMar API Integration</h1>
      
      <div className="prose max-w-none">
        <p>
          This page demonstrates the integration with SanMar&apos;s API services. The integration allows us to:
        </p>
        
        <ul className="list-disc pl-6 my-4">
          <li>Retrieve product information directly from SanMar&apos;s catalog</li>
          <li>Check inventory levels in real-time</li>
          <li>Access product media and specifications</li>
          <li>Use both the &quot;standard&quot; and &quot;promotional&quot; API endpoints for comprehensive data access</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Integration Methods</h2>
        
        <p>
          The integration is implemented using two complementary approaches:
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 my-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-3">MCP Server (Legacy)</h3>
            <p className="text-gray-700">
              This approach uses a Model Context Protocol server to communicate with SanMar APIs. 
              While functional, it has maintenance and reliability challenges.
            </p>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-xl font-semibold mb-3">Agent SDK (New)</h3>
            <p className="text-gray-700">
              Our new implementation uses OpenAI Agents SDK for more reliable and maintainable 
              integration with better error handling, caching, and performance.
            </p>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4">Example Queries</h2>
        
        <p>
          Through either integration method, you can:
        </p>
        
        <ul className="list-disc pl-6 my-4">
          <li>Search for a product: <code>PC61 in Red, size L</code></li>
          <li>Check inventory: <code>Is ST850 in stock?</code></li>
          <li>Get detailed product information: <code>Tell me about DT6000</code></li>
          <li>Find pricing: <code>How much does PC61 cost?</code></li>
        </ul>
        
        <p className="italic text-gray-600 mt-8">
          Note: This page is for demonstration purposes. The actual API integration is used 
          throughout the application wherever product information is needed.
        </p>
      </div>
      
      <ProductLookup />
      
      <div className="mt-12 bg-blue-50 p-4 rounded-md border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-2">About This Page</h2>
        <p className="text-blue-700">
          This page demonstrates the new agent-based integration with SanMar's API.
          It uses the OpenAI Agents SDK to provide a reliable and maintainable way to
          interact with SanMar's product data. Try searching for a product by its style number
          (e.g., "PC61", "DT6000") to see the integration in action.
        </p>
      </div>
    </main>
  );
} 