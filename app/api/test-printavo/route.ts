import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get Printavo credentials from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL;
    const email = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
    const token = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;

    // Log the credentials (without the full token for security)
    console.log('Printavo API URL:', apiUrl);
    console.log('Printavo Email:', email);
    console.log('Printavo Token:', token ? `${token.substring(0, 5)}...` : 'Not set');

    if (!apiUrl || !email || !token) {
      return NextResponse.json({
        success: false,
        message: 'Missing Printavo API credentials',
        credentials: {
          apiUrl: !!apiUrl,
          email: !!email,
          token: !!token
        }
      }, { status: 400 });
    }

    // Try to fetch account information
    const response = await fetch(`${apiUrl}/account`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'email': email,
        'token': token,
      },
    });

    // Get response data
    const responseStatus = response.status;
    const responseHeaders = Object.fromEntries(response.headers.entries());
    let responseData;
    
    try {
      responseData = await response.json();
    } catch (e) {
      const text = await response.text();
      responseData = { text };
    }

    // Return detailed information about the response
    return NextResponse.json({
      success: response.ok,
      status: responseStatus,
      headers: responseHeaders,
      data: responseData
    });
  } catch (error) {
    console.error('Error testing Printavo connection:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Error connecting to Printavo API',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
