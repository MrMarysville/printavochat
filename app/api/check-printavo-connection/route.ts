import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if Printavo credentials are set
    const apiUrl = process.env.NEXT_PUBLIC_PRINTAVO_API_URL;
    const email = process.env.NEXT_PUBLIC_PRINTAVO_EMAIL;
    const token = process.env.NEXT_PUBLIC_PRINTAVO_TOKEN;

    // Log the credentials (without the full token for security)
    console.log('Checking Printavo connection with:');
    console.log('API URL:', apiUrl);
    console.log('Email:', email);
    console.log('Token:', token ? `${token.substring(0, 5)}...` : 'Not set');

    if (!apiUrl || !email || !token) {
      return NextResponse.json(
        { success: false, message: 'Printavo API credentials not configured' },
        { status: 500 }
      );
    }

    // Make a simple request to the Printavo API to check connection
    // Using the customers endpoint which should be available in all Printavo accounts
    const response = await fetch(`${apiUrl}/customers?limit=1`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'email': email,
        'token': token,
      },
    });

    console.log('Printavo API response status:', response.status);

    if (response.ok) {
      const data = await response.json();
      console.log('Printavo connection successful!');
      return NextResponse.json({ 
        success: true, 
        message: 'Connected to Printavo API',
        data: data
      });
    } else {
      let errorMessage = `Failed to connect to Printavo API: ${response.status}`;
      let errorDetails = null;
      
      try {
        errorDetails = await response.json();
        console.error('Printavo API error details:', errorDetails);
      } catch (e) {
        const text = await response.text();
        console.error('Printavo API error response:', text);
        errorDetails = { text };
      }
      
      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage,
          details: errorDetails
        },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error checking Printavo connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: `Error checking Printavo connection: ${error instanceof Error ? error.message : 'Unknown error'}` 
      },
      { status: 500 }
    );
  }
}
