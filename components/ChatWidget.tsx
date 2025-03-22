"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';

// Dynamically import the ChatInterface component
const ChatInterfaceDynamic = dynamic(() => import('@/components/chat-interface'), {
  loading: () => <div className="bg-secondary p-4 rounded-lg">Loading chat...</div>
});

export default function ChatWidget(): React.ReactElement {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Chat toggle button */}
      {!isOpen && (
        <Button
          className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat widget */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] shadow-xl rounded-lg overflow-hidden bg-white">
          <div className="bg-primary text-white p-3 flex justify-between items-center">
            <h3 className="font-semibold">Printavo Assistant</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-primary/90">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="h-[calc(600px-48px)]">
            <Suspense fallback={<div className="bg-secondary p-4 rounded-lg">Loading chat...</div>}>
              <ChatInterfaceDynamic />
            </Suspense>
          </div>
        </div>
      )}
    </>
  );
} 