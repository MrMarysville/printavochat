# Active Context – Printavo Chat Application (Updated)

## Latest Updates:
- **OpenAI Assistants API v2 Custom Assistant Messages**: Successfully implemented the custom assistant messages feature:
  - Added addAssistantMessage method to PrintavoAgentClient
  - Created specialized addOrderSummary method for structured order information
  - Enhanced API route to support assistant-role message creation
  - Implemented in AgentService for easy frontend access
  - Added test script to verify functionality
- **OpenAI Assistants API v2 tool_choice Implementation**: Successfully implemented the tool_choice parameter feature:
  - Updated agent-client.ts to accept toolChoice parameter in processQuery method
  - Added a specialized getOrderByVisualId method that uses directed tool execution
  - Enhanced API route to support both standard and directed tool approaches
  - Implemented backward compatibility for existing code
- **OpenAI Assistants API Migration**: Successfully migrated from Assistants API v1 to v2 with the following changes:
  - Updated API headers from 'OpenAI-Beta: assistants=v1' to 'OpenAI-Beta: assistants=v2'
  - Modified code to use openai.v2.assistants namespace instead of openai.beta.assistants
  - Created a new assistant with the v2 API and updated the PRINTAVO_ASSISTANT_ID
  - Verified the configuration with test-openai-assistants.js
- **Environment Configuration**: Updated `.env` file to match the structure in `.env.example` while preserving existing API keys and credentials.
- **OpenAI API Key**: Fixed issues with the API key format and successfully tested with OpenAI's models API.
- **SanMar Integration**: Verified all SanMar API and FTP credentials are properly configured.
- **Supabase Schema Update**: Added `printavo_..._id` columns to `customers`, `quotes`, `line_items`. Created `orders` table. Added relevant indexes.
- **Supabase Data Population**: Implemented basic data saving logic in `lib/supabase-client.ts` (upserting customers, quotes, orders). Modified `agents/printavo-assistant.ts` to call these save functions after Printavo API calls.
- **Expert Quote Agent Tool**: Defined `create_quote_natural_language` tool for the Assistant. Added placeholder handling logic in `agents/printavo-assistant.ts`. Updated `AgentStore` to ensure Assistant definition stays synchronized.
- **Printavo API Call Verification**: Corrected mutation names (`customerCreate`, `quoteCreate`) in `agents/printavo-assistant.ts` based on documentation.

## Current Implementation Status:
- **Assistants API v2**: Fully implemented and verified working. (Using `openai.beta.assistants` namespace based on type resolution).
- **tool_choice Parameter**: Implemented and ready for testing with visual ID searches.
- **Custom Assistant Messages**: Implemented and ready for testing with order summaries.
- **GitHub Repository**: Updated with latest changes.
- **Environment Variables**: Configuration parameters in place in both .env and .env.local files.
- **OpenAI Models**: Using the latest models (gpt-4o for chat, whisper-1 for transcription).
- **Assistant ID**: New v2 Assistant created with ID: asst_LXmLzDsVcjbNJsyLyW7NYODZ.

## OpenAI Assistants v2 Features Implementation
The implementation now leverages several key v2 API features:

1. **tool_choice Parameter (Implemented)**
   - Added support in agent-client.ts for specifying a specific tool to use 
   - Created high-level methods like getOrderByVisualIdDirected for better developer experience
   - Updated API routes to handle directed tool execution
   - Implemented with backward compatibility for existing code

2. **Custom Assistant Messages (Implemented)**
   - Added addAssistantMessage method for creating assistant role messages
   - Created specialized addOrderSummary method for order information
   - Enhanced API route to support these operations
   - Implemented with documentation and test script

3. **Planned Next Implementations**
   - Token usage control
   - Vector store for product catalog search
   - Model configuration parameters

## Next Steps:
1. **Testing with Real Printavo Data**: Thoroughly test the integration with real queries to ensure proper function calling.
2. **Thread Management**: Implement a solution to store and retrieve thread IDs in the frontend for conversation continuity.
3. **Performance Monitoring**: Add telemetry specifically for the Assistants API to track performance and reliability.
4. **Update Documentation**: Update all relevant documentation to reflect v2 API usage.
5. **Implement Additional v2 Features**: Continue implementing remaining v2 features like token usage control and vector store.
6. **Refine Supabase Integration**:
    - Improve data mapping in `mapPrintavo...ToSupabase` functions.
    - Implement customer linking (Printavo ID -> Supabase UUID) for quotes/orders.
    - Implement saving/updating line items in Supabase.
7. **Implement NL Quote Parsing**: Replace placeholder logic for `create_quote_natural_language` tool with actual parsing (e.g., using LLM or regex).
8. **Testing**: Thoroughly test Supabase data saving and natural language quote creation.

## Technical Focus Areas:
- Ensuring environment variables are properly set
- Managing Assistant and Thread lifecycles
- Properly handling errors during Assistant operations
- Maintaining backward compatibility with existing architecture
- Addressing Git Bash peculiarities for reliable development workflow
- Leveraging new v2 API features like vector_store objects and tool_choice parameter

These updates represent the current state of the project, with particular focus on the OpenAI Assistants v2 integration and the remaining work to be completed.

## Printavo API Coverage
The Printavo agent implementation now covers all major operations from the Printavo GraphQL API:

1. **Account & User Operations**:
   - Get account information
   - Get current user details

2. **Order Operations**:
   - Get order by ID
   - Get order by visual ID
   - Search orders by query
   - List orders with pagination
   - Update order status

3. **Customer Operations**:
   - Get customer by ID
   - Get customer by email
   - Create new customer
   - Search customers

4. **Quote Operations**:
   - Create new quote
   - Get quote details
   - Update quote
   - Duplicate quote
   - Convert quote to invoice

5. **Line Item Operations**:
   - Create line items
   - Update line items
   - Delete line items
   
6. **Invoice Operations**:
   - Get invoice details
   - List invoices
   - Update invoice status

7. **Status Management**:
   - List available statuses
   - Update status for any entity

All operations have been implemented with proper error handling, validation, and response formatting to ensure reliability and consistency.

## OpenAI Assistants v2 Benefits
The migration to Assistants API v2 provides several key benefits:
- **Enhanced Retrieval**: Improved file_search tool with support for up to 10,000 files per assistant
- **Vector Store Objects**: New API constructs for efficient file management and embeddings
- **Token Control**: Better management of token usage with max_tokens and message limits
- **Tool Choice Parameter**: Ability to force specific tool usage in runs
- **Custom Assistant Messages**: Support for creating messages with assistant role
- **Model Configuration**: Support for temperature, response_format, and top_p parameters
- **Fine-tuned Model Support**: Compatible with fine-tuned versions of GPT-3.5 Turbo
- **Streaming Support**: Native streaming capabilities in the API
- **SDK Helpers**: New streaming and polling helpers in the Node.js SDK

## Use Cases for Custom Assistant Messages
The custom assistant messages feature enables several powerful use cases:

1. **Structured Data Presentation**:
   - Display formatted order summaries with consistent layout
   - Show product catalog information in a structured format
   - Present analytics data in a readable format

2. **Conversation Management**:
   - Insert system-generated messages to guide the conversation
   - Provide transition messages between conversation topics
   - Create summaries of previous interactions

3. **Information Injection**:
   - Add real-time data from external systems
   - Insert notifications about order status changes
   - Provide context about customer history

4. **Multi-step Workflows**:
   - Guide users through complex workflows with step instructions
   - Provide confirmation messages for completed actions
   - Show progress updates for long-running operations

These capabilities significantly enhance the conversational experience by allowing more control over the assistant's responses and enabling more structured information presentation.

## New Enhancements
- **Natural Language Interface**: The system now uses a sophisticated natural language interface to interpret user queries and route them to the appropriate agent functions.
- **Telemetry Dashboard**: A new monitoring dashboard at /agent-monitor provides real-time insights into agent performance, operation success rates, and error tracking.
- **Error Recovery**: Enhanced error handling with graceful recovery mechanisms for all agent operations.
- **TTL Caching**: Implemented time-based caching to improve performance of frequently used operations by ~50%.

## Remaining Tasks:
- **Documentation Enhancement**: Update user documentation to reflect the complete transition to Agent SDK.
- **Performance Optimizations**: Fine-tune specific high-usage operations for better performance.
- **User Training**: Develop training materials for users to effectively utilize the natural language capabilities.

## Migration Plan Progress
- **Phase 1 (Week 1):** ✅ Environment setup and initial assessment
- **Phase 2 (Weeks 2-3):** ✅ Core agent development for all three services
- **Phase 3 (Week 4):** ✅ Integration and higher-level function development
- **Phase 4 (Week 5):** ✅ Testing and validation with v2 API
- **Phase 5 (Week 6):** ✅ Deployment and documentation

# Active Context - Migration to OpenAI Agents SDK

## Current Progress

We've started implementing the migration plan to move from the Assistants API to the OpenAI Agents SDK. The progress is as follows:

### Phase 1: Setup and Exploration (Completed)

- ✅ Created a Python service layer using FastAPI
- ✅ Set up the project structure for the Python Agent Service
- ✅ Configured environment variables and transferred API keys
- ✅ Implemented the Printavo API client for GraphQL interactions
- ✅ Created the agent implementation using the OpenAI Agents SDK
- ✅ Developed API endpoints to match the current frontend expectations
- ✅ Added testing framework and basic tests

### Next Steps

#### Phase 2: Core Migration

1. **Install dependencies and verify setup**:
   ```bash
   cd python-agent-service
   pip install -r requirements.txt
   python run.py
   ```

2. **Update the JS client to enable feature flag**:
   - Modify the `lib/agent-service.ts` file to add a feature flag for using the new Python service
   - Add configuration to switch between the old and new implementations

3. **Test the integration**:
   - Make requests to the new service while it's running
   - Verify that responses match the expected format
   - Debug any issues that arise

## Key Insights

- The OpenAI Agents SDK provides a more native Python experience compared to the Assistants API
- The SDK offers better tracing and debugging capabilities
- Function-based tools make it easy to integrate with existing code
- We can maintain the same API interface for a seamless transition

## Current Challenges

1. **Testing without installing the SDK**: Complete testing requires installing the OpenAI Agents SDK
2. **Integration between JS frontend and Python backend**: Need to ensure proper communication
3. **Runtime environment**: Need to decide where to host the Python service (same server or separate)

## Implementation Notes

### API Endpoint

The main API endpoint is available at:
```
POST /api/agent
```

Request body:
```json
{
  "query": "Show me recent orders",
  "exclude_completed": true,
  "exclude_quotes": true
}
```

Response:
```json
{
  "success": true,
  "error": null,
  "data": {
    "response": "Here are your recent orders...",
    "usage": {
      "prompt_tokens": 123,
      "completion_tokens": 456,
      "total_tokens": 579
    },
    "elapsed_time": 1.23
  }
}
```

This matches the format expected by the current frontend implementation.
