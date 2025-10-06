from typing import List, Dict, Any
from ..db.connection import search_blog_posts, get_blog_analytics
from ..services.chroma_service import chroma_service
from ..services.llm_service import llm_service
from ..schemas import ChatMessage
from ..core.logging import get_logger

logger = get_logger(__name__)


class QAService:
    """Service for handling Q&A operations"""

    async def handle_conversational_qa(
        self, user_message: str, chat_history: List[ChatMessage], top_k: int = 3
    ) -> Dict[str, Any]:
        """Handle conversational Q&A with semantic search and chat context"""

        try:
            # Check for website-specific queries
            if self._is_website_query(user_message):
                return self._handle_website_info_query(user_message)

            # Use semantic search to find relevant blog content
            relevant_content, sources = chroma_service.search_similar_content(
                user_message, top_k=top_k, distance_threshold=1.3
            )

            if not relevant_content:
                return {
                    "answer": "I couldn't find specific information about that in our blog posts. However, I'd be happy to help you in other ways! You could ask about our popular posts, get blog writing ideas, or learn about our platform features.",
                    "sources": [],
                    "context_used": "no_content_found",
                    "suggested_next": [
                        "Show me popular blog posts",
                        "Give me blog topic suggestions",
                        "What can I do on this platform?",
                        "Help me write a blog post",
                    ],
                }

            # Build conversational context
            chat_context = ""
            if chat_history:
                for msg in chat_history[-3:]:  # Use last 3 messages for context
                    role = "User" if msg.role == "user" else "Assistant"
                    chat_context += f"{role}: {msg.content}\n"

            # Combine blog content for context
            blog_context = "\n".join(
                [
                    f"[Blog: {item['title']}]\n{item['content'][:400]}"
                    for item in relevant_content[:3]
                ]
            )

            # Generate conversational answer
            prompt = f"""You are a helpful blog assistant having a conversation with a user. Answer their question using the blog content provided, while maintaining the conversational flow.

Previous conversation:
{chat_context}

Current user question: {user_message}

Relevant blog content:
{blog_context}

Instructions:
1. Answer the user's question directly and conversationally
2. Use information from the blog content when relevant
3. If the blog content doesn't fully answer the question, acknowledge this and offer related help
4. Keep the response engaging and helpful
5. Don't mention "blog content" or "according to the posts" - just naturally incorporate the information

Provide a helpful, conversational response:"""

            answer = await llm_service.generate_response(
                prompt, temperature=0.7, max_tokens=400
            )

            # Generate contextual suggestions
            suggested_next = self._generate_suggestions(relevant_content, user_message)

            return {
                "answer": answer,
                "sources": sources[:3],
                "context_used": "conversational_with_blog_content",
                "suggested_next": suggested_next,
            }

        except Exception as e:
            logger.error(f"Conversational QA error: {e}")
            return {
                "answer": "I'm having trouble processing your question right now. Could you try rephrasing it or ask about something else?",
                "sources": [],
                "context_used": "error",
                "suggested_next": [
                    "Tell me about the platform",
                    "Show me popular posts",
                    "Give me topic ideas",
                ],
            }

    def _is_website_query(self, message: str) -> bool:
        """Check if the message is asking about the website/platform"""
        website_keywords = [
            "what is this site",
            "what is this website",
            "what is this platform",
            "tell me about this site",
            "about this website",
            "what can I do here",
            "what is this",
            "about this platform",
        ]
        return any(keyword in message.lower() for keyword in website_keywords)

    def _handle_website_info_query(self, message: str) -> Dict[str, Any]:
        """Handle queries about the website/platform itself"""
        return {
            "answer": """Welcome to our comprehensive blog platform! 🌟 Here's what you can do:

📖 **Read & Discover**: Explore blogs on technology, AI, food, movies, science, design, and more
✍️ **Write & Create**: Publish your own blog posts with our rich text editor
🤖 **AI-Powered Tools**: Use AI for content generation, rephrasing, and summarization
💬 **Engage**: Like, comment, and connect with other bloggers
🔍 **Smart Search**: Find content using our semantic search capabilities

Whether you're a seasoned writer or just starting out, our platform has everything you need!""",
            "sources": [],
            "context_used": "site_info",
            "suggested_next": [
                "Show me trending blog topics",
                "How do I write my first blog post?",
                "What are the most popular posts?",
                "Give me some blog topic ideas",
            ],
        }

    def _generate_suggestions(
        self, relevant_content: List[Dict], user_message: str
    ) -> List[str]:
        """Generate contextual follow-up suggestions"""

        suggestions = []

        # Topic-specific suggestions
        for item in relevant_content[:2]:
            title_lower = item["title"].lower()
            if any(topic in title_lower for topic in ["ai", "artificial intelligence"]):
                suggestions.extend(
                    ["Tell me more about AI tools", "How do I start with AI?"]
                )
            elif any(topic in title_lower for topic in ["food", "cooking", "recipe"]):
                suggestions.extend(["Show me cooking tips", "Suggest recipe ideas"])
            elif any(
                topic in title_lower for topic in ["tech", "technology", "programming"]
            ):
                suggestions.extend(["Help with programming", "Latest tech trends"])

        # Default suggestions
        default_suggestions = [
            "Tell me more about this topic",
            "Show me related blog posts",
            "Give me writing ideas about this",
            "What else should I know?",
        ]

        # Combine and return unique suggestions
        all_suggestions = suggestions + default_suggestions
        return list(dict.fromkeys(all_suggestions))[:4]  # Remove duplicates, limit to 4


# Global instance
qa_service = QAService()
