from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import config
from .core.logging import setup_logging, get_logger

# Import API routers
from .api import qa, semantic_search, summarize, rephrase, topic_summary

# Setup logging
setup_logging()
logger = get_logger(__name__)

app = FastAPI(
    title="Nova Mind - AI Blog Assistant",
    description="Intelligent blog assistant with RAG capabilities",
    version="2.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(qa.router, prefix="/qa", tags=["Q&A"])
app.include_router(semantic_search.router, prefix="/semantic-search", tags=["Search"])
app.include_router(summarize.router, prefix="/summarize", tags=["Summarization"])
app.include_router(rephrase.router, prefix="/rephrase-groq", tags=["Rephrasing"])
app.include_router(
    topic_summary.router, prefix="/topic-summary", tags=["Topic Summary"]
)


@app.get("/")
async def root():
    return {
        "message": "Nova Mind AI Blog Assistant",
        "version": "2.0.0",
        "status": "modular",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "nova-mind", "version": "2.0.0"}


@app.on_event("startup")
async def startup_event():
    logger.info("Nova Mind AI Blog Assistant starting up...")
    logger.info("Modular architecture initialized successfully")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Nova Mind AI Blog Assistant shutting down...")
