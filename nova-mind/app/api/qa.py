from fastapi import APIRouter, HTTPException
from ..schemas import QARequest, QAResponse
from ..services.qa_service import qa_service
from ..core.errors import create_error_response
from ..core.logging import get_logger

logger = get_logger(__name__)
router = APIRouter(tags=["Q&A"])


@router.post("/", response_model=QAResponse)
async def qa_endpoint(request: QARequest):
    """
    Q&A endpoint with conversational support

    Supports both:
    - Simple Q&A: {"question": "What is AI?"}
    - Conversational: {"messages": [{"role": "user", "content": "Hello"}]}
    """
    try:
        # Handle both old question format and new messages format
        if request.messages:
            # Extract user message from conversation
            if not request.messages:
                raise HTTPException(
                    status_code=400, detail="Messages array cannot be empty"
                )

            # Get the latest user message
            user_messages = [msg for msg in request.messages if msg.role == "user"]
            if not user_messages:
                raise HTTPException(
                    status_code=400, detail="No user message found in conversation"
                )

            latest_message = user_messages[-1].content

            # Handle conversational Q&A with full chat history
            result = await qa_service.handle_conversational_qa(
                user_message=latest_message,
                chat_history=request.messages[
                    :-1
                ],  # All messages except the current one
                top_k=request.top_k,
            )

        elif request.question:
            # Handle simple Q&A (backward compatibility)
            result = await qa_service.handle_conversational_qa(
                user_message=request.question, chat_history=[], top_k=request.top_k
            )
        else:
            raise HTTPException(
                status_code=400,
                detail="Either 'question' or 'messages' must be provided",
            )

        return QAResponse(**result)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Q&A endpoint error: {e}")
        error_info = create_error_response(e)
        raise HTTPException(
            status_code=error_info["status_code"], detail=error_info["error"]
        )
