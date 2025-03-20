"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { ChatMessage } from './chat-message';
import { ChatMessage as ChatMessageType } from '@/lib/types';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      content: 'Hello! I can help you manage your Printavo data. Try:\n- Creating a quote\n- Searching for customers\n- Managing tasks\n- Looking up orders',
      role: 'system',
      timestamp: new Date(),
    },
  ]);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Check Printavo API connection on component mount
  useEffect(() => {
    const checkPrintavoConnection = async () => {
      try {
        console.log('Checking Printavo API connection...');
        setConnectionError(null);
        
        // Try to make a direct fetch to Printavo API
        const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL;
        const email = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
        const token = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
        
        if (!apiUrl || !email || !token) {
          console.error('Missing Printavo API credentials');
          setApiConnected(false);
          setConnectionError('Missing API credentials');
          return;
        }
        
        try {
          // Make a direct request to the Printavo API
          const response = await fetch(`${apiUrl}/customers?limit=1`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'email': email,
              'token': token,
            },
          });
          
          console.log('Printavo API direct response status:', response.status);
          
          if (response.ok) {
            console.log('Printavo connection successful!');
            setApiConnected(true);
          } else {
            console.error('Printavo API returned error status:', response.status);
            setApiConnected(false);
            setConnectionError(`API Error: ${response.status}`);
          }
        } catch (error) {
          console.error('Error making direct Printavo API request:', error);
          setApiConnected(false);
          setConnectionError('Network error');
        }
      } catch (error) {
        console.error('Failed to check Printavo connection:', error);
        setApiConnected(false);
        setConnectionError('Connection check failed');
      }
    };
    
    checkPrintavoConnection();
    
    // Set up periodic connection checks every 30 seconds
    const intervalId = setInterval(checkPrintavoConnection, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
    };
    
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Format chat history for AI processing
      const chatHistoryForAI = messages
        .filter(msg => msg.id !== '1') // Skip the initial greeting
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Call our API endpoint to process the message
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...chatHistoryForAI,
            { role: 'user', content: input }
          ]
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process your request');
      }
      
      // Add assistant's response to the chat
      if (data.response) {
        const assistantMessage: ChatMessageType = {
          id: Date.now().toString() + '-assistant',
          content: data.response.content || 'Sorry, I couldn\'t generate a response.',
          role: 'assistant',
          timestamp: new Date(),
        };
        
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
      }
      
      // Only display operation explanation if it's not just a conversation
      if (data.operation && data.operation.operation !== 'conversation') {
        const explanationMessage: ChatMessageType = {
          id: Date.now().toString() + '-explanation',
          content: data.operation.explanation,
          role: 'system',
          timestamp: new Date(),
        };
        
        setMessages(prevMessages => [...prevMessages, explanationMessage]);
      }
      
      // If we got data from Printavo, format and display it
      if (data.response?.data) {
        // Give a small delay for better UX with multiple messages
        setTimeout(() => {
          const formattedData = formatResponseData(data.response.data, data.operation.operation);
          const dataMessage: ChatMessageType = {
            id: Date.now().toString() + '-data',
            content: formattedData,
            role: 'system',
            timestamp: new Date(),
          };
          
          setMessages(prevMessages => [...prevMessages, dataMessage]);
        }, 500);
      } else if (data.response?.errors) {
        // Handle API errors
        setTimeout(() => {
          const errorMessage: ChatMessageType = {
            id: Date.now().toString() + '-error',
            content: `Error from Printavo API: ${data.response.errors[0]?.message || 'Unknown error'}`,
            role: 'system',
            timestamp: new Date(),
          };
          
          setMessages(prevMessages => [...prevMessages, errorMessage]);
        }, 500);
      }
    } catch (error) {
      // Handle errors
      const errorMessage: ChatMessageType = {
        id: Date.now().toString() + '-error',
        content: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'Sorry, I encountered an error processing your request.',
        role: 'system',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format the response data based on operation type
  const formatResponseData = (data: any, operation: string): string => {
    if (!data) return 'No data available';

    switch (operation) {
      case 'createQuote':
        return formatQuote(data);
      case 'getCustomer':
        return formatCustomer(data);
      case 'searchOrders':
        return formatOrders(data);
      case 'createTask':
        return formatTask(data);
      default:
        return '```json\n' + JSON.stringify(data, null, 2) + '\n```';
    }
  };

  const formatQuote = (quote: any): string => {
    return `Quote Created:
Order #${quote.orderNumber}
Status: ${quote.status?.name || 'New'}
Customer: ${quote.customer?.name || 'N/A'}
Created: ${new Date(quote.createdAt).toLocaleDateString()}

Line Items:${formatLineItemGroups(quote.lineItemGroups)}`;
  };

  const formatLineItemGroups = (groups: any): string => {
    if (!groups?.edges) return '\nNo items added';

    return groups.edges.map((edge: any) => {
      const group = edge.node;
      return `\n\nGroup: ${group.name}
${group.lineItems?.edges.map((itemEdge: any) => {
  const item = itemEdge.node;
  return `- ${item.name}
  Quantity: ${item.quantity}
  Price: $${item.unitPrice}`;
}).join('\n')}`;
    }).join('');
  };

  const formatCustomer = (customer: any): string => {
    return `Customer Details:
Name: ${customer.name}
Email: ${customer.email || 'N/A'}
Phone: ${customer.phone || 'N/A'}

Recent Orders:${customer.orders?.edges.map((edge: any) => {
  const order = edge.node;
  return `\n- Order #${order.orderNumber}
  Status: ${order.status?.name || 'N/A'}
  Created: ${new Date(order.createdAt).toLocaleDateString()}`;
}).join('') || '\nNo recent orders'}`;
  };

  const formatOrders = (data: any): string => {
    if (!data.orders?.edges?.length) return 'No orders found';

    return `Orders:\n\n${data.orders.edges.map((edge: any) => {
      const order = edge.node;
      return `Order #${order.orderNumber}
Status: ${order.status?.name || 'N/A'}
Customer: ${order.customer?.name || 'N/A'}
Created: ${new Date(order.createdAt).toLocaleDateString()}
`;
    }).join('\n')}`;
  };

  const formatTask = (task: any): string => {
    return `Task Created:
Title: ${task.title}
Due: ${task.dueAt ? new Date(task.dueAt).toLocaleDateString() : 'No due date'}
Status: ${task.completed ? 'Completed' : 'Pending'}
${task.description ? `\nDescription:\n${task.description}` : ''}`;
  };
  
  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="flex items-center p-4 border-b">
        <h2 className="text-xl font-bold">Printavo Chat</h2>
        <div className="ml-2 flex items-center">
          <div className={`w-3 h-3 rounded-full mr-1 ${apiConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-muted-foreground">{apiConnected ? 'Connected' : 'Disconnected'}</span>
          {connectionError && <span className="text-xs text-red-500 ml-2">{connectionError}</span>}
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form 
        onSubmit={handleSendMessage} 
        className="border-t p-4 flex gap-2"
      >
        <Input
          placeholder="Create a quote, search customers, manage tasks..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          {isLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}