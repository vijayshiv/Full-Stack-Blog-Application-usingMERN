from fastapi import APIRouter, HTTPException
from .schemas import (
    RephraseRequest,
    RephraseResponse,
    SemanticSearchRequest,
    QARequest,
    QAResponse,
)
from .config import config
from .services import cache_service
from sentence_transformers import SentenceTransformer
import chromadb
import openai
import requests

router = APIRouter()
# Load ChromaDB and embedding Mode
chroma_client = chromadb.PersistentClient(path="chroma_db")
chroma_collection = chroma_client.get_or_create_collection("blog_posts")
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


# Helper for prompt instructions
TONE_INSTRUCTIONS = {
    "Professional": "Rephrase this text in a professional, formal business tone",
    "Technical": "Rephrase this text in a technical, precise, and detailed manner",
    "Casual": "Rephrase this text in a casual, friendly, and conversational tone",
    "SEO": "Rephrase this text to be more SEO-friendly with better keywords and structure",
}


def get_instruction(tone):
    return TONE_INSTRUCTIONS.get(tone, "Rephrase this text")


@router.post("/semantic-search")
async def semantic_search(req: SemanticSearchRequest):
    query_embedding = embedding_model.encode([req.query])[0]
    results = chroma_collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=req.top_k,
        include=["metadatas"],
    )
    posts = []
    for meta in results["metadatas"][0]:
        posts.append(
            {"id": meta["id"], "title": meta["title"], "category": meta["category"]}
        )
    return {"results": posts}


@router.post("/qa", response_model=QAResponse)
async def qa_endpoint(request: QARequest):
    # 1. Embed the question
    question_embedding = embedding_model.encode([request.question])[0]
    # 2. Retrieve relevant posts
    results = chroma_collection.query(
        query_embeddings=[question_embedding.tolist()],
        n_results=request.top_k,
        include=["metadatas"],
    )
    # 3. Build context from top posts
    context = ""
    for meta in results["metadatas"][0]:
        context += f"Title: {meta['title']}\nCategory: {meta['category']}\n\n"
    # 4. Build prompt for Groq
    prompt = (
        f"Answer the following question using only the information from the provided blog posts.\n\n"
        f"Context:\n{context}\n"
        f"Question: {request.question}\n"
        f"Answer:"
    )
    # 5. Call Groq (Llama 3)
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {config.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "llama3-70b-8192",
        "messages": [
            {"role": "system", "content": "You are a helpful blog assistant."},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 300,
        "temperature": 0.7,
    }
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        answer = data["choices"][0]["message"]["content"].strip()
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq Q&A error: {str(e)}")


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


@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "nova-mind"}


@router.get("/")
async def root():
    return {
        "message": "Nova-Mind AI Service",
        "endpoints": ["/rephrase-openai", "/rephrase-groq", "/health"],
    }
