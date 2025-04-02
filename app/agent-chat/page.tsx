import NaturalLanguageQuery from '@/components/NaturalLanguageQuery';

export const metadata = {
  title: 'Agent Chat Interface',
  description: 'Chat with the Printavo and SanMar agents using natural language',
};

export default function AgentChatPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Agent Chat Interface</h1>
      <p className="text-gray-600 mb-8">
        Chat with the Printavo and SanMar agents using natural language. 
        You can ask about orders, quotes, product information, inventory, 
        and more. The system uses OpenAI to interpret your questions and 
        route them to the appropriate agent.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <NaturalLanguageQuery />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">What Can I Ask?</h2>
            <ul className="space-y-2 text-gray-700">
              <li><span className="font-medium">Printavo Orders:</span> Search or get details about orders</li>
              <li><span className="font-medium">SanMar Products:</span> Look up products by style number</li>
              <li><span className="font-medium">Inventory:</span> Check if products are in stock</li>
              <li><span className="font-medium">FTP Files:</span> List available files on the SanMar FTP server</li>
              <li><span className="font-medium">Quote Creation:</span> Start creating quotes for customers</li>
            </ul>
          </div>
          
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">About This System</h2>
            <p className="text-blue-700 text-sm">
              This chat interface demonstrates our new agent-based integration with Printavo and SanMar.
              It uses OpenAI&apos;s language models to understand your questions and route them to the 
              appropriate agent. The agents are built using the OpenAI Agents SDK, which provides
              a reliable and maintainable way to interact with external APIs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 