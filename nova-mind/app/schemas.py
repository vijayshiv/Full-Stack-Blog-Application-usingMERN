from pydantic import BaseModel


class RephraseRequest(BaseModel):
    text: str
    tone: str  # e.g., "Professional", "Technical", "Casual", "SEO"


class RephraseResponse(BaseModel):
    rephrased_text: str
