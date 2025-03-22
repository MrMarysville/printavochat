# Active Context: Printavo Chat Application

**Current Focus:**
- Enhanced natural language processing for visual ID queries.
- Finalized all core functionality for stability and visual ID queries.

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
  - Updated help information to guide users on visual ID query options
- Added customer creation functionality:
  - Implemented `CustomerCreateInput` interface in types.ts
  - Added `createCustomer` mutation to graphql-client.ts
  - Created `findOrCreateCustomer` and `createCustomer` helper methods in printavo-service.ts
  - Added `createCustomerOperation` to operations.ts with natural language pattern recognition
  - Enhanced help information to inform users about the customer creation capability
- Created `.clinerules` file documenting project patterns and knowledge.
- Updated `progress.md` to reflect current state.

**Next Steps:**
1.  **Testing:**
    -   Write unit tests for new functions and API routes.
    -   Test the visual ID query functionality with various scenarios.
    -   Verify error handling improvements.

2.  **Additional Improvements:**
    -   Explore adding a filter by Visual ID feature to the order search functionality.
    -   Consider improving the UI to better communicate Visual ID capabilities.
    -   Evaluate adding caching mechanisms to improve performance.

3.  **Documentation Updates:**
    -   Add code comments to improve maintainability.
    -   Create a changelog to track major code changes.

**Current Implementation:**

-   **Visual ID Query:** The system now prioritizes checking visual ID when a 4-digit number is detected in user input. This is handled in `operations.ts` with the updated `createGetOrderOperation` function.
-   **Error Handling:** Improved error handling with custom error classes and detailed error messages. All API routes now use consistent error handling patterns.
-   **Service Layer:** The `printavo-service.ts` now properly uses operations from `graphql-client.ts`, making the code more maintainable.
-   **API Routes:** The API route in `app/api/printavo/route.ts` now includes better parameter validation and specific handling for visual ID queries.

**Active Decisions and Considerations:**

-   **Type Assertions:** We've used type assertions in several places to handle response formats. In a future update, we might want to improve the type definitions.
-   **Query Parameters:** The current implementation of customer search does not fully support query parameters. This could be improved in a future update.
-   **Performance:** We should monitor performance of visual ID queries and consider adding caching mechanisms if needed.
-   **API Consistency:** We've made the API routes more consistent, but further improvements could be made to standardize parameter naming and response formats.
