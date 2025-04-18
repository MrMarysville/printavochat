"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { printavoService } from '@/lib/printavo-service';

export function ErrorSimulator() {
  // Simulate the "No operation named ''" error
  const simulateEmptyOperationNameError = async () => {
    try {
      // Simulate the error by logging it directly
      console.error("Simulated empty operation name error demonstration. In a real app, this would cause: Error: GraphQL errors: No operation named \"\"");
      logger.error("GraphQL request failed after 3 retries: Error: GraphQL errors: No operation named \"\"");
      
      // Also try a real API call that might fail
      await printavoService.searchOrders({ query: '', first: 1 });
    } catch (error) {
      console.error("Error during operation name simulation:", error);
    }
  };

  // Simulate a reference error
  const simulateReferenceError = () => {
    try {
      // @ts-ignore - intentionally cause error
      const result = nonExistentFunction();
    } catch (error) {
      console.error("Simulated reference error:", error);
    }
  };

  // Simulate voice control error
  const simulateVoiceControlError = () => {
    try {
      // Create an empty object to simulate a missing method
      const fakeObject = {};
      // @ts-expect-error - This is intentional to simulate a runtime error
      fakeObject.restartWakeWordRecognition();
    } catch (error) {
      console.error("Simulated voice control reference error:", error);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-slate-50 mb-6">
      <h3 className="text-lg font-medium mb-3">Error Simulation Tools</h3>
      <p className="text-sm text-gray-600 mb-4">
        These buttons simulate specific errors for testing error handling.
      </p>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        <Button
          variant="outline"
          size="sm"
          onClick={simulateEmptyOperationNameError}
          className="text-xs"
        >
          Empty GraphQL Operation
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={simulateReferenceError}
          className="text-xs"
        >
          Reference Error
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={simulateVoiceControlError}
          className="text-xs"
        >
          Voice Control Error
        </Button>
      </div>
    </div>
  );
}
