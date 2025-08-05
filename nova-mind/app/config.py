import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "your-default-secret-key")
    REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")
    DEBUG = os.environ.get("DEBUG", "False").lower() == "true"
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")


config = Config()
