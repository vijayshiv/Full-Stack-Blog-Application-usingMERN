from fastapi import APIRouter, HTTPException
from ..schemas import TopicSummaryRequest, TopicSummaryResponse
from ..services.chroma_service import chroma_service
from ..services.llm_service import llm_service
from ..core.errors import create_error_response
from ..core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["Topic Summary"])


@router.post("/", response_model=TopicSummaryResponse)
async def topic_summary_endpoint(request: TopicSummaryRequest):
    """
    Generate comprehensive topic summaries from blog content
    """
    try:
        # Search for relevant content about the topic
        relevant_content, sources = chroma_service.search_similar_content(
            query=request.topic,
            top_k=request.max_sources,
            distance_threshold=1.2,  # More lenient for topic exploration
        )

        if not relevant_content:
            return TopicSummaryResponse(
                topic=request.topic,
                summary=f"I couldn't find specific blog content about '{request.topic}'. However, I'd be happy to help you create content on this topic or suggest related topics from our available blog posts.",
                sources_used=[],
                total_sources_found=0,
            )

        # Create style-specific prompts
        style_prompts = {
            "comprehensive": "Create a comprehensive overview of the following topic based on the blog content:",
            "technical": "Provide a technical deep-dive into the following topic using the blog content:",
            "beginner": "Explain the following topic in beginner-friendly terms using the blog content:",
            "listicle": "Create a structured list-format summary of the following topic from the blog content:",
            "tutorial": "Create a tutorial-style guide for the following topic using the blog content:",
        }

        base_prompt = style_prompts.get(
            request.summary_style, style_prompts["comprehensive"]
        )

        # Combine content for the prompt
        content_context = "\n\n".join(
            [
                f"[Source: {item['title']}]\n{item['content'][:500]}"
                for item in relevant_content[:5]
            ]
        )

        prompt = f"""{base_prompt}

Topic: {request.topic}

Available blog content:
{content_context}

Generate a {request.summary_style} summary about {request.topic} using the above content. 
Make it informative, well-structured, and engaging for readers interested in {request.topic}.

Summary:"""

        # Generate summary using LLM service
        summary = await llm_service.generate_response(
            prompt=prompt, temperature=0.7, max_tokens=500
        )

        return TopicSummaryResponse(
            topic=request.topic,
            summary=summary,
            sources_used=[item["title"] for item in relevant_content[:5]],
            total_sources_found=len(relevant_content),
        )

    except Exception as e:
        logger.error(f"Topic summary endpoint error: {e}")
        error_info = create_error_response(e)
        raise HTTPException(
            status_code=error_info["status_code"], detail=error_info["error"]
        )
