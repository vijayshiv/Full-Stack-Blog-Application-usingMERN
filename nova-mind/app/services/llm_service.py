import httpx
from typing import Optional
from ..config import config
from ..core.errors import LLMServiceError
from ..core.logging import get_logger

logger = get_logger(__name__)


class LLMService:
    """Service for Large Language Model operations using Groq API"""

    def __init__(self):
        self.api_key = config.GROQ_API_KEY
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        self.default_model = "llama-3.1-8b-instant"  # Updated to supported model

    async def generate_response(
        self,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: int = 150,
        model: Optional[str] = None,
    ) -> str:
        """Generate response using Groq API"""

        # Check if API key is available
        if not self.api_key:
            logger.warning("GROQ API key not configured, using fallback response")
            return self._get_fallback_response(prompt)

        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            }

            data = {
                "messages": [{"role": "user", "content": prompt}],
                "model": model or self.default_model,
                "temperature": temperature,
                "max_tokens": max_tokens,
            }

            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.base_url,
                    headers=headers,
                    json=data,
                    timeout=30.0,
                )

                if response.status_code == 200:
                    result = response.json()
                    return result["choices"][0]["message"]["content"]
                else:
                    logger.error(
                        f"Groq API error: {response.status_code} - {response.text}"
                    )
                    return self._get_fallback_response(prompt)

        except Exception as e:
            logger.error(f"Error calling Groq API: {str(e)}")
            return self._get_fallback_response(prompt)

    def _get_fallback_response(self, prompt: str) -> str:
        """Generate fallback responses when LLM service is unavailable"""

        prompt_lower = prompt.lower()

        if "ai tool" in prompt_lower or "artificial intelligence" in prompt_lower:
            return """Our platform offers several AI-powered tools to enhance your blogging experience! 🤖

✨ **Content Generation**: Get help writing blog posts with AI assistance
📝 **Smart Rephrasing**: Improve your writing with AI-powered rewrites
📊 **Automatic Summarization**: Create concise summaries of long content
🔍 **Semantic Search**: Find relevant content using intelligent search
💡 **Topic Suggestions**: Get AI-generated ideas for your next post

These tools are designed to make your blogging journey more efficient and creative!"""

        elif (
            "site" in prompt_lower
            or "platform" in prompt_lower
            or "about" in prompt_lower
        ):
            return """This is a comprehensive blogging platform designed for writers of all levels! 🌟 You can create and publish blog posts, engage with other writers through comments and likes, and use our advanced AI-powered tools to enhance your content creation process."""

        elif "conversational" in prompt_lower or "chat" in prompt_lower:
            return "I'd be happy to help you learn more about that! Based on the blog content available, I can provide insights and answer questions about various topics. Feel free to ask me anything about our platform, content creation, or the subjects covered in our blog posts."

        else:
            return "I'm here to help you with your blogging experience! You can ask me about platform features, get content suggestions, learn about our AI tools, or discuss topics from our blog posts."

    async def rewrite_query(self, query: str) -> str:
        """Enhance query for better semantic search results"""

        if not self.api_key:
            # Simple query enhancement without LLM
            return f"{query} blog content writing"

        prompt = f"""
        Rewrite this search query to be more effective for finding relevant blog content:
        
        Original query: "{query}"
        
        Make it more specific and include relevant keywords that would help find blog posts.
        Return only the improved query, nothing else.
        """

        try:
            enhanced_query = await self.generate_response(
                prompt, temperature=0.3, max_tokens=50
            )
            return enhanced_query.strip()
        except Exception as e:
            logger.error(f"Query rewriting failed: {e}")
            return query


# Global instance
llm_service = LLMService()
