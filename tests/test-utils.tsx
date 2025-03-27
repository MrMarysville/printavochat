import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ToastProvider, useToast } from '@/components/ui/use-toast';

// Mock router
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

// Mock hooks
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock toast
const mockToast = {
  toast: jest.fn(),
  dismiss: jest.fn(),
};

// Custom wrapper component that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      {children}
    </ToastProvider>
  );
};

// Custom render function that includes providers
const customRender = (ui: React.ReactElement, options: Omit<RenderOptions, 'wrapper'> = {}) => {
  return render(ui, {
    wrapper: AllTheProviders,
    ...options,
  });
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render, mockRouter, mockToast }; 