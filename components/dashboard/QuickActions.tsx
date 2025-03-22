"use client";

import React from 'react';
import { 
  PlusCircle, 
  Users, 
  Search, 
  Printer, 
  ShoppingCart, 
  FileText,
  ArrowRight
} from 'lucide-react';
import { Button } from '../ui/button';

interface QuickAction {
  label: string;
  description?: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  color?: string;
}

interface QuickActionsProps {
  actions?: QuickAction[];
  title?: string;
  showActionLabels?: boolean;
}

export function QuickActions({
  actions = [],
  title = 'Quick Actions',
  showActionLabels = true
}: QuickActionsProps) {
  // Default actions if none provided
  const defaultActions: QuickAction[] = [
    {
      label: 'New Quote',
      description: 'Create a new quote for a customer',
      icon: <PlusCircle className="h-5 w-5" />,
      onClick: () => console.log('Create quote'),
      color: 'text-blue-500'
    },
    {
      label: 'New Customer',
      description: 'Add a new customer to the system',
      icon: <Users className="h-5 w-5" />,
      onClick: () => console.log('Create customer'),
      color: 'text-green-500'
    },
    {
      label: 'Search Orders',
      description: 'Find orders by customer or order number',
      icon: <Search className="h-5 w-5" />,
      onClick: () => console.log('Search orders'),
      color: 'text-purple-500'
    },
    {
      label: 'Create Production Order',
      description: 'Create a new production order in the system',
      icon: <Printer className="h-5 w-5" />,
      onClick: () => console.log('Create production order'),
      color: 'text-orange-500'
    },
    {
      label: 'View Products',
      description: 'Browse and manage product catalog',
      icon: <ShoppingCart className="h-5 w-5" />,
      onClick: () => console.log('View products'),
      color: 'text-red-500'
    },
    {
      label: 'View Invoices',
      description: 'Browse and manage invoices',
      icon: <FileText className="h-5 w-5" />,
      onClick: () => console.log('View invoices'),
      color: 'text-teal-500'
    }
  ];

  const displayActions = actions.length > 0 ? actions : defaultActions;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h3 className="font-medium">{title}</h3>
      </div>
      
      {/* Grid layout for desktop */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {displayActions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex items-start p-3 rounded-lg border hover:bg-gray-50 transition-colors text-left group"
          >
            <div className={`p-2 rounded-full bg-opacity-10 ${action.color?.replace('text-', 'bg-')} mr-3`}>
              {React.cloneElement(action.icon as React.ReactElement, { 
                className: `h-5 w-5 ${action.color}` 
              })}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm">{action.label}</h4>
              {action.description && (
                <p className="text-xs text-gray-500 mt-1">{action.description}</p>
              )}
            </div>
            <ArrowRight className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
      
      {/* List layout for mobile */}
      <div className="md:hidden">
        <div className="divide-y">
          {displayActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="w-full flex items-center p-3 hover:bg-gray-50 transition-colors text-left"
            >
              <div className={`p-2 rounded-full bg-opacity-10 ${action.color?.replace('text-', 'bg-')} mr-3`}>
                {React.cloneElement(action.icon as React.ReactElement, { 
                  className: `h-5 w-5 ${action.color}` 
                })}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">{action.label}</h4>
                {showActionLabels && action.description && (
                  <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </button>
          ))}
        </div>
      </div>
      
      {/* Action buttons at the bottom */}
      <div className="p-4 bg-gray-50 flex justify-end">
        <Button variant="outline" size="sm" className="text-xs flex items-center gap-1">
          View All Actions <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
} 