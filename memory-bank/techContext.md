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

**Technical Constraints:**

-   **Printavo API Rate Limits:** Be mindful of Printavo API rate limits and implement appropriate error handling and retry mechanisms.
-   **OpenAI API Costs:** Usage of OpenAI API incurs costs. Monitor usage and optimize prompts to minimize expenses.
-   **Data Security:** Ensure secure storage and handling of Printavo API credentials and user data.
-   **Real-time Chat Limitations:**  Current implementation might not support true real-time chat features like presence and typing indicators without additional services (e.g., WebSockets).

**Dependencies:**

-   **npm packages:** Refer to `package.json` for a complete list of dependencies.
    -   `react`, `react-dom`, `next`, `tailwindcss`, `openai`, `axios`, `graphql-request`, etc.

**Further Considerations:**

-   **Scalability:** Consider scalability requirements for handling a large number of users and concurrent requests.
-   **Monitoring and Logging:** Implement robust monitoring and logging to track application health and debug issues.
-   **Testing:** Write comprehensive unit and integration tests to ensure code quality and prevent regressions.
-   **Deployment:** Define deployment strategy and environment (e.g., Vercel, AWS, Docker).
