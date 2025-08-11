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
)
from .config import config
from .services import cache_service
from sentence_transformers import SentenceTransformer
import chromadb
import openai
import requests
import logging

router = APIRouter()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load ChromaDB and embedding Model
chroma_client = chromadb.PersistentClient(path="chroma_db")
# Update collection name to support multi-source data
chroma_collection = chroma_client.get_or_create_collection("knowledge_base")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


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
        "model": "llama3-70b-8192",
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
        "stackoverflow": 2,  # High priority - technical Q&A
        "wikipedia": 3,  # Lower priority - general knowledge
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
    elif source_type == "stackoverflow":
        return {
            "id": metadata.get("question_id", ""),
            "title": metadata.get("title", ""),
            "tags": metadata.get("tags", "").split(", ")
            if metadata.get("tags")
            else [],  # Convert string back to list
            "score": metadata.get("score", 0),
            "source": "stackoverflow",
            "url": metadata.get("url", ""),
            "chunk_info": f"{metadata.get('chunk_index', 0) + 1}/{metadata.get('total_chunks', 1)}",
        }
    elif source_type == "wikipedia":
        return {
            "title": metadata.get("title", ""),
            "topic": metadata.get("topic", ""),
            "source": "wikipedia",
            "url": metadata.get("url", ""),
            "chunk_info": f"{metadata.get('chunk_index', 0) + 1}/{metadata.get('total_chunks', 1)}",
        }
    else:
        return {
            "title": metadata.get("title", "Unknown"),
            "source": metadata.get("source", "unknown"),
            "chunk_info": f"{metadata.get('chunk_index', 0) + 1}/{metadata.get('total_chunks', 1)}",
        }


@router.post("/semantic-search")
async def semantic_search(req: SemanticSearchRequest):
    try:
        query_embedding = embedding_model.encode([req.query])[0]

        # Get results from all data sources
        results = chroma_collection.query(
            query_embeddings=[query_embedding.tolist()],
            n_results=req.top_k
            * 2,  # Get more results to allow for sorting by priority
            include=["metadatas", "documents", "distances"],
        )

        if not results["metadatas"][0]:
            logger.warning("No results found in semantic search")
            return {"results": [], "message": "No relevant content found"}

        # Process and sort results by data source priority and relevance
        processed_results = []
        for i, metadata in enumerate(results["metadatas"][0]):
            source_type = metadata.get("source", "unknown")
            distance = results["distances"][0][i]
            priority = get_data_source_priority(metadata)

            result = format_search_result(metadata, source_type)
            result["relevance_score"] = 1 - distance  # Convert distance to similarity
            result["priority"] = priority

            processed_results.append(result)

        # Sort by priority first, then by relevance score
        processed_results.sort(key=lambda x: (x["priority"], -x["relevance_score"]))

        # Return top k results
        final_results = processed_results[: req.top_k]

        # Group results by source for statistics
        source_stats = {}
        for result in final_results:
            source = result["source"]
            source_stats[source] = source_stats.get(source, 0) + 1

        return {
            "results": final_results,
            "source_distribution": source_stats,
            "total_found": len(processed_results),
        }

    except Exception as e:
        logger.error(f"Error in semantic search: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Semantic search error: {str(e)}")


@router.post("/qa", response_model=QAResponse)
async def qa_endpoint(request: QARequest):
    try:
        # 1. Embed the question
        question_embedding = embedding_model.encode([request.question])[0]

        # 2. Retrieve relevant chunks from all sources
        results = chroma_collection.query(
            query_embeddings=[question_embedding.tolist()],
            n_results=request.top_k * 2,  # Get more results for better context
            include=["metadatas", "documents", "distances"],
        )

        if not results["metadatas"][0]:
            return {
                "answer": "I don't have enough information to answer your question. Please try rephrasing or asking about topics covered in our blog."
            }

        # 3. Build context with source attribution and priority
        context_parts = []

        # Group results by source and priority
        result_groups = []
        for i, metadata in enumerate(results["metadatas"][0]):
            source_type = metadata.get("source", "unknown")
            distance = results["distances"][0][i]
            priority = get_data_source_priority(metadata)
            document = results["documents"][0][i]

            result_groups.append(
                {
                    "metadata": metadata,
                    "document": document,
                    "distance": distance,
                    "priority": priority,
                    "source": source_type,
                }
            )

        # Sort by priority and relevance
        result_groups.sort(key=lambda x: (x["priority"], x["distance"]))

        # Build context with source diversity
        total_context_length = 0
        used_sources = set()

        for result in result_groups:
            if total_context_length >= MAX_CONTEXT_LENGTH:
                break

            metadata = result["metadata"]
            document = result["document"]
            source_type = result["source"]

            # Format context based on source type
            if source_type == "blog":
                context_piece = (
                    f"[Blog Post: {metadata.get('title', 'Untitled')}]\n{document}\n"
                )
            elif source_type == "stackoverflow":
                context_piece = f"[Stack Overflow: {metadata.get('title', 'Untitled')} - Score: {metadata.get('score', 0)}]\n{document}\n"
            elif source_type == "wikipedia":
                context_piece = (
                    f"[Wikipedia: {metadata.get('title', 'Untitled')}]\n{document}\n"
                )
            else:
                context_piece = f"[{source_type.title()}: {metadata.get('title', 'Untitled')}]\n{document}\n"

            if total_context_length + len(context_piece) <= MAX_CONTEXT_LENGTH:
                context_parts.append(context_piece)
                used_sources.add(source_type)
                total_context_length += len(context_piece)

        context = "\n".join(context_parts)

        # 4. Summarize context if still too long
        if len(context) > MAX_CONTEXT_LENGTH:
            context = summarize_context(context, config.GROQ_API_KEY)

        # 5. Build enhanced prompt with source awareness
        source_info = ", ".join(used_sources) if used_sources else "our knowledge base"

        prompt = (
            f"Answer the following question using the provided information from {source_info}. "
            f"Be specific and mention the source type when relevant (blog post, Stack Overflow, Wikipedia). "
            f"If the information is insufficient, say so honestly.\n\n"
            f"Context:\n{context}\n\n"
            f"Question: {request.question}\n\n"
            f"Answer:"
        )

        # 6. Call Groq (Llama 3)
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {config.GROQ_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": "llama3-70b-8192",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant with access to multiple knowledge sources including blog posts, Stack Overflow Q&A, and Wikipedia articles. Provide accurate, helpful answers and cite the source types when relevant.",
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": 400,
            "temperature": 0.7,
        }

        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        answer = data["choices"][0]["message"]["content"].strip()

        # Add metadata about sources used
        response_data = {
            "answer": answer,
            "sources_used": list(used_sources),
            "context_length": len(context),
            "results_count": len(results["metadatas"][0]),
        }

        return response_data

    except Exception as e:
        logger.error(f"Error in QA endpoint: {str(e)}")
        # Fallback response
        fallback_answer = (
            "I'm experiencing technical difficulties accessing all knowledge sources. "
            "Please try rephrasing your question or check back later. "
            "For immediate assistance, you can browse our blog posts directly."
        )
        return {"answer": fallback_answer, "sources_used": [], "error": str(e)}


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
            "model": "llama3-70b-8192",  # or "llama2-70b-4096", "gemma-7b-it", etc.
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
            "model": "llama3-70b-8192",
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

        # 2. Group and prioritize content by source
        source_content = {"blog": [], "stackoverflow": [], "wikipedia": []}
        all_content = []
        sources_used = set()

        for i, metadata in enumerate(results["metadatas"][0]):
            source_type = metadata.get("source", "unknown")
            document = results["documents"][0][i]
            distance = results["distances"][0][i]

            if distance < 0.7:  # Only include relevant content
                content_item = {
                    "source": source_type,
                    "title": metadata.get("title", "Untitled"),
                    "content": document,
                    "relevance": 1 - distance,
                    "priority": get_data_source_priority(metadata),
                }

                all_content.append(content_item)
                sources_used.add(source_type)

                if source_type in source_content:
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
                "stackoverflow": "Stack Overflow",
                "wikipedia": "Wikipedia",
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
            "model": "llama3-70b-8192",
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
