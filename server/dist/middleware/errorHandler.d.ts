import { Request, Response, NextFunction } from "express";
import { DatabaseError } from "../types";
export declare class ErrorHandler {
    /**
     * Database Error Handler
     */
    static handleDatabaseError(error: DatabaseError): string;
    /**
     * JWT Error Handler
     */
    static handleJWTError(error: Error): string;
    /**
     * File Upload Error Handler
     */
    static handleMulterError(error: any): string;
    /**
     * Validation Error Handler
     */
    static handleValidationError(error: Error): string;
    /**
     * Generic Error Handler
     */
    static handleGenericError(error: Error): string;
    /**
     * Async Error Handler Wrapper
     */
    static asyncErrorHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Async Handler (alias for backward compatibility)
     */
    static asyncHandler: typeof ErrorHandler.asyncErrorHandler;
    /**
     * Global Error Handler Middleware
     */
    static globalErrorHandler(error: Error, req: Request, res: Response, next: NextFunction): void;
    /**
     * 404 Not Found Handler
     */
    static notFoundHandler(req: Request, res: Response): void;
    /**
     * Handle uncaught exceptions
     */
    static handleUncaughtExceptions(): void;
}
export default ErrorHandler;
//# sourceMappingURL=errorHandler.d.ts.map