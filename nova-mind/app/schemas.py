from pydantic import BaseModel


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
