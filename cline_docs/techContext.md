# Technical Context

## Technologies Used
- Next.js as the React framework
- TypeScript for type safety
- GraphQL for API communication
- Printavo API for business logic

## Development Setup
- Next.js development server runs on port 3002
- Environment variables for Printavo API credentials:
  - `NEXT_PUBLIC_PRINTAVO_EMAIL`
  - `NEXT_PUBLIC_PRINTAVO_TOKEN`
  - `NEXT_PUBLIC_PRINTAVO_API_URL`

## Technical Constraints
- Dependent on Printavo API availability
- Must handle GraphQL error responses properly
- Need to maintain correct typing for Printavo API objects 