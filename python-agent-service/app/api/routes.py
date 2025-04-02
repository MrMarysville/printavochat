"""
API routes for the Python Agent Service.
"""

import logging
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from app.api.models import AgentRequest, AgentResponse, AgentResponseData, TokenUsage
from app.agents.printavo_agent import printavo_agent_manager
from app.config import settings

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter()

@router.post("/api/agent", response_model=AgentResponse)
async def process_agent_request(request: AgentRequest):
    """Process a request to the agent.
    
    Args:
        request: The agent request
        
    Returns:
        The agent response
    """
    try:
        logger.info(f"Processing agent request: {request.query}")
        
        # Call the agent manager
        result = await printavo_agent_manager.process_query(
            query=request.query,
            exclude_completed=request.exclude_completed,
            exclude_quotes=request.exclude_quotes
        )
        
        # Check if there was an error
        if "error" in result:
            return {
                "success": False,
                "error": result["error"],
                "data": None
            }
        
        # Create response
        response_data = AgentResponseData(
            response=result["response"],
            elapsed_time=result.get("elapsed_time")
        )
        
        # Add token usage if available
        if result.get("usage"):
            response_data.usage = TokenUsage(
                prompt_tokens=result["usage"]["prompt_tokens"],
                completion_tokens=result["usage"]["completion_tokens"],
                total_tokens=result["usage"]["total_tokens"]
            )
        
        return {
            "success": True,
            "error": None,
            "data": response_data
        }
    except Exception as e:
        logger.error(f"Error processing agent request: {e}")
        return {
            "success": False,
            "error": f"Internal server error: {str(e)}",
            "data": None
        }

@router.get("/api/health")
async def health_check():
    """Health check endpoint.
    
    Returns:
        Health status
    """
    return {
        "status": "ok",
        "version": "1.0.0",
        "environment": "development" if settings.debug else "production",
        "agent": "PrintavoAgent"
    } 