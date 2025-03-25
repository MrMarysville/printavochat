"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the homepage since we're now using only the chat widget
    router.push('/');
  }, [router]);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold text-center mb-8">Redirecting to homepage...</h1>
      <p className="text-center">The chat functionality is now available in the bottom-right corner of any page.</p>
    </div>
  );
} 