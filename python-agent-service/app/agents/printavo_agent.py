"""
PrintavoAgent implementation using the OpenAI Agents SDK.
"""

import time
from typing import Dict, List, Optional, Any
import logging
from agents import Agent, FunctionTool
from agents.runner import Runner

from app.config import settings
from app.printavo.api import printavo_client

# Configure logging
logger = logging.getLogger(__name__)

# Define the tools to provide to the agent

async def get_orders(query: str = "", exclude_completed: bool = True, exclude_quotes: bool = True) -> List[Dict]:
    """Get orders from Printavo.
    
    Args:
        query: Search terms to filter orders
        exclude_completed: Whether to exclude completed orders
        exclude_quotes: Whether to exclude quotes
        
    Returns:
        List of orders
    """
    logger.info(f"Getting orders with query: {query}")
    try:
        orders = await printavo_client.get_orders(
            query=query,
            exclude_completed=exclude_completed,
            exclude_quotes=exclude_quotes
        )
        
        # Convert to a more simplified format for the agent
        formatted_orders = []
        for order in orders:
            formatted_orders.append({
                "id": order["id"],
                "name": order["name"],
                "visualId": order["visualId"],
                "date": order["createdAt"],
                "status": order["status"]["name"],
                "customer": order["customer"]["name"],
                "total": float(order["total"]) if order["total"] else 0.0
            })
            
        return formatted_orders
    except Exception as e:
        logger.error(f"Error getting orders: {e}")
        # Return a formatted error message that the agent can understand
        return [{"error": f"Failed to retrieve orders: {str(e)}"}]


async def get_order_by_visual_id(visual_id: str) -> Optional[Dict]:
    """Get an order by its visual ID.
    
    Args:
        visual_id: The visual ID of the order
        
    Returns:
        The order if found, None otherwise
    """
    logger.info(f"Getting order with visual ID: {visual_id}")
    try:
        order = await printavo_client.get_order_by_visual_id(visual_id)
        
        if not order:
            return {"error": f"No order found with visual ID: {visual_id}"}
            
        # Format the order
        formatted_order = {
            "id": order["id"],
            "name": order["name"],
            "visualId": order["visualId"],
            "date": order["createdAt"],
            "status": order["status"]["name"],
            "customer": order["customer"]["name"],
            "total": float(order["total"]) if order["total"] else 0.0
        }
            
        return formatted_order
    except Exception as e:
        logger.error(f"Error getting order by visual ID: {e}")
        return {"error": f"Failed to retrieve order: {str(e)}"}


async def get_statuses() -> List[Dict]:
    """Get all available statuses from Printavo.
    
    Returns:
        List of statuses
    """
    logger.info("Getting statuses")
    try:
        statuses = await printavo_client.get_statuses()
        return statuses
    except Exception as e:
        logger.error(f"Error getting statuses: {e}")
        return [{"error": f"Failed to retrieve statuses: {str(e)}"}]


class PrintavoAgentManager:
    """Manager for the Printavo agent."""
    
    def __init__(self):
        """Initialize the Printavo agent manager."""
        # Create the function tools
        self.tools = [
            FunctionTool(get_orders),
            FunctionTool(get_order_by_visual_id),
            FunctionTool(get_statuses)
        ]
        
        # Create the agent
        self.agent = Agent(
            name="PrintavoAgent",
            instructions="""
            You are a helpful assistant that specializes in accessing and analyzing Printavo data.
            
            You can help with:
            1. Retrieving orders from Printavo
            2. Finding specific orders by visual ID
            3. Getting information about available order statuses
            
            By default, you will exclude orders with "completed" status and those with "quote" status.
            If the user specifically asks for these, you can include them by setting the appropriate parameters.
            
            Always format currency values with $ and two decimal places.
            Dates should be formatted in a human-readable format (e.g., "March 15, 2023").
            
            If there are no results matching the user's query, let them know clearly.
            If there's an error in retrieving data, explain the problem and suggest trying again.
            """,
            tools=self.tools,
            model=settings.openai_model
        )
        
    async def process_query(self, query: str, exclude_completed: bool = True, exclude_quotes: bool = True):
        """Process a user query using the Printavo agent.
        
        Args:
            query: The user's query
            exclude_completed: Whether to exclude completed orders
            exclude_quotes: Whether to exclude quotes
            
        Returns:
            The agent's response and usage information
        """
        logger.info(f"Processing query: {query}")
        start_time = time.time()
        
        try:
            # Provide additional context about filters in the query
            context = f"The user wants to {'' if exclude_completed else 'include'} completed orders and {'' if exclude_quotes else 'include'} quotes."
            full_query = f"{query}\n\nContext: {context}"
            
            # Run the agent
            result = await Runner.run(self.agent, full_query)
            
            elapsed_time = time.time() - start_time
            logger.info(f"Query processed in {elapsed_time:.2f} seconds")
            
            # Extract usage information if available
            usage = None
            if hasattr(result, 'usage') and result.usage:
                usage = {
                    "prompt_tokens": result.usage.prompt_tokens,
                    "completion_tokens": result.usage.completion_tokens,
                    "total_tokens": result.usage.total_tokens
                }
            
            return {
                "response": result.final_output,
                "usage": usage,
                "elapsed_time": elapsed_time
            }
        except Exception as e:
            logger.error(f"Error processing query: {e}")
            elapsed_time = time.time() - start_time
            return {
                "error": f"Failed to process query: {str(e)}",
                "elapsed_time": elapsed_time
            }


# Create a singleton instance
printavo_agent_manager = PrintavoAgentManager() 