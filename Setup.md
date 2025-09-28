# Complete Setup Guide - Microservices Blog Platform

This comprehensive guide will help you set up the entire blog application with **all microservices**: Frontend (React), Backend (Node.js), AI Service (Python), WebRTC video meetings, and all databases.

## 📋 Prerequisites & Requirements

### 🛠️ Required Software Stack

- **Node.js** 18.0+ and npm (for Backend & Frontend)
- **MySQL** 8.0+ (Primary database)
- **Redis** 6.0+ (Caching & real-time features)
- **Python** 3.9+ (for Nova Mind AI service)
- **Git** (Version control)

### 🔑 API Keys Required

| Service                | Required    | Purpose             | Get From                           |
| ---------------------- | ----------- | ------------------- | ---------------------------------- |
| **Groq API**           | ✅ Yes      | Fast AI processing  | https://console.groq.com (Free)    |
| **OpenAI API**         | ⚠️ Optional | Premium AI features | https://platform.openai.com (Paid) |
| **Gmail App Password** | ✅ Yes      | Email notifications | Google Account Settings            |

### 🌐 Network Requirements

- **Port 3306**: MySQL database
- **Port 6379**: Redis server
- **Port 4000**: Backend API service
- **Port 5173**: Frontend React app
- **Port 8000**: Nova Mind AI service

## 🗄️ Complete Database Setup

### 1. Install MySQL 8.0+

```bash
# macOS (using Homebrew)
brew install mysql
brew services start mysql

# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql

# Windows
# Download from https://dev.mysql.com/downloads/mysql/
```

### 2. Create Database & Import Schema

```bash
# 1. Login to MySQL
mysql -u root -p

# 2. Create database
CREATE DATABASE blogapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit

# 3. Import database schema
mysql -u root -p blogapp < database/Create\ Table/blogapp.sql
```

### 3. Import Sample Data (Optional for Testing)

```bash
# Import users sample data
mysql -u root -p blogapp < database/Sample\ data/blogapp_users.sql

# Import posts sample data
mysql -u root -p blogapp < database/Sample\ data/blogapp_posts.sql

# Import comments sample data
mysql -u root -p blogapp < database/Sample\ data/blogapp_comments.sql

# Import other sample data files as needed:
# - blogapp_notifications.sql
# - blogapp_meeting_requests.sql
# - blogapp_post_likes.sql
# - blogapp_routines.sql
```

### 4. Setup Sample Images (For Development)

```bash
# Copy sample images to server directory
# Source: database/Images/images/
# Destination: server/images/

# Create images directory in server
mkdir -p server/images

# Copy all sample images
cp -r database/Images/images/* server/images/

# Set proper permissions (Linux/macOS)
chmod 755 server/images
chmod 644 server/images/*
```

### 5. Database Verification

```sql
-- Login to MySQL and verify setup
mysql -u root -p blogapp

-- Check tables created
SHOW TABLES;

-- Verify sample data (if imported)
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM posts;
SELECT COUNT(*) FROM comments;

-- Check database character set
SELECT default_character_set_name FROM information_schema.SCHEMATA
WHERE schema_name = "blogapp";
```

## 🔗 Redis Setup

### 1. Install Redis

```bash
# macOS (using Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt update
sudo apt install redis-server
sudo systemctl start redis

# Windows (using Docker)
docker run -d --name redis-blog -p 6379:6379 redis:latest
```

### 2. Test Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

## ⚙️ Complete Environment Configuration

### 1. Backend Service Environment

**File Location**: `server/.env`

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=blogapp

# JWT Authentication
JWT_SECRET=nRtdxIt1QgT9VHjftlSvfbFYl55EZit1
JWT_EXPIRY=24h

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
EMAIL_SERVICE=gmail

# Server Configuration
PORT=4000
HOST=0.0.0.0
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=your_redis_password_if_any

# Cross-Service URLs
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173

# WebRTC & Meeting Configuration
MEETING_ROOM_URL=http://localhost:5173/meeting
```

### 2. Frontend Service Environment

**File Location**: `client/.env`

```env
# API Configuration
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=Full Stack Blog Platform
VITE_NODE_ENV=development

# WebRTC Configuration
VITE_WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
VITE_ENABLE_VIDEO_CALLS=true

# AI Service Integration
VITE_AI_SERVICE_URL=http://localhost:8000
VITE_ENABLE_AI_FEATURES=true
```

### 3. AI Service (Nova Mind) Environment

**File Location**: `nova-mind/.env`

```env
# AI Provider API Keys
GROQ_API_KEY=gsk_your_groq_api_key_here
OPENAI_API_KEY=sk-proj-your_openai_api_key_here

# Service Configuration
SECRET_KEY=2fiZw0DXnzQEHTNqUVM0y6vf0KpVYY0C
DEBUG=true

# Database Configuration
REDIS_URL=redis://localhost:6379/0

# ChromaDB Configuration (for semantic search)
CHROMA_DB_PATH=./chroma_db
COLLECTION_NAME=blog_embeddings

# Service URLs
BACKEND_URL=http://localhost:4000
```

### 4. Network Configuration for Multiple Devices

If you want to access from other devices on same WiFi, replace `localhost` with your machine's IP:

**Find your IP address:**

```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig | findstr "IPv4"
```

**Update environment files with your IP (e.g., 192.168.1.48):**

```env
# In server/.env
CLIENT_URL=http://192.168.1.48:5173
FRONTEND_URL=http://192.168.1.48:5173

# In client/.env
VITE_API_URL=http://192.168.1.48:4000

# In client/src/config/apiURL.js
const baseURL = "http://192.168.1.48:4000";
```

## 📧 Email Setup (Gmail)

### 1. Enable 2-Factor Authentication

- Go to your Google Account settings
- Enable 2-Factor Authentication

### 2. Generate App Password

- Go to Google Account > Security > App passwords
- Generate a new app password for "Mail"
- Use this password in EMAIL_PASS (not your regular Gmail password)

## 🚀 Complete Installation & Service Startup

### 1. Clone Repository & Initial Setup

```bash
# Clone the repository
git clone <your-repository-url>
cd Full-Stack-Blog-Application-usingMERN

# Create necessary directories
mkdir -p server/src/images
mkdir -p server/logs
```

### 2. Redis Setup (Required for all services)

```bash
# macOS (using Homebrew)
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Windows (using Docker)
docker run -d --name redis-blog -p 6379:6379 redis:latest

# Test Redis connection
redis-cli ping  # Should return: PONG
```

### 3. Backend API Service Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file (copy from above configuration)
touch .env
# Add all backend environment variables

# Start in development mode
npm run dev

# Alternative: Start with host access (for other devices)
npm run dev -- --host
```

✅ **Backend runs on**: http://localhost:4000
✅ **API Documentation**: http://localhost:4000/api-docs
✅ **Health Check**: http://localhost:4000/health

### 4. Frontend React Service Setup

```bash
# Navigate to client directory (new terminal)
cd client

# Install dependencies
npm install

# Create .env file
touch .env
# Add all frontend environment variables

# Start development server
npm run dev

# For network access (other devices on same WiFi)
npm run dev -- --host
```

✅ **Frontend runs on**: http://localhost:5173

### 5. AI Service (Nova Mind) Setup

```bash
# Navigate to nova-mind directory (new terminal)
cd nova-mind

# Create Python virtual environment
python3 -m venv venv

# Activate virtual environment
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install Python dependencies
pip install -r requirement.txt

# Create .env file
touch .env
# Add all AI service environment variables

# Start FastAPI service
uvicorn app.main:app --reload

# For network access:
uvicorn app.main:app --reload --host 0.0.0.0
```

✅ **AI Service runs on**: http://localhost:8000
✅ **AI API Documentation**: http://localhost:8000/docs

### 6. WebRTC Setup (Built into Frontend)

WebRTC functionality is built into the React frontend. No additional setup required.

**WebRTC Features Available:**

- Peer-to-peer video calls
- Screen sharing capabilities
- Audio/video controls
- Meeting room management

### 7. Start All Services (Production Method)

You can use process managers to run all services together:

```bash
# Using PM2 (install: npm install -g pm2)
pm2 start ecosystem.config.js

# Or use Docker Compose (if you have docker-compose.yml)
docker-compose up -d

# Or start manually in separate terminals:
# Terminal 1: Redis
redis-server

# Terminal 2: Backend
cd server && npm run dev

# Terminal 3: Frontend
cd client && npm run dev

# Terminal 4: AI Service
cd nova-mind && source venv/bin/activate && uvicorn app.main:app --reload
```

## ✅ Complete System Verification

### 1. Service Health Checks

```bash
# Backend API Health
curl http://localhost:4000/health

# AI Service Health
curl http://localhost:8000/health

# Redis Connection Test
redis-cli ping

# MySQL Connection Test
mysql -u root -p -e "USE blogapp; SELECT COUNT(*) FROM users;"
```

**Expected Results:**

- ✅ Backend: Status 200 with health information
- ✅ Frontend: Loads at http://localhost:5173
- ✅ AI Service: Status 200 with service info
- ✅ Redis: Returns "PONG"
- ✅ MySQL: Returns user count

### 2. Database Integration Test

```bash
# 1. Register a new user via frontend
# 2. Create a test blog post
# 3. Verify data in MySQL:

mysql -u root -p blogapp
SELECT * FROM users ORDER BY created_at DESC LIMIT 1;
SELECT * FROM posts ORDER BY created_at DESC LIMIT 1;
```

### 3. Real-Time Features Test

```bash
# Check server logs for these messages:
# ✅ "Redis connected successfully"
# ✅ "Socket.io server initialized"
# ✅ "Socket.io initialized successfully"

# Test real-time features:
# 1. Open frontend in 2 browser tabs
# 2. Like a post in one tab
# 3. Verify real-time counter update in other tab
# 4. Add a comment and see live update
```

### 4. AI Service Integration Test

```bash
# Test AI API directly:
curl -X POST http://localhost:8000/rephrase \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello world", "tone": "professional", "provider": "groq"}'

# Test via frontend:
# 1. Create/edit a blog post
# 2. Select some text
# 3. Click "AI Rephrase" button
# 4. Choose tone and provider
# 5. Verify AI-generated response
```

### 5. Video Meeting System Test

```bash
# Test meeting flow:
# 1. Create a blog post (User A)
# 2. Request meeting from another user (User B)
# 3. Check notifications in real-time
# 4. Approve meeting request (User A)
# 5. Join meeting room with WebRTC video call
# 6. Test video/audio/screen sharing features
```

### 6. File Upload & Image Management Test

```bash
# Verify image upload works:
# 1. Create new post with image
# 2. Check file appears in server/images/
# 3. Verify proper permissions:
ls -la server/images/

# Check image serving:
curl -I http://localhost:4000/images/[filename]
```

### 7. Complete Feature Testing Checklist

- [ ] **Authentication**: Register, login, logout, password reset
- [ ] **Blog Management**: Create, edit, delete posts with images
- [ ] **Social Features**: Comments, likes, real-time updates
- [ ] **AI Features**: Text rephrasing, summarization, semantic search
- [ ] **Meeting System**: Request, approve, join WebRTC meetings
- [ ] **Notifications**: Real-time alerts for all activities
- [ ] **File Management**: Image uploads and serving
- [ ] **Performance**: Redis caching, fast page loads
- [ ] **Cross-Device**: Access from mobile/other devices on WiFi

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed**

```bash
# Check MySQL is running
sudo systemctl status mysql  # Linux
brew services list | grep mysql  # macOS

# Check credentials in server/.env
```

**Redis Connection Failed**

```bash
# Check Redis is running
redis-cli ping

# Check REDIS_URL in server/.env
```

**AI Service Not Working**

```bash
# Check API keys in nova-mind/.env
# Verify virtual environment is activated
# Check Python version: python --version
```

**Email Not Sending**

```bash
# Verify Gmail app password (not regular password)
# Check EMAIL_USER and EMAIL_PASS in server/.env
# Ensure 2FA is enabled on Gmail account
```

### Port Conflicts

If ports are already in use:

- Backend: Change PORT in server/.env
- Frontend: Change port in client/vite.config.js
- AI Service: Use `uvicorn app.main:app --reload --port 8001`

### Permission Issues (Linux/macOS)

```bash
# Fix npm permission issues
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

## 🚨 Advanced Troubleshooting

### Common Redis Issues

```bash
# Redis connection errors:
# 1. Check if Redis is running
brew services list | grep redis  # macOS
systemctl status redis           # Linux

# 2. Test connection
redis-cli ping

# 3. Check Redis logs
tail -f /usr/local/var/log/redis.log  # macOS
tail -f /var/log/redis/redis-server.log  # Linux

# 4. Restart Redis if needed
brew services restart redis      # macOS
sudo systemctl restart redis    # Linux
```

### MySQL Connection Issues

```bash
# Check MySQL status
brew services list | grep mysql  # macOS
systemctl status mysql          # Linux

# Reset MySQL password if needed
mysql -u root -p
ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

# Check MySQL error logs
tail -f /usr/local/var/mysql/*.err  # macOS
tail -f /var/log/mysql/error.log   # Linux
```

### AI Service Issues

```bash
# Python virtual environment issues
which python3
python3 --version

# Reinstall dependencies
pip install --upgrade pip
pip install -r requirement.txt --force-reinstall

# API key validation
python3 -c "import os; print('GROQ_API_KEY set:', bool(os.getenv('GROQ_API_KEY')))"
```

### WebRTC/Meeting Issues

```bash
# Check browser WebRTC support
# Open browser console and run:
navigator.mediaDevices.getUserMedia({video: true, audio: true})

# HTTPS requirement for WebRTC in production:
# WebRTC requires HTTPS in production environments
# Use SSL certificates or tunneling services like ngrok
```

## 🌐 Production Deployment Guide

### 1. Environment Variables for Production

```bash
# Backend (.env)
NODE_ENV=production
HOST=0.0.0.0
PORT=4000
CLIENT_URL=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Frontend (.env)
VITE_API_URL=https://api.yourdomain.com
VITE_NODE_ENV=production
```

### 2. SSL Certificate Setup (Required for WebRTC)

```bash
# Using Let's Encrypt with Certbot
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Or use Cloudflare, AWS Certificate Manager, etc.
```

### 3. Production Database Setup

```bash
# Use managed database services:
# - AWS RDS (MySQL)
# - Google Cloud SQL
# - Azure Database for MySQL
# - DigitalOcean Managed Databases

# Update connection strings in environment files
```

### 4. Production Redis Setup

```bash
# Use managed Redis services:
# - AWS ElastiCache
# - Google Cloud Memorystore
# - Azure Cache for Redis
# - DigitalOcean Managed Redis
```

### 5. Container Deployment (Docker)

```dockerfile
# Example Dockerfile for each service
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

## 🎯 Next Steps & Customization

### 1. Feature Customization

- Modify AI prompts in `nova-mind/app/services.py`
- Customize UI themes in `client/src/index.css`
- Add new API endpoints in `server/src/routes/`
- Extend database schema in `database/Create Table/`

### 2. Performance Optimization

- Configure Redis caching strategies
- Optimize MySQL queries and indexes
- Implement CDN for image serving
- Add database connection pooling

### 3. Security Enhancements

- Implement rate limiting per user
- Add input validation and sanitization
- Set up API authentication headers
- Configure CORS properly for production

### 4. Monitoring & Analytics

- Set up application monitoring (New Relic, DataDog)
- Configure error tracking (Sentry)
- Implement usage analytics
- Set up performance monitoring

## 📞 Support & Resources

### Getting Help

1. **Check logs**: All services log to console/files
2. **Environment verification**: Ensure all `.env` files are correct
3. **Service dependencies**: Verify MySQL, Redis are running
4. **Network access**: Check firewall and port availability
5. **API documentation**: Use Swagger docs for debugging

### Useful Commands Reference

```bash
# Service status checks
ps aux | grep node        # Check Node.js processes
ps aux | grep python      # Check Python processes
netstat -tulpn | grep :4000  # Check port usage
lsof -i :5173            # Check what's using port 5173

# Log monitoring
tail -f server/logs/*.log     # Backend logs
journalctl -u mysql -f       # MySQL logs (Linux)
journalctl -u redis -f       # Redis logs (Linux)
```

### Repository Resources

- 📚 **API Documentation**: http://localhost:4000/api-docs
- 🗄️ **Database Schema**: `database/Create Table/blogapp.sql`
- 📊 **Sample Data**: `database/Sample data/`
- 🖼️ **Test Images**: `database/Images/`
- 📝 **Project Structure**: See README.md
