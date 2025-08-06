#!/bin/bash

# Test script for AI Rephrasing Integration
echo "🧪 Testing AI Rephrasing Integration"
echo "=================================="

# Check if Nova-Mind service is running
echo "1. Checking Nova-Mind AI service..."
NOVA_MIND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ $NOVA_MIND_STATUS -eq 200 ]; then
    echo "✅ Nova-Mind service is running"
else
    echo "❌ Nova-Mind service is not running (Status: $NOVA_MIND_STATUS)"
    echo "   Start it with: cd nova-mind && source venv/bin/activate && uvicorn app.main:app --reload"
fi

# Check if Node.js backend is running
echo "2. Checking Node.js backend..."
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4000/health)
if [ $BACKEND_STATUS -eq 200 ]; then
    echo "✅ Node.js backend is running"
else
    echo "❌ Node.js backend is not running (Status: $BACKEND_STATUS)"
    echo "   Start it with: cd server && npm run dev"
fi

# Test AI endpoint through Node.js backend
echo "3. Testing AI rephrase endpoint..."
if [ $NOVA_MIND_STATUS -eq 200 ] && [ $BACKEND_STATUS -eq 200 ]; then
    RESPONSE=$(curl -s -X POST http://localhost:4000/ai/rephrase \
        -H "Content-Type: application/json" \
        -d '{"text": "Hello world!", "tone": "Professional", "provider": "groq"}')
    
    if [[ $RESPONSE == *"rephrased_text"* ]]; then
        echo "✅ AI rephrase endpoint is working"
        echo "   Response: $RESPONSE"
    else
        echo "❌ AI rephrase endpoint failed"
        echo "   Response: $RESPONSE"
    fi
else
    echo "⏭️  Skipping endpoint test (services not running)"
fi

echo ""
echo "🎯 Integration Summary:"
echo "- Frontend: React components added to Write.jsx and EditPost.jsx"
echo "- Backend: AI proxy endpoints added to Node.js server (/ai/rephrase)"
echo "- AI Service: FastAPI nova-mind service with Groq/OpenAI support"
echo ""
echo "📝 Usage:"
echo "1. Open Write or Edit Post page"
echo "2. Select text in the editor"
echo "3. Click '🤖 AI Rephrase Selected Text' button"
echo "4. Choose tone and AI provider"
echo "5. Apply rephrased text"
