from fastapi import APIRouter, HTTPException
from .schemas import RephraseRequest, RephraseResponse
from .config import config
from .services import cache_service
import openai
import requests

router = APIRouter()

# Helper for prompt instructions
TONE_INSTRUCTIONS = {
    "Professional": "Rephrase this text in a professional, formal business tone",
    "Technical": "Rephrase this text in a technical, precise, and detailed manner",
    "Casual": "Rephrase this text in a casual, friendly, and conversational tone",
    "SEO": "Rephrase this text to be more SEO-friendly with better keywords and structure",
}


def get_instruction(tone):
    return TONE_INSTRUCTIONS.get(tone, "Rephrase this text")


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
            "model": "llama-3.3-70b-versatile",  # or "llama2-70b-4096", "gemma-7b-it", etc.
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


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "nova-mind"}


@router.get("/")
async def root():
    return {
        "message": "Nova-Mind AI Service",
        "endpoints": ["/rephrase-openai", "/rephrase-groq", "/health"],
    }
