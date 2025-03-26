/**
 * This script attempts to safely clean the .next/trace directory
 * which can cause EPERM errors on Windows
 */
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const exists = promisify(fs.exists);
const readdir = promisify(fs.readdir);
const unlink = promisify(fs.unlink);
const rmdir = promisify(fs.rmdir);

async function cleanTraceDirectory() {
  try {
    const traceDir = path.join(process.cwd(), '.next', 'trace');
    
    // Check if the trace directory exists
    const dirExists = await exists(traceDir);
    if (!dirExists) {
      console.log("Trace directory doesn't exist. No cleaning needed.");
      return;
    }
    
    // Try to read all files in the directory
    let files;
    try {
      files = await readdir(traceDir);
    } catch (err) {
      console.log(`Cannot access trace directory: ${err.message}`);
      console.log("Skipping trace directory clean due to permission issues.");
      return;
    }
    
    // Delete each file individually
    let deletedCount = 0;
    for (const file of files) {
      try {
        await unlink(path.join(traceDir, file));
        deletedCount++;
      } catch (err) {
        console.log(`Failed to delete file ${file}: ${err.message}`);
      }
    }
    
    // Try to remove the directory itself
    try {
      await rmdir(traceDir);
      console.log(`Cleaned trace directory and removed ${deletedCount} files.`);
    } catch (err) {
      console.log(`Cleaned ${deletedCount} files, but couldn't remove the trace directory: ${err.message}`);
    }
  } catch (err) {
    console.log(`Error cleaning trace directory: ${err.message}`);
    console.log("Continuing with development server startup.");
  }
}

// Execute the cleaning function
cleanTraceDirectory(); 