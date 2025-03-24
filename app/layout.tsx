import './globals.css';
import React from 'react';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import ChatWidget from '@/components/ChatWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Printavo Chat',
  description: 'Printavo integration with AI chat assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "min-h-screen bg-background")} suppressHydrationWarning>
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <ChatWidget />
          </div>
          <Toaster />
        </ToastProvider>
      </body>
    </html>
  );
}
