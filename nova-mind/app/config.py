import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "")
    REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
    DEBUG = os.environ.get("DEBUG", "False").lower() == "true"
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

    # Centralized configuration from environment
    HOST_IP = os.environ.get("HOST_IP", "localhost")
    BACKEND_URL = os.environ.get(
        "BACKEND_URL", f"http://{os.environ.get('HOST_IP', 'localhost')}:4000"
    )
    FRONTEND_URL = f"http://{os.environ.get('HOST_IP', 'localhost')}:5173"

    # Database configuration
    DB_HOST = os.environ.get("DB_HOST", "")
    DB_USER = os.environ.get("DB_USER", "")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "")
    DB_NAME = os.environ.get("DB_NAME", "")


config = Config()
