# Full-Stack Blog Application with AI & Video Meeting Features

A complete, modern blog platform with **microservices architecture**, featuring AI-powered content enhancement, real-time video meetings, and advanced social features built with MERN stack + AI services.

## ✨ Complete Feature Set

### 🔐 Authentication & Security

- JWT-based secure authentication system
- Email verification with OTP support
- Password reset via secure email links
- Profile management with image uploads
- Rate limiting for API security protection
- Session management with Redis

### 📝 Advanced Blog Management

- Rich text editor with image support
- Real-time auto-save functionality
- Category and tag organization
- Draft and publish workflow
- SEO-optimized content structure
- Image upload with file management

### 💬 Social & Interaction Features

- Nested comment system with replies
- Real-time like/unlike with live counters
- User notification system
- Post sharing capabilities
- Activity feeds and user interactions
- Real-time updates via Socket.io

### 🎥 Video Meeting & Communication

- **WebRTC Video Conferencing**: Peer-to-peer video calls
- **Meeting Requests**: Request meetings from blog posts
- **Real-time Scheduling**: Live meeting notifications
- **Meeting Management**: Approve/decline meeting requests
- **Room Management**: Dedicated meeting rooms
- **Real-time Communication**: Socket.io integration

### 🤖 AI-Powered Smart Features (Nova Mind Service)

- **Multi-Provider AI**: Groq (fast) + OpenAI (premium)
- **Text Rephrasing**: Professional, casual, technical, SEO tones
- **Content Summarization**: Auto-generate post summaries
- **Semantic Search**: AI-powered content discovery
- **Smart Suggestions**: AI writing assistance
- **Advanced Summarization**: Multi-level content analysis
- **Vector Database**: ChromaDB for similarity search

### � Real-Time System

- Live notifications via Socket.io
- Real-time comment updates
- Live user activity indicators
- Instant notification delivery
- Online/offline status tracking
- Real-time meeting updates

### 📊 Performance & Analytics

- Redis caching for optimal speed
- Performance monitoring and logging
- Database query optimization
- File upload management
- Error tracking and monitoring

## 🏗️ Microservices Architecture

This application uses **distributed microservices** with separate services communicating via HTTP APIs and real-time protocols:

### 📱 Frontend Service (React App)

- **React 18 + TypeScript**: Component-based UI development
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first responsive design
- **Socket.io Client**: Real-time bidirectional communication
- **React Quill**: Rich text editor with AI integration
- **WebRTC APIs**: Direct peer-to-peer video calling
- **Axios**: HTTP client with request/response interceptors

### 🖥️ Backend API Service (Node.js)

- **Express + TypeScript**: RESTful API server framework
- **MySQL 8.0**: Relational database with complex relationships
- **Socket.io**: Real-time server for live features
- **Redis**: In-memory caching and session store
- **JWT**: Stateless authentication tokens
- **Multer**: File upload middleware for images
- **Nodemailer**: Email service for notifications
- **Swagger**: Auto-generated API documentation

### 🧠 AI Service - Nova Mind (Python)

- **FastAPI**: High-performance async Python API
- **Groq SDK**: Fast AI inference processing
- **OpenAI API**: Premium AI model integration
- **ChromaDB**: Vector database for semantic search
- **Redis**: AI response caching layer
- **Uvicorn**: ASGI server for production deployment

### 🗄️ Database Architecture

- **MySQL**: Primary data storage
  - Users, posts, comments, meetings, notifications
  - Foreign key relationships and indexes
- **Redis**: High-speed caching
  - Session data, real-time cache
  - Pub/Sub messaging between services
- **ChromaDB**: Vector embeddings
  - Semantic search capabilities
  - AI-powered content similarity

### 🔗 Inter-Service Communication

- **REST APIs**: HTTP/HTTPS communication
- **WebSockets**: Real-time bidirectional data
- **Redis Pub/Sub**: Message queuing between services
- **Socket.io**: Event-driven real-time updates

## 🚀 Quick Start Guide

### 📋 Prerequisites

- **Node.js 18+** and npm
- **MySQL 8.0+** database server
- **Redis 6.0+** for caching and real-time features
- **Python 3.9+** for AI service
- **Git** for version control

### ⚡ Fast Setup (All Services)

```bash
# Clone repository
git clone <your-repo-url>
cd Full-Stack-Blog-Application-usingMERN

# Setup database
mysql -u root -p < database/Create\ Table/blogapp.sql
mysql -u root -p blogapp < database/Sample\ data/blogapp_users.sql

# Start all services (see Setup.md for detailed steps)
# 1. Start Redis: brew services start redis
# 2. Start Backend: cd server && npm install && npm run dev
# 3. Start Frontend: cd client && npm install && npm run dev
# 4. Start AI Service: cd nova-mind && pip install -r requirement.txt && uvicorn app.main:app --reload
```

## 🌐 Service Access Points

| Service             | URL                            | Description                       |
| ------------------- | ------------------------------ | --------------------------------- |
| 🎨 **Frontend**     | http://localhost:5173          | Main React application            |
| 🔧 **Backend API**  | http://localhost:4000          | Node.js REST API                  |
| 🤖 **AI Service**   | http://localhost:8000          | Nova Mind AI processing           |
| 📚 **API Docs**     | http://localhost:4000/api-docs | Interactive Swagger documentation |
| ❤️ **Health Check** | http://localhost:4000/health   | System status monitoring          |

## 📁 Complete Project Structure

```
Full-Stack-Blog-Application-usingMERN/
├── 📱 client/                     # React Frontend Service
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── pages/               # Application pages
│   │   ├── context/             # React context providers
│   │   └── config/              # API configuration
│   └── public/                  # Static assets
│
├── 🖥️ server/                     # Node.js Backend Service
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── services/            # Business logic
│   │   ├── repositories/        # Database access
│   │   ├── routes/              # API endpoints
│   │   ├── middleware/          # Custom middleware
│   │   ├── config/              # Database, Redis config
│   │   └── types/               # TypeScript definitions
│   ├── images/                  # User uploaded images
│   └── logs/                    # Application logs
│
├── 🧠 nova-mind/                  # Python AI Service
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── routes.py            # AI API endpoints
│   │   ├── services.py          # AI processing logic
│   │   └── schemas.py           # Data models
│   ├── chroma_db/               # Vector database storage
│   └── requirement.txt          # Python dependencies
│
└── 🗄️ database/                   # Database Resources
    ├── Create Table/            # SQL schema files
    ├── Sample data/             # Development test data
    └── Images/                  # Sample post images
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
