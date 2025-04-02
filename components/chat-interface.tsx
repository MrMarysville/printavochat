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
import { 
  ChatMessage, 
  ChatFile, 
  RichMessageData, 
  MessageRole, 
  MessageType,
  getMessageStyles
} from '@/lib/types/chat';
import { Badge } from "@/components/ui/badge";

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

// Quote creation component
const RichQuoteMessage = ({ quoteData, onUpdate }: { 
  quoteData: any, 
  onUpdate: (data: any, action: string) => void 
}) => {
  const stage = quoteData?.stage || 'initial';
  
  const handleAddLineItem = () => {
    onUpdate({ action: 'add_line_item' }, 'add_line_item');
  };
  
  const handleSubmitQuote = () => {
    onUpdate({ action: 'finalize_quote' }, 'finalize_quote');
  };
  
  return (
    <div className="border border-blue-200 rounded-md p-3 bg-blue-50 w-full mt-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-blue-900">Quote Creation</h3>
        <Badge variant="outline" className="bg-blue-100">
          {stage === 'initial' ? 'Started' :
           stage === 'customer_selected' ? 'Customer Selected' :
           stage === 'adding_items' ? 'Adding Items' :
           stage === 'review' ? 'Review' : 'Processing'}
        </Badge>
      </div>
      
      {quoteData?.customer && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-500">Customer</p>
          <p className="text-sm">{quoteData.customer.name}</p>
        </div>
      )}
      
      {quoteData?.lineItems && quoteData.lineItems.length > 0 && (
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-500">Line Items</p>
          <ul className="text-sm space-y-1">
            {quoteData.lineItems.map((item: any, index: number) => (
              <li key={index} className="flex justify-between p-1 hover:bg-blue-100 rounded">
                <span>
                  {item.quantity} x {item.product} 
                  {item.color && ` - ${item.color}`}
                </span>
                <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {stage === 'adding_items' && (
        <Button 
          size="sm" 
          variant="outline" 
          className="mr-2"
          onClick={handleAddLineItem}
        >
          Add Another Item
        </Button>
      )}
      
      {stage === 'review' && (
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Total</span>
            <span>${quoteData.total?.toFixed(2) || '0.00'}</span>
          </div>
          
          <Button 
            size="sm" 
            className="w-full"
            onClick={handleSubmitQuote}
          >
            Submit Quote
          </Button>
        </div>
      )}
      
      {quoteData?.notes && (
        <div className="mt-2 text-xs text-gray-500">
          <p className="font-medium">Notes</p>
          <p>{quoteData.notes}</p>
        </div>
      )}
    </div>
  );
};

// Add a customer profile component
const RichCustomerMessage = ({ customer, onCreateQuote }: { 
  customer: any,
  onCreateQuote?: () => void
}) => {
  return (
    <div className="border border-green-200 rounded-md p-3 bg-green-50 w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-green-900">{customer.name}</h3>
        <Badge variant="outline" className="bg-green-100">Customer</Badge>
      </div>
      
      <div className="space-y-1 text-sm mb-3">
        <p><span className="font-medium">Email:</span> {customer.email}</p>
        {customer.phone && <p><span className="font-medium">Phone:</span> {customer.phone}</p>}
        {customer.address && <p><span className="font-medium">Address:</span> {customer.address}</p>}
      </div>
      
      {onCreateQuote && (
        <Button 
          size="sm" 
          variant="outline" 
          className="w-full"
          onClick={onCreateQuote}
        >
          Create Quote for {customer.name}
        </Button>
      )}
    </div>
  );
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I can help you with Printavo operations. What would you like to do?',
      role: MessageRole.ASSISTANT,
      timestamp: new Date().toISOString(),
      messageType: MessageType.TEXT
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
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: input,
      role: MessageRole.USER,
      timestamp: new Date().toISOString(),
      messageType: MessageType.TEXT
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Process the message and get response
      const response = await processMessage(input);
      
      // Add assistant's response to chat
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        content: response.message,
        role: MessageRole.ASSISTANT,
        timestamp: new Date().toISOString(),
        messageType: MessageType.TEXT,
        richData: response.richData
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      logger.error('Chat interface error:', error);
      
      // Handle errors
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        content: error instanceof Error 
          ? `Error: ${error.message}` 
          : 'Sorry, I encountered an error processing your request.',
        role: MessageRole.SYSTEM,
        timestamp: new Date().toISOString(),
        messageType: MessageType.TEXT
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
      // Try to detect if it's a customer creation message with structured data
      if (inputMessage.includes('create customer') || 
          inputMessage.includes('add customer') || 
          inputMessage.includes('new customer')) {
            
        // Check if it contains email which is required
        const emailMatch = inputMessage.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
        
        if (emailMatch) {
          try {
            // Extract customer data
            const email = emailMatch[0];
            
            // Check if customer already exists
            const checkResponse = await fetch('/api/messages/customer', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                action: 'check_exists',
                email: email
              }),
            });
            
            if (!checkResponse.ok) {
              throw new Error(`HTTP error! status: ${checkResponse.status}`);
            }
            
            const checkData = await checkResponse.json();
            
            if (checkData.exists) {
              // Customer exists
              return {
                message: `I found an existing customer with this email address: ${email}.\n\n${checkData.customer.name}\nEmail: ${email}\n${checkData.customer.phone ? `Phone: ${checkData.customer.phone}\n` : ''}${checkData.customer.address ? `Address: ${checkData.customer.address}` : ''}`,
                richData: {
                  type: 'customer',
                  content: checkData.customer
                }
              };
            }
            
            // Try to extract name
            let name = '';
            
            // Look for name patterns
            const namePatterns = [
              /name:?\s*([^,\n]+)/i,
              /for\s+([^,@\n]+)(?=\s+with|$|\s+at)/i,
              /customer(?:\s+is|:)?\s+([^,@\n]+)/i,
              /client(?:\s+is|:)?\s+([^,@\n]+)/i,
              /new customer[:\s]+([^,@\n]+)/i
            ];
            
            for (const pattern of namePatterns) {
              const match = inputMessage.match(pattern);
              if (match && match[1]) {
                name = match[1].trim();
                break;
              }
            }
            
            // Extract phone
            const phone = extractPhone(inputMessage);
            
            // Extract address parts
            const streetMatch = inputMessage.match(/(?:street|address)[:\s]+([^,\n]+)/i);
            const cityMatch = inputMessage.match(/city[:\s]+([^,\n]+)/i);
            const stateMatch = inputMessage.match(/state[:\s]+([^,\n]+)/i);
            const zipMatch = inputMessage.match(/(?:zip|postal)[:\s]+([^,\n]+)/i);
            
            const street = streetMatch ? streetMatch[1].trim() : '';
            const city = cityMatch ? cityMatch[1].trim() : '';
            const state = stateMatch ? stateMatch[1].trim() : '';
            const zip = zipMatch ? zipMatch[1].trim() : '';
            
            // If we have enough data (at least name and email), create the customer
            if (name) {
              const createResponse = await fetch('/api/messages/customer', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  action: 'create',
                  name,
                  email,
                  phone,
                  street,
                  city,
                  state,
                  zip
                }),
              });
              
              if (!createResponse.ok) {
                throw new Error(`HTTP error! status: ${createResponse.status}`);
              }
              
              const createData = await createResponse.json();
              
              return {
                message: `I've created a new customer for you:\n\n**${name}**\nEmail: ${email}\n${phone ? `Phone: ${phone}\n` : ''}${(street || city || state || zip) ? 'Address: ' + [street, (city && state) ? `${city}, ${state} ${zip}` : city || state || zip].filter(Boolean).join('\n') : ''}`,
                richData: {
                  type: 'customer',
                  content: createData.customer
                }
              };
            } else {
              // We have an email but not enough other data
              return {
                message: `I can create a new customer with email ${email}. Could you please provide the customer's name?`,
                richData: {
                  type: 'customer_creation',
                  content: {
                    stage: 'need_name',
                    email
                  }
                }
              };
            }
          } catch (error) {
            logger.error('Error processing customer creation:', error);
            return {
              message: `I had trouble processing the customer information. Please make sure to include at least a name and email address.`,
              richData: {
                type: 'error',
                content: {
                  error: error instanceof Error ? error.message : 'Unknown error'
                }
              }
            };
          }
        }
      }
      
      // Check if it might be a quote-related query
      const lowerInput = inputMessage.toLowerCase();
      const isQuoteQuery = lowerInput.includes('quote') || 
                          lowerInput.includes('order') || 
                          /pc\d+|st\d+|k\d+/i.test(inputMessage); // SanMar product codes
      
      if (isQuoteQuery) {
        // Use the new messages API for potential quote creation
        try {
          const apiUrl = '/api/messages';
          const response = await fetch(apiUrl, {
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
                  role: MessageRole.USER,
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          
          // Check if this is a quote creation response
          if (data.type === 'quote_creation') {
            return {
              message: data.message,
              richData: {
                type: 'quote_creation',
                content: data.data
              }
            };
          }
          
          return {
            message: data.message,
            richData: data.richData
          };
        } catch (error) {
          logger.error('Error processing with messages API:', error);
          throw error;
        }
      }
      
      // First check if it's a Printavo query that can be processed directly
      if (inputMessage.toLowerCase().includes('visual') || 
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
                  role: MessageRole.USER,
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
              role: MessageRole.USER,
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

  // Helper function to extract phone numbers from text
  const extractPhone = (text: string): string => {
    // Look for phone number patterns
    const phonePatterns = [
      /phone:?\s*(\+?[0-9][\s-()0-9]{9,})/i,
      /(?:^|\s|,)(\+?[0-9][\s-()0-9]{9,})(?:$|\s|,)/,
      /(?:^|\s|,)(\([0-9]{3}\)\s*[0-9]{3}-[0-9]{4})(?:$|\s|,)/,
      /(?:^|\s|,)([0-9]{3}-[0-9]{3}-[0-9]{4})(?:$|\s|,)/
    ];
    
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return '';
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
      const fileMessage: ChatMessage = {
        id: Date.now().toString(),
        content: files.length === 1 
          ? `I've uploaded a file: ${files[0].name}` 
          : `I've uploaded ${files.length} files`,
        role: MessageRole.USER,
        timestamp: new Date().toISOString(),
        files: data.files.map((file: any) => ({
          id: file.fileName,
          name: file.originalName,
          url: file.url,
          type: file.type,
          size: file.size
        })),
        messageType: MessageType.FILE
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
  
  const handleUploadedFiles = async (fileMessage: ChatMessage) => {
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
      const assistantMessage: ChatMessage = {
        id: Date.now().toString() + '-assistant',
        content: data.message,
        role: MessageRole.ASSISTANT,
        timestamp: new Date().toISOString(),
        messageType: MessageType.TEXT,
        richData: data.richData
      };
      
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (error) {
      logger.error('Error processing uploaded files:', error);
      
      const errorMessage: ChatMessage = {
        id: Date.now().toString() + '-error',
        content: error instanceof Error 
          ? `Error processing uploaded files: ${error.message}` 
          : 'Sorry, I encountered an error processing your files.',
        role: MessageRole.SYSTEM,
        timestamp: new Date().toISOString(),
        messageType: MessageType.TEXT
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const renderMessage = (message: ChatMessage) => {
    const styles = getMessageStyles(message.role);
    
    // Format message content with line breaks
    const formattedContent = message.content.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < message.content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
    
    // Handle rich data display
    let richContent = null;
    if (message.richData) {
      if (message.richData.type === 'order' && message.richData.content) {
        // Display an order card
        richContent = (
          <div className="mt-3">
            <RichOrderMessage 
              order={message.richData.content}
              onViewDetails={() => {
                // Handle viewing order details
                window.open(`/orders/${message.richData.content.id}`, '_blank');
              }}
            />
          </div>
        );
      } else if (message.richData.type === 'products' && Array.isArray(message.richData.content)) {
        // Display product gallery
        richContent = (
          <div className="mt-3">
            <RichProductMessage products={message.richData.content} />
          </div>
        );
      } else if (message.richData.type === 'form' && message.richData.content) {
        // Display dynamic form
        richContent = (
          <div className="mt-3">
            <RichFormMessage 
              formConfig={message.richData.content}
              onSubmit={(data) => {
                // Handle form submission
                console.log('Form data:', data);
                setInput(`I've completed the form with: ${JSON.stringify(data)}`);
              }}
            />
          </div>
        );
      } else if (message.richData.type === 'quote_creation' && message.richData.content) {
        // Display quote creation UI
        richContent = (
          <div className="mt-3">
            <RichQuoteMessage 
              quoteData={message.richData.content}
              onUpdate={(data, action) => {
                // Handle quote updates
                setInput(`${action}: ${JSON.stringify(data)}`);
              }}
            />
          </div>
        );
      } else if (message.richData.type === 'customer' && message.richData.content) {
        // Display customer information
        richContent = (
          <div className="mt-3">
            <RichCustomerMessage 
              customer={message.richData.content}
              onCreateQuote={() => {
                // Handle quote creation for this customer
                setInput(`Create a quote for ${message.richData.content.name}`);
              }}
            />
          </div>
        );
      } else if (message.richData.type === 'agent_response' && message.richData.content) {
        // Display agent response with special formatting
        richContent = (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-xs font-medium text-blue-700 mb-2">Agent Response</div>
            {typeof message.richData.content === 'object' && (
              <pre className="text-xs overflow-auto max-h-60 bg-blue-100 p-2 rounded">
                {JSON.stringify(message.richData.content, null, 2)}
              </pre>
            )}
          </div>
        );
      }
    }
    
    return (
      <div 
        key={message.id}
        className={`${styles.containerClass} p-3 rounded-lg max-w-[85%] mb-4`}
      >
        {/* Message files */}
        {message.files && message.files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {message.files.map(file => (
              <FileAttachment key={file.id} file={file} />
            ))}
          </div>
        )}
        
        {/* Message content */}
        <div className={styles.textClass}>
          {formattedContent}
        </div>
        
        {/* Rich content */}
        {richContent}
        
        {/* Timestamp */}
        <div className="text-xs opacity-50 mt-1">
          {formatTimestamp(message.timestamp)}
        </div>
      </div>
    );
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
                message.role === MessageRole.USER ? 'items-end' : 'items-start'
              }`}
            >
              <div className={`flex flex-col max-w-[85%] rounded-lg p-3 ${
                message.role === MessageRole.USER 
                  ? 'bg-primary text-primary-foreground'
                  : message.role === MessageRole.SYSTEM
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