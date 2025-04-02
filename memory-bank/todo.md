# Project TODO List

This document outlines the pending tasks, organized by priority and category, for the Printavo Chat Application.

## High Priority Tasks

### OpenAI Assistants API Integration
- [ ] Complete testing of tool_choice parameter with visual ID searches
- [ ] Verify custom assistant messages implementation with order summaries
- [ ] Implement token usage control for better cost management
- [ ] Implement thread management solution for conversation continuity
- [ ] Add telemetry specifically for the Assistants API performance
- [ ] Update all documentation to reflect v2 API usage

### Supabase Database
- [ ] Create missing `products` table to store product information
- [ ] Implement `pricing_matrix` tables for price calculation
- [ ] Update `line_items` table with additional fields:
  - [ ] Add `itemNumber` for product reference
  - [ ] Add `category` field
  - [ ] Add `markupPercentage` field
  - [ ] Add `productStatus` field
- [ ] Enhance `customers` table with:
  - [ ] Add `internalNote` field
  - [ ] Add `resaleNumber` field
  - [ ] Add `taxExempt` boolean field
  - [ ] Add `orderCount` field
- [ ] Update `orders`/`quotes` tables with:
  - [ ] Add payment tracking fields
  - [ ] Add discount fields
  - [ ] Add due date fields
  - [ ] Add `paymentTerm` reference
  - [ ] Add `productionNote` field
  - [ ] Add `totalQuantity` field
- [ ] Create additional tables:
  - [ ] `tasks` for task/reminder tracking
  - [ ] `payment_terms` for payment options
  - [ ] `fees` for additional order fees
  - [ ] `expenses` for order expense tracking

### Data Integration
- [ ] Improve data mapping in `mapPrintavo...ToSupabase` functions
- [ ] Implement customer linking (Printavo ID → Supabase UUID)
- [ ] Complete logic for saving/updating line items in Supabase
- [ ] Implement batch synchronization process for existing Printavo data

## Medium Priority Tasks

### Natural Language Features
- [ ] Replace placeholder logic for `create_quote_natural_language` tool
- [ ] Develop improved parsing logic using LLM or regex
- [ ] Create training examples for natural language quote creation
- [ ] Implement validation logic for parsed quote information
- [ ] Add conversational flows for requesting missing quote information

### SanMar Integration
- [ ] Complete SanMar product catalog integration
- [ ] Implement SanMar inventory checking
- [ ] Create order placement workflows for SanMar
- [ ] Develop product search features using SanMar data
- [ ] Add product recommendation capabilities

### User Experience
- [ ] Develop training materials for natural language capabilities
- [ ] Create guided tutorials for common workflows
- [ ] Implement UI improvements for order visualization
- [ ] Add progress indicators for long-running operations
- [ ] Create dashboard for viewing synchronized data

## Low Priority Tasks

### Performance Optimization
- [ ] Implement caching for frequently accessed data
- [ ] Optimize database queries for better performance
- [ ] Add batch processing for high-volume operations
- [ ] Implement rate limiting to prevent API abuse
- [ ] Add compression for data transfers

### Monitoring and Maintenance
- [ ] Set up automated backup system for Supabase data
- [ ] Create monitoring dashboard for system health
- [ ] Implement alert system for critical errors
- [ ] Develop data integrity checks
- [ ] Create maintenance documentation

### Documentation
- [ ] Complete API documentation
- [ ] Create architecture diagrams
- [ ] Document database schema and relationships
- [ ] Prepare user guides for all features
- [ ] Develop troubleshooting guides

## Future Considerations

### OpenAI Agents SDK Migration
- [ ] Evaluate benefits of migrating to Agents SDK
- [ ] Plan Python service layer using FastAPI
- [ ] Develop strategy for phased migration
- [ ] Create feature flag system for testing new implementation
- [ ] Design compatibility layer for existing frontend

### Advanced Features
- [ ] Implement vector store for product catalog search
- [ ] Develop AI-powered sales forecasting
- [ ] Create automated customer segmentation
- [ ] Add analytics dashboard for business insights
- [ ] Implement multi-channel notification system

## Notes
- All high-priority tasks should be completed before moving to medium-priority items
- Database schema changes should be carefully planned to avoid data loss
- Regular testing should be performed throughout development
- Documentation should be updated as features are implemented 