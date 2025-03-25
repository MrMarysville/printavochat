# Active Context: Printavo Chat Application

**Current Focus:**
- Enhanced order details display with comprehensive information.
- Improved natural language processing for simpler order queries.
- Consistent use of live Printavo data throughout the application.
- Order status update functionality with real-time API integration.

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

**Next Steps:**
1.  **Testing:**
    - Write unit tests for new functions and API routes.
    - Test the visual ID query functionality with various scenarios.
    - Test the quote creation functionality with various inputs.
    - Verify error handling improvements.

2.  **Additional Improvements:**
    - Add ability to update order status from the order details view.
    - Improve mobile responsiveness of the order details display.
    - Add pagination support for order listings.
    - Enhance quote creation with better validation and feedback.

3.  **Documentation Updates:**
    - Add code comments to improve maintainability.
    - Create a changelog to track major code changes.

**Current Implementation:**

- **Visual ID Query:** The system now supports simpler "find order XXXX" queries in addition to more explicit formats. This makes it more intuitive for users to find orders.
- **Quote Creation via Chat:** Users can now create quotes entirely through conversation, with the system guiding them through the process of adding customer details, line items, and notes.
- **Order Details Display:** The OrderCard component now shows comprehensive information including line items, customer details, notes, and addresses with improved styling.
- **Live Data Integration:** All parts of the application (homepage, dashboard, and chat) now consistently use live data from the Printavo API.
- **Error Handling:** Improved error handling with custom error classes and detailed error messages. All API routes now use consistent error handling patterns.
- **Service Layer:** The `printavo-service.ts` now properly uses operations from `graphql-client.ts`, making the code more maintainable.
- **API Routes:** The API route in `app/api/printavo/route.ts` now includes better parameter validation and specific handling for visual ID queries.

**Active Decisions and Considerations:**

- **Type Definitions:** We've improved type definitions to better match the Printavo API response structure, including adding description field to line items.
- **Performance Optimizations:** The formatOrderForChat function now properly formats all order data including line items, which may increase response size but provides a better user experience.
- **UI Consistency:** We're using a blue-themed header for order cards to maintain visual consistency and highlight important information.
- **Expanding Query Capabilities:** We should consider adding support for more query types beyond visual ID, such as customer name or order status.
- **Environment Variables:** We now maintain both standard and NEXT_PUBLIC_ prefixed variables to ensure compatibility with different parts of the application.
- **Conversational UI:** The chat interface now supports multi-step workflows like quote creation, which enhances the application's capabilities.
