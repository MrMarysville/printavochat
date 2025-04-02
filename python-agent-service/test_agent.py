#!/usr/bin/env python
"""
Test script for the Python Agent Service.
This script sends a request to the agent service and displays the response.
"""

import argparse
import asyncio
import json
import time
from typing import Dict, Any
import httpx

# Define the default server URL
DEFAULT_URL = "http://localhost:8000"

async def test_agent(
    query: str, 
    exclude_completed: bool = True, 
    exclude_quotes: bool = True, 
    server_url: str = DEFAULT_URL
) -> Dict[str, Any]:
    """Send a request to the agent service and return the response.
    
    Args:
        query: The query to send to the agent
        exclude_completed: Whether to exclude completed orders
        exclude_quotes: Whether to exclude quotes
        server_url: The URL of the agent service
        
    Returns:
        The agent response
    """
    # Prepare the request data
    request_data = {
        "query": query,
        "exclude_completed": exclude_completed,
        "exclude_quotes": exclude_quotes
    }
    
    # Print the request
    print(f"\n🔍 Sending request to {server_url}/api/agent")
    print(f"Request data: {json.dumps(request_data, indent=2)}")
    
    # Send the request
    start_time = time.time()
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{server_url}/api/agent",
                json=request_data,
                timeout=60.0  # Increase timeout for longer queries
            )
            
            elapsed_time = time.time() - start_time
            
            # Print the response status
            print(f"\n📊 Response status: {response.status_code}")
            print(f"Response time: {elapsed_time:.2f} seconds")
            
            # Parse the JSON response
            try:
                response_data = response.json()
                print("\n📝 Response data:")
                print(json.dumps(response_data, indent=2))
                
                return response_data
            except json.JSONDecodeError:
                print("\n❌ Error: Response is not valid JSON")
                print(f"Response text: {response.text}")
                return {"success": False, "error": "Invalid JSON response"}
                
        except httpx.RequestError as e:
            print(f"\n❌ Error: {e}")
            return {"success": False, "error": str(e)}


async def test_health(server_url: str = DEFAULT_URL) -> Dict[str, Any]:
    """Send a request to the health check endpoint.
    
    Args:
        server_url: The URL of the agent service
        
    Returns:
        The health status
    """
    print(f"\n🔍 Checking health of {server_url}/api/health")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{server_url}/api/health")
            
            print(f"\n📊 Health check status: {response.status_code}")
            
            try:
                response_data = response.json()
                print("\n📝 Health data:")
                print(json.dumps(response_data, indent=2))
                
                return response_data
            except json.JSONDecodeError:
                print("\n❌ Error: Response is not valid JSON")
                print(f"Response text: {response.text}")
                return {"success": False, "error": "Invalid JSON response"}
                
        except httpx.RequestError as e:
            print(f"\n❌ Error: {e}")
            return {"success": False, "error": str(e)}


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Test the Python Agent Service")
    parser.add_argument("--health", action="store_true", help="Check the health of the service")
    parser.add_argument("--url", type=str, default=DEFAULT_URL, help="Agent service URL")
    parser.add_argument("--query", type=str, default="Show me recent orders", help="Query to send to the agent")
    parser.add_argument("--include-completed", action="store_true", help="Include completed orders")
    parser.add_argument("--include-quotes", action="store_true", help="Include quotes")
    
    args = parser.parse_args()
    
    if args.health:
        result = asyncio.run(test_health(args.url))
    else:
        result = asyncio.run(test_agent(
            query=args.query, 
            exclude_completed=not args.include_completed,
            exclude_quotes=not args.include_quotes,
            server_url=args.url
        ))
    
    # Print summary
    if result.get("success", False):
        print("\n✅ Test completed successfully")
    else:
        print("\n❌ Test failed")
        

if __name__ == "__main__":
    main() 