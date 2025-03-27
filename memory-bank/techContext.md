# Technical Context: Printavo Chat Application

**Technologies Used:**

-   **Frontend:**
    -   React: JavaScript library for building user interfaces.
    -   Next.js: React framework for full-stack web applications.
    -   Tailwind CSS: Utility-first CSS framework.
    -   TypeScript: Superset of JavaScript that adds static typing.

-   **Backend:**
    -   Next.js API routes (Node.js): Server-side logic and API endpoints.
    -   OpenAI API: Natural language processing and language model.
    -   Printavo API: REST and GraphQL API for accessing Printavo data.
    -   GraphQL Client: Apollo Client or similar for querying Printavo GraphQL API.

-   **Development Tools:**
    -   VSCode: Integrated development environment.
    -   npm: Package manager for JavaScript dependencies.
    -   Git: Version control system.
    -   Jest: JavaScript testing framework.

**Development Setup:**

1.  **Prerequisites:**
    -   Node.js and npm installed.
    -   Printavo API credentials (Email, Token, API URL).
    -   OpenAI API key.
    -   Git installed.

2.  **Project Setup:**
    ```bash
    git clone [repository-url]
    cd printavo-chat
    npm install
    ```

3.  **Environment Variables:**
    -   Create `.env.local` file in the project root.
    -   Add the following environment variables:
        ```
        NEXT_PUBLIC_PRINTAVO_API_URL=https://www.printavo.com/api/v2
        NEXT_PUBLIC_PRINTAVO_EMAIL=your_printavo_email
        NEXT_PUBLIC_PRINTAVO_TOKEN=your_printavo_token
        OPENAI_API_KEY=your_openai_api_key
        ```

4.  **Running the Application:**
    ```bash
    npm run dev
    ```
    -   Frontend will be accessible at `http://localhost:3000`.
    -   Backend API routes will be accessible at `http://localhost:3000/api`.

**Printavo API Integration:**

-   **Authentication:**
    -   Printavo API uses email/token authentication instead of Bearer tokens.
    -   Headers must include `email` and `token` fields with appropriate values.
    -   Make sure environment variables are correctly set.

-   **API Endpoints:**
    -   GraphQL endpoint: `${PRINTAVO_API_URL}/graphql`
    -   REST endpoints: Various endpoints under the base API URL

-   **Error Handling:**
    -   Custom error types created for different API error scenarios.
    -   Retry logic implemented for transient network issues.
    -   Rate limiting protection with exponential backoff.

-   **Debugging:**
    -   Health check endpoint available at `/api/health`.
    -   Comprehensive logging throughout the API client code.
    -   Error response analysis to determine the nature of failures.

**API Layer:**
- **EnhancedAPIClient:**
  - Intelligent request queuing
  - Rate limit handling
  - Request staggering
  - Exponential backoff
  - TTL-based caching
  - Fallback mechanisms
  - Error recovery
  - Comprehensive logging

- **API Services:**
  - OrdersAPI: Order management operations
  - QuotesAPI: Quote and invoice operations
  - StatusesAPI: Status management operations
  - Each service implements:
    - Proper error handling
    - Type safety
    - Request validation
    - Response normalization

- **Request Queue:**
  - Manages API request flow
  - Prevents rate limiting
  - Implements staggered requests
  - Handles retries with exponential backoff
  - Respects API rate limits
  - Optimizes request patterns

- **Cache Layer:**
  - TTL-based caching
  - Memory optimization
  - Cache invalidation
  - Request deduplication
  - Response normalization

- **Error Handling:**
  - Specific error types for different scenarios
  - Retry strategies
  - Fallback mechanisms
  - Comprehensive logging
  - User-friendly error messages

**Technical Constraints:**
- **API Rate Limits:**
  - Implemented request queuing and staggering
  - Added exponential backoff for retries
  - Enhanced caching to reduce API calls
  - Added request deduplication
- **Data Consistency:**
  - Proper cache invalidation
  - Response normalization
  - Type safety across services
- **Error Recovery:**
  - Multiple fallback mechanisms
  - Intelligent retry logic
  - Comprehensive error tracking

**Dependencies:**

-   **npm packages:** Refer to `package.json` for a complete list of dependencies.
    -   `react`, `react-dom`, `next`, `tailwindcss`, `openai`, `axios`, `graphql-request`, etc.

**Further Considerations:**

-   **Scalability:** Consider scalability requirements for handling a large number of users and concurrent requests.
-   **Monitoring and Logging:** Implement robust monitoring and logging to track application health and debug issues.
-   **Testing:** Write comprehensive unit and integration tests to ensure code quality and prevent regressions.
-   **Deployment:** Define deployment strategy and environment (e.g., Vercel, AWS, Docker).

## MCP Servers (Model Context Protocol)

MCP servers extend Cline's capabilities by providing specialized tools and access to external APIs or systems.

### Supabase MCP Server (`github.com/alexander-zuev/supabase-mcp-server`)
- **Purpose:** Provides tools to interact with the project's Supabase database and management API.
- **Location:** Installed via executable (`C:\Users\King\.local\bin\supabase-mcp-server.exe`).
- **Technology:** Rust, `@modelcontextprotocol/sdk`.
- **Setup:** Configured in `cline_mcp_settings.json` with Supabase project details.
- **Status:** Installed and running.

### SanMar MCP Server (`sanmar-mcp-server`)
- **Purpose:** Provides tools to interact with the SanMar API (both Standard and PromoStandards) via SOAP.
- **Location:** `C:\Users\King\Documents\Cline\MCP\sanmar-mcp-server`
- **Technology:** Node.js, `soap` package, `@modelcontextprotocol/sdk`.
- **Setup:** Configured in `cline_mcp_settings.json` with SanMar credentials.
- **Status:** Installed and running. Provides a wide range of tools.

### SanMar FTP MCP Server (`sanmar-ftp-mcp-server`)
- **Purpose:** Downloads files from the SanMar FTP server.
- **Location:** `C:\Users\King\Documents\Cline\MCP\sanmar-ftp-mcp-server`
- **Technology:** Node.js, `ssh2` package, `@modelcontextprotocol/sdk`.
- **Setup:** Configured in `cline_mcp_settings.json` (credentials might be placeholders).
- **Status:** Installed, potentially running (credentials need verification).

### Printavo GraphQL MCP Server (`printavo-graphql-mcp-server`)
- **Purpose:** Provides tools to interact directly with the Printavo GraphQL API (v2).
- **Location:** `C:\Users\King\Documents\Cline\MCP\printavo-graphql-mcp-server`
- **Technology:** Node.js, `@modelcontextprotocol/sdk`. Uses `fetch` internally for API calls.
- **Setup:** Configured in `cline_mcp_settings.json` with Printavo API URL, email, and token.
- **Status:** Installed and running.
- **Documentation:** See `memory-bank/printavo-mcp-server.md` for details on tools and usage.
- **Integration:** The main application can optionally use this server via `lib/printavo-mcp-client.ts`, controlled by the `USE_PRINTAVO_MCP` environment variable.
