"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { logger } from '@/lib/logger';
import { ErrorSimulator } from './error-simulation';

// Alert and AlertDescription custom components since we don't have the real ones
const Alert = ({ children, className = "", ...props }) => (
  <div className={`border p-4 rounded-md bg-blue-50 border-blue-200 ${className}`} {...props}>
    {children}
  </div>
);

const AlertTitle = ({ children }) => (
  <h5 className="font-medium mb-1">{children}</h5>
);

const AlertDescription = ({ children }) => (
  <div className="text-sm">{children}</div>
);

// Tabs components
const Tabs = ({ children, defaultValue, ...props }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            activeTab, 
            setActiveTab 
          });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ children, className = "", ...props }) => (
  <div className={`flex space-x-2 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const TabsTrigger = ({ value, activeTab, setActiveTab, children }) => (
  <button
    className={`px-3 py-1 rounded ${activeTab === value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
    onClick={() => setActiveTab(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ value, activeTab, children }) => {
  if (value !== activeTab) return null;
  return <div>{children}</div>;
};

// Accordion components
const Accordion = ({ children, type, collapsible }) => {
  const [openItems, setOpenItems] = useState(new Set());
  
  const toggleItem = (itemValue) => {
    setOpenItems(prev => {
      const newItems = new Set(prev);
      if (newItems.has(itemValue)) {
        newItems.delete(itemValue);
      } else {
        if (type === 'single') {
          newItems.clear();
        }
        newItems.add(itemValue);
      }
      return newItems;
    });
  };
  
  return (
    <div className="border rounded-md overflow-hidden">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            isOpen: openItems.has(child.props.value),
            toggleItem
          });
        }
        return child;
      })}
    </div>
  );
};

const AccordionItem = ({ value, isOpen, toggleItem, children }) => (
  <div className="border-b last:border-b-0">
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { 
          value,
          isOpen,
          toggleItem
        });
      }
      return child;
    })}
  </div>
);

const AccordionTrigger = ({ value, isOpen, toggleItem, children }) => (
  <button
    className="w-full p-3 text-left flex justify-between items-center"
    onClick={() => toggleItem(value)}
  >
    {children}
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="16" 
      height="16" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  </button>
);

const AccordionContent = ({ isOpen, children }) => {
  if (!isOpen) return null;
  return (
    <div className="p-3 border-t bg-gray-50">
      {children}
    </div>
  );
};

// Define error log entry type
interface ErrorLogEntry {
  id: string;
  timestamp: string;
  message: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  details: any;
  stack?: string;
  componentStack?: string;
  source?: string;
  url?: string;
}

// Memory storage for errors in this session
const errorLog: ErrorLogEntry[] = [];

// Add error listener that captures all errors
const setupErrorCapture = () => {
  // Only run in browser
  if (typeof window === 'undefined') return;

  // Capture uncaught errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message);
    
    errorLog.unshift({
      id: `err_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      level: 'error',
      details: {
        fileName: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
      },
      stack: error.stack,
      source: 'window.onerror',
      url: window.location.href
    });
  });

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    
    errorLog.unshift({
      id: `promise_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: error.message || 'Unhandled promise rejection',
      level: 'error',
      details: event.reason,
      stack: error.stack,
      source: 'unhandledrejection',
      url: window.location.href
    });
  });

  // Override console.error to capture errors
  const originalConsoleError = console.error;
  console.error = (...args) => {
    // Call original console.error
    originalConsoleError(...args);
    
    // Extract error if present
    const errorArg = args.find(arg => arg instanceof Error);
    const error = errorArg || new Error(args.map(a => String(a)).join(' '));
    
    errorLog.unshift({
      id: `console_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: new Date().toISOString(),
      message: args.map(a => String(a)).join(' '),
      level: 'error',
      details: args,
      stack: error.stack,
      source: 'console.error',
      url: window.location.href
    });
  };

  // Restore original console.error on unmount
  return () => {
    console.error = originalConsoleError;
  };
};

// Function to trigger test errors
const triggerTestError = (type: string) => {
  switch (type) {
    case 'sync':
      throw new Error('Test synchronous error');
    case 'async':
      setTimeout(() => {
        throw new Error('Test async error');
      }, 0);
    case 'promise':
      Promise.reject(new Error('Test promise rejection'));
      break;
    case 'api':
      fetch('/api/non-existent-endpoint')
        .then(response => {
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          return response.json();
        })
        .catch(error => {
          console.error('API error:', error);
        });
      break;
    case 'graphql':
      logger.error('GraphQL error test', {
        errors: [{ message: 'Test GraphQL error', path: ['query', 'field'] }],
        operationName: 'TestQuery',
        variables: { test: true }
      });
      break;
    default:
      console.error('Unknown test error type');
  }
};

const ErrorDebugPage: React.FC = () => {
  const [errors, setErrors] = useState<ErrorLogEntry[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Setup error capture
  useEffect(() => {
    const cleanup = setupErrorCapture();
    return cleanup;
  }, []);

  // Refresh error list
  useEffect(() => {
    setErrors([...errorLog]);
    
    // Set up auto-refresh timer
    let timer: NodeJS.Timeout;
    if (autoRefresh) {
      timer = setInterval(() => {
        setErrors([...errorLog]);
      }, 3000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [refreshKey, autoRefresh]);

  const clearErrors = () => {
    errorLog.length = 0;
    setErrors([]);
  };

  const refreshErrors = () => {
    setRefreshKey(prev => prev + 1);
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  // Helper to format the timestamp
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };

  // Function to format JSON for display
  const formatJSON = (data: any): JSX.Element => {
    if (!data) return <span>null</span>;
    
    try {
      const formatted = JSON.stringify(data, null, 2);
      return (
        <pre className="whitespace-pre-wrap overflow-x-auto text-xs bg-gray-100 p-2 rounded">
          {formatted}
        </pre>
      );
    } catch (e) {
      return <span>Unable to format: {String(e)}</span>;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Error Monitoring Dashboard</CardTitle>
          <CardDescription>
            View and debug application errors in real-time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="space-x-2">
              <Button onClick={refreshErrors} variant="outline">
                Refresh
              </Button>
              <Button onClick={clearErrors} variant="outline" className="text-red-500 border-red-300">
                Clear All
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={toggleAutoRefresh} />
              <Label htmlFor="auto-refresh">Auto-refresh</Label>
            </div>
          </div>
          
          <Alert className="mb-6">
            <AlertTitle>Debug Tools</AlertTitle>
            <AlertDescription>
              <div className="mt-2">
                <p className="mb-2">Generate test errors to verify error handling:</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => triggerTestError('sync')}>
                    Sync Error
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => triggerTestError('async')}>
                    Async Error
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => triggerTestError('promise')}>
                    Promise Rejection
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => triggerTestError('api')}>
                    API Error
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => triggerTestError('graphql')}>
                    GraphQL Error
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
          
          {/* Add the specific error simulator for the issues we were having */}
          <ErrorSimulator />
          
          {errors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No errors logged in this session
            </div>
          ) : (
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All ({errors.length})</TabsTrigger>
                <TabsTrigger value="js">
                  JavaScript ({errors.filter(e => e.source !== 'graphql').length})
                </TabsTrigger>
                <TabsTrigger value="api">
                  API/GraphQL ({errors.filter(e => e.source === 'graphql' || e.message.includes('API') || e.message.includes('GraphQL')).length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all">
                <ErrorList errors={errors} />
              </TabsContent>
              
              <TabsContent value="js">
                <ErrorList errors={errors.filter(e => e.source !== 'graphql')} />
              </TabsContent>
              
              <TabsContent value="api">
                <ErrorList errors={errors.filter(e => 
                  e.source === 'graphql' || 
                  e.message.includes('API') || 
                  e.message.includes('GraphQL')
                )} />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="text-sm text-gray-500">
          Error logs are stored in memory and will be cleared when you refresh the page.
        </CardFooter>
      </Card>
    </div>
  );
};

// Error list component
const ErrorList: React.FC<{ errors: ErrorLogEntry[] }> = ({ errors }) => {
  return (
    <div className="space-y-4">
      {errors.map((error) => (
        <Accordion type="single" collapsible key={error.id}>
          <AccordionItem value={error.id}>
            <AccordionTrigger>
              <div className="flex items-start text-left">
                <Badge className={
                  error.level === 'error' ? 'bg-red-100 text-red-800' :
                  error.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }>
                  {error.level}
                </Badge>
                <div className="ml-2">
                  <div className="font-medium">{error.message.substring(0, 100)}{error.message.length > 100 ? '...' : ''}</div>
                  <div className="text-xs text-gray-500">{formatTime(error.timestamp)} · {error.source || 'unknown'}</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-semibold mb-1">Error Message</h4>
                  <div className="bg-gray-100 p-2 rounded">{error.message}</div>
                </div>
                
                {error.stack && (
                  <div>
                    <h4 className="font-semibold mb-1">Stack Trace</h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
                      {error.stack}
                    </pre>
                  </div>
                )}
                
                {error.componentStack && (
                  <div>
                    <h4 className="font-semibold mb-1">Component Stack</h4>
                    <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto max-h-40 overflow-y-auto">
                      {error.componentStack}
                    </pre>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold mb-1">Details</h4>
                  {formatJSON(error.details)}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-semibold mb-1">Time</h4>
                    <div className="bg-gray-100 p-2 rounded">{new Date(error.timestamp).toLocaleString()}</div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Source</h4>
                    <div className="bg-gray-100 p-2 rounded">{error.source || 'Unknown'}</div>
                  </div>
                </div>
                
                {error.url && (
                  <div>
                    <h4 className="font-semibold mb-1">URL</h4>
                    <div className="bg-gray-100 p-2 rounded text-xs break-all">{error.url}</div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
};

export default ErrorDebugPage; 