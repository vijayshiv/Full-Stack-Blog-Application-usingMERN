from fastapi import APIRouter, HTTPException
from ..schemas import SummarizeRequest, SummarizeResponse
from ..services.llm_service import llm_service
from ..core.errors import create_error_response
from ..core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["Summarization"])


@router.post("/", response_model=SummarizeResponse)
async def summarize_endpoint(request: SummarizeRequest):
    """
    Summarize text content with different styles
    """
    try:
        # Create summarization prompt based on style
        style_prompts = {
            "concise": "Provide a concise summary of the following text:",
            "detailed": "Provide a detailed summary with key points from the following text:",
            "bullet_points": "Summarize the following text in bullet points:",
            "executive": "Provide an executive summary of the following text:",
        }

        base_prompt = style_prompts.get(request.style, style_prompts["concise"])

        prompt = f"""{base_prompt}

Text to summarize:
{request.text}

Summary (max {request.max_length} words):"""

        # Generate summary using LLM service
        summary = await llm_service.generate_response(
            prompt=prompt,
            temperature=0.3,
            max_tokens=request.max_length * 2,  # Rough token estimation
        )

        # Calculate lengths
        original_length = len(request.text.split())
        summary_length = len(summary.split())

        return SummarizeResponse(
            summary=summary,
            original_length=original_length,
            summary_length=summary_length,
        )

    except Exception as e:
        logger.error(f"Summarization endpoint error: {e}")
        error_info = create_error_response(e)
        raise HTTPException(
            status_code=error_info["status_code"], detail=error_info["error"]
        )
