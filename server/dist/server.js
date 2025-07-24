"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const http_1 = require("http");
const config_1 = __importDefault(require("./config"));
const utils_1 = require("./utils");
const middleware_1 = require("./middleware");
const swagger_1 = require("./config/swagger");
const socketService_1 = require("./services/socketService");
const redis_1 = require("./config/redis");
// Import routes
const users_1 = __importDefault(require("./routes/users"));
const posts_1 = __importDefault(require("./routes/posts"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const PORT = config_1.default.server.port;
// Initialize middleware instances
const requestLogger = new middleware_1.RequestLogger();
const rateLimiter = new middleware_1.RateLimiter();
// Basic middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: "10mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "10mb" }));
// Trust proxy for proper IP addresses
app.set("trust proxy", true);
// Global rate limiting
app.use(rateLimiter.apiRateLimit());
// Request logging middleware
app.use(middleware_1.RequestLogger.requestLogger());
app.use(middleware_1.RequestLogger.performanceLogger());
// Custom morgan format for console logging
app.use((0, morgan_1.default)(":method :url :status :res[content-length] - :response-time ms"));
// Serve static files (images)
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "..", "src/images")));
// Health check endpoint
app.get("/health", (req, res) => {
    res.json((0, utils_1.successMessage)({
        status: "healthy",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || "development",
    }));
});
// Authentication middleware for protected routes
app.use((req, res, next) => {
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
    const isGetLikesRoute = req.method === "GET" && pathname.startsWith("/posts/likes/");
    const isPublicRoute = publicRoutes.includes(pathname) ||
        publicPathPatterns.some((pattern) => pathname.startsWith(pattern)) ||
        isGetLikesRoute ||
        pathname === "/api-docs.json";
    if (isPublicRoute) {
        next();
    }
    else {
        // Apply authentication middleware
        middleware_1.AuthMiddleware.verifyToken(req, res, next);
    }
});
// API Routes
app.use("/user", users_1.default);
app.use("/posts", posts_1.default);
app.use("/notifications", notifications_1.default);
// Swagger Documentation
app.use("/api-docs", swagger_1.swaggerUi.serve);
app.get("/api-docs", swagger_1.swaggerUi.setup(swagger_1.swaggerSpec, swagger_1.swaggerUiOptions));
app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swagger_1.swaggerSpec);
});
// Error handling middleware
app.use(middleware_1.RequestLogger.errorLogger());
app.use(middleware_1.ErrorHandler.globalErrorHandler);
// 404 handler (must be last)
app.use(middleware_1.ErrorHandler.notFoundHandler);
// Handle uncaught exceptions
middleware_1.ErrorHandler.handleUncaughtExceptions();
// Graceful shutdown handling
const gracefulShutdown = async (signal) => {
    console.log(`Received ${signal}. Graceful shutdown...`);
    // Cleanup rate limiter
    rateLimiter.destroy();
    // Clean up old logs
    middleware_1.RequestLogger.cleanupOldLogs(30);
    // Disconnect Redis
    try {
        await redis_1.redisService.disconnect();
        console.log("Redis disconnected");
    }
    catch (error) {
        console.error("Error disconnecting Redis:", error);
    }
    process.exit(0);
};
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
// Initialize services and start server
async function startServer() {
    try {
        // Initialize Redis
        await redis_1.redisService.connect();
        console.log("✅ Redis connected successfully");
        // Initialize Socket.io
        socketService_1.socketService.initialize(httpServer);
        console.log("✅ Socket.io initialized successfully");
        // Start server
        httpServer.listen(PORT, () => {
            console.log(`🚀 Server is running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
            console.log(`📝 API Documentation: http://localhost:${PORT}/api-docs`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`🔌 Socket.io ready for connections`);
        });
    }
    catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}
// Start the server
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map