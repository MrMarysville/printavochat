"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Wifi, WifiOff } from 'lucide-react';
import { checkConnection } from '@/lib/graphql-client';
import { logger } from '@/lib/logger';

// Named components for better error handling
const ChatInterfaceError = () => (
  <div className="bg-red-50 text-red-500 p-4 rounded-lg">
    Failed to load chat interface. Please refresh the page.
  </div>
);
ChatInterfaceError.displayName = 'ChatInterfaceError';

const ChatInterfaceLoading = () => (
  <div className="bg-secondary p-4 rounded-lg">Loading chat...</div>
);
ChatInterfaceLoading.displayName = 'ChatInterfaceLoading';

// Dynamically import the ChatInterface component with improved error handling
const ChatInterfaceDynamic = dynamic(
  () => import('./chat-interface').catch(err => {
    console.error('Failed to load chat interface:', err);
    return ChatInterfaceError;
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

  return (
    <>
      {/* Chat toggle button */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            className="h-14 w-14 rounded-full shadow-lg"
            onClick={() => setIsOpen(true)}
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Chat widget */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] shadow-xl rounded-lg overflow-hidden bg-white">
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Printavo Assistant</h3>
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
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-primary/90">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {apiStatus.checked && !apiStatus.connected && (
            <div className="bg-red-50 text-red-800 p-3 border-b border-red-200 text-sm">
              <strong>API Disconnected:</strong> Unable to connect to Printavo API.
              {apiStatus.message && <span> Error: {apiStatus.message}</span>}
            </div>
          )}
          
          <div className={`${apiStatus.checked && !apiStatus.connected ? 'h-[calc(600px-96px)]' : 'h-[calc(600px-48px)]'}`}>
            <Suspense fallback={<div className="bg-secondary p-4 rounded-lg">Loading chat...</div>}>
              <ChatInterfaceDynamic />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
}

ChatWidget.displayName = "ChatWidget";
export default ChatWidget; 