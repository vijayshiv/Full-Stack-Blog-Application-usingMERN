# Redis Setup Guide for Comment Threading Feature

## 🚀 Quick Redis Installation

### For macOS (using Homebrew):

```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Check if Redis is running
redis-cli ping
# Should return: PONG
```

### For Windows:

```bash
# Option 1: Using Docker (Recommended)
docker run -d --name redis-blog -p 6379:6379 redis:latest

# Option 2: Download from GitHub releases
# https://github.com/tporadowski/redis/releases
# Download and run the installer
```

### For Linux (Ubuntu/Debian):

```bash
# Install Redis
sudo apt update
sudo apt install redis-server

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Check if Redis is running
redis-cli ping
# Should return: PONG
```

## 🔧 Configuration

### Environment Variables

Create or update your `.env` file in the server directory:

```env
# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
# REDIS_PASSWORD=your_password_if_needed

# Client URL for Socket.io CORS
CLIENT_URL=http://localhost:5173
```

### Test Redis Connection

```bash
# Connect to Redis CLI
redis-cli

# Test basic commands
127.0.0.1:6379> set test "Hello Redis"
OK
127.0.0.1:6379> get test
"Hello Redis"
127.0.0.1:6379> exit
```

## 🏃‍♂️ Running the Enhanced Server

1. **Apply Database Migration**:

   ```bash
   # Connect to your MySQL database and run:
   mysql -u your_username -p your_database < database/comment_threading_migration.sql
   ```

2. **Install Dependencies**:

   ```bash
   cd server
   npm install
   ```

3. **Start the Server**:

   ```bash
   npm run dev
   ```

4. **Verify Setup**:
   - Check terminal for "✅ Redis connected successfully"
   - Check terminal for "✅ Socket.io initialized successfully"
   - Visit `http://localhost:4000/health` to confirm server is running

## 🧪 Testing the Comment Threading API

### 1. Get Comment Threads

```bash
curl -X GET "http://localhost:4000/posts/comments/threads/1"
```

### 2. Add a Comment

```bash
curl -X POST "http://localhost:4000/posts/comments/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content": "This is a test comment!"}'
```

### 3. Add a Reply

```bash
curl -X POST "http://localhost:4000/posts/comments/1/reply/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"content": "This is a reply to comment 1!"}'
```

## 🔌 WebSocket Testing

### Using a WebSocket Client:

```javascript
// In browser console or JavaScript file
const socket = io("http://localhost:4000", {
  auth: {
    token: "YOUR_JWT_TOKEN",
  },
});

// Join a post room
socket.emit("join_post", 1);

// Listen for new comments
socket.on("new_comment", (comment) => {
  console.log("New comment:", comment);
});

// Listen for replies
socket.on("new_reply", (reply) => {
  console.log("New reply:", reply);
});
```

## 🚨 Troubleshooting

### Redis Connection Issues:

1. **Check if Redis is running**: `redis-cli ping`
2. **Check port**: Make sure port 6379 is not blocked
3. **Check logs**: Look for Redis connection errors in server console

### Socket.io Issues:

1. **Check CORS**: Verify CLIENT_URL in environment variables
2. **Check Authentication**: Ensure JWT token is valid
3. **Check Network**: Verify port 4000 is accessible

### Database Issues:

1. **Run Migration**: Ensure the database migration was applied
2. **Check Foreign Keys**: Verify parent_comment_id references are working
3. **Check User Permissions**: Ensure database user has proper permissions

## 🎯 Next Steps

Once everything is working:

1. Test comment threading in your frontend
2. Implement real-time notifications UI
3. Add meeting request functionality
4. Move to Phase 2: AI Content Rephrasing

## 📊 Monitoring

### Redis Commands for Monitoring:

```bash
# Check connected clients
redis-cli client list

# Monitor real-time commands
redis-cli monitor

# Check memory usage
redis-cli info memory

# List all keys (be careful in production)
redis-cli keys "*"
```

### Server Logs to Watch:

- "✅ Redis connected successfully"
- "✅ Socket.io initialized successfully"
- "User X connected via Socket.io"
- "New comment emitted to post Y"
