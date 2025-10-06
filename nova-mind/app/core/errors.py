from fastapi import HTTPException
from typing import Dict, Any
import traceback
from .logging import get_logger

logger = get_logger(__name__)


class NovaBaseException(Exception):
    """Base exception for Nova Mind application"""

    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class DatabaseConnectionError(NovaBaseException):
    """Exception raised when database connection fails"""

    def __init__(self, message: str = "Database connection failed"):
        super().__init__(message, 503)


class LLMServiceError(NovaBaseException):
    """Exception raised when LLM service fails"""

    def __init__(self, message: str = "LLM service unavailable"):
        super().__init__(message, 503)


class ChromaDBError(NovaBaseException):
    """Exception raised when ChromaDB operations fail"""

    def __init__(self, message: str = "Vector database operation failed"):
        super().__init__(message, 500)


def create_error_response(error: Exception) -> Dict[str, Any]:
    """Create standardized error response"""

    if isinstance(error, NovaBaseException):
        return {"error": error.message, "status_code": error.status_code}

    # Log unexpected errors
    logger.error(f"Unexpected error: {str(error)}")
    logger.error(traceback.format_exc())

    return {"error": "Internal server error", "status_code": 500}
