# System Patterns

## Architecture
The application follows a Next.js architecture with:
- GraphQL client for Printavo API integration
- Service layer that abstracts the GraphQL operations
- API routes for handling client requests

## Key Technical Decisions
1. Using GraphQL for Printavo API integration
2. Implementing a service layer to abstract API complexity
3. TypeScript for type safety across the application

## Patterns
- GraphQL operations are defined in `lib/graphql-client.ts`
- Service modules (`printavo-service.ts`) abstract the GraphQL operations
- API routes handle HTTP requests and call the appropriate services 