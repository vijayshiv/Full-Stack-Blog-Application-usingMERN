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
    "Professional": "Rephrase this text in a professional, formal business tone",
    "Technical": "Rephrase this text in a technical, precise, and detailed manner",
    "Casual": "Rephrase this text in a casual, friendly, and conversational tone",
    "SEO": "Rephrase this text to be more SEO-friendly with better keywords and structure",
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


async def make_groq_request(prompt: str, temperature: float = 0.7, max_tokens: int = 150) -> str:
    """
    Make a request to Groq API for text generation
    """
    import httpx
    
    try:
        headers = {
            "Authorization": f"Bearer {config.GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        
        data = {
            "messages": [
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "model": "mixtral-8x7b-32768",
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=headers,
                json=data,
                timeout=10.0
            )
            
            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"]
            else:
                logger.error(f"Groq API error: {response.status_code} - {response.text}")
                return ""
                
    except Exception as e:
        logger.error(f"Error calling Groq API: {str(e)}")
        return ""


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
            max_tokens=150
        )
        
        if response and response.strip():
            # Extract the rewrites from the response
            lines = response.strip().split('\n')
            rewrites = []
            for line in lines:
                # Clean up the line and extract the actual rewrite
                cleaned = line.strip()
                if cleaned and not cleaned.startswith('Original') and len(cleaned) > 5:
                    # Remove numbering and formatting
                    if '. ' in cleaned:
                        cleaned = cleaned.split('. ', 1)[1]
                    if cleaned.startswith('- '):
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
        food_expanded = f"{original_query} cuisine dish recipe cooking ingredients nutrition"
        enhanced_queries.append(food_expanded)
    
    # Technology expansion  
    elif any(word in query_lower for word in ["tech", "ai", "programming", "software"]):
        tech_expanded = f"{original_query} technology development coding software engineering computer"
        enhanced_queries.append(tech_expanded)
    
    # Movie/Cinema expansion
    elif any(word in query_lower for word in ["movie", "film", "cinema", "actor"]):
        movie_expanded = f"{original_query} cinema film director entertainment hollywood actor"
        enhanced_queries.append(movie_expanded)
    
    # Science expansion
    elif any(word in query_lower for word in ["science", "research", "study"]):
        science_expanded = f"{original_query} research scientific study analysis experiment discovery"
        enhanced_queries.append(science_expanded)
    
    # Art expansion
    elif any(word in query_lower for word in ["art", "artist", "painting", "creative"]):
        art_expanded = f"{original_query} artistic creative visual design aesthetic culture"
        enhanced_queries.append(art_expanded)
    
    # 3. Question-style reformulation for better semantic matching
    if not original_query.startswith(("what", "how", "why", "when", "where")):
        question_forms = [
            f"What is {original_query}",
            f"Tell me about {original_query}",
            f"Information about {original_query}"
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
        "primary_query": enhanced_queries[0]
    }


@router.post("/semantic-search")
async def semantic_search(req: SemanticSearchRequest):
    try:
        # 1. Enhance the query with rule-based expansion
        query_enhancement = enhance_query(req.query)
        logger.info(f"Enhanced query from '{req.query}' to {len(query_enhancement['enhanced_queries'])} variants")
        
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
                        
                    doc_id = f"{metadata.get('post_id')}_{metadata.get('chunk_index', 0)}"
                    distance = results["distances"][0][j]
                    
                    # Apply weight to distance (lower distance is better)
                    weighted_distance = distance / weight
                    
                    if doc_id not in all_results or weighted_distance < all_results[doc_id]["distance"]:
                        all_results[doc_id] = {
                            "metadata": metadata,
                            "document": results["documents"][0][j],
                            "distance": weighted_distance,
                            "query_variant": query_enhancement["enhanced_queries"][i]
                        }
                        
            except Exception as search_error:
                logger.warning(f"Search failed for query variant {i}: {str(search_error)}")
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
                relevance_boost *= (1.0 + title_matches * 0.5)
                
            # Content matching boost
            content_matches = sum(1 for word in query_words if word in content_lower)
            if content_matches > 0:
                relevance_boost *= (1.0 + content_matches * 0.2)
            
            # Category-specific boosts (only for decent similarity)
            if similarity > 20:
                # Fruit/Summer specific matching
                if any(word in query_lower for word in ["fruit", "summer"]):
                    if any(word in title_lower + " " + content_lower for word in ["watermelon", "fruit", "summer", "mango", "berry", "apple", "citrus", "melon"]) and category == "food":
                        relevance_boost *= 1.6
                
                # Specific dish matching
                elif "sushi" in query_lower and "sushi" in title_lower:
                    relevance_boost *= 1.8
                elif "salmon" in query_lower and "salmon" in title_lower:
                    relevance_boost *= 1.8
                
                # Tech matching
                elif any(word in query_lower for word in ["tech", "ai", "programming", "code"]) and category == "technology":
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
                "query_variant_used": result_data["query_variant"]
            }
            
            # Deduplicate: keep highest similarity result for each post
            if post_id not in seen_posts or seen_posts[post_id]["similarity"] < boosted_similarity:
                seen_posts[post_id] = result
        
        # 5. Sort and limit results
        formatted_results = list(seen_posts.values())
        formatted_results.sort(key=lambda x: x["similarity"], reverse=True)
        formatted_results = formatted_results[:req.top_k]
        
        logger.info(f"Enhanced semantic search completed: found {len(formatted_results)} relevant blog posts")
        
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
                "chunks_found": len(all_results)
            }
        }

    except Exception as e:
        logger.error(f"Error in enhanced semantic search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Enhanced semantic search error: {str(e)}")


@router.post("/qa", response_model=QAResponse)
async def qa_endpoint(request: QARequest):
    try:
        question = request.question.lower()

        # Check if this is a site-specific question (best, trending, etc.)
        if any(
            keyword in question
            for keyword in ["best", "trending", "popular", "most liked", "top"]
        ):
            return await handle_site_specific_question(request.question)

        # Check if this is a content idea request
        if any(
            keyword in question
            for keyword in ["idea", "write about", "suggest", "topic", "content"]
        ):
            return await handle_content_idea_request(request.question)

        # Regular Q&A: Only use blog posts (no external sources)
        # Search blog posts first
        blog_results = search_blog_posts_for_qa(request.question, 3)

        if blog_results:
            # Generate answer from blog content
            blog_context = "\n".join(
                [
                    f"[Blog: {post['title']}] {post['content'][:500]}"
                    for post in blog_results
                ]
            )

            if len(blog_context) > MAX_CONTEXT_LENGTH:
                blog_context = summarize_context(blog_context, config.GROQ_API_KEY)

            answer = await generate_answer_from_context(
                request.question, blog_context, "blog"
            )

            sources = [
                {
                    "title": post["title"],
                    "type": "blog",
                    "url": f"/posts/{post['post_id']}",
                    "snippet": post["content"][:200] + "...",
                }
                for post in blog_results
            ]

            return {
                "answer": answer,
                "sources": sources,
                "context_used": "blog_only",
            }

        # If no relevant blog posts found
        return {
            "answer": "I don't have enough information to answer your question based on our blog content. Please try asking about topics covered in our blog posts, or consider asking for content ideas.",
            "sources": [],
            "context_used": "none",
        }

    except Exception as e:
        logger.error(f"Error in QA: {str(e)}")
        raise HTTPException(status_code=500, detail=f"QA error: {str(e)}")


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


@router.post("/topic-summary", response_model=TopicSummaryResponse)
async def topic_summary(request: TopicSummaryRequest):
    """Generate a comprehensive summary on a specific topic using all available sources"""
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

        # 2. Group and prioritize content by source (blog only)
        source_content = {"blog": []}
        all_content = []
        sources_used = set()

        for i, metadata in enumerate(results["metadatas"][0]):
            source_type = metadata.get("source", "unknown")
            document = results["documents"][0][i]
            distance = results["distances"][0][i]

            # Only include blog content
            if (
                source_type == "blog" and distance < 0.7
            ):  # Only include relevant content
                content_item = {
                    "source": source_type,
                    "title": metadata.get("title", "Untitled"),
                    "content": document,
                    "relevance": 1 - distance,
                    "priority": get_data_source_priority(metadata),
                }

                all_content.append(content_item)
                sources_used.add(source_type)
                source_content[source_type].append(content_item)

        if not all_content:
            return {
                "topic": request.topic,
                "summary": f"No sufficiently relevant information found about '{request.topic}'.",
                "sources_used": [],
                "total_sources_found": len(results["metadatas"][0]),
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

        # 5. Build style-specific prompt
        style_instructions = {
            "comprehensive": "Provide a comprehensive overview covering all major aspects",
            "technical": "Focus on technical details, implementations, and best practices",
            "beginner": "Explain in simple terms suitable for beginners, avoiding jargon",
        }

        style_instruction = style_instructions.get(
            request.summary_style, style_instructions["comprehensive"]
        )

        prompt = (
            f"Create a detailed summary about '{request.topic}' using the provided information from multiple sources. "
            f"{style_instruction}. "
            f"Organize the information logically and mention when information comes from different types of sources.\n\n"
            f"Available information:\n{context}\n\n"
            f"Topic: {request.topic}\n"
            f"Summary:"
        )

        # 6. Generate summary using Groq
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
                    "content": "You are an expert knowledge synthesizer. Create comprehensive, well-structured summaries that integrate information from multiple sources effectively.",
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 600,
            "temperature": 0.6,
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        summary = data["choices"][0]["message"]["content"].strip()

        return {
            "topic": request.topic,
            "summary": summary,
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
