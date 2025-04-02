"""
Run script for the Python Agent Service.
"""

import os
import uvicorn
from app.config import settings

if __name__ == "__main__":
    # Run the application
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    ) 