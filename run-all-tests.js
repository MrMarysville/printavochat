/**
 * Printavo SanMar Integration - Master Test Runner
 * 
 * This script runs all test files in sequence to provide a comprehensive test suite
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TEST_FILES = [
  'printavo-tests.js',  // Main tests with mock data
  'st850-test.js',      // ST850-specific tests
  'mcp-direct-test.js', // MCP direct implementation tests
  'dt6000-test.js',     // District DT6000 t-shirt tests
  // Add more test files here as needed
];

// Utility for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
  },
  
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    magenta: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
    gray: '\x1b[100m',
  }
};

// Verify that all test files exist
function verifyTestFiles() {
  console.log(`${colors.bright}${colors.fg.blue}Verifying test files...${colors.reset}`);
  
  const missingFiles = [];
  
  for (const file of TEST_FILES) {
    if (!fs.existsSync(file)) {
      missingFiles.push(file);
    }
  }
  
  if (missingFiles.length > 0) {
    console.error(`${colors.fg.red}The following test files were not found:${colors.reset}`);
    missingFiles.forEach(file => console.error(`- ${file}`));
    return false;
  }
  
  console.log(`${colors.fg.green}✓ All test files found${colors.reset}`);
  return true;
}

// Run a single test file
function runTestFile(testFile) {
  return new Promise((resolve, reject) => {
    console.log(`\n${colors.bg.blue}${colors.fg.white}${colors.bright} RUNNING: ${testFile} ${colors.reset}\n`);
    
    const startTime = Date.now();
    const cmd = `node ${testFile}`;
    
    const childProcess = exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`${colors.fg.red}Error executing ${testFile}:${colors.reset} ${error.message}`);
        reject(error);
        return;
      }
      
      if (stderr) {
        console.error(`${colors.fg.yellow}Warnings from ${testFile}:${colors.reset}\n${stderr}`);
      }
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      
      console.log(stdout);
      console.log(`${colors.bg.blue}${colors.fg.white}${colors.bright} COMPLETED: ${testFile} in ${duration.toFixed(2)}s ${colors.reset}\n`);
      
      // Check if the test was successful - look for various completion phrases
      const successPhrases = [
        'All tests completed',
        'All ST850 tests completed',
        'tests completed'
      ];
      
      const success = !error && successPhrases.some(phrase => stdout.includes(phrase));
      
      resolve({
        file: testFile,
        success,
        duration
      });
    });
  });
}

// Run all tests in sequence
async function runAllTests() {
  console.log(`\n${colors.bright}${colors.fg.cyan}==============================================${colors.reset}`);
  console.log(`${colors.bright}${colors.fg.cyan}    PRINTAVO SANMAR INTEGRATION TEST SUITE    ${colors.reset}`);
  console.log(`${colors.bright}${colors.fg.cyan}==============================================${colors.reset}\n`);
  
  // Verify test files
  if (!verifyTestFiles()) {
    process.exit(1);
  }
  
  const results = [];
  const startTime = Date.now();
  
  for (const testFile of TEST_FILES) {
    try {
      const result = await runTestFile(testFile);
      results.push(result);
    } catch (error) {
      results.push({
        file: testFile,
        success: false,
        error: error.message
      });
    }
  }
  
  const endTime = Date.now();
  const totalDuration = (endTime - startTime) / 1000;
  
  // Print summary
  console.log(`\n${colors.bright}${colors.fg.cyan}==============================================${colors.reset}`);
  console.log(`${colors.bright}${colors.fg.cyan}               TEST SUMMARY                   ${colors.reset}`);
  console.log(`${colors.bright}${colors.fg.cyan}==============================================${colors.reset}\n`);
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  results.forEach(result => {
    if (result.success) {
      totalSuccess++;
      console.log(`${colors.fg.green}✓ PASS${colors.reset} ${result.file} (${result.duration.toFixed(2)}s)`);
    } else {
      totalFailed++;
      console.log(`${colors.fg.red}✗ FAIL${colors.reset} ${result.file} ${result.error ? '- ' + result.error : ''}`);
    }
  });
  
  console.log(`\n${colors.bright}Total execution time: ${totalDuration.toFixed(2)}s${colors.reset}`);
  console.log(`${colors.bright}${colors.fg.green}Tests passed: ${totalSuccess}${colors.reset}`);
  console.log(`${colors.bright}${colors.fg.red}Tests failed: ${totalFailed}${colors.reset}`);
  
  console.log(`\n${colors.bright}${colors.fg.cyan}==============================================${colors.reset}`);
  
  if (totalFailed > 0) {
    process.exit(1);
  }
}

// Run the tests
runAllTests().catch(error => {
  console.error(`${colors.fg.red}Error running tests:${colors.reset}`, error);
  process.exit(1);
}); 