import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
import config from "./config";
import { successMessage, errorMessage } from "./utils";
import {
  AuthMiddleware,
  ErrorHandler,
  RequestLogger,
  RateLimiter,
} from "./middleware";
import { swaggerSpec, swaggerUi, swaggerUiOptions } from "./config/swagger";

// Import routes
import userRoutes from "./routes/users";
import postRoutes from "./routes/posts";

const app: Express = express();
const PORT = config.server.port;

// Initialize middleware instances
const requestLogger = new RequestLogger();
const rateLimiter = new RateLimiter();

// Basic middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Trust proxy for proper IP addresses
app.set("trust proxy", true);

// Global rate limiting
app.use(rateLimiter.apiRateLimit());

// Request logging middleware
app.use(RequestLogger.requestLogger());
app.use(RequestLogger.performanceLogger());

// Custom morgan format for console logging
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

// Serve static files (images)
app.use("/images", express.static(path.join(__dirname, "..", "src/images")));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json(
    successMessage({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    })
  );
});

// Authentication middleware for protected routes
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Incoming request to ${req.url}`);

  // Extract the pathname without query parameters for route matching
  const pathname = req.url.split("?")[0];

  // Public routes that don't require authentication
  const publicRoutes = [
    "/user/check-email",
    "/user/login",
    "/user/register",
    "/user/forgot-password",
    "/user/reset-password",
    "/posts/all",
    "/posts/categories",
    "/health",
  ];

  // Check if route starts with public path patterns
  const publicPathPatterns = [
    "/posts/post/",
    "/posts/search",
    "/posts/by-category/",
    "/posts/is-liked/",
    "/posts/comments/",
    "/images/",
    "/api-docs",
    "/health",
  ];

  // Special case for GET /posts/likes/ - only GET requests should be public
  const isGetLikesRoute =
    req.method === "GET" && pathname.startsWith("/posts/likes/");

  const isPublicRoute =
    publicRoutes.includes(pathname) ||
    publicPathPatterns.some((pattern) => pathname.startsWith(pattern)) ||
    isGetLikesRoute ||
    pathname === "/api-docs.json";

  if (isPublicRoute) {
    next();
  } else {
    // Apply authentication middleware
    AuthMiddleware.verifyToken(req, res, next);
  }
});

// API Routes
app.use("/user", userRoutes);
app.use("/posts", postRoutes);

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(swaggerSpec, swaggerUiOptions));
app.get("/api-docs.json", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

// Error handling middleware
app.use(RequestLogger.errorLogger());
app.use(ErrorHandler.globalErrorHandler);

// 404 handler (must be last)
app.use(ErrorHandler.notFoundHandler);

// Handle uncaught exceptions
ErrorHandler.handleUncaughtExceptions();

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Graceful shutdown...`);

  // Cleanup rate limiter
  rateLimiter.destroy();

  // Clean up old logs
  RequestLogger.cleanupOldLogs(30);

  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

export default app;
