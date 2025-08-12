from pydantic import BaseModel
from typing import Optional, List, Dict, Any


class RephraseRequest(BaseModel):
    text: str
    tone: str  # e.g., "Professional", "Technical", "Casual", "SEO"


class RephraseResponse(BaseModel):
    rephrased_text: str


class SemanticSearchRequest(BaseModel):
    query: str
    top_k: int = 5


class QARequest(BaseModel):
    question: str
    top_k: int = 3


class QAResponse(BaseModel):
    answer: str


class SummarizeRequest(BaseModel):
    text: str
    style: str = "concise"  # "concise", "detailed", "bullet_points", "executive"
    max_length: int = 200


class SummarizeResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int


class TopicSummaryRequest(BaseModel):
    topic: str
    max_sources: int = 10
    summary_style: str = "comprehensive"  # "comprehensive", "technical", "beginner"


class TopicSummaryResponse(BaseModel):
    topic: str
    summary: str
    sources_used: list
    total_sources_found: int


# New Advanced Features Schemas


class MultiHopQARequest(BaseModel):
    question: str
    user_id: Optional[str] = None
    max_hops: int = 3
    include_reasoning: bool = True


class MultiHopQAResponse(BaseModel):
    answer: str
    reasoning_steps: List[Dict[str, Any]]
    sources: List[Dict[str, Any]]
    total_hops: int


class AgentTaskRequest(BaseModel):
    task: str
    user_id: Optional[str] = None
    context: Optional[Dict[str, Any]] = None


class AgentTaskResponse(BaseModel):
    result: str
    steps_taken: List[Dict[str, Any]]
    sources: List[Dict[str, Any]]
    execution_time: float


class ToolRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any]


class ToolResponse(BaseModel):
    result: Any
    tool_used: str
    success: bool
    error_message: Optional[str] = None


class AdvancedSummarizeRequest(BaseModel):
    text: str
    style: str = "concise"  # "concise", "detailed", "bullet_points", "executive", "creative", "academic"
    target_audience: str = "general"  # "general", "technical", "beginner", "expert"
    length: str = "medium"  # "short", "medium", "long"
    include_keywords: Optional[List[str]] = None
    tone: str = "neutral"  # "neutral", "formal", "casual", "enthusiastic"


class AdvancedSummarizeResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int
    style_used: str
    target_audience: str
    keywords_included: List[str]
    confidence_score: float
