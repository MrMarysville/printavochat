# Python Agent Service Setup Guide

This guide provides step-by-step instructions for setting up and running the Python Agent Service.

## Prerequisites

Before starting, make sure you have the following installed:

- Python 3.10 or higher
- pip (Python package manager)
- virtualenv or venv (optional but recommended)

## Step 1: Set Up a Virtual Environment

Create and activate a virtual environment to isolate the dependencies:

```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows
venv\Scripts\activate
# On macOS/Linux
source venv/bin/activate
```

## Step 2: Install Dependencies

Install the required packages:

```bash
pip install -r requirements.txt
```

## Step 3: Configure Environment Variables

Copy the example `.env` file and update it with your actual values:

```bash
cp .env.example .env
```

Open the `.env` file in a text editor and add your API keys:

```
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_key_here
OPENAI_MODEL=gpt-4o

# Printavo API Configuration
PRINTAVO_API_URL=https://www.printavo.com/api/v2
PRINTAVO_EMAIL=your_printavo_email
PRINTAVO_TOKEN=your_printavo_token
```

## Step 4: Run the Service

Start the service using the provided run script:

```bash
python run.py
```

This will start the FastAPI application on `http://localhost:8000` by default.

Alternatively, you can start it directly with uvicorn:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Step 5: Test the Service

### Using the Test Script

You can use the provided test script to test the service:

```bash
# Test the health check endpoint
python test_agent.py --health

# Test with a simple query
python test_agent.py --query "Show me recent orders"

# Test with custom options
python test_agent.py --query "Show me all orders" --include-completed --include-quotes
```

### Using the API Documentation

You can also explore and test the API using the Swagger UI at:

```
http://localhost:8000/api/docs
```

Or ReDoc at:

```
http://localhost:8000/api/redoc
```

## Step 6: Integrating with Next.js Frontend

To use the Python Agent Service with your existing Next.js frontend:

1. Make sure the service is running at `http://localhost:8000`
2. Update your Next.js `.env` file:
   ```
   USE_PYTHON_AGENT=true
   PYTHON_AGENT_URL=http://localhost:8000
   ```
3. Restart your Next.js application
4. Test that the integration works by making requests from the frontend

## Troubleshooting

### Common Issues

1. **Service does not start:**
   - Check that all dependencies are installed: `pip install -r requirements.txt`
   - Verify that the port is not in use: `lsof -i :8000` (on macOS/Linux)

2. **API calls fail:**
   - Verify that your API keys are correct in the `.env` file
   - Check the server logs for error messages
   - Ensure that the OpenAI Agents SDK is properly installed

3. **Integration with Next.js fails:**
   - Check that the service is running and accessible from the Next.js application
   - Verify that the URL is correctly set in the Next.js `.env` file
   - Check the browser console and Next.js server logs for error messages

For any other issues, please refer to the OpenAI Agents SDK documentation or file an issue in the project repository. 