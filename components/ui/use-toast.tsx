"use client";

import * as React from "react";
import { createContext, useContext, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "destructive" | "success";

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface Toast extends ToastProps {
  id: string;
  visible: boolean;
}

interface ToastContextType {
  toast: (_props: ToastProps) => void;
  dismiss: (_id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = React.useCallback(
    ({ title, description, variant = "default", duration = 5000 }: ToastProps) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, title, description, variant, duration, visible: true }]);

      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
        );
        
        // Remove after animation
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 300);
      }, duration);

      return id;
    },
    []
  );

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );
    
    // Remove after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map(({ id, title, description, variant, visible }) => (
          <div
            key={id}
            className={cn(
              "min-w-[300px] p-4 rounded-md shadow-md transition-all duration-300 transform",
              variant === "destructive" && "bg-red-500 text-white",
              variant === "success" && "bg-green-500 text-white",
              variant === "default" && "bg-white border border-gray-200",
              visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                {title && <h3 className="font-medium">{title}</h3>}
                {description && <p className="text-sm mt-1">{description}</p>}
              </div>
              <button
                onClick={() => dismiss(id)}
                className="ml-4 text-gray-500 hover:text-gray-700"
                aria-label="Close"
                title="Close notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// Simplified version without react hooks for direct import
export const toast = (_props: ToastProps) => {
  // This is just a helper function - doesn't actually call useContext
  // The real implementation will be used through useToast() hook
  console.warn("This toast function should be used with useToast() hook instead");
  return _props;
}; 