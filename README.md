# Full-Stack Blog Application with AI Features

A modern, feature-rich blog platform built with MERN stack, TypeScript, and AI-powered content enhancement.

## ✨ Features

### 🔐 Authentication & User Management

- User registration and login with JWT authentication
- Profile management and password reset via email
- Secure session handling with token expiration

### 📝 Blog Management

- Create, edit, and delete blog posts with rich text editor
- Image upload and management for posts
- Category-based post organization
- Personal dashboard for managing your posts

### 💬 Social Features

- Comment system with threading support
- Like/unlike posts with real-time counters
- User notifications for interactions
- Real-time updates via Socket.io

### 🎥 Video Meeting System

- Request meetings with post authors
- WebRTC-based video conferencing
- Real-time meeting notifications
- Meeting room management

### 🤖 AI-Powered Content Enhancement

- **AI Text Rephrasing**: Rephrase selected text in different tones (Professional, Technical, Casual, SEO)
- **Multiple AI Providers**: Choose between Groq (fast & free) or OpenAI (premium)
- **Real-time Processing**: Instant text enhancement while writing/editing
- **Smart Integration**: Seamlessly integrated into the blog editor

### 📱 Modern Experience

- Responsive design for all devices
- Real-time notifications and updates
- Fast loading with optimized performance
- Intuitive user interface

## 🛠️ Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **React Quill** for rich text editing
- **Socket.io Client** for real-time features

### Backend

- **Node.js** with Express and TypeScript
- **MySQL** for data storage
- **Socket.io** for real-time communication
- **Redis** for caching and session management
- **JWT** for authentication

### AI Service

- **FastAPI** (Python) for AI endpoints
- **Groq API** for fast text processing
- **OpenAI API** for premium AI features
- **Redis** for response caching

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- MySQL 8.0+
- Redis
- Python 3.8+ (for AI service)

### 1. Database Setup

```bash
# Import the database schema
mysql -u your_username -p < database/blogapp_complete.sql
```

### 2. Backend Setup

```bash
cd server
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

### 4. AI Service Setup

```bash
cd nova-mind
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirement.txt
uvicorn app.main:app --reload
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:4000
- **AI Service**: http://localhost:8000

## 📁 Project Structure

```
├── client/          # React frontend application
├── server/          # Node.js backend API
├── nova-mind/       # Python AI service
├── database/        # Database schema and sample data
└── docs/           # Project documentation
```

## 🔧 Key Features in Detail

### AI Text Rephrasing

1. Select any text in the blog editor
2. Click the "AI Rephrase" button
3. Choose your preferred tone and AI provider
4. Get instant AI-enhanced text suggestions
5. Apply changes seamlessly to your content

### Video Meeting System

1. Request a meeting from any blog post
2. Real-time notifications for meeting requests
3. WebRTC-powered video calls
4. Integrated meeting room interface

### Real-time Features

- Live comment updates
- Instant notifications
- Real-time like counters
- Meeting status updates

## 📄 License

MIT License - feel free to use this project for learning and development.
