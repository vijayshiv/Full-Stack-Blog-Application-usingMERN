import { Request, Response, NextFunction } from "express";
import { RateLimitOptions } from "../types";
export declare class RateLimiter {
    private store;
    private cleanupInterval;
    constructor();
    /**
     * Cleanup expired entries every 5 minutes
     */
    private cleanup;
    /**
     * Get key for rate limiting (IP + endpoint)
     */
    private getKey;
    /**
     * Generic rate limiter
     */
    createRateLimit(options?: Partial<RateLimitOptions>): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Authentication rate limiting (stricter)
     */
    authRateLimit(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * API rate limiting (general)
     */
    apiRateLimit(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * User-specific rate limiting
     */
    userRateLimit(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Password reset rate limiting (very strict)
     */
    passwordResetRateLimit(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * File upload rate limiting
     */
    uploadRateLimit(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Search rate limiting
     */
    searchRateLimit(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Comment rate limiting
     */
    commentRateLimit(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Post creation rate limiting
     */
    postCreationRateLimit(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Post rate limiting (alias for postCreationRateLimit)
     */
    postRateLimit(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Get current rate limit status for a key
     */
    getStatus(req: Request, identifier?: "ip" | "user"): {
        limit: number;
        remaining: number;
        resetTime: number;
    } | null;
    /**
     * Reset rate limit for a specific key (admin function)
     */
    resetLimit(req: Request, identifier?: "ip" | "user"): void;
    /**
     * Cleanup method to be called when shutting down
     */
    destroy(): void;
    /**
     * Get store statistics (for monitoring)
     */
    getStats(): {
        totalKeys: number;
        activeKeys: number;
        expiredKeys: number;
    };
}
export default RateLimiter;
//# sourceMappingURL=rateLimiter.d.ts.map