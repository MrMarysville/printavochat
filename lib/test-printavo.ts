/**
 * Client-side utility to test the Printavo API connection
 */

/**
 * Test the connection to Printavo by searching for an order by visual ID
 * @param visualId - The visual ID to search for
 * @returns The test result
 */
export async function testPrintavoConnection(visualId: string = '9435') {
  try {
    console.log(`Testing Printavo connection with visual ID: ${visualId}`);
    
    const response = await fetch(`/api/test-printavo-connection?visualId=${visualId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Test failed:', errorData);
      return {
        success: false,
        message: errorData.message || 'Connection test failed',
        error: errorData.error || errorData.errors || 'No detailed error available'
      };
    }
    
    const data = await response.json();
    console.log('Test result:', data);
    return data;
  } catch (error) {
    console.error('Test error:', error);
    return {
      success: false,
      message: 'Error running Printavo connection test',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 