import { Request, Response, NextFunction } from "express";
import { errorMessage } from "../utils";
import { RateLimitOptions } from "../types";

interface RateLimitData {
  count: number;
  resetTime: number;
  firstRequest: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitData>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // In-memory store for rate limiting (in production, use Redis)
    this.store = new Map();
    this.cleanup();
  }

  /**
   * Cleanup expired entries every 5 minutes
   */
  private cleanup(): void {
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.store.entries()) {
        if (now > data.resetTime) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  /**
   * Get key for rate limiting (IP + endpoint)
   */
  private getKey(req: Request, identifier: "ip" | "user" = "ip"): string {
    let key = "";

    if (identifier === "ip") {
      key = req.ip || (req.connection as any)?.remoteAddress || "unknown";
    } else if (identifier === "user" && req.user) {
      key = `user_${req.user.id}`;
    } else {
      key = req.ip || (req.connection as any)?.remoteAddress || "unknown";
    }

    return `${key}_${(req.route as any)?.path || req.path}`;
  }

  /**
   * Generic rate limiter
   */
  createRateLimit(options: Partial<RateLimitOptions> = {}) {
    const defaultOptions: RateLimitOptions = {
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: "Too many requests, please try again later",
      identifier: "ip",
      skipSuccessfulRequests: false,
    };

    const config = { ...defaultOptions, ...options };

    return (req: Request, res: Response, next: NextFunction): void => {
      const key = this.getKey(req, config.identifier);
      const now = Date.now();
      const windowStart = now - config.windowMs;

      let data = this.store.get(key);

      // Initialize or reset if window expired
      if (!data || data.resetTime <= now) {
        data = {
          count: 0,
          resetTime: now + config.windowMs,
          firstRequest: now,
        };
      }

      // Check if request should be counted
      const shouldCount =
        !config.skipSuccessfulRequests || res.statusCode >= 400;

      if (shouldCount) {
        data.count++;
      }

      // Update store
      this.store.set(key, data);

      // Set headers
      res.setHeader("X-RateLimit-Limit", config.maxRequests);
      res.setHeader(
        "X-RateLimit-Remaining",
        Math.max(0, config.maxRequests - data.count)
      );
      res.setHeader("X-RateLimit-Reset", Math.ceil(data.resetTime / 1000));

      // Check if limit exceeded
      if (data.count > config.maxRequests) {
        res.status(429).json(errorMessage(config.message));
        return;
      }

      next();
    };
  }

  /**
   * Authentication rate limiting (stricter)
   */
  authRateLimit() {
    return this.createRateLimit({
      maxRequests: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message:
        "Too many authentication attempts, please try again in 15 minutes",
      identifier: "ip",
    });
  }

  /**
   * API rate limiting (general)
   */
  apiRateLimit() {
    return this.createRateLimit({
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: "Too many API requests, please try again later",
      identifier: "ip",
    });
  }

  /**
   * User-specific rate limiting
   */
  userRateLimit() {
    return this.createRateLimit({
      maxRequests: 1000,
      windowMs: 60 * 60 * 1000, // 1 hour
      message: "User request limit exceeded, please try again later",
      identifier: "user",
    });
  }

  /**
   * Password reset rate limiting (very strict)
   */
  passwordResetRateLimit() {
    return this.createRateLimit({
      maxRequests: 3,
      windowMs: 60 * 60 * 1000, // 1 hour
      message: "Too many password reset attempts, please try again in 1 hour",
      identifier: "ip",
    });
  }

  /**
   * File upload rate limiting
   */
  uploadRateLimit() {
    return this.createRateLimit({
      maxRequests: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      message: "Upload limit exceeded, please try again later",
      identifier: "user",
    });
  }

  /**
   * Search rate limiting
   */
  searchRateLimit() {
    return this.createRateLimit({
      maxRequests: 50,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: "Search limit exceeded, please try again later",
      identifier: "ip",
    });
  }

  /**
   * Comment rate limiting
   */
  commentRateLimit() {
    return this.createRateLimit({
      maxRequests: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
      message: "Comment limit exceeded, please try again later",
      identifier: "user",
    });
  }

  /**
   * Post creation rate limiting
   */
  postCreationRateLimit() {
    return this.createRateLimit({
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
      message: "Post creation limit exceeded, please try again later",
      identifier: "user",
    });
  }

  /**
   * Post rate limiting (alias for postCreationRateLimit)
   */
  postRateLimit() {
    return this.postCreationRateLimit();
  }

  /**
   * Get current rate limit status for a key
   */
  getStatus(
    req: Request,
    identifier: "ip" | "user" = "ip"
  ): {
    limit: number;
    remaining: number;
    resetTime: number;
  } | null {
    const key = this.getKey(req, identifier);
    const data = this.store.get(key);

    if (!data) {
      return null;
    }

    return {
      limit: 100, // Default, should be passed as parameter
      remaining: Math.max(0, 100 - data.count),
      resetTime: data.resetTime,
    };
  }

  /**
   * Reset rate limit for a specific key (admin function)
   */
  resetLimit(req: Request, identifier: "ip" | "user" = "ip"): void {
    const key = this.getKey(req, identifier);
    this.store.delete(key);
  }

  /**
   * Cleanup method to be called when shutting down
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }

  /**
   * Get store statistics (for monitoring)
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    expiredKeys: number;
  } {
    const now = Date.now();
    let activeKeys = 0;
    let expiredKeys = 0;

    for (const [, data] of this.store.entries()) {
      if (now > data.resetTime) {
        expiredKeys++;
      } else {
        activeKeys++;
      }
    }

    return {
      totalKeys: this.store.size,
      activeKeys,
      expiredKeys,
    };
  }
}

export default RateLimiter;
