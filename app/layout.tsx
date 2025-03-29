import './globals.css';
import React from 'react';
// Remove the next/font import that's causing the conflict
import { Toaster } from '@/components/ui/toaster';
import { ToastProvider } from '@/components/ui/use-toast';
import { Navbar } from '@/components/Navbar';
import type { Metadata } from 'next';
import { cn } from '@/lib/utils';
import ChatWidget from '@/components/ChatWidget';

// Instead of using next/font, we'll use a CSS class and import the font in globals.css
// The font will be loaded via a link tag or @import in globals.css

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
      <body className="min-h-screen bg-background font-sans" suppressHydrationWarning>
        <ToastProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <ChatWidget />
          </div>
          <Toaster />
          <footer className="py-4 border-t mt-auto">
            <div className="container mx-auto flex justify-between items-center">
              <div className="text-sm text-gray-500">
                &copy; {new Date().getFullYear()} Printavo Integration
              </div>
              {process.env.NODE_ENV === 'development' && (
                <a 
                  href="/admin/debug" 
                  className="text-xs text-gray-400 hover:text-gray-600 transition"
                  title="Error Monitoring Dashboard"
                >
                  Debug Mode
                </a>
              )}
            </div>
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
