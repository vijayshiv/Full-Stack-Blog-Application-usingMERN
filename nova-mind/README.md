# Nova-Mind AI Service

A FastAPI-based AI service for content rephrasing and future AI features.

## Features

- **AI Content Rephrasing**: Rephrase text in different tones (Professional, Technical, Casual, SEO)
- **Redis Caching**: Cache AI responses to reduce API calls and improve performance
- **OpenAI Integration**: Uses GPT-3.5-turbo for high-quality text rephrasing

## Local Development Setup

1. **Create a virtual environment:**

   ```sh
   python3 -m venv venv
   ```

2. **Activate the virtual environment:**

   ```sh
   source venv/bin/activate
   ```

3. **Install dependencies:**

   ```sh
   pip install -r requirements.txt
   ```

4. **Environment Configuration:**
   Copy `.env.example` to `.env` and add your API keys:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your actual values:

   ```
   OPENAI_API_KEY=your-openai-api-key-here
   SECRET_KEY=your-secret-key
   DEBUG=true
   REDIS_URL=redis://localhost:6379/0
   ```

5. **Run the FastAPI app:**
   ```sh
   uvicorn app.main:app --reload
   ```

## API Endpoints

### POST /rephrase

Rephrase text in different tones.

**Request Body:**

```json
{
  "text": "This is a simple blog post about technology.",
  "tone": "Professional"
}
```

**Response:**

```json
{
  "rephrased_text": "This represents a sophisticated analysis of technological innovations."
}
```

**Available Tones:**

- `Professional`: Formal business tone
- `Technical`: Precise and detailed manner
- `Casual`: Friendly and conversational
- `SEO`: SEO-optimized with better keywords

### GET /health

Health check endpoint.

### GET /

Service information and available endpoints.

## Testing with Postman

1. Start the server: `uvicorn app.main:app --reload`
2. Test endpoints at `http://localhost:8000`
3. View interactive docs at `http://localhost:8000/docs`

## Architecture

- **FastAPI**: High-performance async web framework
- **Pydantic**: Data validation and serialization
- **OpenAI**: AI text generation and rephrasing
- **Redis**: Caching layer (optional)
- **python-dotenv**: Environment variable management
