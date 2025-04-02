"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
}

export function MainNav() {
  const pathname = usePathname();
  
  const navItems: NavItem[] = [
    { href: '/', label: 'Dashboard' },
    { href: '/orders', label: 'Orders' },
    { href: '/customers', label: 'Customers' },
    { href: '/chat', label: 'Chat Assistant' },
    { href: '/sanmar', label: 'SanMar' },
    { href: '/agent-chat', label: 'Agent Chat' },
  ];
  
  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-black dark:text-white"
              : "text-muted-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
} 