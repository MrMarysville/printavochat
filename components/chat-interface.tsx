"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, X, Minimize2 } from 'lucide-react';
import Image from 'next/image';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { logger } from '@/lib/logger';
import { FileUpload } from './file-upload';
import { useToast } from './ui/use-toast';
import { OrderCard } from './rich-messages/OrderCard';
import { ProductGallery } from './rich-messages/ProductGallery';
import { DynamicForm } from './rich-messages/DynamicForm';

type MessageType = 'text' | 'file' | 'order' | 'product' | 'form' | 'dashboard';

interface ChatFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

interface RichMessageData {
  type: 'order' | 'product' | 'form' | 'dashboard';
  content: any;
}

interface ChatMessageType {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  files?: ChatFile[];
  richData?: RichMessageData;
  messageType: MessageType;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([
    {
      id: '1',
      content: 'Hello! I can help you with Printavo operations. What would you like to do?',
      role: 'assistant',
      timestamp: new Date().toISOString(),
      messageType: 'text'
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) throw new Error('Health check failed');
        const data = await response.json();
        setIsConnected(data.status === 'ok');
        setConnectionError(null);
      } catch (error) {
        console.error('Connection check failed:', error);
        setIsConnected(false);
        setConnectionError('Failed to connect to server');
      }
    };

    checkConnection();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage: ChatMessageType = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date().toISOString(),
      messageType: 'text'
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Process the message and get response
      const response = await processMessage(input);
      
      // Add assistant's response to chat
      const assistantMessage: ChatMessageType = {
        id: Date.now().toString() + '-assistant',
        content: response.message,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        messageType: 'text',
        richData: response.richData
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      logger.error('Chat interface error:', error);
      
      // Handle errors
      const errorMessage: ChatMessageType = {
        id: Date.now().toString() + '-error',
        content: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'Sorry, I encountered an error processing your request.',
        role: 'system',
        timestamp: new Date().toISOString(),
        messageType: 'text'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processMessage = async (inputMessage: string): Promise<{
    message: string;
    richData?: RichMessageData;
  }> => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages,
            {
              id: Date.now().toString(),
              content: inputMessage,
              role: 'user',
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        message: data.message,
        richData: data.richData
      };
    } catch (error) {
      logger.error('Error processing message:', error);
      throw error;
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (!files.length) return;

    setIsLoading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('parentType', 'chat');
      formData.append('parentId', 'chat-session');
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Create message with file attachments
      const fileMessage: ChatMessageType = {
        id: Date.now().toString(),
        content: files.length === 1 
          ? `I've uploaded a file: ${files[0].name}` 
          : `I've uploaded ${files.length} files`,
        role: 'user',
        timestamp: new Date().toISOString(),
        files: data.files.map((file: any) => ({
          id: file.fileName,
          name: file.originalName,
          url: file.url,
          type: file.type,
          size: file.size
        })),
        messageType: 'file'
      };
      
      setMessages(prev => [...prev, fileMessage]);
      setShowUpload(false);
      
      toast({
        title: 'Files uploaded successfully',
        description: `${files.length} file${files.length > 1 ? 's' : ''} uploaded`
      });
      
      // Process the uploaded files to get a response
      handleUploadedFiles(fileMessage);
      
    } catch (error) {
      logger.error('File upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload files',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUploadedFiles = async (fileMessage: ChatMessageType) => {
    setIsLoading(true);
    
    try {
      // Send the file message to the chat API to process
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, fileMessage],
          files: fileMessage.files
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Add assistant's response
      const assistantMessage: ChatMessageType = {
        id: Date.now().toString() + '-assistant',
        content: data.message,
        role: 'assistant',
        timestamp: new Date().toISOString(),
        messageType: 'text',
        richData: data.richData
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      logger.error('Error processing uploaded files:', error);
      
      const errorMessage: ChatMessageType = {
        id: Date.now().toString() + '-error',
        content: error instanceof Error 
          ? `Error processing files: ${error.message}` 
          : 'Sorry, I encountered an error processing your files.',
        role: 'system',
        timestamp: new Date().toISOString(),
        messageType: 'text'
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Format timestamp consistently
  const formatTimestamp = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Render different message types
  const renderMessage = (message: ChatMessageType) => {
    switch (message.messageType) {
      case 'file':
        return (
          <div className="flex flex-col space-y-2">
            <p className="text-sm">{message.content}</p>
            <div className="flex flex-wrap gap-2">
              {message.files?.map(file => (
                <a 
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center p-2 rounded bg-gray-100 text-xs hover:bg-gray-200 transition"
                >
                  {file.type.startsWith('image/') ? (
                    <Image 
                      src={file.url} 
                      alt={file.name} 
                      width={32}
                      height={32}
                      className="h-8 w-8 object-cover rounded mr-2" 
                    />
                  ) : (
                    <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center mr-2">
                      <span className="text-xs">{file.name.split('.').pop()}</span>
                    </div>
                  )}
                  <span className="truncate max-w-[120px]">{file.name}</span>
                </a>
              ))}
            </div>
          </div>
        );
      
      case 'text':
        // Check if there's rich data to render
        if (message.richData) {
          switch (message.richData.type) {
            case 'order':
              return (
                <div className="flex flex-col space-y-3">
                  <p className="text-sm">{message.content}</p>
                  <OrderCard 
                    order={message.richData.content} 
                    onViewDetails={() => console.log(`View order: ${message.richData?.content.id}`)}
                  />
                </div>
              );
              
            case 'product':
              return (
                <div className="flex flex-col space-y-3">
                  <p className="text-sm">{message.content}</p>
                  <ProductGallery 
                    products={message.richData.content} 
                    onSelectProduct={(product) => console.log(`Selected product: ${product.id}`)}
                  />
                </div>
              );
              
            case 'form':
              return (
                <div className="flex flex-col space-y-3">
                  <p className="text-sm">{message.content}</p>
                  <DynamicForm 
                    fields={message.richData.content.fields}
                    title={message.richData.content.title}
                    onSubmit={(values) => {
                      // Handle form submission
                      console.log('Form values:', values);
                      // You would typically send this to your API
                      const formResponseMessage: ChatMessageType = {
                        id: Date.now().toString(),
                        content: 'I submitted the form with the provided information',
                        role: 'user',
                        timestamp: new Date().toISOString(),
                        messageType: 'text'
                      };
                      setMessages(prev => [...prev, formResponseMessage]);
                    }}
                  />
                </div>
              );
          }
        }
        
        // Default text rendering
        return <p className="text-sm whitespace-pre-wrap">{message.content}</p>;
        
      default:
        return <p className="text-sm">{message.content}</p>;
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-16 h-16 bg-primary rounded-full shadow-lg cursor-pointer flex items-center justify-center"
        onClick={() => setIsMinimized(false)}>
        <Send className="h-6 w-6 text-white" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-bold">Printavo Chat</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full mr-1 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs text-muted-foreground">{isConnected ? 'Connected' : 'Disconnected'}</span>
          {connectionError && <span className="text-xs text-red-500 ml-2">{connectionError}</span>}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMinimized(true)}
            className="ml-2"
          >
            <Minimize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
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
                    ? 'bg-primary text-primary-foreground'
                    : message.role === 'system'
                    ? 'bg-muted text-muted-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`}
              >
                {renderMessage(message)}
                <span className="text-xs opacity-70 block mt-1">
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>

              {!isConnected && message.role === 'assistant' && (
                <div className="text-xs text-amber-600 mt-1 italic">
                  Note: This response is from the API. Connection issues may affect data accuracy.
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {showUpload && (
        <div className="border-t p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Upload Files</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowUpload(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <FileUpload 
            onFileUpload={handleFileUpload} 
            _parentType="chat"
            _parentId="chat-session"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowUpload(!showUpload)}
            disabled={isLoading}
            className="flex-shrink-0"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading || !isConnected}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !isConnected || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}






