"""
Configuration module for the Python Agent Service.
Loads environment variables and provides configuration settings.
"""

import os
from dotenv import load_dotenv
from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

class Settings(BaseModel):
    """Settings model for the application."""
    # OpenAI API settings
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    openai_model: str = os.getenv("OPENAI_MODEL", "gpt-4o")
    
    # Printavo API settings
    printavo_api_url: str = os.getenv("PRINTAVO_API_URL", "https://www.printavo.com/api/v2")
    printavo_email: str = os.getenv("PRINTAVO_EMAIL", "")
    printavo_token: str = os.getenv("PRINTAVO_TOKEN", "")
    
    # Server settings
    port: int = int(os.getenv("PORT", "8000"))
    host: str = os.getenv("HOST", "0.0.0.0")
    debug: bool = os.getenv("DEBUG", "False").lower() == "true"
    
    # Validate the configuration
    def validate(self):
        """Validate that all required settings are provided."""
        missing = []
        if not self.openai_api_key:
            missing.append("OPENAI_API_KEY")
        if not self.printavo_email:
            missing.append("PRINTAVO_EMAIL")
        if not self.printavo_token:
            missing.append("PRINTAVO_TOKEN")
            
        if missing:
            raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        
        return True

# Create a global settings object
settings = Settings() 