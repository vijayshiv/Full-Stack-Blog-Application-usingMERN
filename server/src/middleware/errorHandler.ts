import { Request, Response, NextFunction } from "express";
import { errorMessage } from "../utils";
import { DatabaseError } from "../types";

export class ErrorHandler {
  /**
   * Database Error Handler
   */
  static handleDatabaseError(error: DatabaseError): string {
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
  static handleJWTError(error: Error): string {
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
  static handleMulterError(error: any): string {
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
  static handleValidationError(error: Error): string {
    console.error("Validation Error:", error);
    return error.message || "Validation failed.";
  }

  /**
   * Generic Error Handler
   */
  static handleGenericError(error: Error): string {
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
  static asyncErrorHandler(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
  ) {
    return (req: Request, res: Response, next: NextFunction): void => {
      Promise.resolve(fn(req, res, next)).catch((error: Error) => {
        console.error("Async Error:", error);

        let errorMessage: string;

        // Determine error type and handle accordingly
        if (
          error.name === "JsonWebTokenError" ||
          error.name === "TokenExpiredError"
        ) {
          errorMessage = ErrorHandler.handleJWTError(error);
          res.status(401).json({ status: "error", error: errorMessage });
        } else if ((error as DatabaseError).code) {
          errorMessage = ErrorHandler.handleDatabaseError(
            error as DatabaseError
          );
          res.status(500).json({ status: "error", error: errorMessage });
        } else if (
          error.message?.includes("validation") ||
          error.message?.includes("required")
        ) {
          errorMessage = ErrorHandler.handleValidationError(error);
          res.status(400).json({ status: "error", error: errorMessage });
        } else {
          errorMessage = ErrorHandler.handleGenericError(error);
          res.status(500).json({ status: "error", error: errorMessage });
        }
      });
    };
  }

  /**
   * Async Handler (alias for backward compatibility)
   */
  static asyncHandler = ErrorHandler.asyncErrorHandler;

  /**
   * Global Error Handler Middleware
   */
  static globalErrorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    console.error("Global Error Handler:", error);

    // If response was already sent, delegate to Express default error handler
    if (res.headersSent) {
      next(error);
      return;
    }

    let statusCode = 500;
    let errorMessage: string;

    // Determine error type and status code
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      statusCode = 401;
      errorMessage = ErrorHandler.handleJWTError(error);
    } else if ((error as DatabaseError).code) {
      statusCode = 500;
      errorMessage = ErrorHandler.handleDatabaseError(error as DatabaseError);
    } else if (
      error.message?.includes("validation") ||
      error.message?.includes("required")
    ) {
      statusCode = 400;
      errorMessage = ErrorHandler.handleValidationError(error);
    } else if (error.name === "MulterError") {
      statusCode = 400;
      errorMessage = ErrorHandler.handleMulterError(error);
    } else {
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
  static notFoundHandler(req: Request, res: Response): void {
    res.status(404).json({
      status: "error",
      error: `Route ${req.method} ${req.path} not found`,
    });
  }

  /**
   * Handle uncaught exceptions
   */
  static handleUncaughtExceptions(): void {
    process.on("uncaughtException", (error: Error) => {
      console.error("Uncaught Exception:", error);
      process.exit(1);
    });

    process.on(
      "unhandledRejection",
      (reason: unknown, promise: Promise<unknown>) => {
        console.error("Unhandled Rejection at:", promise, "reason:", reason);
        process.exit(1);
      }
    );
  }
}

export default ErrorHandler;
