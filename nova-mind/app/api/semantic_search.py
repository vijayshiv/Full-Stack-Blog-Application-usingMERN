from fastapi import APIRouter, HTTPException
from ..schemas import SemanticSearchRequest
from ..services.chroma_service import chroma_service
from ..core.errors import create_error_response
from ..core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["Semantic Search"])


@router.post("/")
async def semantic_search_endpoint(request: SemanticSearchRequest):
    """
    Perform semantic search across blog content
    """
    try:
        # Use ChromaDB service for semantic search
        relevant_content, sources = chroma_service.search_similar_content(
            query=request.query,
            top_k=request.top_k,
            distance_threshold=0.7,  # Stricter threshold for direct search
        )

        return {"query": request.query, "results": sources, "total_found": len(sources)}

    except Exception as e:
        logger.error(f"Semantic search endpoint error: {e}")
        error_info = create_error_response(e)
        raise HTTPException(
            status_code=error_info["status_code"], detail=error_info["error"]
        )
