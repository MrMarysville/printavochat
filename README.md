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
- 📱 Responsive design

## Tech Stack

- Next.js 13+ (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Printavo GraphQL API
- OpenAI API

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
   PRINTAVO_API_URL=https://www.printavo.com/api/v2
   PRINTAVO_EMAIL=your-email@example.com
   PRINTAVO_TOKEN=your-api-token
   OPENAI_API_KEY=your-openai-api-key
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

## Environment Variables

- `PRINTAVO_API_URL`: Printavo API endpoint (v2)
- `PRINTAVO_EMAIL`: Your Printavo account email
- `PRINTAVO_TOKEN`: Your Printavo API token
- `OPENAI_API_KEY`: OpenAI API key for natural language processing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
