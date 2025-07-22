const utils = require('../utils');

class RateLimiter {
  
  constructor() {
    // In-memory store for rate limiting (in production, use Redis)
    this.store = new Map();
    this.cleanup();
  }

  // Cleanup expired entries every 5 minutes
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.store.entries()) {
        if (now > data.resetTime) {
          this.store.delete(key);
        }
      }
    }, 5 * 60 * 1000); // 5 minutes
  }

  // Get key for rate limiting (IP + endpoint)
  getKey(req, identifier = 'ip') {
    let key = '';
    
    if (identifier === 'ip') {
      key = req.ip || req.connection.remoteAddress || 'unknown';
    } else if (identifier === 'user' && req.user) {
      key = `user_${req.user.id}`;
    } else {
      key = req.ip || req.connection.remoteAddress || 'unknown';
    }
    
    return `${key}_${req.route?.path || req.path}`;
  }

  // Generic rate limiter
  createRateLimit(options = {}) {
    const {
      maxRequests = 100,
      windowMs = 15 * 60 * 1000, // 15 minutes
      message = 'Too many requests. Please try again later.',
      identifier = 'ip',
      skipSuccessfulRequests = false
    } = options;

    return (req, res, next) => {
      const key = this.getKey(req, identifier);
      const now = Date.now();
      const resetTime = now + windowMs;

      let requestData = this.store.get(key);
      
      if (!requestData || now > requestData.resetTime) {
        requestData = {
          count: 0,
          resetTime: resetTime
        };
      }

      // Check if limit exceeded
      if (requestData.count >= maxRequests) {
        const timeUntilReset = Math.ceil((requestData.resetTime - now) / 1000);
        
        res.set({
          'X-RateLimit-Limit': maxRequests,
          'X-RateLimit-Remaining': 0,
          'X-RateLimit-Reset': new Date(requestData.resetTime).toISOString()
        });

        return res.status(429).json(utils.errorMessage(`${message} Try again in ${timeUntilReset} seconds.`));
      }

      // Increment counter only if not skipping successful requests
      if (!skipSuccessfulRequests) {
        requestData.count++;
        this.store.set(key, requestData);
      } else {
        // We'll increment after response if it's not successful
        res.on('finish', () => {
          if (res.statusCode >= 400) {
            requestData.count++;
            this.store.set(key, requestData);
          }
        });
      }

      // Set rate limit headers
      res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - requestData.count),
        'X-RateLimit-Reset': new Date(requestData.resetTime).toISOString()
      });

      next();
    };
  }

  // Specific rate limiters for different endpoints

  // General API rate limiter
  generalRateLimit() {
    return this.createRateLimit({
      maxRequests: 1000,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many requests from this IP'
    });
  }

  // Authentication rate limiter (stricter)
  authRateLimit() {
    return this.createRateLimit({
      maxRequests: 10,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many authentication attempts',
      skipSuccessfulRequests: true // Only count failed attempts
    });
  }

  // Password reset rate limiter
  passwordResetRateLimit() {
    return this.createRateLimit({
      maxRequests: 5,
      windowMs: 60 * 60 * 1000, // 1 hour
      message: 'Too many password reset attempts'
    });
  }

  // Post creation rate limiter
  postCreationRateLimit() {
    return this.createRateLimit({
      maxRequests: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
      message: 'Too many posts created',
      identifier: 'user'
    });
  }

  // Comment rate limiter
  commentRateLimit() {
    return this.createRateLimit({
      maxRequests: 30,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many comments',
      identifier: 'user'
    });
  }

  // Like/Unlike rate limiter
  likeRateLimit() {
    return this.createRateLimit({
      maxRequests: 100,
      windowMs: 15 * 60 * 1000, // 15 minutes
      message: 'Too many like/unlike actions',
      identifier: 'user'
    });
  }

  // File upload rate limiter
  uploadRateLimit() {
    return this.createRateLimit({
      maxRequests: 20,
      windowMs: 60 * 60 * 1000, // 1 hour
      message: 'Too many file uploads',
      identifier: 'user'
    });
  }
}

module.exports = RateLimiter;
