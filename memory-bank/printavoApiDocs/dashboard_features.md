# Dashboard Features

## Recent Orders Display

The dashboard displays recent orders from the Printavo API with several key features:

### Newest First Display

- Recent orders are displayed with the newest orders first by default
- The GraphQL query uses `sortDescending: true` parameter to fetch data in reverse chronological order
- Client-side sorting further ensures that orders are displayed from newest to oldest based on the `createdAt` field
- A sort toggle allows users to change between "Newest First" and "Oldest First" views

### Implementation Details

1. **API Request:**
   - The `fetchRecentOrders` function in `lib/graphql-client.ts` makes a GraphQL query to the Printavo API
   - The query explicitly includes `sortDescending: true` to fetch the most recent orders first
   - A limit of 50 orders is set to provide enough data for filtering and sorting while maintaining performance

2. **Data Processing:**
   - Returned data is transformed into a standardized format for the UI
   - Date values are preserved from the API's ISO format for accurate sorting
   - Numeric values like `total` are converted from strings to numbers
   - Final data is sorted on the client side to ensure correct ordering

3. **User Preferences:**
   - Sort direction is controlled by the `sortDirection` state in the dashboard component
   - The UI allows toggling between "Newest First" and "Oldest First" via a dropdown selector
   - The sort preference is applied consistently across all order displays

### Fault Tolerance

- The implementation includes fallbacks for API errors or empty responses:
  - Empty responses return an empty array instead of null
  - API errors are caught and logged, returning an empty array to prevent UI breakage
  - Date parsing errors are handled gracefully to prevent sorting failures

### Testing

- Test coverage for the order display includes:
  - Verification that the GraphQL query includes the correct parameters
  - Confirmation that orders are properly sorted from newest to oldest by default
  - Testing of error handling for API failures and empty responses
  - Validation of the data transformation process

## Real-time Data Updates

The dashboard implements a comprehensive real-time update system with:

- Auto-refresh functionality with configurable intervals (30s, 1m, 5m, 10m)
- Smart polling with change detection to reduce API load
- WebSocket service integration for push notifications
- Visual indicators for connection status and data freshness
- Last updated timestamp display
- Toast notifications for new and updated orders
