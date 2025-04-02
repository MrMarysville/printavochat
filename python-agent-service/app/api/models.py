"""
API models for the Python Agent Service.
"""

from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field


class AgentRequest(BaseModel):
    """Request model for the agent API."""
    query: str = Field(..., description="The query to process")
    exclude_completed: bool = Field(True, description="Whether to exclude completed orders")
    exclude_quotes: bool = Field(True, description="Whether to exclude quotes")


class TokenUsage(BaseModel):
    """Token usage model."""
    prompt_tokens: int = Field(..., description="Number of prompt tokens used")
    completion_tokens: int = Field(..., description="Number of completion tokens used")
    total_tokens: int = Field(..., description="Total number of tokens used")


class AgentResponseData(BaseModel):
    """Data model for the agent response."""
    response: str = Field(..., description="The agent's response")
    elapsed_time: Optional[float] = Field(None, description="Time taken to process the request in seconds")
    usage: Optional[TokenUsage] = Field(None, description="Token usage information")


class AgentResponse(BaseModel):
    """Response model for the agent API."""
    success: bool = Field(..., description="Whether the request was successful")
    error: Optional[str] = Field(None, description="Error message if the request failed")
    data: Optional[AgentResponseData] = Field(None, description="Response data if the request was successful")


class Order(BaseModel):
    """Order model."""
    id: str = Field(..., description="Order ID")
    name: str = Field(..., description="Order name")
    visualId: str = Field(..., description="Visual ID")
    date: str = Field(..., description="Created date")
    status: str = Field(..., description="Order status")
    customer: str = Field(..., description="Customer name")
    total: float = Field(..., description="Order total")


class OrdersResponse(BaseModel):
    """Response model for orders API."""
    success: bool = Field(..., description="Whether the request was successful")
    error: Optional[str] = Field(None, description="Error message if the request failed")
    data: Optional[List[Order]] = Field(None, description="Orders if the request was successful")


class Status(BaseModel):
    """Status model."""
    id: str = Field(..., description="Status ID")
    name: str = Field(..., description="Status name")
    color: str = Field(..., description="Status color")


class StatusesResponse(BaseModel):
    """Response model for statuses API."""
    success: bool = Field(..., description="Whether the request was successful")
    error: Optional[str] = Field(None, description="Error message if the request failed")
    data: Optional[List[Status]] = Field(None, description="Statuses if the request was successful") 