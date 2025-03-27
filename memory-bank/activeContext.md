# Active Context: Printavo Chat Application

**Current Focus:**
- Enhanced order details display with comprehensive information.
- Improved natural language processing for simpler order queries.
- Consistent use of live Printavo data throughout the application.
- Order status update functionality with real-time API integration.
- Advanced dashboard visualizations with Chart.js for sales and revenue tracking.
- Expanded Visual ID search capabilities with dedicated component and utilities.
- Improved error handling and recovery mechanisms.
- Enhanced loading states with skeleton components.
- Global search functionality across entity types.

**Recent Changes:**
- Created core memory bank files: `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`.
- Enhanced error handling in API route `app/api/printavo/route.ts`.
- Added query by visual ID support in:
  - `lib/printavo-service.ts` - Added service method for the visual ID query
  - `lib/operations.ts` - Improved order lookup to prioritize visual ID for 4-digit numbers
  - `app/api/printavo/route.ts` - Added direct visual ID query parameter support
- Added natural language processing for visual ID queries:
  - Enhanced the `determineOperation` function to recognize explicit visual ID queries
  - Added support for phrases like "visual ID 1234", "find order with visual ID 1234"
  - Added support for simpler queries like "find order 1234"
  - Updated help information to guide users on visual ID query options
- Added customer creation functionality:
  - Implemented `CustomerCreateInput` interface in types.ts
  - Added `createCustomer` mutation to graphql-client.ts
  - Created `findOrCreateCustomer` and `createCustomer` helper methods in printavo-service.ts
  - Added `createCustomerOperation` to operations.ts with natural language pattern recognition
  - Enhanced help information to inform users about the customer creation capability
- Fixed Printavo API integration issues:
  - Standardized environment variable usage across all API clients
  - Corrected authentication header format in GraphQL and REST clients
  - Fixed incorrect GraphQL endpoint URL construction
  - Added health check endpoint at `/api/health` for API connection diagnostics
  - Improved error handling and retry logic for API failures
  - Enhanced logging for better debugging capability
- Fixed GraphQL operation name issues:
  - Added explicit operation names to all GraphQL queries
  - Ensured consistent operation naming pattern
  - Added validation to require operation names
  - Improved error handling for missing operation names
  - Enhanced error resilience in dashboard components
- Added quote creation via chat with natural language:
  - Enhanced `chat-commands.ts` to support creating quotes through conversation
  - Added pattern matching for quote creation requests
  - Implemented quote creation workflow with conversational UI
  - Added support for adding line items, customer details, and notes through chat
  - Enhanced to look up existing customers by email and offer to use them for quotes
  - Added intelligent workflow to create new customers when necessary
  - Added support for style numbers, colors, and sizes in line items
  - Implemented smart parsing of different size formats (e.g., "S(2), M(3), L(5)")
  - Added support for organizing items into line item groups
  - Implemented automatic production date calculation (2 weeks ahead, adjusted to avoid weekends)
  - Added payment term selection with retrieval of options from Printavo API
  - Integrated Printavo's imprint functionality for artwork with typeOfWork, details, and mockups
- Created `.clinerules` file documenting project patterns and knowledge.
- Enhanced order details display:
  - Completely redesigned OrderCard component with better UI
  - Added detailed display of line items, notes, and addresses
  - Improved information hierarchy and visual styling
  - Made line items always visible by default
- Fixed authentication issues:
  - Added NEXT_PUBLIC_ prefixed environment variables
  - Ensured proper handling of Contact object fields (fullName instead of name)
- Removed mock data:
  - Updated dashboard to always use live Printavo data
  - Updated homepage to display real orders from Printavo
  - Added proper loading states for data fetching
- Fixed EPERM file permission issues:
  - Added `.next/trace` to the `.gitignore` file
  - Created a `predev` script in package.json to automatically clean the trace directory before starting the development server
  - Added workaround in next.config.js using experimental.isrMemoryCacheSize setting
- Updated `progress.md` to reflect current state.
- Added order status update functionality:
  - Implemented `getStatuses` method in `printavo-service.ts` to fetch available statuses
  - Created reusable `StatusSelect` component in `components/ui/status-select.tsx`
  - Updated OrderCard component to support interactive status changes
  - Created utility functions in `lib/status-utils.ts` for consistent status handling
  - Added orders management page at `/orders` with status update capabilities
- Added dashboard visualizations:
  - Implemented SalesChart component using Chart.js and react-chartjs-2
  - Added order volume bar charts showing monthly activity
  - Created revenue line charts for financial analysis
  - Added data filtering to focus on the last 6 months
  - Improved error handling and loading states for charts
  - Ensured responsive design that works on all device sizes
- Added orders sort direction toggle:
  - Implemented a dropdown selector in the Recent Orders section to toggle between "Newest First" and "Oldest First"
  - Updated state management to store and apply sort preference
  - Enhanced the sorting logic to use the user's preference when displaying orders
  - Applied consistent sorting throughout the application
- Improved API rate limiting handling:
  - Implemented exponential backoff and retry logic for API requests
  - Added specific handling for 429 (Too Many Requests) errors
  - Added staggered API requests by introducing delays between consecutive calls
  - Enhanced error messages for rate limiting issues
  - Updated executeGraphQL function to support retries with intelligent backoff
- Implemented significant stability improvements:
  - Fixed SmartPoller infinite loop issue with proper timer cleanup
  - Enhanced error handling with specific error types and consistent patterns
  - Improved Jest testing configuration for better component test coverage
  - Added environment variable mocking for consistent test execution
  - Implemented proper cleanup mechanisms to prevent memory leaks
- Enhanced error boundary component for better user feedback:
  - Redesigned ErrorBoundary component with improved error detection
  - Added specialized handling for API errors with meaningful messages
  - Implemented retry functionality directly in error UI
  - Provided detailed error information for debugging
  - Added smart error classification for different error types
  - Added a functional ErrorBoundaryWrapper component for easier usage
- Added skeleton loaders for improved loading states:
  - Created reusable Skeleton component with various preset shapes (text, circular, rectangular, button, card, avatar)
  - Implemented specialized OrderSkeleton, ChartSkeleton, and DashboardSkeleton components
  - Added smooth loading animations for better user experience
  - Ensured consistent loading states throughout the application
  - Implemented count parameters to easily create multiple skeleton items
- Implemented global search functionality:
  - Created GlobalSearch component for searching across entity types
  - Added search API endpoint with optimized querying
  - Implemented Visual ID-specific search prioritization
  - Added intelligent relevance sorting for search results
  - Integrated search component into navigation for easy access
  - Added keyboard navigation and accessibility features
  - Implemented debounced search to minimize API calls
  - Added proper error handling and loading states
- Enhanced API reliability with new EnhancedAPIClient implementation:
  - Added intelligent request queuing with rate limit handling
  - Implemented fallback mechanisms for order/quote queries
  - Added staggered requests with configurable delays
  - Enhanced caching strategies with TTL support
  - Improved error handling and recovery
- Reorganized API structure:
  - Created dedicated StatusesAPI for better separation of concerns
  - Improved type safety across API implementations
  - Enhanced error classification and handling
  - Added comprehensive logging for better debugging
- Optimized API request patterns:
  - Implemented request queuing to prevent rate limiting
  - Added intelligent retry logic with exponential backoff
  - Enhanced caching with proper TTL management
  - Added request staggering to prevent API overload
- **SanMar MCP Server:**
  - Created a new MCP server (`sanmar-mcp-server`) to interact with SanMar APIs (both Standard and PromoStandards) via SOAP.
  - Implemented functions for product info, inventory, pricing, orders, invoices, etc.
  - Configured the server in `cline_mcp_settings.json`.
  - Installed necessary dependencies (`@modelcontextprotocol/sdk`, `soap`).
  - Verified the server is running and available in Cline.
  - Added the ability to download files from the SanMar FTP server using the `get_sanmar_ftp_file` tool.
# Active Context: Printavo Chat Application

**Current Focus:**
- Enhanced order details display with comprehensive information.
- Improved natural language processing for simpler order queries.
- Consistent use of live Printavo data throughout the application.
- Order status update functionality with real-time API integration.
- Advanced dashboard visualizations with Chart.js for sales and revenue tracking.
- Expanded Visual ID search capabilities with dedicated component and utilities.
- Improved error handling and recovery mechanisms.
- Enhanced loading states with skeleton components.
- Global search functionality across entity types.

**Recent Changes:**
- Created core memory bank files: `projectbrief.md`, `productContext.md`, `systemPatterns.md`, `techContext.md`.
- Enhanced error handling in API route `app/api/printavo/route.ts`.
- Added query by visual ID support in:
  - `lib/printavo-service.ts` - Added service method for the visual ID query
  - `lib/operations.ts` - Improved order lookup to prioritize visual ID for 4-digit numbers
  - `app/api/printavo/route.ts` - Added direct visual ID query parameter support
- Added natural language processing for visual ID queries:
  - Enhanced the `determineOperation` function to recognize explicit visual ID queries
  - Added support for phrases like "visual ID 1234", "find order with visual ID 1234"
  - Added support for simpler queries like "find order 1234"
  - Updated help information to guide users on visual ID query options
- Added customer creation functionality:
  - Implemented `CustomerCreateInput` interface in types.ts
  - Added `createCustomer` mutation to graphql-client.ts
  - Created `findOrCreateCustomer` and `createCustomer` helper methods in printavo-service.ts
  - Added `createCustomerOperation` to operations.ts with natural language pattern recognition
  - Enhanced help information to inform users about the customer creation capability
- Fixed Printavo API integration issues:
  - Standardized environment variable usage across all API clients
  - Corrected authentication header format in GraphQL and REST clients
  - Fixed incorrect GraphQL endpoint URL construction
  - Added health check endpoint at `/api/health` for API connection diagnostics
  - Improved error handling and retry logic for API failures
  - Enhanced logging for better debugging capability
- Fixed GraphQL operation name issues:
  - Added explicit operation names to all GraphQL queries
  - Ensured consistent operation naming pattern
  - Added validation to require operation names
  - Improved error handling for missing operation names
  - Enhanced error resilience in dashboard components
- Added quote creation via chat with natural language:
  - Enhanced `chat-commands.ts` to support creating quotes through conversation
  - Added pattern matching for quote creation requests
  - Implemented quote creation workflow with conversational UI
  - Added support for adding line items, customer details, and notes through chat
  - Enhanced to look up existing customers by email and offer to use them for quotes
  - Added intelligent workflow to create new customers when necessary
  - Added support for style numbers, colors, and sizes in line items
  - Implemented smart parsing of different size formats (e.g., "S(2), M(3), L(5)")
  - Added support for organizing items into line item groups
  - Implemented automatic production date calculation (2 weeks ahead, adjusted to avoid weekends)
  - Added payment term selection with retrieval of options from Printavo API
  - Integrated Printavo's imprint functionality for artwork with typeOfWork, details, and mockups
- Created `.clinerules` file documenting project patterns and knowledge.
- Enhanced order details display:
  - Completely redesigned OrderCard component with better UI
  - Added detailed display of line items, notes, and addresses
  - Improved information hierarchy and visual styling
  - Made line items always visible by default
- Fixed authentication issues:
  - Added NEXT_PUBLIC_ prefixed environment variables
  - Ensured proper handling of Contact object fields (fullName instead of name)
- Removed mock data:
  - Updated dashboard to always use live Printavo data
  - Updated homepage to display real orders from Printavo
  - Added proper loading states for data fetching
- Fixed EPERM file permission issues:
  - Added `.next/trace` to the `.gitignore` file
  - Created a `predev` script in package.json to automatically clean the trace directory before starting the development server
  - Added workaround in next.config.js using experimental.isrMemoryCacheSize setting
- Updated `progress.md` to reflect current state.
- Added order status update functionality:
  - Implemented `getStatuses` method in `printavo-service.ts` to fetch available statuses
  - Created reusable `StatusSelect` component in `components/ui/status-select.tsx`
  - Updated OrderCard component to support interactive status changes
  - Created utility functions in `lib/status-utils.ts` for consistent status handling
  - Added orders management page at `/orders` with status update capabilities
- Added dashboard visualizations:
  - Implemented SalesChart component using Chart.js and react-chartjs-2
  - Added order volume bar charts showing monthly activity
  - Created revenue line charts for financial analysis
  - Added data filtering to focus on the last 6 months
  - Improved error handling and loading states for charts
  - Ensured responsive design that works on all device sizes
- Added orders sort direction toggle:
  - Implemented a dropdown selector in the Recent Orders section to toggle between "Newest First" and "Oldest First"
  - Updated state management to store and apply sort preference
  - Enhanced the sorting logic to use the user's preference when displaying orders
  - Applied consistent sorting throughout the application
- Improved API rate limiting handling:
  - Implemented exponential backoff and retry logic for API requests
  - Added specific handling for 429 (Too Many Requests) errors
  - Added staggered API requests by introducing delays between consecutive calls
  - Enhanced error messages for rate limiting issues
  - Updated executeGraphQL function to support retries with intelligent backoff
- Implemented significant stability improvements:
  - Fixed SmartPoller infinite loop issue with proper timer cleanup
  - Enhanced error handling with specific error types and consistent patterns
  - Improved Jest testing configuration for better component test coverage
  - Added environment variable mocking for consistent test execution
  - Implemented proper cleanup mechanisms to prevent memory leaks
- Enhanced error boundary component for better user feedback:
  - Redesigned ErrorBoundary component with improved error detection
  - Added specialized handling for API errors with meaningful messages
  - Implemented retry functionality directly in error UI
  - Provided detailed error information for debugging
  - Added smart error classification for different error types
  - Added a functional ErrorBoundaryWrapper component for easier usage
- Added skeleton loaders for improved loading states:
  - Created reusable Skeleton component with various preset shapes (text, circular, rectangular, button, card, avatar)
  - Implemented specialized OrderSkeleton, ChartSkeleton, and DashboardSkeleton components
  - Added smooth loading animations for better user experience
  - Ensured consistent loading states throughout the application
  - Implemented count parameters to easily create multiple skeleton items
- Implemented global search functionality:
  - Created GlobalSearch component for searching across entity types
  - Added search API endpoint with optimized querying
  - Implemented Visual ID-specific search prioritization
  - Added intelligent relevance sorting for search results
  - Integrated search component into navigation for easy access
  - Added keyboard navigation and accessibility features
  - Implemented debounced search to minimize API calls
  - Added proper error handling and loading states
- Enhanced API reliability with new EnhancedAPIClient implementation:
  - Added intelligent request queuing with rate limit handling
  - Implemented fallback mechanisms for order/quote queries
  - Added staggered requests with configurable delays
  - Enhanced caching strategies with TTL support
  - Improved error handling and recovery
- Reorganized API structure:
  - Created dedicated StatusesAPI for better separation of concerns
  - Improved type safety across API implementations
  - Enhanced error classification and handling
  - Added comprehensive logging for better debugging
- Optimized API request patterns:
  - Implemented request queuing to prevent rate limiting
  - Added intelligent retry logic with exponential backoff
  - Enhanced caching with proper TTL management
  - Added request staggering to prevent API overload
- **SanMar MCP Server:**
  - Created a new MCP server (`sanmar-mcp-server`) to interact with SanMar APIs (both Standard and PromoStandards) via SOAP.
  - Implemented functions for product info, inventory, pricing, orders, invoices, etc.
  - Configured the server in `cline_mcp_settings.json`.
  - Installed necessary dependencies (`@modelcontextprotocol/sdk`, `soap`).
  - Verified the server is running and available in Cline.

- **SanMar FTP MCP Server:**
  - Created a new MCP server (`sanmar-ftp-mcp-server`) for downloading files from the SanMar FTP server.
  - Uses SFTP to retrieve data files.
  - To be configured in `cline_mcp_settings.json` with necessary environment variables (SANMAR_FTP_HOST, SANMAR_FTP_USERNAME, SANMAR_FTP_PASSWORD).
  - Not yet running.
- Added the ability to download files from the SanMar FTP server using the `get_sanmar_ftp_file` tool.
- Added the ability to download files from the SanMar FTP server using the `get_sanmar_ftp_file` tool.
- Fixed test utilities and component tests:
  - Updated test utilities to properly include ToastProvider from @/components/ui/use-toast
  - Fixed import issues in test files to use correct default/named imports
  - Enhanced test environment setup with proper context providers
  - Improved error boundary testing configuration
  - Added proper cleanup for test environment
  - Fixed GlobalSearch component tests with correct provider setup
  - Enhanced skeleton component tests with proper rendering checks
  - Updated VisualIdSearch tests to include toast context
  - Fixed search flow integration tests
- Fixed SmartPoller implementation and tests:
  - Resolved issues with the SmartPoller's change detection and callback handling
  - Enhanced pollNow method for direct testing with proper callback invocation
  - Fixed detectChanges to correctly handle initial data during first poll
  - Improved test isolation and state management for reliable tests
  - Ensured proper cleanup of resources to prevent memory leaks
  - Fixed flaky tests by improving async operation handling

**Next Steps:**
1.  **Testing:**
    - Create integration tests for end-to-end user flows.
    - Write unit tests for new components (error boundary, skeleton, global search).
    - Test global search functionality with various query types.
    - Add more comprehensive test coverage for error scenarios
    - Implement end-to-end tests for complex workflows
    - Add performance testing for search functionality
    - Create stress tests for API rate limiting scenarios

2.  **Additional Improvements:**
    - Optimize global search performance and caching.
    - Implement customizable dashboard with user preferences.
    - Add analytics to track usage patterns and identify common queries.
    - Consider adding authentication to restrict access to the application.
    - Implement webhooks for real-time order updates from Printavo.
    - Explore potential uses for the new SanMar MCP tools (e.g., checking stock during quote creation).

3.  **Documentation Updates:**
    - Add code comments to improve maintainability.
    - Create a changelog to track major code changes.

**Current Implementation:**

- **Visual ID Query:** The system now supports simpler "find order XXXX" queries in addition to more explicit formats. This makes it more intuitive for users to find orders.
- **Quote Creation via Chat:** Users can now create quotes entirely through conversation, with the system guiding them through the process of adding customer details, line items, and notes.
- **Enhanced Quote Editing:** The quote creation workflow now supports:
  - Editing existing line items with "edit item N: [details]" commands
  - Removing items from the quote with "remove item N" commands
  - Previewing the current state of the quote with "preview quote" command
  - Improved validation and error handling throughout the process
- **Order Details Display:** The OrderCard component now shows comprehensive information including line items, customer details, notes, and addresses with improved styling.
- **Orders Page:** Enhanced with pagination, search functionality, status filtering, and improved mobile responsiveness.
- **Live Data Integration:** All parts of the application (homepage, dashboard, and chat) now consistently use live data from the Printavo API.
- **Error Handling:** Improved error handling with custom error classes and detailed error messages. All API routes now use consistent error handling patterns.
- **Service Layer:** The `printavo-service.ts` now properly uses operations from `graphql-client.ts`, making the code more maintainable.
- **API Routes:** The API route in `app/api/printavo/route.ts` now includes better parameter validation and specific handling for visual ID queries.
- **Dashboard:** Enhanced with real-time data updates, interactive charts for sales trends, revenue tracking, and customizable sort order for orders display. By default, orders are sorted from newest to oldest for quick access to most recent activity.
- **API Rate Limiting:** Implemented robust handling of API rate limits with exponential backoff, intelligent retries, and detailed user feedback.
- **Error Boundary:** Enhanced error boundary component with API-specific error handling, retry functionality, and detailed error information.
- **Skeleton Loaders:** Implemented skeleton loaders for improved loading states throughout the application, with specialized components for orders, charts, and dashboards.
- **Global Search:** Added global search functionality with support for searching orders and customers, with visual ID prioritization and intelligent relevance sorting.
- **SanMar Integration:** The `sanmar-mcp-server` is now installed, configured, and running, providing access to SanMar API tools directly within Cline.

**Active Decisions and Considerations:**

- **Type Definitions:** We've improved type definitions to better match the Printavo API response structure, including adding description field to line items and notes field to QuoteCreateInput.
- **Performance Optimizations:** The formatOrderForChat function now properly formats all order data including line items, which may increase response size but provides a better user experience.
- **UI Consistency:** We're using a blue-themed header for order cards to maintain visual consistency and highlight important information.
- **Expanding Query Capabilities:** We should consider adding support for more query types beyond visual ID, such as customer name or order status.
- **Environment Variables:** We now maintain both standard and NEXT_PUBLIC_ prefixed variables to ensure compatibility with different parts of the application.
- **Conversational UI:** The chat interface now supports multi-step workflows like quote creation with editing capabilities, which enhances the application's flexibility.
- **Homepage Behavior:** The homepage automatically redirects to the dashboard for immediate access to order information.
- **Error Handling Strategy:** We've implemented a more comprehensive error handling strategy with specific focus on API rate limiting to ensure application resilience.
- **Chart Visualization:** Used Chart.js for dashboard visualizations to provide better business insights without requiring complex backend analytics.
- **User Preferences:** Added user preference storage for display options like sort order to enhance user experience.
- **API Optimization:** Implemented staggered API requests and intelligent retry logic to minimize rate limiting issues while maintaining data freshness.
- **SmartPoller Implementation:** Redesigned the SmartPoller to properly cleanup resources and handle errors gracefully, preventing infinite loops or memory leaks.
- **Testing Infrastructure:** Improved the Jest configuration to support both unit tests and React component tests, with proper mocking of environment variables and external dependencies.
- **Error Classification:** We've implemented smart error classification to differentiate between different types of errors and provide appropriate feedback.
- **Loading State Consistency:** We're using skeleton loaders throughout the application to ensure consistent loading states and improve perceived performance.
- **Global Search Strategy:** We prioritize Visual ID matches in search results to make it easier for users to find specific orders, while still providing broader search capabilities.
- **Search Performance:** We're implementing debouncing and caching strategies to minimize API calls and improve search performance.

## Recent Fixes

Recently completed work has successfully addressed all known issues:

1. **GraphQL Schema Validation**
   - Added a schema validator that automatically detects API changes
   - Implemented comparison logic to detect breaking changes in the Printavo API
   - Added warning logs when schema incompatibilities are found
   - Created a system that will help prevent unexpected failures when the API structure changes

2. **Nested Line Item Handling**
   - Enhanced order data extraction with recursive line item processing
   - Added an `allLineItems` property to orders for easier access to all items regardless of nesting
   - Improved the data structure to better handle Printavo's complex nested line items

3. **Quote Creation Workflow Improvements**
   - Added functionality to edit existing line items in a quote
   - Implemented item removal capability
   - Created a detailed quote preview function
   - Enhanced natural language parsing with multiple patterns for line item details
   - Structured the workflow to support a conversational quote building experience

4. **Punycode Deprecation Warning Fix**
   - Created a warning suppression script to filter out specific deprecation warnings
   - Updated package.json scripts to use the suppression mechanism for all test commands
   - Implemented a targeted approach that only suppresses specific warnings

5. **SmartPoller Stability Enhancements**
   - Fixed polling mechanisms to prevent infinite loops
   - Improved error handling with proper backoff strategies
   - Added cleanup of timer references to prevent memory leaks
   - Implemented better state management for polling status

## Next Steps
- Add unit tests for the new schema validation functionality
- Implement the authentication refresh mechanism
- Enhance the WebSocket implementation for production
- Address browser compatibility issues for voice features
- Continue improving error handling and recovery mechanisms

## Active Decisions

The team has decided to:
- Use schema validation as a proactive approach to detecting API changes
- Implement recursive extraction for line items to handle any level of nesting
- Add edit/remove capabilities to the quote creation workflow for a better user experience
- Fix the punycode deprecation warnings using a targeted suppression approach that doesn't hide important warnings

## Architectural Considerations

The recent fixes have reinforced these architectural principles:
- Proactive validation before API dependency failures occur
- Graceful degradation when services are unavailable
- Comprehensive extraction of nested data structures for simplicity of use
- Natural language interfaces that allow for flexibility in user input
- Targeted warning suppression that maintains visibility of important issues

### GraphQL Client Improvements
- **Operation Name Handling**:
  - Fixed "No operation named" errors in the dashboard by ensuring all GraphQL operations have explicit names
  - Added automatic operation name extraction from query definitions
  - Implemented fallback with operation name generation for unnamed queries
  - Updated admin debug tools to safely simulate operation name errors without causing actual issues
  - Enhanced error detection and recovery for GraphQL operation name issues

### Real-time Updates
- Implementing smart polling for dashboard data
- Adding WebSocket service for real-time notifications
- Enhancing change detection for efficient data updates

### Error Handling
- Creating robust error boundary components
- Implementing specialized error handling for API failures
- Enhancing error recovery with retry mechanisms
- Adding better user feedback for error states

## Recent Changes

- Added operation name validation and generation to fix GraphQL "No operation named" errors
- Enhanced skeleton loaders for improved loading states
- Created global search functionality
- Fixed rate limiting and infinite loop issues in polling system
- Enhanced error handling with custom error classes
- Added voice control features to chat widget
- Improved OpenAI model integration
- Implemented order status updates from details view
- Enhanced API reliability with request queuing

## Next Steps

- Implement customizable dashboard preferences
- Add analytics for tracking common queries
- Create better browser compatibility detection for voice features
- Replace mock WebSocket with production implementation
- Enhance error handling for specialized use cases
- Implement authentication refresh mechanisms
- Add webhook support for real-time Printavo updates

## Active Decisions

- Using Web Speech API for voice recognition with fallbacks
- Implementing TTL-based caching for improved performance
- Using GraphQL for most Printavo API interactions
- Adopting a proactive error handling approach with retries and fallbacks
- Leveraging automatic operation name extraction and generation for robust GraphQL operations
