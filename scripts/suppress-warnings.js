#!/usr/bin/env node

/**
 * Script to suppress specific deprecation warnings
 * 
 * This is useful for warnings from dependencies that can't be immediately fixed
 */

// Store the original process.emitWarning
const originalEmitWarning = process.emitWarning;

// Replace with our filtered version
process.emitWarning = (warning, ...args) => {
  // Check if it's a deprecation warning about punycode
  if (
    warning.includes('DEP0040') || 
    warning.includes('punycode module is deprecated') ||
    (args[0] === 'DeprecationWarning' && warning.includes('punycode'))
  ) {
    // Suppress this specific warning
    return;
  }
  
  // Let all other warnings through
  return originalEmitWarning(warning, ...args);
};

// Log that warning suppression is active
console.log('Warning suppression active - suppressing punycode deprecation warnings'); 