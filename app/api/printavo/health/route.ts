/**
 * API Health Check Endpoint
 * 
 * This endpoint performs tests on the Printavo GraphQL API connection
 * and returns detailed diagnostic information.
 */

import { NextResponse } from 'next/server';
import { executeGraphQL } from '@/lib/printavo-api';
import { logger } from '@/lib/logger';

/**
 * Test a GraphQL query with proper diagnostics
 */
async function testGraphQLQuery(query: string, variables: Record<string, any>, operationName: string) {
  try {
    const startTime = Date.now();
    const data = await executeGraphQL(query, variables, operationName);
    const duration = Date.now() - startTime;
    
    return {
      success: true,
      duration,
      data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`Health check query "${operationName}" failed:`, error);
    
    return {
      success: false,
      error: errorMessage,
      details: error instanceof Error ? error.stack : undefined
    };
  }
}

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL || 'https://www.printavo.com/api/v2';
  const apiEmail = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
  const apiToken = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;
  
  logger.info('Running Printavo API health check');
  
  // Check for environment variables first
  const environmentCheck = {
    api_url: {
      set: !!apiUrl,
      value: apiUrl
    },
    api_email: {
      set: !!apiEmail,
      value: apiEmail ? `${apiEmail.substring(0, 3)}...${apiEmail.substring(apiEmail.indexOf('@'))}` : undefined
    },
    api_token: {
      set: !!apiToken,
      value: apiToken ? `${apiToken.substring(0, 4)}...${apiToken.substring(apiToken.length - 4)}` : undefined
    }
  };
  
  // Run account test
  const accountQuery = `
    query GetAccountInfo {
      account {
        id
        companyName
        companyEmail
      }
    }
  `;
  
  const accountTest = await testGraphQLQuery(accountQuery, {}, "GetAccountInfo");
  
  // Run recent orders test
  const ordersQuery = `
    query GetRecentOrders {
      invoices(first: 3, sortDescending: true) {
        edges {
          node {
            id
            visualId
            createdAt
          }
        }
      }
    }
  `;
  
  const ordersTest = await testGraphQLQuery(ordersQuery, {}, "GetRecentOrders");
  
  // Collect the results
  const results = {
    timestamp: new Date().toISOString(),
    environment: environmentCheck,
    tests: {
      account: accountTest,
      recentOrders: ordersTest
    },
    summary: {
      environment_ready: Object.values(environmentCheck).every(check => check.set),
      all_tests_passed: accountTest.success && ordersTest.success,
      working_connection: accountTest.success
    }
  };
  
  const status = results.summary.all_tests_passed ? 200 : 500;
  
  return NextResponse.json(results, { status });
} 