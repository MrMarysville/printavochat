"use client";

import React, { useState, useEffect } from 'react';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import { printavoService } from '@/lib/printavo-service';
import { cn } from '@/lib/utils';
import { getStatusColorClass } from '@/lib/status-utils';
import { Button } from './button';
import { useToast } from './use-toast';

interface StatusOption {
  id: string;
  name: string;
  color?: string;
  description?: string;
}

interface StatusSelectProps {
  currentStatusId?: string;
  currentStatusName?: string;
  orderId: string;
  onStatusChange?: (statusId: string, statusName: string) => void;
  disabled?: boolean;
  className?: string;
}

export function StatusSelect({
  currentStatusId,
  currentStatusName,
  orderId,
  onStatusChange,
  disabled = false,
  className,
}: StatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [statuses, setStatuses] = useState<StatusOption[]>([]);
  const { toast } = useToast();

  // Load statuses on component mount
  useEffect(() => {
    const loadStatuses = async () => {
      setIsLoading(true);
      try {
        const response = await printavoService.getStatuses();
        if (response.success && response.data?.statuses) {
          setStatuses(response.data.statuses);
        } else {
          console.error('Failed to load statuses:', response.error);
          toast({
            title: 'Error loading statuses',
            description: 'Could not load available statuses.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error loading statuses:', error);
        toast({
          title: 'Error loading statuses',
          description: 'An unexpected error occurred.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadStatuses();
  }, [toast]);

  // Handle status selection
  const handleStatusSelect = async (status: StatusOption) => {
    if (status.id === currentStatusId) {
      setIsOpen(false);
      return;
    }

    setUpdating(true);
    try {
      const response = await printavoService.updateStatus(orderId, status.id);
      if (response.success) {
        // Update the UI
        if (onStatusChange) {
          onStatusChange(status.id, status.name);
        }
        
        toast({
          title: 'Status updated',
          description: `Order status changed to ${status.name}`,
        });
      } else {
        console.error('Failed to update status:', response.error);
        toast({
          title: 'Error updating status',
          description: 'Could not update the order status.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error updating status',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
      setIsOpen(false);
    }
  };

  // Get status color class for a status
  const getBackgroundColorClass = (statusId?: string, statuses: StatusOption[] = []) => {
    if (!statusId) return '';
    const status = statuses.find(s => s.id === statusId);
    if (!status) return '';
    return getStatusColorClass(status.name);
  };

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          "w-full justify-between font-normal",
          currentStatusId && getBackgroundColorClass(currentStatusId, statuses),
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading || updating}
      >
        {updating ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <>
            {currentStatusName || 'Select status'}
            <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
          </>
        )}
      </Button>
      
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg border max-h-60 overflow-auto">
          <ul className="py-1">
            {isLoading ? (
              <li className="px-3 py-2 text-sm text-center text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                Loading statuses...
              </li>
            ) : statuses.length === 0 ? (
              <li className="px-3 py-2 text-sm text-center text-gray-500">
                No statuses available
              </li>
            ) : (
              statuses.map((status) => (
                <li 
                  key={status.id}
                  className={cn(
                    "px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 flex items-center justify-between",
                    status.id === currentStatusId && "bg-blue-50 text-blue-700"
                  )}
                  onClick={() => handleStatusSelect(status)}
                >
                  <span>{status.name}</span>
                  {status.id === currentStatusId && (
                    <Check className="h-4 w-4" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
} 