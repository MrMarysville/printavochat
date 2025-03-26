"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, WifiOff, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface HealthCheckResult {
  timestamp: string;
  environment: {
    api_url: { set: boolean; value: string };
    api_email: { set: boolean; value: string | undefined };
    api_token: { set: boolean; value: string | undefined };
  };
  tests: {
    account: { success: boolean; error?: string };
    recentOrders: { success: boolean; error?: string };
  };
  summary: {
    environment_ready: boolean;
    all_tests_passed: boolean;
    working_connection: boolean;
  };
}

export default function PrintavoConnectionStatus() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'not-checked'>('not-checked');
  const [healthData, setHealthData] = useState<HealthCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkHealth = async () => {
    setIsChecking(true);
    setStatus('loading');
    
    try {
      const response = await fetch('/api/printavo/health');
      const data = await response.json();
      
      setHealthData(data);
      setStatus(data.summary.all_tests_passed ? 'success' : 'error');
      
      if (data.summary.all_tests_passed) {
        toast({
          title: "Connection Success",
          description: "Successfully connected to Printavo API",
          variant: "default",
        });
      } else {
        toast({
          title: "Connection Issues",
          description: "Could not connect to Printavo API. See details for more information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setStatus('error');
      toast({
        title: "Connection Error",
        description: "Failed to check Printavo API connection",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'loading':
        return <RefreshCw className="h-6 w-6 text-yellow-500 animate-spin" />;
      default:
        return <WifiOff className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'success':
        return "Connected to Printavo";
      case 'error':
        return "Printavo Connection Issues";
      case 'loading':
        return "Checking Connection...";
      default:
        return "Connection Status Unknown";
    }
  };

  return (
    <Card className={`shadow-sm ${status === 'error' ? 'border-red-200' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Printavo API Status</CardTitle>
          {getStatusIcon()}
        </div>
        <CardDescription>
          {getStatusText()}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-sm pb-2">
        {status === 'error' && healthData && (
          <div className="space-y-2">
            <div className="bg-red-50 p-3 rounded-md">
              <h4 className="font-medium text-red-800">Connection Issues</h4>
              <ul className="list-disc pl-4 mt-1 text-red-700 text-xs">
                {!healthData.environment.api_email.set && (
                  <li>API Email is not set in environment variables</li>
                )}
                {!healthData.environment.api_token.set && (
                  <li>API Token is not set in environment variables</li>
                )}
                {!healthData.tests.account.success && (
                  <li>Account test failed: {healthData.tests.account.error}</li>
                )}
                {!healthData.tests.recentOrders.success && (
                  <li>Recent orders test failed: {healthData.tests.recentOrders.error}</li>
                )}
              </ul>
            </div>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-green-700">
            <p>All systems operational</p>
            <p className="text-xs text-gray-500 mt-1">
              Last checked: {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'Unknown'}
            </p>
          </div>
        )}
        
        {status === 'loading' && (
          <div className="h-16 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkHealth}
          disabled={isChecking}
          className="w-full text-xs"
        >
          {isChecking ? (
            <>
              <RefreshCw className="h-3 w-3 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="h-3 w-3 mr-2" />
              Check Connection
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 