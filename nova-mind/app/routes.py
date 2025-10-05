from fastapi import APIRouter, HTTPException
from .schemas import (
    RephraseRequest,
    RephraseResponse,
    SemanticSearchRequest,
    QARequest,
    QAResponse,
    SummarizeRequest,
    SummarizeResponse,
    TopicSummaryRequest,
    TopicSummaryResponse,
    MultiHopQARequest,
    MultiHopQAResponse,
    AgentTaskRequest,
    AgentTaskResponse,
    ToolRequest,
    ToolResponse,
    AdvancedSummarizeRequest,
    AdvancedSummarizeResponse,
)
from .config import config
from .services import cache_service
from sentence_transformers import SentenceTransformer
import chromadb
import openai
import requests
import logging
import mysql.connector

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load ChromaDB and embedding Model
chroma_client = chromadb.PersistentClient(path="chroma_db")
# Update collection name to support multi-source data
chroma_collection = chroma_client.get_or_create_collection("knowledge_base")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


# Database connection helper
def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=config.DB_HOST,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            database=config.DB_NAME,
        )
        return connection
    except mysql.connector.Error as e:
        logger.error(f"Database connection error: {e}")
        return None


# Blog posts semantic search helper
def search_blog_posts(query, limit=5):
    """Search blog posts using basic text matching and return formatted results"""
    connection = get_db_connection()
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)

        # Search in title, content, and categories
        search_query = """
        SELECT p.post_id, p.title, p.content, p.category, p.img, p.createdTimestamp as date, u.fullname as username 
        FROM posts p 
        JOIN users u ON p.user_id = u.id 
        WHERE p.title LIKE %s OR p.content LIKE %s OR p.category LIKE %s
        ORDER BY p.createdTimestamp DESC
        LIMIT %s
        """

        search_term = f"%{query}%"
        cursor.execute(search_query, (search_term, search_term, search_term, limit))

        results = cursor.fetchall()

        # Format results to match semantic search format
        formatted_results = []
        for post in results:
            # Calculate a simple relevance score based on query matches
            title_matches = query.lower() in post["title"].lower()
            content_matches = query.lower() in (post["content"] or "").lower()
            category_matches = query.lower() in (post["category"] or "").lower()

            # Simple scoring: title match = 0.5, content match = 0.3, category match = 0.2
            relevance_score = 0
            if title_matches:
                relevance_score += 0.5
            if content_matches:
                relevance_score += 0.3
            if category_matches:
                relevance_score += 0.2

            formatted_result = {
                "id": str(post["post_id"]),
                "title": post["title"],
                "content": post["content"][:200] + "..."
                if len(post["content"]) > 200
                else post["content"],
                "category": post["category"],
                "author": post["username"],
                "date": post["date"].strftime("%Y-%m-%d") if post["date"] else None,
                "image": post["img"],
                "source": "blog",
                "url": f"/posts/{post['post_id']}",
                "relevance_score": relevance_score,
                "priority": 1,  # Highest priority for blog posts
            }
            formatted_results.append(formatted_result)

        cursor.close()
        connection.close()

        # Sort by relevance score
        formatted_results.sort(key=lambda x: x["relevance_score"], reverse=True)
        return formatted_results

    except mysql.connector.Error as e:
        logger.error(f"Database query error: {e}")
        if connection:
            connection.close()
        return []


# Helper for prompt instructions
TONE_INSTRUCTIONS = {
    "Professional": "Rephrase this text in a professional, formal business tone. Return only the rephrased text with no additional formatting or explanations.",
    "Technical": "Rephrase this text in a technical, precise, and detailed manner. Return only the rephrased text with no additional formatting or explanations.",
    "Casual": "Rephrase this text in a casual, friendly, and conversational tone. Return only the rephrased text with no additional formatting or explanations.",
    "SEO": "Rephrase this text to be more SEO-friendly with better keywords and structure. Return only the rephrased text with no additional formatting or explanations.",
}

MAX_CONTEXT_LENGTH = 2000  # characters


def summarize_context(context, groq_api_key):
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {
                "role": "system",
                "content": "Summarize the following blog content for answering a user question.",
            },
            {"role": "user", "content": context},
        ],
        "max_tokens": 300,
        "temperature": 0.5,
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    data = resp.json()
    return data["choices"][0]["message"]["content"].strip()


def get_instruction(tone):
    return TONE_INSTRUCTIONS.get(tone, "Rephrase this text")


def get_data_source_priority(metadata):
    """Define priority for different data sources"""
    source = metadata.get("source", "unknown")
    priorities = {
        "blog": 1,  # Highest priority - our own content
    }
    return priorities.get(source, 999)


def format_search_result(metadata, source_type):
    """Format search results based on source type"""
    if source_type == "blog":
        return {
            "id": metadata.get("post_id", ""),
            "title": metadata.get("title", ""),
            "category": metadata.get("category", ""),
            "source": "blog",
            "chunk_info": f"{metadata.get('chunk_index', 0) + 1}/{metadata.get('total_chunks', 1)}",
        }
    else:
        return {
            "title": metadata.get("title", "Unknown"),
            "source": metadata.get("source", "unknown"),
            "chunk_info": f"{metadata.get('chunk_index', 0) + 1}/{metadata.get('total_chunks', 1)}",
        }


async def make_groq_request(
    prompt: str, temperature: float = 0.7, max_tokens: int = 150
) -> str:
    """
    Make a request to Groq API for text generation
    """
    import httpx

    # Check if GROQ API key is available
    if not config.GROQ_API_KEY:
        logger.warning("GROQ API key not configured, using fallback response")
        # Return contextually appropriate responses based on the prompt content
        if "ai tool" in prompt.lower() or "artificial intelligence" in prompt.lower():
            return "Our platform offers several AI-powered tools to enhance your blogging experience! 🤖\n\n✨ **Content Generation**: Get help writing blog posts with AI assistance\n📝 **Smart Rephrasing**: Improve your writing with AI-powered rewrites\n📊 **Automatic Summarization**: Create concise summaries of long content\n🔍 **Semantic Search**: Find relevant content using intelligent search\n💡 **Topic Suggestions**: Get AI-generated ideas for your next post\n\nThese tools are designed to make your blogging journey more efficient and creative!"
        elif (
            "site" in prompt.lower()
            or "platform" in prompt.lower()
            or "about" in prompt.lower()
        ):
            return "This is a comprehensive blogging platform designed for writers of all levels! 🌟 You can create and publish blog posts, engage with other writers through comments and likes, and use our advanced AI-powered tools to enhance your content creation process."
        elif "conversational" in prompt.lower() or "chat" in prompt.lower():
            # For conversational contexts, provide more natural responses
            return "I'd be happy to help you learn more about that! Based on the blog content available, I can provide insights and answer questions about various topics. Feel free to ask me anything about our platform, content creation, or the subjects covered in our blog posts."
        else:
            return "I'm here to help you with your blogging experience! You can ask me about platform features, get content suggestions, learn about our AI tools, or discuss topics from our blog posts."

    try:
        headers = {
            "Authorization": f"Bearer {config.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        data = {
            "messages": [{"role": "user", "content": prompt}],
            "model": "mixtral-8x7b-32768",
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=10.0,
            )

            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                logger.error(
                    f"Groq API error: {response.status_code} - {response.text}"
                )
                # Return fallback response on API error
                return "I'm having trouble with my AI service right now. Let me help you in other ways! You can browse our blog posts, learn about platform features, or ask for content suggestions."

    except Exception as e:
        logger.error(f"Error calling Groq API: {str(e)}")
        # Return fallback response on exception
        return "I'm experiencing some technical difficulties right now. However, I'm still here to help! You can ask me about our platform, browse blog posts, or get content ideas."


async def rewrite_query_with_llm(original_query: str) -> list:
    """
    Use LLM to rewrite the query in multiple ways for better semantic search
    """
    try:
        prompt = f"""
Rewrite the following search query in 3 different ways to help find relevant blog posts. 
Each rewrite should capture the same intent but use different words and phrasings.
Focus on synonyms, related terms, and alternative expressions.

Original query: "{original_query}"

Provide 3 rewrites as a simple list, one per line:
1. 
2. 
3. 
"""

        # Use Groq for fast query rewriting
        response = await make_groq_request(
            prompt=prompt,
            temperature=0.3,  # Low temperature for consistent rewrites
            max_tokens=150,
        )

        if response and response.strip():
            # Extract the rewrites from the response
            lines = response.strip().split("\n")
            rewrites = []
            for line in lines:
                # Clean up the line and extract the actual rewrite
                cleaned = line.strip()
                if cleaned and not cleaned.startswith("Original") and len(cleaned) > 5:
                    # Remove numbering and formatting
                    if ". " in cleaned:
                        cleaned = cleaned.split(". ", 1)[1]
                    if cleaned.startswith("- "):
                        cleaned = cleaned[2:]
                    rewrites.append(cleaned)

            logger.info(f"LLM generated {len(rewrites)} query rewrites")
            return rewrites[:3]  # Limit to 3 rewrites

    except Exception as e:
        logger.error(f"Error rewriting query with LLM: {str(e)}")

    return []  # Return empty list if LLM fails


def enhance_query(original_query: str) -> dict:
    """
    Enhance the query using multiple techniques for better retrieval
    """
    enhanced_queries = []

    # 1. Original query (always first)
    enhanced_queries.append(original_query)

    # 2. Rule-based query expansion with synonyms and related terms
    query_lower = original_query.lower()

    # Food/Cuisine expansion
    if any(word in query_lower for word in ["food", "recipe", "cooking", "meal"]):
        food_expanded = (
            f"{original_query} cuisine dish recipe cooking ingredients nutrition"
        )
        enhanced_queries.append(food_expanded)

    # Technology expansion
    elif any(word in query_lower for word in ["tech", "ai", "programming", "software"]):
        tech_expanded = f"{original_query} technology development coding software engineering computer"
        enhanced_queries.append(tech_expanded)

    # Movie/Cinema expansion
    elif any(word in query_lower for word in ["movie", "film", "cinema", "actor"]):
        movie_expanded = (
            f"{original_query} cinema film director entertainment hollywood actor"
        )
        enhanced_queries.append(movie_expanded)

    # Science expansion
    elif any(word in query_lower for word in ["science", "research", "study"]):
        science_expanded = (
            f"{original_query} research scientific study analysis experiment discovery"
        )
        enhanced_queries.append(science_expanded)

    # Art expansion
    elif any(word in query_lower for word in ["art", "artist", "painting", "creative"]):
        art_expanded = (
            f"{original_query} artistic creative visual design aesthetic culture"
        )
        enhanced_queries.append(art_expanded)

    # 3. Question-style reformulation for better semantic matching
    if not original_query.startswith(("what", "how", "why", "when", "where")):
        question_forms = [
            f"What is {original_query}",
            f"Tell me about {original_query}",
            f"Information about {original_query}",
        ]
        enhanced_queries.extend(question_forms[:2])  # Add 2 question variants

    # 4. Specific domain enhancements
    if "fruit" in query_lower:
        enhanced_queries.append("watermelon summer fresh healthy natural sweet")
    if "summer" in query_lower and "fruit" in query_lower:
        enhanced_queries.append("watermelon pizza refreshing summer snack recipe")
    if "sushi" in query_lower:
        enhanced_queries.append("japanese cuisine rice fish seafood asian food")
    if "movie" in query_lower:
        enhanced_queries.append("film cinema entertainment story acting director")

    return {
        "original": original_query,
        "enhanced_queries": enhanced_queries[:6],  # Limit to 6 variants max
        "primary_query": enhanced_queries[0],
    }


@router.post("/semantic-search")
async def semantic_search(req: SemanticSearchRequest):
    try:
        # 1. Enhance the query with rule-based expansion
        query_enhancement = enhance_query(req.query)
        logger.info(
            f"Enhanced query from '{req.query}' to {len(query_enhancement['enhanced_queries'])} variants"
        )

        # 2. Add LLM-generated query rewrites for even better coverage
        llm_rewrites = await rewrite_query_with_llm(req.query)
        if llm_rewrites:
            query_enhancement["enhanced_queries"].extend(llm_rewrites)
            logger.info(f"Added {len(llm_rewrites)} LLM-generated query rewrites")

        # Limit total queries to avoid too many API calls
        all_queries = query_enhancement["enhanced_queries"][:8]  # Max 8 query variants

        # 3. Generate embeddings for all query variants
        all_embeddings = []
        for query_variant in all_queries:
            embedding = embedding_model.encode([query_variant])[0]
            all_embeddings.append(embedding.tolist())

        logger.info(f"Generated {len(all_embeddings)} embeddings for enhanced search")

        # 3. Perform multiple searches and combine results
        all_results = {}  # Use dict to avoid duplicates by document ID

        for i, embedding in enumerate(all_embeddings):
            try:
                results = chroma_collection.query(
                    query_embeddings=[embedding],
                    n_results=req.top_k * 2,  # Get more results for diversity
                    include=["metadatas", "documents", "distances"],
                )

                # Weight results based on query variant importance
                weight = 1.0 if i == 0 else 0.7  # Original query gets full weight

                for j, metadata in enumerate(results["metadatas"][0]):
                    if metadata.get("source") != "blog":
                        continue

                    doc_id = (
                        f"{metadata.get('post_id')}_{metadata.get('chunk_index', 0)}"
                    )
                    distance = results["distances"][0][j]

                    # Apply weight to distance (lower distance is better)
                    weighted_distance = distance / weight

                    if (
                        doc_id not in all_results
                        or weighted_distance < all_results[doc_id]["distance"]
                    ):
                        all_results[doc_id] = {
                            "metadata": metadata,
                            "document": results["documents"][0][j],
                            "distance": weighted_distance,
                            "query_variant": query_enhancement["enhanced_queries"][i],
                        }

            except Exception as search_error:
                logger.warning(
                    f"Search failed for query variant {i}: {str(search_error)}"
                )
                continue

        if not all_results:
            # Fallback to keyword search if all enhanced searches fail
            blog_results = search_blog_posts(req.query, req.top_k)
            return {
                "results": blog_results,
                "source_distribution": {"blog": len(blog_results)},
                "total_found": len(blog_results),
                "message": "Used fallback keyword search due to vector search errors.",
            }

        # 4. Process and rank all collected results
        seen_posts = {}  # Track best result for each post_id to avoid duplicates

        logger.info(f"Enhanced search collected {len(all_results)} unique chunks")

        for doc_id, result_data in all_results.items():
            metadata = result_data["metadata"]
            document = result_data["document"]
            distance = result_data["distance"]

            # Convert distance to similarity score (0-100)
            similarity = round(max(0, (2 - distance) / 2 * 100), 2)

            post_id = metadata.get("post_id", "")
            title = metadata.get("title", "Untitled")

            # Skip very low similarity results
            if similarity < 15:  # Lowered threshold for enhanced search
                continue

            # Apply intelligent relevance boosting
            category = metadata.get("category", "General").lower()
            query_lower = req.query.lower()
            title_lower = title.lower()
            content_lower = document.lower()

            relevance_boost = 1.0
            query_words = query_lower.split()

            # Title matching boost (highest priority)
            title_matches = sum(1 for word in query_words if word in title_lower)
            if title_matches > 0:
                relevance_boost *= 1.0 + title_matches * 0.5

            # Content matching boost
            content_matches = sum(1 for word in query_words if word in content_lower)
            if content_matches > 0:
                relevance_boost *= 1.0 + content_matches * 0.2

            # Category-specific boosts (only for decent similarity)
            if similarity > 20:
                # Fruit/Summer specific matching
                if any(word in query_lower for word in ["fruit", "summer"]):
                    if (
                        any(
                            word in title_lower + " " + content_lower
                            for word in [
                                "watermelon",
                                "fruit",
                                "summer",
                                "mango",
                                "berry",
                                "apple",
                                "citrus",
                                "melon",
                            ]
                        )
                        and category == "food"
                    ):
                        relevance_boost *= 1.6

                # Specific dish matching
                elif "sushi" in query_lower and "sushi" in title_lower:
                    relevance_boost *= 1.8
                elif "salmon" in query_lower and "salmon" in title_lower:
                    relevance_boost *= 1.8

                # Tech matching
                elif (
                    any(
                        word in query_lower
                        for word in ["tech", "ai", "programming", "code"]
                    )
                    and category == "technology"
                ):
                    relevance_boost *= 1.3

                # Movie matching
                elif "movie" in query_lower and category == "cinema":
                    relevance_boost *= 1.5

            # Calculate final boosted similarity
            boosted_similarity = min(100, similarity * relevance_boost)

            # Create result object
            result = {
                "id": post_id,
                "title": title,
                "content": document[:200] + "..." if len(document) > 200 else document,
                "category": metadata.get("category", "General"),
                "author": metadata.get("author", "Unknown"),
                "date": metadata.get("date", ""),
                "image": metadata.get("img", ""),
                "source": "blog",
                "url": f"/posts/{post_id}",
                "similarity": round(boosted_similarity, 2),
                "query_variant_used": result_data["query_variant"],
            }

            # Deduplicate: keep highest similarity result for each post
            if (
                post_id not in seen_posts
                or seen_posts[post_id]["similarity"] < boosted_similarity
            ):
                seen_posts[post_id] = result

        # 5. Sort and limit results
        formatted_results = list(seen_posts.values())
        formatted_results.sort(key=lambda x: x["similarity"], reverse=True)
        formatted_results = formatted_results[: req.top_k]

        logger.info(
            f"Enhanced semantic search completed: found {len(formatted_results)} relevant blog posts"
        )

        if not formatted_results:
            return {
                "results": [],
                "source_distribution": {"blog": 0},
                "total_found": 0,
                "message": "No relevant blog posts found. Try different keywords or browse our categories.",
            }

        return {
            "results": formatted_results,
            "source_distribution": {"blog": len(formatted_results)},
            "total_found": len(formatted_results),
            "enhancement_info": {
                "original_query": req.query,
                "variants_used": len(query_enhancement["enhanced_queries"]),
                "chunks_found": len(all_results),
            },
        }

    except Exception as e:
        logger.error(f"Error in enhanced semantic search: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Enhanced semantic search error: {str(e)}"
        )


@router.post("/qa", response_model=QAResponse)
async def qa_endpoint(request: QARequest):
    """Enhanced chatbot-style Q&A endpoint with conversational context and website awareness"""
    try:
        # Extract chat history and latest user message
        if (
            request.messages
            and isinstance(request.messages, list)
            and len(request.messages) > 0
        ):
            chat_history = request.messages[:-1] if len(request.messages) > 1 else []
            user_message = request.messages[-1].content
        else:
            chat_history = []
            user_message = request.question or ""

        if not user_message.strip():
            return {
                "answer": "Hello! I'm your blog assistant. Ask me about our blog posts, get writing ideas, or learn about our platform!",
                "sources": [],
                "context_used": "greeting",
                "suggested_next": [
                    "What is this website about?",
                    "Show me trending blog topics",
                    "How do I write a blog post?",
                ],
            }

        question = user_message.lower()

        # 1. Website awareness and platform information
        if any(
            kw in question
            for kw in [
                "what is this site",
                "about this website",
                "what can i do here",
                "features of this site",
                "what is this platform",
                "tell me about this blog",
                "how does this work",
                "what's this for",
            ]
        ):
            answer = (
                "Welcome to our comprehensive blog platform! 🌟 Here's what you can do:\n\n"
                "📖 **Read & Discover**: Explore blogs on technology, AI, food, movies, science, design, and more\n"
                "✍️ **Write & Create**: Publish your own blog posts with our rich text editor\n"
                "🤖 **AI-Powered Tools**: Use AI for content generation, rephrasing, and summarization\n"
                "💬 **Engage**: Like, comment, and connect with other bloggers\n"
                "🔍 **Smart Search**: Find content using our semantic search capabilities\n\n"
                "Whether you're a seasoned writer or just starting out, our platform has everything you need!"
            )
            return {
                "answer": answer,
                "sources": [],
                "context_used": "site_info",
                "suggested_next": [
                    "Show me trending blog topics",
                    "How do I write my first blog post?",
                    "What are the most popular posts?",
                    "Give me some blog topic ideas",
                ],
            }

        # 2. Blog topic suggestions and writing help
        if any(
            kw in question
            for kw in [
                "blog idea",
                "topic to write",
                "suggest a topic",
                "content idea",
                "what should i write",
                "writing suggestions",
                "blog topics",
                "help me write",
                "give me ideas",
                "inspiration",
            ]
        ):
            return await handle_enhanced_content_ideas(user_message, chat_history)

        # 3. Site-specific questions (trending, best posts, etc.)
        if any(
            kw in question
            for kw in ["best", "trending", "popular", "most liked", "top", "recent"]
        ):
            result = await handle_site_specific_question(user_message)
            # Enhance with suggested next actions
            result["suggested_next"] = [
                "Tell me more about one of these posts",
                "Suggest topics similar to these",
                "How do I write posts like these?",
            ]
            return result

        # 4. Enhanced semantic search with conversational context
        return await handle_conversational_qa(user_message, chat_history, request.top_k)

    except Exception as e:
        logger.error(f"Error in chatbot QA: {str(e)}")
        return {
            "answer": "I encountered an error while processing your question. Please try rephrasing or ask something else!",
            "sources": [],
            "context_used": "error",
            "suggested_next": [
                "What is this website about?",
                "Show me popular blog posts",
                "Give me blog writing ideas",
            ],
        }


# Helper functions for the new QA logic
async def handle_site_specific_question(question: str):
    """Handle questions about best/trending posts from the blog database"""
    connection = get_db_connection()
    if not connection:
        return {
            "answer": "I'm having trouble accessing the blog database right now. Please try again later.",
            "sources": [],
            "context_used": "database_error",
        }

    try:
        cursor = connection.cursor(dictionary=True)

        if any(keyword in question.lower() for keyword in ["trending", "popular"]):
            # Get trending posts (recent posts with high engagement)
            query = """
            SELECT p.post_id, p.title, p.content, p.category, p.createdTimestamp as date, u.fullname as username,
                   COUNT(pl.post_id) as likes_count
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            LEFT JOIN post_likes pl ON p.post_id = pl.post_id
            WHERE p.createdTimestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY p.post_id
            ORDER BY likes_count DESC, p.createdTimestamp DESC
            LIMIT 5
            """
            cursor.execute(query)
            posts = cursor.fetchall()

            if posts:
                post_list = "\n".join(
                    [
                        f"• {post['title']} (Category: {post['category']}, Likes: {post['likes_count']})"
                        for post in posts
                    ]
                )
                answer = f"Here are the trending blog posts from the last 30 days:\n\n{post_list}"
            else:
                answer = "I couldn't find any trending posts at the moment. Check back later!"

        elif any(keyword in question.lower() for keyword in ["best", "top"]):
            # Get best posts by likes
            query = """
            SELECT p.post_id, p.title, p.content, p.category, p.createdTimestamp as date, u.fullname as username,
                   COUNT(pl.post_id) as likes_count
            FROM posts p 
            JOIN users u ON p.user_id = u.id 
            LEFT JOIN post_likes pl ON p.post_id = pl.post_id
            GROUP BY p.post_id
            ORDER BY likes_count DESC
            LIMIT 5
            """
            cursor.execute(query)
            posts = cursor.fetchall()

            if posts:
                post_list = "\n".join(
                    [
                        f"• {post['title']} (Category: {post['category']}, Likes: {post['likes_count']})"
                        for post in posts
                    ]
                )
                answer = f"Here are the best (most liked) blog posts:\n\n{post_list}"
            else:
                answer = "I couldn't find any posts with likes at the moment."
        else:
            answer = "I can help you find the best or trending posts on our blog. Try asking 'What are the best posts?' or 'What's trending?'"

        cursor.close()
        connection.close()

        return {
            "answer": answer,
            "sources": [
                {
                    "title": "Blog Database",
                    "type": "blog",
                    "url": "/",
                    "snippet": "Site analytics",
                }
            ],
            "context_used": "site_specific",
        }

    except Exception as e:
        logger.error(f"Database query error: {e}")
        if connection:
            connection.close()
        return {
            "answer": "I encountered an error while searching our blog posts. Please try again.",
            "sources": [],
            "context_used": "database_error",
        }


async def handle_content_idea_request(question: str):
    """Handle content idea generation using LLM"""
    try:
        # Analyze existing blog categories for context
        connection = get_db_connection()
        categories = []

        if connection:
            cursor = connection.cursor()
            cursor.execute(
                "SELECT DISTINCT category FROM posts WHERE category IS NOT NULL"
            )
            categories = [row[0] for row in cursor.fetchall()]
            cursor.close()
            connection.close()

        category_context = (
            f"Our blog covers these topics: {', '.join(categories)}"
            if categories
            else ""
        )

        prompt = f"""You are a content strategist for a blog. The user is asking for content ideas.
        
        {category_context}
        
        User question: {question}
        
        Provide 3-5 specific, engaging blog post ideas that would be valuable for readers. Include:
        - Catchy titles
        - Brief description of what the post would cover
        - Why it would be interesting to readers
        
        Format your response as a numbered list."""

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {config.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a creative content strategist who generates engaging blog post ideas.",
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 500,
            "temperature": 0.8,
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        answer = data["choices"][0]["message"]["content"].strip()

        return {
            "answer": answer,
            "sources": [
                {
                    "title": "AI Content Generator",
                    "type": "ai",
                    "url": "#",
                    "snippet": "Creative writing assistance",
                }
            ],
            "context_used": "content_ideas",
        }

    except Exception as e:
        logger.error(f"Content idea generation error: {e}")
        return {
            "answer": "I'm having trouble generating content ideas right now. Try asking about specific topics you'd like to write about!",
            "sources": [],
            "context_used": "content_error",
        }


def search_blog_posts_for_qa(question: str, limit: int = 3):
    """Search blog posts specifically for Q&A context"""
    connection = get_db_connection()
    if not connection:
        return []

    try:
        cursor = connection.cursor(dictionary=True)

        search_term = f"%{question}%"
        query = """
        SELECT post_id, title, content, category, createdTimestamp as date
        FROM posts 
        WHERE title LIKE %s OR content LIKE %s 
        ORDER BY createdTimestamp DESC
        LIMIT %s
        """

        cursor.execute(query, (search_term, search_term, limit))
        results = cursor.fetchall()

        cursor.close()
        connection.close()

        return results

    except Exception as e:
        logger.error(f"Blog search error: {e}")
        if connection:
            connection.close()
        return []


async def generate_answer_from_context(question: str, context: str, source_type: str):
    """Generate answer using LLM from provided context"""
    try:
        system_prompt = "You are a helpful assistant that answers questions based on blog content. Focus on the blog information provided and be specific about the content."

        prompt = f"""Answer the following question using the provided context:

Context:
{context}

Question: {question}

Provide a helpful, accurate answer based on the context. If the context doesn't fully answer the question, say so."""

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {config.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 300,
            "temperature": 0.7,
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        logger.error(f"Answer generation error: {e}")
        return "I'm having trouble generating an answer right now. Please try rephrasing your question."


async def handle_enhanced_content_ideas(user_message: str, chat_history: list):
    """Enhanced content idea generation with database insights and personalized suggestions"""
    try:
        # Get trending categories and popular topics from database
        connection = get_db_connection()
        trending_topics = []
        category_stats = []

        if connection:
            cursor = connection.cursor(dictionary=True)

            # Get trending categories with post counts
            cursor.execute("""
                SELECT category, COUNT(*) as post_count, AVG(COALESCE(likes_count, 0)) as avg_likes
                FROM (
                    SELECT p.category, COUNT(pl.post_id) as likes_count
                    FROM posts p 
                    LEFT JOIN post_likes pl ON p.post_id = pl.post_id
                    WHERE p.category IS NOT NULL 
                    AND p.createdTimestamp >= DATE_SUB(NOW(), INTERVAL 90 DAY)
                    GROUP BY p.post_id, p.category
                ) as post_likes_summary
                GROUP BY category
                ORDER BY post_count DESC, avg_likes DESC
                LIMIT 8
            """)
            category_stats = cursor.fetchall()

            # Get some recent popular posts for inspiration
            cursor.execute("""
                SELECT p.title, p.category, COUNT(pl.post_id) as likes_count
                FROM posts p 
                LEFT JOIN post_likes pl ON p.post_id = pl.post_id
                WHERE p.createdTimestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                GROUP BY p.post_id
                ORDER BY likes_count DESC
                LIMIT 5
            """)
            trending_posts = cursor.fetchall()

            cursor.close()
            connection.close()

            trending_topics = [
                cat["category"] for cat in category_stats if cat["category"]
            ]

        # Generate personalized topic suggestions using LLM
        context_info = ""
        if category_stats:
            cat_list = [
                f"{cat['category']} ({cat['post_count']} posts)"
                for cat in category_stats[:5]
            ]
            context_info += (
                f"Popular categories on our platform: {', '.join(cat_list)}\n"
            )

        if trending_posts:
            post_titles = [post["title"] for post in trending_posts]
            context_info += f"Recent trending titles: {', '.join(post_titles)}"

        prompt = f"""You are a creative blog content strategist. Based on the user's request and current platform trends, suggest 8-10 engaging blog topic ideas.

User request: "{user_message}"

Platform context:
{context_info}

Provide diverse, engaging blog topic ideas with brief descriptions. Make them specific, actionable, and appealing to readers. Format as a numbered list with topic title and short description."""

        suggestions = await make_groq_request(prompt, temperature=0.8, max_tokens=500)

        answer = f"Here are some fantastic blog topic ideas tailored for you:\n\n{suggestions}\n\n"

        if trending_topics:
            hot_cats = ", ".join(trending_topics[:4])
            answer += f"💡 **Hot Categories**: {hot_cats}\n\n"

        answer += "Would you like a detailed outline for any of these topics, or shall I suggest more ideas in a specific category?"

        return {
            "answer": answer,
            "sources": [
                {
                    "title": "Platform Analytics",
                    "type": "site_data",
                    "url": "/",
                    "snippet": f"Based on {len(category_stats)} categories and recent trends",
                }
            ],
            "context_used": "content_generation",
            "suggested_next": [
                "Give me an outline for one of these topics",
                "Suggest more AI-related topics",
                "What are the most popular blog categories?",
                "Help me write an introduction",
            ],
        }

    except Exception as e:
        logger.error(f"Enhanced content ideas error: {e}")
        return {
            "answer": "Here are some popular blog topic ideas: AI in daily life, sustainable living tips, productivity hacks, cooking experiments, movie reviews, tech tutorials, and personal growth stories. Would you like me to elaborate on any of these?",
            "sources": [],
            "context_used": "fallback_topics",
            "suggested_next": [
                "Give me an outline for AI topics",
                "Suggest cooking blog ideas",
                "Help me with tech tutorials",
            ],
        }


async def handle_conversational_qa(
    user_message: str, chat_history: list, top_k: int = 3
):
    """Handle conversational Q&A with semantic search and chat context"""
    try:
        # Use semantic search to find relevant blog content
        question_embedding = embedding_model.encode([user_message])[0]

        # Search in ChromaDB with improved similarity threshold
        results = chroma_collection.query(
            query_embeddings=[question_embedding.tolist()],
            n_results=top_k * 2,  # Get more results to filter better ones
            include=["metadatas", "documents", "distances"],
        )

        relevant_content = []
        sources = []

        # Filter and collect relevant content with improved distance threshold
        for i, (document, metadata, distance) in enumerate(
            zip(
                results["documents"][0],
                results["metadatas"][0],
                results["distances"][0],
            )
        ):
            if distance < 1.3:  # More lenient threshold for conversational QA
                title = metadata.get("title", "Untitled")
                post_id = metadata.get("post_id", "")

                relevant_content.append(
                    {"title": title, "content": document, "distance": distance}
                )

                sources.append(
                    {
                        "title": title,
                        "type": "blog",
                        "url": f"/posts/{post_id}" if post_id else "/",
                        "snippet": document[:200] + "..."
                        if len(document) > 200
                        else document,
                    }
                )

        if not relevant_content:
            # No relevant content found
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
                for item in relevant_content[:3]  # Use top 3 most relevant
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

        answer = await make_groq_request(prompt, temperature=0.7, max_tokens=400)

        # Generate contextual suggestions based on the topic
        suggestion_topics = []
        for item in relevant_content[:2]:
            if any(
                topic in item["title"].lower()
                for topic in ["ai", "artificial intelligence"]
            ):
                suggestion_topics.extend(
                    ["Tell me more about AI tools", "How do I start with AI?"]
                )
            elif any(
                topic in item["title"].lower()
                for topic in ["food", "cooking", "recipe"]
            ):
                suggestion_topics.extend(
                    ["Show me cooking tips", "Suggest recipe ideas"]
                )
            elif any(
                topic in item["title"].lower()
                for topic in ["tech", "technology", "programming"]
            ):
                suggestion_topics.extend(
                    ["Help with programming", "Latest tech trends"]
                )

        default_suggestions = [
            "Tell me more about this topic",
            "Show me related blog posts",
            "Give me writing ideas about this",
            "What else should I know?",
        ]

        suggested_next = (
            suggestion_topics[:2] + default_suggestions[:2]
            if suggestion_topics
            else default_suggestions
        )

        return {
            "answer": answer,
            "sources": sources[:3],  # Return top 3 sources
            "context_used": "conversational_with_blog_content",
            "suggested_next": suggested_next,
        }

    except Exception as e:
        logger.error(f"Conversational QA error: {e}")
        return {
            "answer": "I'm having trouble processing your question right now. Could you try rephrasing it or ask about something else?",
            "sources": [],
            "context_used": "error_fallback",
            "suggested_next": [
                "What is this website about?",
                "Show me popular posts",
                "Give me blog ideas",
            ],
        }


@router.post("/rephrase-openai", response_model=RephraseResponse)
async def rephrase_openai(request: RephraseRequest):
    if not config.OPENAI_API_KEY:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")

    cached_result = cache_service.get_cached_rephrase(request.text, request.tone)
    if cached_result:
        return {"rephrased_text": cached_result}

    try:
        instruction = get_instruction(request.tone)
        client = openai.OpenAI(api_key=config.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": instruction},
                {"role": "user", "content": request.text},
            ],
            max_tokens=500,
            temperature=0.7,
        )
        rephrased = response.choices[0].message.content.strip()
        cache_service.cache_rephrase(request.text, request.tone, rephrased)
        return {"rephrased_text": rephrased}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OpenAI error: {str(e)}")


@router.post("/rephrase-groq", response_model=RephraseResponse)
async def rephrase_groq(request: RephraseRequest):
    if not config.GROQ_API_KEY:
        raise HTTPException(status_code=500, detail="Groq API key not configured")

    cached_result = cache_service.get_cached_rephrase(request.text, request.tone)
    if cached_result:
        return {"rephrased_text": cached_result}

    try:
        instruction = get_instruction(request.tone)
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {config.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "llama-3.1-8b-instant",  # Updated to current model
            "messages": [
                {"role": "system", "content": instruction},
                {"role": "user", "content": request.text},
            ],
            "max_tokens": 500,
            "temperature": 0.7,
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        rephrased = data["choices"][0]["message"]["content"].strip()
        cache_service.cache_rephrase(request.text, request.tone, rephrased)
        return {"rephrased_text": rephrased}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq error: {str(e)}")


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_text(request: SummarizeRequest):
    """Summarize provided text using Groq AI"""
    try:
        if not config.GROQ_API_KEY:
            raise HTTPException(status_code=500, detail="Groq API key not configured")

        # Define summary styles
        style_instructions = {
            "concise": "Provide a brief, concise summary in 2-3 sentences.",
            "detailed": "Provide a comprehensive summary with key points and important details.",
            "bullet_points": "Summarize the text as clear bullet points highlighting main ideas.",
            "executive": "Provide an executive summary suitable for business stakeholders.",
        }

        instruction = style_instructions.get(
            request.style, style_instructions["concise"]
        )

        # Build the prompt
        prompt = f"{instruction}\n\nText to summarize:\n{request.text}"

        # Call Groq API
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {config.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert at creating clear, accurate summaries. Follow the user's style requirements precisely.",
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": min(request.max_length * 2, 500),  # Allow some buffer
            "temperature": 0.5,
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        summary = data["choices"][0]["message"]["content"].strip()

        return {
            "summary": summary,
            "original_length": len(request.text),
            "summary_length": len(summary),
        }

    except Exception as e:
        logger.error(f"Error in text summarization: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Summarization error: {str(e)}")


async def generate_blog_content_from_ai_knowledge(topic: str, style: str) -> str:
    """
    Generate blog content using AI's general knowledge when no relevant sources are found
    """
    try:
        style_prompts = {
            "comprehensive": f"""Write a comprehensive, well-structured blog post about "{topic}". 
Write in plain text format suitable for a rich text editor. Structure the content clearly with:
- Clear headings and subheadings
- Well-organized paragraphs
- Bullet points for lists
- Easy to read formatting

Do NOT use HTML tags, markdown (##, **, *, etc.), or SEO sections.
Write 800-1000 words of engaging, informative content that users can format using editor tools.""",
            "technical": f"""Write a technical deep-dive blog post about "{topic}". 
Write in plain text format suitable for a rich text editor. Include:
- Technical details and explanations
- Code examples (without HTML tags)
- Best practices and implementation tips
- Clear structure with headings and sections

Do NOT use HTML tags, markdown (##, **, `, etc.), or SEO sections.
Write 1000-1200 words of technical content.""",
            "beginner": f"""Write a beginner-friendly blog post about "{topic}". 
Write in plain text format suitable for a rich text editor. Make it:
- Easy to understand for beginners
- Well-structured with clear sections
- Include simple explanations and examples
- Use friendly, approachable language

Do NOT use HTML tags, markdown (##, **, etc.), or SEO sections.
Write 600-800 words of beginner-friendly content.""",
            "listicle": f"""Write an engaging listicle blog post about "{topic}". 
Write in plain text format suitable for a rich text editor. Structure as:
- Clear introduction
- Numbered or bulleted list items
- Brief explanations for each point
- Actionable insights

Do NOT use HTML tags, markdown (##, **, etc.), or SEO sections.
Create 5-10 clear points in 600-800 words.""",
            "tutorial": f"""Write a step-by-step tutorial blog post about "{topic}". 
Write in plain text format suitable for a rich text editor. Include:
- Clear step-by-step instructions
- Prerequisites and setup information
- Code examples (as plain text)
- Practical, actionable guidance

Do NOT use HTML tags, markdown (##, **, `, etc.), or SEO sections.
Write 800-1000 words of tutorial content.""",
        }

        prompt = style_prompts.get(style, style_prompts["comprehensive"])
        prompt += "\n\nCRITICAL: Return ONLY plain text content - no HTML tags, no markdown, no SEO recommendations. Write clean, readable text that users can format using rich text editor tools."

        content = await make_groq_request(prompt, temperature=0.7, max_tokens=2000)

        if content:
            # Clean up any HTML tags or markdown formatting that might have slipped through
            content = (
                content.replace("<h2>", "")
                .replace("</h2>", "")
                .replace("<p>", "")
                .replace("</p>", "")
            )
            content = content.replace("**", "").replace("##", "").replace("# ", "")
            # Remove SEO sections if present
            if (
                "📝 SEO" in content
                or "SEO Keywords" in content
                or "Meta Description" in content
            ):
                lines = content.split("\n")
                cleaned_lines = []
                skip_seo = False
                for line in lines:
                    if any(
                        seo_marker in line
                        for seo_marker in [
                            "📝 SEO",
                            "SEO Keywords",
                            "Meta Description",
                            "Suggested Blog Title",
                        ]
                    ):
                        skip_seo = True
                        continue
                    if not skip_seo:
                        cleaned_lines.append(line)
                content = "\n".join(cleaned_lines).strip()
            return content
        else:
            return f"{topic}\n\nI'd be happy to help you write about {topic}. This is an interesting topic that deserves detailed coverage."

    except Exception as e:
        logger.error(f"Error generating AI content: {str(e)}")
        return f"{topic}\n\nLet's explore {topic} together. This topic offers many interesting aspects to discuss."


async def generate_blog_content(topic: str, style: str, context: str) -> str:
    """
    Generate comprehensive blog content with structure, SEO optimization, and writing guidance
    """
    # Blog writing templates based on style
    style_templates = {
        "comprehensive": {
            "title": "Complete Guide to",
            "structure": "## Introduction\n\n## Key Points\n\n## Detailed Analysis\n\n## Best Practices\n\n## Conclusion",
            "tone": "comprehensive and authoritative",
            "seo_focus": "long-form, detailed content with subheadings",
        },
        "technical": {
            "title": "Technical Deep Dive:",
            "structure": "## Overview\n\n## Technical Details\n\n## Implementation\n\n## Code Examples\n\n## Troubleshooting\n\n## Summary",
            "tone": "technical and precise",
            "seo_focus": "technical keywords and implementation details",
        },
        "beginner": {
            "title": "Beginner's Guide to",
            "structure": "## What is it?\n\n## Why it matters\n\n## Step-by-step guide\n\n## Common mistakes\n\n## Next steps",
            "tone": "friendly and accessible",
            "seo_focus": "beginner-friendly terms and step-by-step guidance",
        },
        "listicle": {
            "title": "Top 10 Things About",
            "structure": "## Introduction\n\n## 1. First Point\n\n## 2. Second Point\n\n...\n\n## Conclusion",
            "tone": "engaging and scannable",
            "seo_focus": "numbered lists and actionable points",
        },
        "tutorial": {
            "title": "How to",
            "structure": "## What you'll learn\n\n## Prerequisites\n\n## Step 1\n\n## Step 2\n\n## Step 3\n\n## Troubleshooting\n\n## Conclusion",
            "tone": "instructional and clear",
            "seo_focus": "how-to keywords and step-by-step process",
        },
    }

    template = style_templates.get(style, style_templates["comprehensive"])

    # Advanced prompt for blog content generation
    prompt = f"""You are an expert blog writer creating content for a rich text editor. Create a comprehensive blog post about "{topic}".

CRITICAL FORMATTING REQUIREMENTS:
- Write in plain text format suitable for rich text editor
- Do NOT use HTML tags or markdown (##, **, *, etc.)
- Do NOT include SEO recommendations or meta descriptions
- Structure content with clear headings and sections

WRITING REQUIREMENTS:
- Style: {template["tone"]}
- Target Length: 1000-1500 words
- Include actionable insights and practical examples

CONTENT GUIDELINES:
1. Start with engaging introduction
2. Use clear headings and subheadings
3. Include bullet points and numbered lists (as plain text)
4. Add practical examples and real-world applications
5. End with strong conclusion

AVAILABLE RESEARCH MATERIAL:
{context}

Return ONLY clean, readable text content - no HTML tags, no markdown, no SEO sections.

"""

    try:
        # Generate blog content using Groq
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {config.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an expert blog writer and content strategist. Create engaging, well-structured blog content in plain text format suitable for rich text editors. Focus on providing valuable, readable content without HTML tags or markdown.",
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 1200,
            "temperature": 0.7,
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        blog_content = data["choices"][0]["message"]["content"].strip()

        # Clean up any HTML tags or markdown formatting
        blog_content = (
            blog_content.replace("<h2>", "")
            .replace("</h2>", "")
            .replace("<p>", "")
            .replace("</p>", "")
        )
        blog_content = (
            blog_content.replace("**", "").replace("##", "").replace("# ", "")
        )

        # Remove any SEO sections that might have been added
        if "📝 SEO" in blog_content or "SEO Keywords" in blog_content:
            lines = blog_content.split("\n")
            cleaned_lines = []
            skip_seo = False
            for line in lines:
                if any(
                    seo_marker in line
                    for seo_marker in [
                        "📝 SEO",
                        "SEO Keywords",
                        "Meta Description",
                        "Suggested Blog Title",
                    ]
                ):
                    skip_seo = True
                    continue
                if not skip_seo:
                    cleaned_lines.append(line)
            blog_content = "\n".join(cleaned_lines).strip()

        return blog_content

    except Exception as e:
        logger.error(f"Error generating blog content: {str(e)}")
        return f"Error generating blog content for '{topic}'. Please try again with a different topic or style."


@router.post("/topic-summary", response_model=TopicSummaryResponse)
async def topic_summary(request: TopicSummaryRequest):
    """AI-powered blog writing assistant: Generate comprehensive blog content with structure, SEO, and multiple formats"""
    try:
        # 1. Search for content related to the topic
        topic_embedding = embedding_model.encode([request.topic])[0]

        # Get more results to ensure good coverage
        results = chroma_collection.query(
            query_embeddings=[topic_embedding.tolist()],
            n_results=request.max_sources * 2,
            include=["metadatas", "documents", "distances"],
        )

        if not results["metadatas"][0]:
            return {
                "topic": request.topic,
                "summary": f"No information found about '{request.topic}' in our knowledge base.",
                "sources_used": [],
                "total_sources_found": 0,
            }

        # 2. Group and prioritize content by source with flexible matching
        source_content = {"blog": [], "other": []}
        all_content = []
        sources_used = set()

        for i, metadata in enumerate(results["metadatas"][0]):
            source_type = metadata.get("source", metadata.get("source_type", "blog"))
            document = results["documents"][0][i]
            distance = results["distances"][0][i]

            # Use flexible distance thresholds - much more permissive
            relevance_threshold = 1.5  # Allow much higher distances

            if distance < relevance_threshold:
                content_item = {
                    "source": source_type,
                    "title": metadata.get("title", "Untitled"),
                    "content": document,
                    "relevance": max(0, 1 - (distance / 2)),  # Normalize relevance
                    "priority": get_data_source_priority(metadata),
                    "distance": distance,
                }

                all_content.append(content_item)
                sources_used.add(source_type)

                if source_type == "blog":
                    source_content["blog"].append(content_item)
                else:
                    source_content["other"].append(content_item)

        # If still no content, generate using AI's general knowledge
        if not all_content:
            logger.info(
                f"No relevant content found for '{request.topic}', generating from AI knowledge"
            )

            # Generate comprehensive blog content using AI's general knowledge
            ai_generated_content = await generate_blog_content_from_ai_knowledge(
                request.topic, request.summary_style
            )

            return {
                "topic": request.topic,
                "summary": ai_generated_content,
                "blog_content": ai_generated_content,
                "sources_used": ["AI General Knowledge"],
                "total_sources_found": 0,
                "note": "Generated using AI general knowledge - no specific sources found in knowledge base",
            }

        # 3. Sort by priority and relevance
        all_content.sort(key=lambda x: (x["priority"], -x["relevance"]))

        # 4. Build comprehensive context from top sources
        context_parts = []
        total_length = 0
        max_context = 3000  # Larger context for topic summaries

        for item in all_content[: request.max_sources]:
            source_label = {
                "blog": "Blog Post",
            }.get(item["source"], item["source"].title())

            content_piece = f"[{source_label}: {item['title']}]\n{item['content']}\n\n"

            if total_length + len(content_piece) <= max_context:
                context_parts.append(content_piece)
                total_length += len(content_piece)
            else:
                break

        context = "".join(context_parts)

        # 5. Generate AI-powered blog content
        blog_content = await generate_blog_content(
            request.topic, request.summary_style, context
        )

        return {
            "topic": request.topic,
            "summary": blog_content,
            "sources_used": list(sources_used),
            "total_sources_found": len(results["metadatas"][0]),
        }

    except Exception as e:
        logger.error(f"Error in topic summarization: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Topic summarization error: {str(e)}"
        )


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "nova-mind"}


@router.get("/knowledge-stats")
async def get_knowledge_stats():
    """Get statistics about the knowledge base"""
    try:
        # Get all documents to analyze
        all_docs = chroma_collection.get(include=["metadatas"])

        if not all_docs["metadatas"]:
            return {"total_documents": 0, "sources": {}}

        # Count by source
        source_counts = {}
        for metadata in all_docs["metadatas"]:
            source = metadata.get("source", "unknown")
            source_counts[source] = source_counts.get(source, 0) + 1

        return {
            "total_documents": len(all_docs["metadatas"]),
            "sources": source_counts,
            "collection_name": chroma_collection.name,
        }

    except Exception as e:
        logger.error(f"Error getting knowledge stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Stats error: {str(e)}")


@router.get("/")
async def root():
    return {
        "message": "Nova-Mind AI Service",
        "endpoints": ["/rephrase-openai", "/rephrase-groq", "/health"],
    }


# Advanced Features Endpoints


@router.post("/multi-hop-qa", response_model=MultiHopQAResponse)
async def multi_hop_qa(request: MultiHopQARequest):
    """Multi-hop reasoning Q&A endpoint"""
    try:
        from app.advanced_services import advanced_ai_service  # type: ignore

        result = await advanced_ai_service.multi_hop_qa(
            question=request.question,
            user_id=request.user_id,
            max_hops=request.max_hops,
        )

        return {
            "answer": result["answer"],
            "reasoning_steps": result["reasoning_steps"]
            if request.include_reasoning
            else [],
            "sources": result["sources"],
            "total_hops": result["total_hops"],
        }

    except Exception as e:
        logger.error(f"Multi-hop QA error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Multi-hop QA error: {str(e)}")


@router.post("/agent-task", response_model=AgentTaskResponse)
async def agent_task(request: AgentTaskRequest):
    """Agentic workflow task execution endpoint"""
    try:
        from .advanced_services import advanced_ai_service  # type: ignore

        result = await advanced_ai_service.agent_task(
            task=request.task, user_id=request.user_id, context=request.context
        )

        return {
            "result": result["result"],
            "steps_taken": result["steps_taken"],
            "sources": result["sources"],
            "execution_time": result["execution_time"],
        }

    except Exception as e:
        logger.error(f"Agent task error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent task error: {str(e)}")


@router.post("/agent")
async def agent(request: dict):
    """Simple agent endpoint for AI Assistant"""
    try:
        query = request.get("query")
        if not query:
            raise HTTPException(status_code=400, detail="Query is required")

        from .advanced_services import advanced_ai_service  # type: ignore

        result = await advanced_ai_service.agent_task(
            task=query, user_id=None, context=None
        )

        return {
            "final_answer": result["result"],
            "steps_taken": result["steps_taken"],
            "context_used": "blog" if result["sources"] else "general",
            "execution_time": result["execution_time"],
        }

    except Exception as e:
        logger.error(f"Agent error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")


@router.post("/tool-execute", response_model=ToolResponse)
async def execute_tool(request: ToolRequest):
    """Execute a specific tool"""
    try:
        from .advanced_services import advanced_ai_service  # type: ignore

        # Get the tool by name
        tool = None
        for available_tool in advanced_ai_service.tools:
            if available_tool.name == request.tool_name:
                tool = available_tool
                break

        if not tool:
            return {
                "result": None,
                "tool_used": request.tool_name,
                "success": False,
                "error_message": f"Tool '{request.tool_name}' not found",
            }

        # Execute the tool
        query = request.parameters.get("query", "")
        result = tool._run(query)

        return {
            "result": result,
            "tool_used": request.tool_name,
            "success": True,
            "error_message": None,
        }

    except Exception as e:
        logger.error(f"Tool execution error: {str(e)}")
        return {
            "result": None,
            "tool_used": request.tool_name,
            "success": False,
            "error_message": str(e),
        }


@router.post("/advanced-summarize", response_model=AdvancedSummarizeResponse)
async def advanced_summarize(request: AdvancedSummarizeRequest):
    """Advanced summarization with Hugging Face models"""
    try:
        from .advanced_services import advanced_ai_service  # type: ignore

        result = await advanced_ai_service.advanced_summarize(
            text=request.text,
            style=request.style,
            target_audience=request.target_audience,
            length=request.length,
            include_keywords=request.include_keywords,
            tone=request.tone,
        )

        return {
            "summary": result["summary"],
            "original_length": result["original_length"],
            "summary_length": result["summary_length"],
            "style_used": result["style_used"],
            "target_audience": result["target_audience"],
            "keywords_included": result["keywords_included"],
            "confidence_score": result["confidence_score"],
        }

    except Exception as e:
        logger.error(f"Advanced summarization error: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"Advanced summarization error: {str(e)}"
        )


@router.get("/available-tools")
async def get_available_tools():
    """Get list of available tools"""
    try:
        from .advanced_services import advanced_ai_service  # type: ignore

        tools_info = []
        for tool in advanced_ai_service.tools:
            tools_info.append({"name": tool.name, "description": tool.description})

        return {"tools": tools_info, "total_tools": len(tools_info)}

    except Exception as e:
        logger.error(f"Tools listing error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Tools listing error: {str(e)}")
