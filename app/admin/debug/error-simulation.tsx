"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { logger } from '@/lib/logger';
import { executeGraphQL } from '@/lib/printavo-api';

export function ErrorSimulator() {
  // Simulate the "No operation named ''" error
  const simulateEmptyOperationNameError = async () => {
    try {
      // This will trigger the error by intentionally passing an empty operation name
      const query = `{ account { id } }`;
      // Add a comment to indicate this is for testing purposes only
      // In a real scenario, always provide an operation name to prevent errors
      await executeGraphQL(query, {}, "ErrorSimulation");
      
      // Log a message about simulating the error instead of actually causing it
      console.error("Simulated empty operation name error demonstration. In a real app, this would cause: Error: GraphQL errors: No operation named \"\"");
      logger.error("This is a demonstration of how the operation name error would appear in logs");
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
      // @ts-ignore - intentionally cause an error similar to the original one
      const fakeObject = {};
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