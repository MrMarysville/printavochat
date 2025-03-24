# Product Context

## Purpose
This project provides an integration with Printavo's API, allowing users to interact with Printavo data. The application appears to be a chat-based interface for accessing and managing Printavo information.

## Problems Solved
- Simplifies interaction with Printavo's API
- Provides a chat interface for accessing Printavo data
- Allows for querying orders, products, and other Printavo resources

## How It Should Work
The application connects to Printavo's GraphQL API and provides various operations such as:
- Retrieving order information (by ID or visual ID)
- Searching for products
- Managing customers
- Handling quotes and invoices
- Working with line items and fees

Users can query the system using a chat interface, and the backend will translate these requests into appropriate API calls to Printavo. 