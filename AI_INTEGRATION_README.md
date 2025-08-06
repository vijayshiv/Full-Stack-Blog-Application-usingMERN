# 🤖 AI Rephrasing Feature Integration

This document explains how the AI text rephrasing feature has been integrated into your blog application.

## 🏗️ Architecture Overview

```
Frontend (React) → Backend (Node.js) → AI Service (FastAPI/Nova-Mind)
     ↓                    ↓                        ↓
- Write.jsx         - /ai/rephrase          - /rephrase-groq
- EditPost.jsx      - Proxy endpoint        - /rephrase-openai
- AIRephraseModal   - Error handling        - Redis caching
```

## 📁 Files Added/Modified

### Backend (Node.js)

- ✅ `server/src/routes/aiRoutes.ts` - New AI proxy endpoints
- ✅ `server/src/server.ts` - Route registration
- ✅ `server/.env.example` - AI service URL configuration

### Frontend (React)

- ✅ `client/src/components/AIRephraseModal.jsx` - Reusable AI modal component
- ✅ `client/src/pages/Write.jsx` - AI button & modal integration
- ✅ `client/src/pages/EditPost.jsx` - AI button & modal integration

### AI Service (FastAPI)

- ✅ `nova-mind/` - Complete AI service (already implemented)

## 🚀 How to Use

### 1. Start All Services

```bash
# Terminal 1: Start Nova-Mind AI Service
cd nova-mind
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 2: Start Node.js Backend
cd server
npm run dev

# Terminal 3: Start React Frontend
cd client
npm start
```

### 2. Using the Feature

1. **Create/Edit Post**: Go to Write or Edit Post page
2. **Select Text**: Highlight the text you want to rephrase in the editor
3. **Click AI Button**: Click "🤖 AI Rephrase Selected Text"
4. **Choose Options**:
   - **Tone**: Professional, Technical, Casual, or SEO
   - **Provider**: Groq (fast & free) or OpenAI (premium)
5. **Rephrase**: Click "Rephrase Text" to get AI suggestions
6. **Apply**: Click "Apply Changes" to replace the selected text

## 🔧 Configuration

### Environment Variables

Add to your `server/.env`:

```bash
AI_SERVICE_URL=http://localhost:8000
```

Add to your `nova-mind/.env`:

```bash
GROQ_API_KEY=your-groq-api-key
OPENAI_API_KEY=your-openai-api-key  # Optional
```

## 🎯 API Endpoints

### Node.js Backend

- `POST /ai/rephrase` - Rephrase text (proxy to AI service)
- `GET /ai/health` - Check AI service health

### Nova-Mind AI Service

- `POST /rephrase-groq` - Rephrase using Groq
- `POST /rephrase-openai` - Rephrase using OpenAI
- `GET /health` - Service health check

## 📝 Request/Response Format

### Request

```json
{
  "text": "Your text to rephrase",
  "tone": "Professional",
  "provider": "groq"
}
```

### Response

```json
{
  "status": "success",
  "data": {
    "rephrased_text": "Your professionally rephrased text"
  }
}
```

## 🧪 Testing

Run the integration test:

```bash
./test-ai-integration.sh
```

## 🚨 Troubleshooting

### Common Issues

1. **AI Service Not Running**

   ```bash
   cd nova-mind
   source venv/bin/activate
   uvicorn app.main:app --reload
   ```

2. **Groq API Error**

   - Check your `GROQ_API_KEY` in nova-mind/.env
   - Verify API key is valid at https://console.groq.com

3. **Text Selection Not Working**

   - Make sure you select text before clicking the rephrase button
   - The ReactQuill editor must have focus

4. **Modal Not Appearing**
   - Check browser console for JavaScript errors
   - Ensure all React components are properly imported

## 🎨 UI Components

### AIRephraseModal Features

- **Real-time text preview** (original vs rephrased)
- **Tone selection dropdown** with descriptions
- **Provider selection** (Groq vs OpenAI)
- **Loading states** with spinners
- **Error handling** with toast notifications
- **Responsive design** for mobile/desktop

### Integration Points

- **Write.jsx**: New post creation with AI assistance
- **EditPost.jsx**: Existing post editing with AI assistance
- **Seamless UX**: Text replacement preserves editor state

## 🔮 Future Enhancements

- **Bulk rephrasing**: Rephrase entire posts
- **Style consistency**: Maintain writing style across posts
- **Multi-language support**: Rephrase in different languages
- **Writing suggestions**: AI-powered content improvements
- **Grammar checking**: Integrated grammar and spell check

## 📊 Benefits

- **Improved Content Quality**: Professional, technical, casual, and SEO-optimized tones
- **Time Savings**: Quick text refinement without manual rewriting
- **Consistency**: Maintain tone across your blog posts
- **Accessibility**: Easy-to-use interface for all skill levels
- **Flexibility**: Choose between different AI providers
