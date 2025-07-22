const fs = require('fs');
const path = require('path');

class RequestLogger {
  
  constructor() {
    // Ensure logs directory exists
    this.logsDir = path.join(__dirname, '..', 'logs');
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  // Format timestamp
  static formatTimestamp() {
    return new Date().toISOString();
  }

  // Get client IP address
  static getClientIP(req) {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  }

  // Get user agent
  static getUserAgent(req) {
    return req.get('User-Agent') || 'unknown';
  }

  // Log to file
  logToFile(logData, logType = 'requests') {
    const logFile = path.join(this.logsDir, `${logType}.log`);
    const logEntry = JSON.stringify(logData) + '\n';
    
    fs.appendFile(logFile, logEntry, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const startTime = Date.now();
      
      // Log request
      const requestLog = {
        timestamp: RequestLogger.formatTimestamp(),
        method: req.method,
        url: req.originalUrl,
        ip: RequestLogger.getClientIP(req),
        userAgent: RequestLogger.getUserAgent(req),
        contentType: req.get('Content-Type') || 'none',
        contentLength: req.get('Content-Length') || 0,
        userId: req.user ? req.user.id : null,
        type: 'request'
      };

      console.log(`📥 ${req.method} ${req.originalUrl} - ${RequestLogger.getClientIP(req)}`);
      this.logToFile(requestLog);

      // Override res.json to log response
      const originalJson = res.json;
      res.json = function(data) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        const responseLog = {
          timestamp: RequestLogger.formatTimestamp(),
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          responseTime: `${responseTime}ms`,
          ip: RequestLogger.getClientIP(req),
          userId: req.user ? req.user.id : null,
          success: res.statusCode < 400,
          type: 'response'
        };

        console.log(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} - ${responseTime}ms`);
        
        // Log to file (using the instance method)
        const logger = new RequestLogger();
        logger.logToFile(responseLog);

        return originalJson.call(this, data);
      };

      next();
    };
  }

  // Error logging middleware
  errorLogger() {
    return (err, req, res, next) => {
      const errorLog = {
        timestamp: RequestLogger.formatTimestamp(),
        method: req.method,
        url: req.originalUrl,
        error: {
          message: err.message,
          stack: err.stack,
          name: err.name
        },
        ip: RequestLogger.getClientIP(req),
        userAgent: RequestLogger.getUserAgent(req),
        userId: req.user ? req.user.id : null,
        type: 'error'
      };

      console.error(`❌ Error in ${req.method} ${req.originalUrl}:`, err.message);
      this.logToFile(errorLog, 'errors');

      next(err);
    };
  }

  // Authentication logging
  static authLogger(req, res, next) {
    if (req.user) {
      const authLog = {
        timestamp: RequestLogger.formatTimestamp(),
        userId: req.user.id,
        email: req.user.email,
        action: 'authenticated_request',
        ip: RequestLogger.getClientIP(req),
        url: req.originalUrl,
        method: req.method,
        type: 'auth'
      };

      const logger = new RequestLogger();
      logger.logToFile(authLog, 'auth');
    }
    next();
  }

  // Security logging for failed authentication attempts
  static securityLogger(event, details) {
    const securityLog = {
      timestamp: RequestLogger.formatTimestamp(),
      event: event,
      details: details,
      type: 'security'
    };

    console.warn(`🔒 Security Event: ${event}`);
    
    const logger = new RequestLogger();
    logger.logToFile(securityLog, 'security');
  }
}

module.exports = RequestLogger;
