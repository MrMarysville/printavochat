"""
Debug script for the Python Agent Service.
This script imports each module one by one to identify any import errors.
"""

import sys
import os

print(f"Python executable: {sys.executable}")
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")
print(f"PYTHONPATH: {os.environ.get('PYTHONPATH', 'Not set')}")

modules_to_check = [
    "fastapi",
    "uvicorn",
    "pydantic",
    "dotenv",
    "httpx",
    "pytest",
    "agents",  # This is the OpenAI Agents SDK
]

print("\nChecking installed modules:")
for module in modules_to_check:
    try:
        __import__(module)
        print(f"✅ {module} - Successfully imported")
    except ImportError as e:
        print(f"❌ {module} - Import error: {e}")

print("\nChecking app modules:")
try:
    print("Checking app module...")
    import app
    print("✅ app - Successfully imported")
    
    print("Checking app.config module...")
    from app.config import settings
    print(f"✅ app.config - Successfully imported (debug={settings.debug})")
    
    print("Checking app.api modules...")
    from app.api import models
    print("✅ app.api.models - Successfully imported")
    
    print("Checking app.api.routes module...")
    from app.api import routes
    print("✅ app.api.routes - Successfully imported")
    
    print("Checking app.printavo.api module...")
    from app.printavo import api
    print("✅ app.printavo.api - Successfully imported")
    
    print("Checking app.agents.printavo_agent module...")
    from app.agents import printavo_agent
    print("✅ app.agents.printavo_agent - Successfully imported")
    
    print("Checking app.main module...")
    import app.main
    print("✅ app.main - Successfully imported")

except Exception as e:
    import traceback
    print(f"❌ Error: {e}")
    traceback.print_exc()

print("\nDebug complete") 