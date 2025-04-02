# Printavo Chat Assistant

An AI-powered chat interface for Printavo that allows users to interact with their Printavo account using natural language. Built with Next.js, TypeScript, and integrated with Printavo's GraphQL API.

## Features

- 💬 Natural language chat interface
- 🔍 Order lookup by ID or Visual ID
- 📊 Real-time order status updates
- 📁 File upload support
- 👥 Customer information access
- 🏷️ Product catalog browsing
- 📋 Order creation forms
- 🎙️ Voice control with wake word detection
- 🔊 Realtime voice conversations
- 📱 Responsive design

### Template System

Our application includes a powerful quote template system to speed up order creation:

- **Pre-filled Products**: Templates contain standard products, quantities, and pricing
- **Quick Creation**: Create quotes in seconds with "Create a quote for [customer] using [template]"
- **Customization**: Easily modify template-based quotes to meet specific customer needs
- **Template Saving**: Save any quote as a reusable template

See [TEMPLATES.md](TEMPLATES.md) for complete documentation on using the template system.

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Printavo GraphQL API
- OpenAI API
- Web Speech API
- WebSockets for realtime voice

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/printavo-chat.git
   cd printavo-chat
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local`:
   ```
   PRINTAVO_API_URL=www.printavo.com/api/v2
   PRINTAVO_EMAIL=your-email@example.com
   PRINTAVO_TOKEN=your-api-token
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_MODEL=gpt-4o
   OPENAI_VOICE_MODEL=gpt-4o-realtime-preview
   OPENAI_TRANSCRIPTION_MODEL=whisper-1
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3002](http://localhost:3002) in your browser.

## Usage

The chat interface supports natural language queries such as:

- "Show me order #12345"
- "Find order with Visual ID 9876"
- "Show me our product catalog"
- "Create a new order"
- "Show me customer information"

### Voice Interface

The application supports two types of voice interaction:

1. **Standard Voice Control**:
   - Say the wake word "printavo" to activate
   - After the wake word is detected, speak your query
   - Audio is captured and sent to OpenAI Whisper for transcription
   - Your transcribed query is processed like a typed message

2. **Realtime Voice Control**:
   - Say the wake word "printavo" to activate
   - After detection, a realtime connection is established with OpenAI
   - Speak naturally and get immediate responses
   - Uses OpenAI's cutting-edge gpt-4o-realtime-preview model

To try the voice demo, navigate to `/voice-demo` in your browser.

## Environment Variables

- `PRINTAVO_API_URL`: Printavo API endpoint (v2) - Must be exactly `www.printavo.com/api/v2`
- `PRINTAVO_EMAIL`: Your Printavo account email
- `PRINTAVO_TOKEN`: Your Printavo API token
- `OPENAI_API_KEY`: OpenAI API key for natural language processing
- `OPENAI_MODEL`: Model for text generation (default: gpt-4o)
- `OPENAI_VOICE_MODEL`: Model for realtime voice (default: gpt-4o-realtime-preview)
- `OPENAI_TRANSCRIPTION_MODEL`: Model for audio transcription (default: whisper-1)

## Important Notes

- The Printavo API endpoint **must** be set to `www.printavo.com/api/v2` without the `https://` prefix
- The application will automatically add the necessary protocol to the URL
- Do not change the API endpoint format as it will cause connection issues
- Voice features require a browser that supports the Web Speech API (Chrome recommended)
- Realtime voice features require an OpenAI API key with access to the gpt-4o-realtime-preview model

## Voice Feature Configuration Guide

### Setting Up Voice Recognition

The application uses two approaches for voice control:

1. **Standard Voice Recognition**:
   - Uses the browser's built-in Speech Recognition API for wake word detection
   - Records audio after wake word detection and sends to OpenAI's Whisper API
   - No streaming - waits for user to finish speaking before processing

2. **Realtime Voice Recognition**:
   - Uses WebSockets to establish a realtime connection with OpenAI
   - Streams audio data in real-time for immediate processing
   - Provides a more natural conversational experience
   - Requires the gpt-4o-realtime-preview model

### Voice Configuration

Configure the voice features in your `.env` file:

```
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o
OPENAI_VOICE_MODEL=gpt-4o-realtime-preview
OPENAI_TRANSCRIPTION_MODEL=whisper-1
```

You can customize the wake word in the VoiceControl component props (default is "printavo").

### Troubleshooting Voice Features

If voice features aren't working:

1. **Check browser compatibility**:
   - Ensure you're using a browser that supports the Web Speech API
   - Chrome is recommended for best compatibility

2. **Verify microphone permissions**:
   - Grant microphone access when prompted
   - Check browser settings if permission was previously denied

3. **API key issues**:
   - Ensure your OpenAI API key has access to the required models
   - Check for rate limiting or quota issues

## Printavo API Configuration Guide

### Setting Up the API Connection

The application connects to Printavo's GraphQL API v2. For successful connection:

1. **API Endpoint Format**: 
   - Must be exactly `www.printavo.com/api/v2`
   - Do NOT include `https://` prefix
   - Do NOT append `/graphql` to the URL
   
2. **API Credentials**:
   - You need a valid Printavo email and API token
   - Get your token from your Printavo account settings

### Troubleshooting API Connection

If your app fails to connect to the Printavo API:

1. **Check your .env file**:
   ```
   PRINTAVO_API_URL=www.printavo.com/api/v2
   PRINTAVO_EMAIL=your-email@example.com  
   PRINTAVO_TOKEN=your-api-token
   ```

2. **Run the API check script**:
   ```bash
   npm run check-api
   ```

3. **Common Issues**:
   - Adding `https://` prefix to the API URL
   - Appending `/graphql` to the API URL
   - Invalid credentials
   - Network connectivity issues

The application has safeguards to verify the API connection at startup, but always ensure your `.env` file follows the required format.

## Printavo MCP Integration

The application now includes an integration with the Printavo GraphQL MCP Server, which provides direct access to the Printavo API through Cursor.ai's Model Context Protocol.

### Setting Up the MCP Integration

To enable the MCP integration:

1. **MCP Server Setup**:
   - The Printavo GraphQL MCP server is located at `C:/Users/King/Documents/Cline/MCP/printavo-graphql-mcp-server`
   - Make sure the server is running and properly configured

2. **Environment Configuration**:
   - Add the following setting to your `.env.local` file:
   ```
   USE_PRINTAVO_MCP=true
   ```

3. **Available Features**:
   - `getOrder`: Retrieve order details by ID
   - `getCustomer`: Retrieve customer details by ID
   - `searchOrders`: Search for orders using a query string

### Testing the MCP Integration

The application includes a test endpoint to verify the MCP integration is working:

1. **Test API Endpoint**:
   - Navigate to `/api/test-mcp?query=your_search_term` in your browser
   - This will execute a search using the MCP client and return the results

2. **Troubleshooting**:
   - If the test returns an error, check that the MCP server is running
   - Verify your Printavo API credentials are correct
   - You can disable the MCP integration by setting `USE_PRINTAVO_MCP=false` in your `.env.local` file

### Fallback Mechanism

The application is designed to automatically fall back to direct API calls if the MCP client fails:

1. **Automatic Fallback**:
   - If the MCP client returns an error, the application will retry using direct API calls
   - All operations will still work even if the MCP server is unavailable
   - Logs will show warnings when falling back to direct API calls

2. **Manual Override**:
   - You can manually disable the MCP integration by setting `USE_PRINTAVO_MCP=false` in your `.env.local` file
   - This will force the application to use direct API calls for all operations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
