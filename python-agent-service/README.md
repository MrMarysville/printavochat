# Python Agent Service for Printavo

This service provides an API for interacting with Printavo data using the OpenAI Agents SDK.

## Features

- Agent-based interaction with Printavo data
- RESTful API for integration with the existing Next.js frontend
- Based on the new OpenAI Agents SDK for Python

## Requirements

- Python 3.10+
- OpenAI API key
- Printavo API credentials

## Installation

1. Clone the repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

4. Edit the `.env` file and add your API keys and settings

## Running the service

Start the service with:

```bash
python run.py
```

Or directly with uvicorn:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Agent API

- `POST /api/agent` - Process a request using the Printavo agent
  - Request body:
    ```json
    {
      "query": "Show me recent orders",
      "exclude_completed": true,
      "exclude_quotes": true
    }
    ```
  - Response:
    ```json
    {
      "success": true,
      "error": null,
      "data": {
        "response": "Here are your recent orders...",
        "usage": {
          "prompt_tokens": 123,
          "completion_tokens": 456,
          "total_tokens": 579
        },
        "elapsed_time": 1.23
      }
    }
    ```

### Health Check

- `GET /api/health` - Health check endpoint
  - Response:
    ```json
    {
      "status": "ok",
      "version": "1.0.0",
      "environment": "development",
      "agent": "PrintavoAgent"
    }
    ```

## Documentation

API documentation is available at `/api/docs` (Swagger UI) and `/api/redoc` (ReDoc) when running in debug mode.

## Integration with Next.js Frontend

This service is designed to be used with the existing Next.js frontend. To integrate:

1. Update the `lib/agent-service.ts` file to call this Python service API
2. Keep the interface consistent to minimize changes to UI components
3. Add feature flags to toggle between the old and new implementation

## Development

- Use `DEBUG=True` in your `.env` file for development mode
- Run tests with `pytest`
- Run linting with `flake8` 