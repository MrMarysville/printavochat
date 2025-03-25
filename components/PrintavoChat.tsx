import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { processChatQuery } from '@/lib/chat-commands';
import { Loader2 } from 'lucide-react';
import { OrderCard } from '@/components/rich-messages/OrderCard';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: any;
};

export function PrintavoChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: "Hello! I'm your Printavo assistant. You can ask me to find information about orders, for example: 'Find order with visual ID 5'"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom of the chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add the user message
    const userMessageId = Date.now().toString();
    setMessages(prev => [
      ...prev,
      { id: userMessageId, role: 'user', content: input }
    ]);
    
    // Clear the input
    setInput('');
    setIsLoading(true);
    
    try {
      // Process the query
      const result = await processChatQuery(input);
      
      // Add the assistant's response
      setMessages(prev => [
        ...prev,
        { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: result.message,
          data: result.data
        }
      ]);
    } catch (error) {
      // Handle any errors
      setMessages(prev => [
        ...prev,
        { 
          id: (Date.now() + 1).toString(), 
          role: 'assistant', 
          content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render order data in a readable format
  const renderOrderData = (data: any) => {
    if (!data) return null;
    
    return (
      <div className="mt-4">
        <OrderCard 
          order={data} 
          onViewDetails={() => console.log(`View order: ${data.id}`)}
        />
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Printavo Chat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 h-[500px] overflow-y-auto p-2">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                {message.data && renderOrderData(message.data)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex gap-2 w-full">
          <Input
            placeholder="Ask about orders, e.g., 'Find order 1234'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
} 