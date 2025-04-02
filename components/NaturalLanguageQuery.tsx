'use client';

import { useState } from 'react';

/**
 * NaturalLanguageQuery component
 * A chat-like interface for interacting with the agents using natural language.
 */
export default function NaturalLanguageQuery() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    data?: any;
  }>>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I can help you with Printavo and SanMar information. Try asking me about orders, products, or inventory. For example, you can say 'Show me details for order 1234' or 'Check inventory for SanMar style PC61 in Black'."
    }
  ]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message
    const userMessageId = Date.now().toString();
    setMessages(prevMessages => [
      ...prevMessages,
      {
        id: userMessageId,
        role: 'user',
        content: query
      }
    ]);
    
    // Reset form
    setQuery('');
    setError(null);
    setIsLoading(true);
    
    try {
      // Call the natural language API
      const response = await fetch('/api/natural-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      const result = await response.json();
      
      // Add assistant message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: result.success ? result.response : (result.error || 'I encountered an error processing your request.'),
          data: result.data
        }
      ]);
    } catch (err) {
      setError((err as Error).message || 'Failed to process your request');
      
      // Add error message
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `I'm sorry, I encountered an error: ${(err as Error).message || 'Unknown error'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Example queries
  const exampleQueries = [
    "Show me order 1234",
    "Search for orders from King Clothing",
    "Check inventory for SanMar style PC61 in Black",
    "Get product information for DT6000",
    "List available files on the SanMar FTP server"
  ];

  const handleExampleClick = (example: string) => {
    setQuery(example);
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh] bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <h2 className="text-xl font-semibold">Natural Language Agent Interface</h2>
        <p className="text-sm opacity-80">Ask questions about Printavo orders or SanMar products</p>
      </div>
      
      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map(message => (
          <div 
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] p-3 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              
              {/* Data visualization for certain types of results */}
              {message.data && message.data.product && (
                <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-sm">
                  <div className="font-semibold">{message.data.product.productName}</div>
                  <div>{message.data.product.description}</div>
                  {message.data.inventory && (
                    <div className="mt-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        message.data.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {message.data.isAvailable ? 'In Stock' : 'Limited Stock'}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {message.data && message.data.orders && (
                <div className="mt-2 p-2 bg-white rounded border border-gray-200 text-sm">
                  <div className="font-semibold">Found {message.data.orders.length} orders</div>
                  <ul className="mt-1 space-y-1">
                    {message.data.orders.slice(0, 3).map((order: any, index: number) => (
                      <li key={index} className="flex justify-between">
                        <span>Order #{order.visualId}</span>
                        <span>${parseFloat(order.total).toFixed(2)}</span>
                      </li>
                    ))}
                    {message.data.orders.length > 3 && (
                      <li className="text-gray-500 text-xs">And {message.data.orders.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] p-3 rounded-lg bg-gray-100 text-gray-800">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Example queries */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-2">Example queries:</div>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => handleExampleClick(example)}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
      
      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about orders, products, or inventory..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
            disabled={isLoading || !query.trim()}
          >
            Send
          </button>
        </div>
        
        {error && (
          <div className="mt-2 text-sm text-red-600">
            {error}
          </div>
        )}
      </form>
    </div>
  );
} 