import logging
import sys
from typing import Optional


def setup_logging(level: str = "INFO") -> logging.Logger:
    """
    Set up logging configuration for the application
    """
    logging_level = getattr(logging, level.upper(), logging.INFO)

    # Create formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )

    # Create console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # Configure root logger
    logging.basicConfig(
        level=logging_level,
        handlers=[console_handler],
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    )

    return logging.getLogger(__name__)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for the given name"""
    return logging.getLogger(name)
