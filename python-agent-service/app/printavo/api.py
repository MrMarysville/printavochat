"""
Printavo API client for interacting with the Printavo GraphQL API.
"""

import json
import logging
from typing import Dict, List, Optional, Any, Union
import httpx
from pydantic import BaseModel

from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class PrintavoAPIClient:
    """Client for interacting with the Printavo API."""
    
    def __init__(self, api_url: str = None, email: str = None, token: str = None):
        """Initialize the Printavo API client.
        
        Args:
            api_url: The Printavo API URL (defaults to settings.printavo_api_url)
            email: The Printavo API email (defaults to settings.printavo_email)
            token: The Printavo API token (defaults to settings.printavo_token)
        """
        self.api_url = api_url or settings.printavo_api_url
        self.email = email or settings.printavo_email
        self.token = token or settings.printavo_token
        self.graphql_endpoint = f"{self.api_url}/graphql"
        
        # Validate that we have the required credentials
        if not self.email or not self.token:
            raise ValueError("Printavo API email and token must be provided")
    
    async def execute_graphql(self, query: str, variables: Dict = None, operation_name: str = None) -> Dict:
        """Execute a GraphQL query against the Printavo API.
        
        Args:
            query: The GraphQL query to execute
            variables: Optional variables for the GraphQL query
            operation_name: Optional operation name for the GraphQL query
            
        Returns:
            The response data from the Printavo API
        """
        headers = {
            "Content-Type": "application/json",
            "email": self.email,
            "token": self.token
        }
        
        payload = {
            "query": query
        }
        
        if variables:
            payload["variables"] = variables
            
        if operation_name:
            payload["operationName"] = operation_name
            
        logger.debug(f"Executing GraphQL query: {operation_name or 'unnamed'}")
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.graphql_endpoint,
                    headers=headers,
                    json=payload
                )
                
                response.raise_for_status()
                result = response.json()
                
                if "errors" in result:
                    logger.error(f"GraphQL errors: {result['errors']}")
                    raise Exception(f"GraphQL errors: {result['errors']}")
                    
                return result.get("data", {})
                
        except httpx.HTTPStatusError as e:
            logger.error(f"HTTP error: {e}")
            raise Exception(f"HTTP error: {e}")
            
        except Exception as e:
            logger.error(f"Error executing GraphQL query: {e}")
            raise
            
    async def get_orders(self, 
                         query: str = "", 
                         first: int = 10, 
                         exclude_completed: bool = True,
                         exclude_quotes: bool = True) -> List[Dict]:
        """Get orders from Printavo.
        
        Args:
            query: Search query to filter orders
            first: Number of orders to retrieve
            exclude_completed: Whether to exclude completed orders
            exclude_quotes: Whether to exclude quotes
            
        Returns:
            List of orders
        """
        # Construct the query string based on filters
        query_string = query
        
        # Add filters if needed
        if exclude_completed:
            query_string += " -status:completed"
            
        if exclude_quotes:
            query_string += " -status:quote"
            
        # GraphQL query for orders
        gql_query = """
        query SearchOrders($query: String!, $first: Int!) {
          orders(first: $first, query: $query) {
            edges {
              node {
                id
                name
                visualId
                createdAt
                updatedAt
                dueDate
                status {
                  id
                  name
                  color
                }
                customer {
                  id
                  name
                  email
                }
                total
              }
            }
          }
        }
        """
        
        variables = {
            "query": query_string.strip(),
            "first": first
        }
        
        try:
            data = await self.execute_graphql(gql_query, variables, "SearchOrders")
            
            if not data or not data.get("orders") or not data["orders"].get("edges"):
                return []
                
            # Extract and transform the orders
            orders = []
            for edge in data["orders"]["edges"]:
                node = edge["node"]
                orders.append({
                    "id": node["id"],
                    "name": node["name"],
                    "visualId": node["visualId"],
                    "createdAt": node["createdAt"],
                    "status": {
                        "id": node["status"]["id"],
                        "name": node["status"]["name"],
                        "color": node["status"]["color"]
                    },
                    "customer": {
                        "id": node["customer"]["id"],
                        "name": node["customer"]["name"],
                        "email": node["customer"]["email"]
                    },
                    "total": node["total"]
                })
                
            return orders
            
        except Exception as e:
            logger.error(f"Error getting orders: {e}")
            raise
            
    async def get_statuses(self) -> List[Dict]:
        """Get all available statuses from Printavo.
        
        Returns:
            List of statuses
        """
        gql_query = """
        query GetStatuses {
          statuses {
            edges {
              node {
                id
                name
                color
              }
            }
          }
        }
        """
        
        try:
            data = await self.execute_graphql(gql_query, operation_name="GetStatuses")
            
            if not data or not data.get("statuses") or not data["statuses"].get("edges"):
                return []
                
            # Extract and transform the statuses
            statuses = []
            for edge in data["statuses"]["edges"]:
                node = edge["node"]
                statuses.append({
                    "id": node["id"],
                    "name": node["name"],
                    "color": node["color"]
                })
                
            return statuses
            
        except Exception as e:
            logger.error(f"Error getting statuses: {e}")
            raise
            
    async def get_order_by_visual_id(self, visual_id: str) -> Optional[Dict]:
        """Get an order by its visual ID.
        
        Args:
            visual_id: The visual ID of the order
            
        Returns:
            The order if found, None otherwise
        """
        # GraphQL query for getting an order by visual ID
        gql_query = """
        query GetOrderByVisualId($query: String!) {
          invoices(query: $query, first: 1) {
            edges {
              node {
                id
                name
                visualId
                createdAt
                updatedAt
                total
                status {
                  id
                  name
                  color
                }
                contact {
                  id
                  fullName
                  email
                }
              }
            }
          }
        }
        """
        
        variables = {
            "query": visual_id.strip()
        }
        
        try:
            data = await self.execute_graphql(gql_query, variables, "GetOrderByVisualId")
            
            if (not data or 
                not data.get("invoices") or 
                not data["invoices"].get("edges") or 
                len(data["invoices"]["edges"]) == 0):
                return None
                
            # Extract the order
            node = data["invoices"]["edges"][0]["node"]
            
            # Transform to a consistent format
            order = {
                "id": node["id"],
                "name": node["name"],
                "visualId": node["visualId"],
                "createdAt": node["createdAt"],
                "status": {
                    "id": node["status"]["id"],
                    "name": node["status"]["name"],
                    "color": node["status"]["color"]
                },
                "customer": {
                    "id": node["contact"]["id"],
                    "name": node["contact"]["fullName"],
                    "email": node["contact"]["email"]
                },
                "total": node["total"]
            }
                
            return order
            
        except Exception as e:
            logger.error(f"Error getting order by visual ID: {e}")
            raise

# Create a singleton instance
printavo_client = PrintavoAPIClient() 