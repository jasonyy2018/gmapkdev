from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import os

class Settings(BaseSettings):
    # API Keys
    google_api_key: str = "" # Unified key for Maps and Gemini
    
    # Database
    database_url: str = "sqlite:///./gmapkdev.db"
    
    # App Config
    app_name: str = "Smart Map Customer Development System"
    debug: bool = True
    cors_origins: List[str] = ["*"]
    
    # Search & Analysis
    max_search_results: int = 50
    request_timeout: int = 30

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding='utf-8',
        extra='ignore'
    )

settings = Settings()
