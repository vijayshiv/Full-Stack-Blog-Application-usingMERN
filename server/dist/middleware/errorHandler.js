"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
class ErrorHandler {
    /**
     * Database Error Handler
     */
    static handleDatabaseError(error) {
        console.error("Database Error:", error);
        if (error.code === "ER_DUP_ENTRY") {
            if (error.message.includes("email")) {
                return "Email already exists. Please use a different email address.";
            }
            return "Duplicate entry found.";
        }
        if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return "Referenced item not found.";
        }
        if (error.code === "ECONNREFUSED") {
            return "Database connection failed. Please try again later.";
        }
        return "Database operation failed. Please try again.";
    }
    /**
     * JWT Error Handler
     */
    static handleJWTError(error) {
        console.error("JWT Error:", error);
        if (error.name === "JsonWebTokenError") {
            return "Invalid authentication token.";
        }
        if (error.name === "TokenExpiredError") {
            return "Authentication token has expired. Please login again.";
        }
        return "Authentication failed.";
    }
    /**
     * File Upload Error Handler
     */
    static handleMulterError(error) {
        console.error("File Upload Error:", error);
        if (error.code === "LIMIT_FILE_SIZE") {
            return "File size too large. Maximum size allowed is 5MB.";
        }
        if (error.code === "LIMIT_FILE_COUNT") {
            return "Too many files uploaded.";
        }
        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return "Unexpected file field.";
        }
        return "File upload failed.";
    }
    /**
     * Validation Error Handler
     */
    static handleValidationError(error) {
        console.error("Validation Error:", error);
        return error.message || "Validation failed.";
    }
    /**
     * Generic Error Handler
     */
    static handleGenericError(error) {
        console.error("Generic Error:", error);
        // Don't expose internal errors in production
        if (process.env.NODE_ENV === "production") {
            return "An unexpected error occurred. Please try again.";
        }
        return error.message || "An unexpected error occurred.";
    }
    /**
     * Async Error Handler Wrapper
     */
    static asyncErrorHandler(fn) {
        return (req, res, next) => {
            Promise.resolve(fn(req, res, next)).catch((error) => {
                console.error("Async Error:", error);
                let errorMessage;
                // Determine error type and handle accordingly
                if (error.name === "JsonWebTokenError" ||
                    error.name === "TokenExpiredError") {
                    errorMessage = ErrorHandler.handleJWTError(error);
                    res.status(401).json({ status: "error", error: errorMessage });
                }
                else if (error.code) {
                    errorMessage = ErrorHandler.handleDatabaseError(error);
                    res.status(500).json({ status: "error", error: errorMessage });
                }
                else if (error.message?.includes("validation") ||
                    error.message?.includes("required")) {
                    errorMessage = ErrorHandler.handleValidationError(error);
                    res.status(400).json({ status: "error", error: errorMessage });
                }
                else {
                    errorMessage = ErrorHandler.handleGenericError(error);
                    res.status(500).json({ status: "error", error: errorMessage });
                }
            });
        };
    }
    /**
     * Global Error Handler Middleware
     */
    static globalErrorHandler(error, req, res, next) {
        console.error("Global Error Handler:", error);
        // If response was already sent, delegate to Express default error handler
        if (res.headersSent) {
            next(error);
            return;
        }
        let statusCode = 500;
        let errorMessage;
        // Determine error type and status code
        if (error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError") {
            statusCode = 401;
            errorMessage = ErrorHandler.handleJWTError(error);
        }
        else if (error.code) {
            statusCode = 500;
            errorMessage = ErrorHandler.handleDatabaseError(error);
        }
        else if (error.message?.includes("validation") ||
            error.message?.includes("required")) {
            statusCode = 400;
            errorMessage = ErrorHandler.handleValidationError(error);
        }
        else if (error.name === "MulterError") {
            statusCode = 400;
            errorMessage = ErrorHandler.handleMulterError(error);
        }
        else {
            statusCode = 500;
            errorMessage = ErrorHandler.handleGenericError(error);
        }
        res.status(statusCode).json({
            status: "error",
            error: errorMessage,
            ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        });
    }
    /**
     * 404 Not Found Handler
     */
    static notFoundHandler(req, res) {
        res.status(404).json({
            status: "error",
            error: `Route ${req.method} ${req.path} not found`,
        });
    }
    /**
     * Handle uncaught exceptions
     */
    static handleUncaughtExceptions() {
        process.on("uncaughtException", (error) => {
            console.error("Uncaught Exception:", error);
            process.exit(1);
        });
        process.on("unhandledRejection", (reason, promise) => {
            console.error("Unhandled Rejection at:", promise, "reason:", reason);
            process.exit(1);
        });
    }
}
exports.ErrorHandler = ErrorHandler;
/**
 * Async Handler (alias for backward compatibility)
 */
ErrorHandler.asyncHandler = ErrorHandler.asyncErrorHandler;
exports.default = ErrorHandler;
//# sourceMappingURL=errorHandler.js.map