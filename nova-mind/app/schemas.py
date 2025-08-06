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
