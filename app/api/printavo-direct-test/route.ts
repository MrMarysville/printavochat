import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get Printavo credentials from environment variables
    const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL;
    const email = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
    const token = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;

    // Log the credentials (without the full token for security)
    console.log('Printavo credentials:');
    console.log('API URL:', apiUrl);
    console.log('Email:', email);
    console.log('Token:', token ? `${token.substring(0, 5)}...` : 'Not set');

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

    // Make a direct request to the Printavo API
    const url = `${apiUrl}/account`;
    console.log('Making request to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'email': email,
        'token': token,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // Get response data
    let responseData;
    let responseText;
    
    try {
      responseText = await response.text();
      console.log('Response text:', responseText);
      
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { raw_text: responseText };
      }
    } catch (e) {
      console.error('Error reading response:', e);
      responseData = { error: 'Could not read response' };
    }

    // Return detailed information about the response
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
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
