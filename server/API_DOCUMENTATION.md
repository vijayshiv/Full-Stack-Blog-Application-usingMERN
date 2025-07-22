# Blog Application API Documentation

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MySQL Database
- NPM or Yarn

### Installation

```bash
cd server
npm install
node server.js
```

## 📚 API Documentation

### Interactive Documentation

Visit [http://localhost:4000/api-docs](http://localhost:4000/api-docs) for interactive Swagger UI documentation.

### API JSON Schema

Download the OpenAPI 3.0 specification: [http://localhost:4000/api-docs.json](http://localhost:4000/api-docs.json)

## 🔗 Quick Links

### Health Check

```bash
GET /health
```

Simple endpoint to verify API is running.

### Public Endpoints (No Authentication Required)

- `POST /user/register` - Register new user
- `POST /user/login` - User login
- `POST /user/check-email` - Check if email exists
- `GET /posts/all` - Get all posts
- `GET /posts/post/:id` - Get specific post
- `GET /posts/by-category/:category` - Get posts by category
- `GET /posts/search` - Search posts
- `GET /posts/likes/:postId` - Get post likes count
- `GET /posts/comments/:postId` - Get post comments

### Protected Endpoints (Authentication Required)

- `GET /user/details` - Get user details
- `PUT /user/update` - Update user profile
- `POST /user/delete` - Delete user account
- `POST /posts/add-post` - Create new post
- `PUT /posts/update-post/:postId` - Update post
- `DELETE /posts/delete-post/:postId` - Delete post
- `GET /posts/my-all-post` - Get user's posts
- `POST /posts/like/:postId` - Like/Unlike post
- `GET /posts/is-liked/:postId` - Check if user liked post
- `POST /posts/comment/:postId` - Add comment

## 🔐 Authentication

### JWT Token Authentication

Include the JWT token in the request header:

```
token: your-jwt-token-here
```

### Getting a Token

1. Register: `POST /user/register`
2. Login: `POST /user/login`
3. Use the returned token in subsequent requests

## 📝 Request/Response Format

### Success Response

```json
{
  "status": "success",
  "data": { ... }
}
```

### Error Response

```json
{
  "status": "error",
  "error": "Error message"
}
```

## 🔒 Security Features

### Rate Limiting

- **General API**: 1000 requests per 15 minutes
- **Authentication**: 10 attempts per 15 minutes
- **Password Reset**: 5 attempts per hour
- **Post Creation**: 10 posts per hour per user
- **Comments**: 30 comments per 15 minutes
- **Likes**: 100 actions per 15 minutes

### Input Validation

All endpoints include comprehensive input validation:

- Email format validation
- Password strength requirements
- Content length limits
- SQL injection prevention
- XSS protection

### Error Handling

- Database error handling
- JWT token validation
- File upload error handling
- Global error catching
- Detailed error messages

## 📊 Logging & Monitoring

### Request Logging

All requests are logged with:

- Timestamp
- Method and URL
- IP address
- Response time
- Status code

### Log Files

- `logs/requests.log` - All requests/responses
- `logs/auth.log` - Authentication events
- `logs/errors.log` - Error details
- `logs/security.log` - Security events

## 🛠️ Development

### Architecture

- **Repository Layer**: Data access
- **Service Layer**: Business logic
- **Controller Layer**: HTTP handling
- **Middleware Layer**: Validation, auth, logging

### Testing Endpoints

Test the API using curl, Postman, or the Swagger UI:

```bash
# Health check
curl http://localhost:4000/health

# Register user
curl -X POST http://localhost:4000/user/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":"John Doe","email":"john@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:4000/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get all posts
curl http://localhost:4000/posts/all
```

## 📋 Environment Configuration

Create a `.env` file or set environment variables:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=blogapp
JWT_SECRET=your-secret-key
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
PORT=4000
NODE_ENV=development
```

## 🚀 Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secret
- [ ] Configure proper CORS settings
- [ ] Set up SSL/HTTPS
- [ ] Use production database
- [ ] Configure proper logging
- [ ] Set up monitoring

## 📞 Support

For API support or questions:

- Email: support@blogapp.com
- Documentation: http://localhost:4000/api-docs
- Health Check: http://localhost:4000/health

---

**Note**: This is a free, open-source API documentation. No paid services required!
