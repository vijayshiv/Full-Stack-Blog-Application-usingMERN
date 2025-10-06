from fastapi import APIRouter, HTTPException
from ..schemas import RephraseRequest, RephraseResponse
from ..services.llm_service import llm_service
from ..core.errors import create_error_response
from ..core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["Text Rephrasing"])


@router.post("/", response_model=RephraseResponse)
async def rephrase_endpoint(request: RephraseRequest):
    """
    Rephrase text with different tones and styles
    """
    try:
        # Create rephrasing prompt based on tone
        tone_prompts = {
            "Professional": "Rewrite the following text in a professional, formal tone:",
            "Technical": "Rewrite the following text in a technical, precise manner:",
            "Casual": "Rewrite the following text in a casual, friendly tone:",
            "SEO": "Rewrite the following text to be SEO-optimized with relevant keywords:",
        }

        base_prompt = tone_prompts.get(request.tone, tone_prompts["Professional"])

        prompt = f"""{base_prompt}

Original text: {request.text}

Rephrased text:"""

        # Generate rephrased text using LLM service
        rephrased_text = await llm_service.generate_response(
            prompt=prompt, temperature=0.7, max_tokens=200
        )

        return RephraseResponse(rephrased_text=rephrased_text.strip())

    except Exception as e:
        logger.error(f"Rephrasing endpoint error: {e}")
        error_info = create_error_response(e)
        raise HTTPException(
            status_code=error_info["status_code"], detail=error_info["error"]
        )
