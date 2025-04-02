/**
 * Test script for agent system.
 * Runs all agent-related tests and generates performance reports.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
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
    crimson: '\x1b[38m'
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
    crimson: '\x1b[48m'
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const hasArg = (arg) => args.includes(arg);

// Test configuration
const testConfig = {
  testDir: 'tests/agents',
  reportsDir: 'tests/reports',
  testPattern: '\\.test\\.ts$', // Fixed regex pattern
  excludePatterns: ['mcp-comparison.test.ts'], // Skip these by default to avoid external API calls
  jestOptions: '--verbose --no-cache',
  jestConfigPath: 'tests/agents/jest.config.js',
  forceComparison: hasArg('--force-comparison'), // Set to true to force running comparison tests
};

// Ensure directories exist
if (!fs.existsSync(testConfig.reportsDir)) {
  fs.mkdirSync(testConfig.reportsDir, { recursive: true });
}

// Print header
console.log(`\n${colors.bg.blue}${colors.fg.white}${colors.bright} AGENT SYSTEM TESTS ${colors.reset}\n`);

// Log configuration
console.log(`${colors.bright}Configuration:${colors.reset}`);
console.log(`  Test directory: ${testConfig.testDir}`);
console.log(`  Reports directory: ${testConfig.reportsDir}`);
console.log(`  Jest config: ${testConfig.jestConfigPath}`);
console.log(`  Force comparison tests: ${testConfig.forceComparison ? 'Yes' : 'No'}`);
console.log('');

// Check if test directory exists
if (!fs.existsSync(testConfig.testDir)) {
  console.log(`${colors.fg.red}Error: Test directory ${testConfig.testDir} does not exist.${colors.reset}`);
  process.exit(1);
}

// Get list of test files
const getTestFiles = () => {
  const files = fs.readdirSync(testConfig.testDir)
    .filter(file => file.match(new RegExp(testConfig.testPattern)))
    .filter(file => !testConfig.excludePatterns.some(pattern => file.includes(pattern)));
  
  if (testConfig.forceComparison) {
    // If we're forcing comparison tests, get the excluded files too
    const comparisonFiles = fs.readdirSync(testConfig.testDir)
      .filter(file => file.match(new RegExp(testConfig.testPattern)))
      .filter(file => testConfig.excludePatterns.some(pattern => file.includes(pattern)));
    
    return [...files, ...comparisonFiles];
  }
  
  return files;
};

const testFiles = getTestFiles();

if (testFiles.length === 0) {
  console.log(`${colors.fg.yellow}Warning: No test files found matching pattern in ${testConfig.testDir}.${colors.reset}`);
  process.exit(0);
}

// Run all tests in a single Jest command
console.log(`${colors.fg.cyan}Running tests with Jest...${colors.reset}`);

try {
  // Run all tests with the Jest CLI
  const command = `npx jest --config ${testConfig.jestConfigPath} ${testConfig.jestOptions}`;
  execSync(command, { stdio: 'inherit' });
  console.log(`${colors.fg.green}✓ All tests completed successfully${colors.reset}\n`);
  process.exit(0);
} catch (error) {
  console.log(`${colors.fg.red}✗ Tests failed${colors.reset}`);
  process.exit(1);
}

// Run tests individually
const results = [];

testFiles.forEach((file, index) => {
  const filePath = path.join(testConfig.testDir, file);
  const reportPath = path.join(testConfig.reportsDir, `${path.basename(file, '.test.ts')}-report.json`);
  
  console.log(`${colors.fg.cyan}[${index + 1}/${testFiles.length}] Running tests for ${file}${colors.reset}`);
  
  try {
    // Run jest for this test file and generate JSON report
    const command = `npx jest ${filePath} ${testConfig.jestOptions} --json --outputFile=${reportPath}`;
    execSync(command, { stdio: 'inherit' });
    
    results.push({
      file,
      success: true,
      reportPath
    });
    
    console.log(`${colors.fg.green}✓ Tests completed successfully${colors.reset}\n`);
  } catch (error) {
    results.push({
      file,
      success: false,
      error: error.message
    });
    
    console.log(`${colors.fg.red}✗ Tests failed${colors.reset}\n`);
  }
});

// Print summary
console.log(`\n${colors.bg.blue}${colors.fg.white}${colors.bright} TEST SUMMARY ${colors.reset}\n`);

const successCount = results.filter(r => r.success).length;
const failureCount = results.length - successCount;

console.log(`${colors.bright}Results:${colors.reset}`);
console.log(`  ${colors.fg.green}✓ ${successCount} test files passed${colors.reset}`);
console.log(`  ${colors.fg.red}✗ ${failureCount} test files failed${colors.reset}`);

if (failureCount > 0) {
  console.log(`\n${colors.bright}Failed tests:${colors.reset}`);
  results.filter(r => !r.success).forEach(result => {
    console.log(`  ${colors.fg.red}✗ ${result.file}${colors.reset}`);
  });
}

// Generate performance report if there are successful tests
if (successCount > 0) {
  console.log(`\n${colors.bright}Generating performance report...${colors.reset}`);
  
  // Combine all performance data from the reports
  const performanceData = {};
  
  results.filter(r => r.success).forEach(result => {
    try {
      const reportData = JSON.parse(fs.readFileSync(result.reportPath, 'utf8'));
      
      // Extract console output with performance data
      reportData.testResults.forEach(testResult => {
        testResult.console?.forEach(consoleEntry => {
          // Try to extract performance data
          if (consoleEntry.message.includes('Performance:')) {
            const match = consoleEntry.message.match(/([^:]+) Performance: (\d+\.\d+)ms/);
            if (match) {
              const operation = match[1].trim();
              const time = parseFloat(match[2]);
              
              if (!performanceData[operation]) {
                performanceData[operation] = [];
              }
              
              performanceData[operation].push(time);
            }
          }
        });
      });
    } catch (error) {
      console.log(`${colors.fg.yellow}⚠ Couldn't process report for ${result.file}: ${error.message}${colors.reset}`);
    }
  });
  
  // Generate CSV report
  const reportPath = path.join(testConfig.reportsDir, 'performance-report.csv');
  
  let csvContent = 'Operation,Average Time (ms),Min Time (ms),Max Time (ms)\n';
  
  Object.entries(performanceData).forEach(([operation, times]) => {
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    csvContent += `"${operation}",${avgTime.toFixed(2)},${minTime.toFixed(2)},${maxTime.toFixed(2)}\n`;
  });
  
  fs.writeFileSync(reportPath, csvContent);
  
  console.log(`${colors.fg.green}✓ Performance report generated: ${reportPath}${colors.reset}`);
  
  // If we have comparison data, generate comparison report
  if (testConfig.forceComparison) {
    const comparisonData = {};
    
    // Extract comparison data from console output
    results.filter(r => r.success).forEach(result => {
      try {
        const reportData = JSON.parse(fs.readFileSync(result.reportPath, 'utf8'));
        
        reportData.testResults.forEach(testResult => {
          testResult.console?.forEach(consoleEntry => {
            // Look for comparison data
            if (consoleEntry.message.includes('Comparison:')) {
              const lines = consoleEntry.message.split('\n');
              
              // Parse the comparison data
              let operation = '';
              let mcpTime = 0;
              let agentTime = 0;
              
              lines.forEach(line => {
                if (line.includes('Performance Comparison:')) {
                  operation = line.split('Performance Comparison:')[0].trim();
                } else if (line.includes('- MCP:')) {
                  const match = line.match(/- MCP: (\d+\.\d+)ms/);
                  if (match) mcpTime = parseFloat(match[1]);
                } else if (line.includes('- Agent:')) {
                  const match = line.match(/- Agent: (\d+\.\d+)ms/);
                  if (match) agentTime = parseFloat(match[1]);
                }
              });
              
              if (operation && mcpTime && agentTime) {
                comparisonData[operation] = {
                  mcpTime,
                  agentTime,
                  difference: mcpTime - agentTime,
                  percentImprovement: ((mcpTime - agentTime) / mcpTime) * 100
                };
              }
            }
          });
        });
      } catch (error) {
        console.log(`${colors.fg.yellow}⚠ Couldn't extract comparison data for ${result.file}: ${error.message}${colors.reset}`);
      }
    });
    
    // Generate comparison report if we have data
    if (Object.keys(comparisonData).length > 0) {
      const comparisonReportPath = path.join(testConfig.reportsDir, 'comparison-report.csv');
      
      let comparisonCsvContent = 'Operation,MCP Time (ms),Agent Time (ms),Difference (ms),Improvement (%)\n';
      
      Object.entries(comparisonData).forEach(([operation, data]) => {
        comparisonCsvContent += `"${operation}",${data.mcpTime.toFixed(2)},${data.agentTime.toFixed(2)},${data.difference.toFixed(2)},${data.percentImprovement.toFixed(2)}\n`;
      });
      
      fs.writeFileSync(comparisonReportPath, comparisonCsvContent);
      
      console.log(`${colors.fg.green}✓ Comparison report generated: ${comparisonReportPath}${colors.reset}`);
    }
  }
}

// Set exit code
process.exit(failureCount > 0 ? 1 : 0); 