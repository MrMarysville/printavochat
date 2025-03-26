"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, XCircle } from 'lucide-react';
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
import { VoiceControl } from './VoiceControl';
import ErrorBoundary from './error-boundary';

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

// Component for displaying file attachments
const FileAttachment = ({ file }: { file: ChatFile }) => {
  return (
    <a 
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
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = '/placeholder-image.png';
          }}
        />
      ) : (
        <div className="h-8 w-8 bg-gray-200 rounded flex items-center justify-center mr-2">
          <span className="text-xs">{file.name.split('.').pop()}</span>
        </div>
      )}
      <span className="truncate max-w-[120px]">{file.name}</span>
    </a>
  );
};

// Rich message components wrapped in error boundaries
const RichOrderMessage = ({ order, onViewDetails }: { order: any, onViewDetails: () => void }) => {
  return (
    <ErrorBoundary fallback={
      <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
        Error displaying order information
      </div>
    }>
      <OrderCard order={order} onViewDetails={onViewDetails} />
    </ErrorBoundary>
  );
};

const RichProductMessage = ({ products }: { products: any[] }) => {
  return (
    <ErrorBoundary fallback={
      <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
        Error displaying products
      </div>
    }>
      <ProductGallery products={products} />
    </ErrorBoundary>
  );
};

const RichFormMessage = ({ formConfig, onSubmit }: { formConfig: any, onSubmit: (data: any) => void }) => {
  return (
    <ErrorBoundary fallback={
      <div className="p-3 bg-red-50 text-red-800 rounded-md text-sm">
        Error displaying form
      </div>
    }>
      <DynamicForm formConfig={formConfig} onSubmit={onSubmit} />
    </ErrorBoundary>
  );
};

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);

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
        logger.error('Connection check failed:', error);
        setIsConnected(false);
        setConnectionError('Failed to connect to server');
      }
    };

    checkConnection();
    
    // Set up an interval to periodically check connection
    const connectionInterval = setInterval(checkConnection, 60000); // Check every minute
    
    return () => clearInterval(connectionInterval);
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
      
      // Show error toast
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processMessage = async (inputMessage: string): Promise<{
    message: string;
    richData?: RichMessageData;
  }> => {
    try {
      // First check if it's a Printavo query that can be processed directly
      if (inputMessage.toLowerCase().includes('visual') || 
          inputMessage.toLowerCase().includes('order') ||
          inputMessage.toLowerCase().includes('invoice') ||
          /^\d{4,5}$/.test(inputMessage.trim())) {
            
        // It might be a Printavo specific query, let's try our direct processing method
        try {
          const apiUrl = '/api/chat'; // Use our custom API endpoint
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                {
                  id: Date.now().toString(),
                  content: inputMessage,
                  role: 'user',
                  timestamp: new Date().toISOString(),
                }
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
          logger.error('Error processing Printavo query:', error);
          throw error;
        }
      }

      // For non-Printavo or fallback queries, use the standard API
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
    try {
      switch (message.messageType) {
        case 'file':
          return (
            <div className="flex flex-col space-y-2">
              <p className="text-sm">{message.content}</p>
              <div className="flex flex-wrap gap-2">
                {message.files?.map(file => (
                  <FileAttachment key={file.id} file={file} />
                ))}
              </div>
            </div>
          );
        
        case 'text':
          // Check if there's rich data to render
          if (message.richData) {
            try {
              switch (message.richData.type) {
                case 'order':
                  return (
                    <div className="flex flex-col space-y-3">
                      <p className="text-sm">{message.content}</p>
                      <RichOrderMessage 
                        order={message.richData.content} 
                        onViewDetails={() => console.log(`View order: ${message.richData?.content.id}`)}
                      />
                    </div>
                  );
                  
                case 'product':
                  return (
                    <div className="flex flex-col space-y-3">
                      <p className="text-sm">{message.content}</p>
                      <RichProductMessage products={message.richData.content} />
                    </div>
                  );
                
                case 'form':
                  return (
                    <div className="flex flex-col space-y-3">
                      <p className="text-sm">{message.content}</p>
                      <RichFormMessage 
                        formConfig={message.richData.content} 
                        onSubmit={(data) => console.log('Form submitted:', data)}
                      />
                    </div>
                  );
                  
                default:
                  return <p className="text-sm">{message.content}</p>;
              }
            } catch (error) {
              logger.error('Error rendering rich message:', error);
              return (
                <div className="flex flex-col space-y-2">
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs text-red-500">Error displaying rich content</p>
                </div>
              );
            }
          } else {
            // Regular text message
            return (
              <p className="text-sm whitespace-pre-wrap">
                {message.content}
              </p>
            );
          }
          
        default:
          return <p className="text-sm">{message.content}</p>;
      }
    } catch (error) {
      logger.error('Error rendering message:', error);
      return <p className="text-sm text-red-500">Error displaying message</p>;
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Connection error banner */}
      {connectionError && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 z-10 text-center text-sm">
          <span className="flex items-center justify-center gap-2">
            <XCircle className="h-4 w-4" />
            {connectionError}
          </span>
        </div>
      )}

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={`flex flex-col ${
                message.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div className={`flex flex-col max-w-[85%] rounded-lg p-3 ${
                message.role === 'user' 
                  ? 'bg-primary text-primary-foreground'
                  : message.role === 'system'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-muted'
              }`}>
                {renderMessage(message)}
              </div>
              <span className="text-xs text-muted-foreground mt-1">
                {formatTimestamp(message.timestamp)}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* File upload overlay */}
      {showUpload && (
        <div className="p-4 bg-background border-t">
          <FileUpload 
            onUpload={handleFileUpload} 
            onCancel={() => setShowUpload(false)}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Input area */}
      <form 
        onSubmit={handleSubmit} 
        className="border-t p-3 bg-background flex items-center gap-2"
      >
        {isVoiceEnabled && (
          <VoiceControl
            onSpeechInput={(text) => setInput(text)}
            disabled={isLoading}
          />
        )}
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isLoading}
          onClick={() => setShowUpload(!showUpload)}
          className="flex-shrink-0"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
          <span className="sr-only">Attach file</span>
        </Button>
        
        <div className="flex-1 relative">
          <Input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="pr-10"
            aria-label="Message input"
          />
        </div>
        
        <Button 
          type="submit" 
          size="icon"
          disabled={isLoading || !input.trim()}
          className="flex-shrink-0"
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent" />
          ) : (
            <Send className="h-5 w-5" />
          )}
          <span className="sr-only">Send message</span>
        </Button>
      </form>
    </div>
  );
}