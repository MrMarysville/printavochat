"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Import UI components
import { logger } from '@/lib/logger';
import { ErrorSimulator } from './error-simulation';

// Define custom UI components since the imports are failing
// These are simplified versions of the shadcn/ui components
const Alert = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement> & { className?: string }) => (
  <div className={`border p-4 rounded-md bg-blue-50 border-blue-200 ${className}`} {...props}>
    {children}
  </div>
);

const AlertTitle = ({ children }: { children: React.ReactNode }) => (
  <h5 className="font-medium mb-1">{children}</h5>
);

const AlertDescription = ({ children }: { children: React.ReactNode }) => (
  <div className="text-sm">{children}</div>
);

// Tabs components
const Tabs = ({ children, defaultValue, ...props }: { children: React.ReactNode, defaultValue: string } & React.HTMLAttributes<HTMLDivElement>) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  return (
    <div {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, { 
            activeTab, 
            setActiveTab 
          });
        }
        return child;
      })}
    </div>
  );
};

const TabsList = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement> & { className?: string }) => (
  <div className={`flex space-x-2 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

const TabsTrigger = ({ value, activeTab, setActiveTab, children }: { 
  value: string, 
  activeTab?: string, 
  setActiveTab?: (value: string) => void, 
  children: React.ReactNode 
}) => (
  <button
    className={`px-3 py-1 rounded ${activeTab === value ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
    onClick={() => setActiveTab && setActiveTab(value)}
  >
    {children}
  </button>
);

const TabsContent = ({ value, activeTab, children }: { 
  value: string, 
  activeTab?: string, 
  children: React.ReactNode 
}) => {
  if (value !== activeTab) return null;
  return <div>{children}</div>;
};

// Accordion components
const Accordion = ({ children, type, collapsible }: { 
  children: React.ReactNode, 
  type?: 'single' | 'multiple', 
  collapsible?: boolean 
}) => {
  const [openItems, setOpenItems] = useState(new Set<string>());
  
  const toggleItem = (itemValue: string) => {
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
          return React.cloneElement(child as React.ReactElement<any>, { 
            isOpen: openItems.has((child as React.ReactElement<any>).props.value),
            toggleItem
          });
        }
        return child;
      })}
    </div>
  );
};

const AccordionItem = ({ value, isOpen, toggleItem, children }: { 
  value: string, 
  isOpen?: boolean, 
  toggleItem?: (value: string) => void, 
  children: React.ReactNode 
}) => (
  <div className="border-b last:border-b-0">
    {React.Children.map(children, child => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as React.ReactElement<any>, { 
          value,
          isOpen,
          toggleItem
        });
      }
      return child;
    })}
  </div>
);

const AccordionTrigger = ({ value, isOpen, toggleItem, children }: { 
  value: string, 
  isOpen?: boolean, 
  toggleItem?: (value: string) => void, 
  children: React.ReactNode 
}) => (
  <button
    className="w-full p-3 text-left flex justify-between items-center"
    onClick={() => toggleItem && toggleItem(value)}
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

const AccordionContent = ({ isOpen, children }: { 
  isOpen?: boolean, 
  children: React.ReactNode 
}) => {
  if (!isOpen) return null;
  return (
    <div className="p-3 border-t bg-gray-50">
      {children}
    </div>
  );
};

// Badge component
const Badge = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement> & { className?: string }) => (
  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`} {...props}>
    {children}
  </div>
);

// Switch component
const Switch = ({ id, checked, onCheckedChange }: { 
  id: string, 
  checked?: boolean, 
  onCheckedChange?: (checked: boolean) => void 
}) => (
  <button
    id={id}
    role="switch"
    aria-checked={checked}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}
    onClick={() => onCheckedChange && onCheckedChange(!checked)}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

// Label component
const Label = ({ htmlFor, children }: { htmlFor: string, children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-sm font-medium">
    {children}
  </label>
);

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

// Error list component - simplified to avoid TypeScript errors
const ErrorList: React.FC<{ errors: ErrorLogEntry[] }> = ({ errors }) => {
  return (
    <div className="space-y-4">
      {errors.map((error) => (
        <div key={error.id} className="border rounded-md overflow-hidden">
          <div className="p-3 border-b flex items-start">
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              error.level === 'error' ? 'bg-red-100 text-red-800' :
              error.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {error.level}
            </div>
            <div className="ml-2">
              <div className="font-medium">{error.message.substring(0, 100)}{error.message.length > 100 ? '...' : ''}</div>
              <div className="text-xs text-gray-500">
                {new Date(error.timestamp).toLocaleTimeString()} · {error.source || 'unknown'}
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50">
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
                <pre className="whitespace-pre-wrap overflow-x-auto text-xs bg-gray-100 p-2 rounded">
                  {error.details ? JSON.stringify(error.details, null, 2) : 'null'}
                </pre>
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default ErrorDebugPage;
