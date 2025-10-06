"""
Utility functions for the Nova Mind application
"""

from typing import List, Dict, Any
import re
from ..core.logging import get_logger

logger = get_logger(__name__)


def clean_html_content(html_content: str) -> str:
    """
    Clean HTML content and extract plain text
    """
    try:
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(html_content, "html.parser")

        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()

        # Get text and clean it
        text = soup.get_text()

        # Clean up whitespace
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = " ".join(chunk for chunk in chunks if chunk)

        return text
    except Exception as e:
        logger.error(f"Error cleaning HTML content: {e}")
        return html_content


def chunk_text(text: str, max_words: int = 150, overlap_words: int = 30) -> List[str]:
    """
    Enhanced semantic chunking that preserves meaning and context
    """
    try:
        words = text.split()
        if len(words) <= max_words:
            return [text]

        chunks = []
        start = 0

        while start < len(words):
            # Calculate end position
            end = min(start + max_words, len(words))

            # Try to find a good breaking point (sentence end, paragraph, etc.)
            chunk_words = words[start:end]
            chunk_text = " ".join(chunk_words)

            # Look for sentence endings near the end of the chunk
            if end < len(words):  # Not the last chunk
                sentence_endings = [".", "!", "?", "\n\n"]
                best_break = end

                # Look backwards from the end to find a good break point
                for i in range(len(chunk_text) - 1, max(0, len(chunk_text) - 100), -1):
                    if chunk_text[i] in sentence_endings:
                        # Count words up to this point
                        words_up_to_break = len(chunk_text[:i].split())
                        if (
                            words_up_to_break >= max_words * 0.7
                        ):  # At least 70% of max_words
                            best_break = start + words_up_to_break + 1
                            break

                if best_break != end:
                    chunk_words = words[start:best_break]
                    chunk_text = " ".join(chunk_words)
                    end = best_break

            chunks.append(chunk_text.strip())

            # Move start position with overlap
            if end >= len(words):
                break
            start = max(end - overlap_words, start + 1)  # Ensure progress

        return chunks

    except Exception as e:
        logger.error(f"Error chunking text: {e}")
        return [text]


def extract_keywords(text: str, top_k: int = 10) -> List[str]:
    """
    Extract keywords from text using simple frequency analysis
    """
    try:
        # Convert to lowercase and remove special characters
        clean_text = re.sub(r"[^a-zA-Z\s]", "", text.lower())

        # Split into words
        words = clean_text.split()

        # Remove common stop words
        stop_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "from",
            "up",
            "about",
            "into",
            "through",
            "during",
            "before",
            "after",
            "above",
            "below",
            "between",
            "among",
            "through",
            "is",
            "was",
            "are",
            "were",
            "be",
            "been",
            "being",
            "have",
            "has",
            "had",
            "do",
            "does",
            "did",
            "will",
            "would",
            "should",
            "could",
            "can",
            "may",
            "might",
            "must",
            "shall",
            "this",
            "that",
            "these",
            "those",
        }

        # Filter words
        filtered_words = [
            word for word in words if len(word) > 3 and word not in stop_words
        ]

        # Count frequency
        word_freq = {}
        for word in filtered_words:
            word_freq[word] = word_freq.get(word, 0) + 1

        # Sort by frequency and return top k
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)

        return [word for word, freq in sorted_words[:top_k]]

    except Exception as e:
        logger.error(f"Error extracting keywords: {e}")
        return []


def validate_request_data(
    data: Dict[str, Any], required_fields: List[str]
) -> Dict[str, Any]:
    """
    Validate request data and return errors if any
    """
    errors = {}

    for field in required_fields:
        if field not in data or data[field] is None:
            errors[field] = f"Field '{field}' is required"
        elif isinstance(data[field], str) and not data[field].strip():
            errors[field] = f"Field '{field}' cannot be empty"

    return errors
