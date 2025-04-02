"""
Tests for the Printavo agent.
"""

import pytest
import os
import json
from unittest.mock import AsyncMock, patch
from agents import Agent
from app.agents.printavo_agent import PrintavoAgentManager
from app.printavo.api import PrintavoAPIClient


@pytest.fixture
def mock_printavo_client():
    """Mock Printavo API client."""
    with patch('app.printavo.api.printavo_client') as mock:
        # Mock the get_orders method
        mock.get_orders = AsyncMock(return_value=[
            {
                "id": "order1",
                "name": "Test Order 1",
                "visualId": "1234",
                "createdAt": "2023-01-01T00:00:00Z",
                "status": {"id": "status1", "name": "In Progress", "color": "blue"},
                "customer": {"id": "customer1", "name": "Test Customer", "email": "test@example.com"},
                "total": "100.00"
            },
            {
                "id": "order2",
                "name": "Test Order 2",
                "visualId": "5678",
                "createdAt": "2023-01-02T00:00:00Z",
                "status": {"id": "status2", "name": "New", "color": "green"},
                "customer": {"id": "customer2", "name": "Another Customer", "email": "another@example.com"},
                "total": "200.00"
            }
        ])
        
        # Mock the get_order_by_visual_id method
        mock.get_order_by_visual_id = AsyncMock(return_value={
            "id": "order1",
            "name": "Test Order 1",
            "visualId": "1234",
            "createdAt": "2023-01-01T00:00:00Z",
            "status": {"id": "status1", "name": "In Progress", "color": "blue"},
            "customer": {"id": "customer1", "name": "Test Customer", "email": "test@example.com"},
            "total": "100.00"
        })
        
        # Mock the get_statuses method
        mock.get_statuses = AsyncMock(return_value=[
            {"id": "status1", "name": "In Progress", "color": "blue"},
            {"id": "status2", "name": "New", "color": "green"},
            {"id": "status3", "name": "Completed", "color": "grey"}
        ])
        
        yield mock


@pytest.mark.asyncio
@patch('app.agents.printavo_agent.Agent')
@patch('app.agents.printavo_agent.Runner')
async def test_process_query(mock_runner, mock_agent, mock_printavo_client):
    """Test processing a query."""
    # Mock Runner.run
    mock_result = AsyncMock()
    mock_result.final_output = "Here are your orders: Order 1, Order 2"
    mock_result.usage = AsyncMock()
    mock_result.usage.prompt_tokens = 100
    mock_result.usage.completion_tokens = 50
    mock_result.usage.total_tokens = 150
    
    mock_runner.run = AsyncMock(return_value=mock_result)
    
    # Create agent manager
    agent_manager = PrintavoAgentManager()
    
    # Process a query
    result = await agent_manager.process_query("Show me recent orders")
    
    # Assertions
    assert "response" in result
    assert result["response"] == "Here are your orders: Order 1, Order 2"
    assert "usage" in result
    assert result["usage"]["prompt_tokens"] == 100
    assert result["usage"]["completion_tokens"] == 50
    assert result["usage"]["total_tokens"] == 150
    assert "elapsed_time" in result
    
    # Verify Runner.run was called with the correct arguments
    mock_runner.run.assert_called_once()
    args, kwargs = mock_runner.run.call_args
    assert args[0] == agent_manager.agent
    assert "Show me recent orders" in args[1]


@pytest.mark.asyncio
async def test_process_query_error_handling():
    """Test error handling in process_query."""
    # Create agent manager with mocked agent
    agent_manager = PrintavoAgentManager()
    agent_manager.agent = AsyncMock()
    
    # Mock Runner.run to raise an exception
    with patch('app.agents.printavo_agent.Runner.run', side_effect=Exception("Test error")):
        # Process a query
        result = await agent_manager.process_query("Show me recent orders")
        
        # Assertions
        assert "error" in result
        assert "Test error" in result["error"]
        assert "elapsed_time" in result 