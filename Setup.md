# Complete Setup Guide

This guide will help you set up the entire blog application with all features including AI capabilities.

## 📋 Prerequisites

### Required Software

- **Node.js** 16.0+ and npm
- **MySQL** 8.0+
- **Redis** server
- **Python** 3.8+ (for AI service)
- **Git**

### API Keys Needed

- **Groq API Key** (free): https://console.groq.com
- **OpenAI API Key** (optional): https://platform.openai.com
- **Gmail App Password** (for email features)

## 🗄️ Database Setup

### 1. Install MySQL

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

### 2. Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create the database and import schema
CREATE DATABASE blogapp;
exit

# Import the complete schema
mysql -u root -p blogapp < database/blogapp_complete.sql
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

## ⚙️ Environment Configuration

### 1. Server Environment (.env in server/)

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=blogapp

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

# Server Configuration
PORT=4000
NODE_ENV=development

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379

# Client URL for CORS
CLIENT_URL=http://localhost:5173

# AI Service
AI_SERVICE_URL=http://localhost:8000
```

### 2. Client Environment (.env in client/)

```env
# API Configuration
VITE_API_URL=http://localhost:4000
VITE_APP_NAME=Blog Application
VITE_NODE_ENV=development
```

### 3. AI Service Environment (.env in nova-mind/)

```env
# AI Provider API Keys
GROQ_API_KEY=your_groq_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Service Configuration
SECRET_KEY=your_secret_key
DEBUG=true

# Redis Configuration
REDIS_URL=redis://localhost:6379/0
```

## 📧 Email Setup (Gmail)

### 1. Enable 2-Factor Authentication

- Go to your Google Account settings
- Enable 2-Factor Authentication

### 2. Generate App Password

- Go to Google Account > Security > App passwords
- Generate a new app password for "Mail"
- Use this password in EMAIL_PASS (not your regular Gmail password)

## 🚀 Installation & Running

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd Full-Stack-Blog-Application-usingMERN
```

### 2. Backend Setup

```bash
cd server
npm install
npm run dev
```

✅ Server should start on http://localhost:4000

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

✅ Client should start on http://localhost:5173

### 4. AI Service Setup

```bash
cd nova-mind
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirement.txt

# Start the service
uvicorn app.main:app --reload
```

✅ AI service should start on http://localhost:8000

## ✅ Verification Steps

### 1. Check All Services

- Backend: http://localhost:4000/health
- Frontend: http://localhost:5173
- AI Service: http://localhost:8000/health

### 2. Test Database Connection

- Register a new user
- Create a test blog post
- Verify data appears in MySQL

### 3. Test Redis Connection

- Check server logs for "Redis connected successfully"
- Test real-time features (comments, likes)

### 4. Test AI Features

- Create/edit a blog post
- Select some text and click "AI Rephrase"
- Verify AI responses work

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

## 🎯 Next Steps

After successful setup:

1. Import sample data from database/Sample data/ (optional)
2. Customize the application for your needs
3. Configure production environment variables
4. Set up SSL certificates for production
5. Configure cloud database and Redis for scaling

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Ensure all prerequisite software is installed
4. Check server logs for detailed error messages
