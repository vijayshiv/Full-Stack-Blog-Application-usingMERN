const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const config = require("./config/index");
const jwt = require("jsonwebtoken");
const path = require("path");
const utils = require("./utils");
const { ErrorHandler, RequestLogger, RateLimiter } = require("./middleware");
const { swaggerSpec, swaggerUi, swaggerUiOptions } = require("./config/swagger");

const PORT = config.server.port;

// Initialize middleware instances
const requestLogger = new RequestLogger();
const rateLimiter = new RateLimiter();

// Basic middleware
app.use(cors("*"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for proper IP addresses
app.set('trust proxy', true);

// Global rate limiting
app.use(rateLimiter.generalRateLimit());

// Request logging middleware
app.use(requestLogger.requestLogger());

// Custom morgan format for console logging
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Authentication middleware
app.use((req, res, next) => {
  console.log(`Incoming request to ${req.url}`);
  if (
    req.url === "/user/check-email" ||
    req.url === "/user/login" ||
    req.url === "/user/register" ||
    req.url === "/user/forgot-password" ||
    req.url === "/user/reset-password" ||
    req.url === "/posts/all" ||
    req.url.startsWith("/posts/post/") ||
    req.url.startsWith("/posts/search") ||
    req.url.startsWith("/posts/by-category/") ||
    req.url.startsWith("/posts/likes/") ||
    req.url.startsWith("/posts/comments/") ||
    req.url.startsWith("/images/") ||
    req.url.startsWith("/api-docs") ||
    req.url === "/api-docs.json" ||
    req.url === "/health"
  ) {
    next();
  } else {
    const token = req.headers["token"];
    if (!token || token.length == 0) {
      res.status(401).json(utils.errorMessage("Missing Token"));
    } else {
      try {
        const payload = jwt.verify(token, config.secretKey);
        req.user = payload;
        
        // Log successful authentication
        RequestLogger.authLogger(req, res, () => {});
        next();
      } catch (ex) {
        // Log failed authentication attempt
        RequestLogger.securityLogger('failed_token_verification', {
          ip: req.ip,
          url: req.url,
          token: token.substring(0, 10) + '...',
          error: ex.message
        });
        res.status(401).json(utils.errorMessage("Invalid Token"));
      }
    }
  }
});

// Routes
const userRouter = require("./routes/users");
app.use("/user", userRouter);

const postRouter = require("./routes/posts");
app.use("/posts", postRouter);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [System]
 *     description: Check if the API is running and healthy
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Blog API is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-07-23T20:30:45.123Z"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 */
// Health check endpoint for API testing
app.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'Blog API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Swagger JSON endpoint
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Serve static images from the 'images' folder
app.use("/images", express.static(path.join(__dirname, "images")));

// Error logging middleware
app.use(requestLogger.errorLogger());

// Global error handler
app.use(ErrorHandler.globalErrorHandler);

// 404 handler for undefined routes
app.use('*', ErrorHandler.notFoundHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server started on PORT: ${PORT}`);
  console.log(`📊 Environment: ${config.server.nodeEnv}`);
  console.log(`🔒 Security: Rate limiting enabled`);
  console.log(`📝 Logging: Request/Error logging enabled`);
  console.log(`✅ Validation: Input validation enabled`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`📋 API JSON: http://localhost:${PORT}/api-docs.json`);
});
