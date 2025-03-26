"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Wifi, WifiOff, X } from 'lucide-react';
import { checkConnection } from '@/lib/graphql-client';
import { logger } from '@/lib/logger';
import ErrorBoundary from './error-boundary';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";

// Named components for better error handling
const ChatInterfaceError = () => (
  <div className="flex flex-col items-center justify-center h-full bg-red-50 text-red-500 p-4">
    <div className="mb-4">🔌</div>
    <h3 className="font-semibold mb-2">Failed to load chat interface</h3>
    <p className="text-sm">Please refresh the page or try again later.</p>
  </div>
);
ChatInterfaceError.displayName = 'ChatInterfaceError';

const ChatInterfaceLoading = () => (
  <div className="flex flex-col items-center justify-center h-full bg-secondary/20 p-4">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent mb-4" />
    <p className="text-sm text-muted-foreground">Loading chat interface...</p>
  </div>
);
ChatInterfaceLoading.displayName = 'ChatInterfaceLoading';

// Dynamically import the ChatInterface component with improved error handling
const ChatInterfaceDynamic = dynamic(
  () => import('./chat-interface').catch(err => {
    logger.error('Failed to load chat interface:', err);
    return () => <ChatInterfaceError />;
  }),
  {
    loading: () => <ChatInterfaceLoading />,
    ssr: false // Disable server-side rendering for this component
  }
);

function ChatWidget(): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<{
    connected: boolean;
    checked: boolean;
    account: any;
    message?: string;
  }>({
    connected: false,
    checked: false,
    account: null
  });
  const [checkingApi, setCheckingApi] = useState<boolean>(false);
  
  // Check API connection status on mount
  useEffect(() => {
    let isMounted = true;
    
    const checkApi = async () => {
      setCheckingApi(true);
      try {
        const status = await checkConnection();
        if (isMounted) {
          setApiStatus(status);
        }
      } catch (error) {
        if (isMounted) {
          logger.error("Error in component when checking API connection:", error);
          setApiStatus({
            connected: false,
            checked: true,
            account: null,
            message: error instanceof Error ? error.message : "Unknown error"
          });
        }
      } finally {
        if (isMounted) {
          setCheckingApi(false);
        }
      }
    };
    
    checkApi();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Function to manually check API connection
  const recheckApiConnection = async () => {
    setCheckingApi(true);
    try {
      // First try to check the connection using the health endpoint
      logger.info("Manually checking API connection...");
      const status = await checkConnection(true); // Force fresh check
      setApiStatus(status);
      logger.info("API connection check completed");
    } catch (error) {
      logger.error("Error rechecking API connection:", error);
      setApiStatus({
        connected: false,
        checked: true,
        account: null,
        message: error instanceof Error ? error.message : "Unknown error during connection check"
      });
    } finally {
      setCheckingApi(false);
    }
  };

  // Handle sheet open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      {/* Chat toggle button */}
      <div className="fixed bottom-4 right-4 z-40">
        <SheetTrigger asChild>
          <Button
            className="h-14 w-14 rounded-full shadow-lg"
            size="icon"
            aria-label="Open Chat Assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </SheetTrigger>
      </div>

      {/* Chat drawer */}
      <SheetContent 
        side="right" 
        className="p-0 w-[90%] sm:w-[400px] md:w-[450px] h-full flex flex-col"
        hideCloseButton={false}
      >
        <SheetHeader className="bg-primary text-white p-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-white m-0 p-0">Printavo Assistant</SheetTitle>
            {apiStatus.checked && (
              <div 
                className={`w-3 h-3 rounded-full ${apiStatus.connected ? 'bg-green-400' : 'bg-red-400'}`}
                title={apiStatus.connected ? 
                  `Connected to ${apiStatus.account?.name || 'Printavo'}` : 
                  'API disconnected - using mock data'}
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={recheckApiConnection}
              disabled={checkingApi}
              className="text-white hover:bg-primary/90"
              title="Check API connection"
            >
              {checkingApi ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent mr-1" />
              ) : apiStatus.connected ? (
                <Wifi className="h-4 w-4 mr-1" />
              ) : (
                <WifiOff className="h-4 w-4 mr-1" />
              )}
              {apiStatus.connected ? 'Connected' : 'Disconnected'}
            </Button>
            <SheetClose asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-primary/90"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>
        
        {apiStatus.checked && !apiStatus.connected && (
          <div className="bg-red-50 text-red-800 p-3 border-b border-red-200 text-sm">
            <strong>API Disconnected:</strong> Unable to connect to Printavo API.
            {apiStatus.message && <span> Error: {apiStatus.message}</span>}
          </div>
        )}
        
        <div className="flex-1 overflow-hidden">
          <ErrorBoundary fallback={<ChatInterfaceError />}>
            <Suspense fallback={<ChatInterfaceLoading />}>
              <ChatInterfaceDynamic />
            </Suspense>
          </ErrorBoundary>
        </div>
      </SheetContent>
    </Sheet>
  );
}

ChatWidget.displayName = "ChatWidget";
export default ChatWidget;