import { Request, Response, NextFunction } from "express";
import fs from "fs";
import path from "path";
import { RequestLogData } from "../types";

export class RequestLogger {
  private logsDir: string;

  constructor() {
    // Ensure logs directory exists
    this.logsDir = path.join(__dirname, "..", "..", "logs");
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Format timestamp
   */
  static formatTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Get client IP address
   */
  static getClientIP(req: Request): string {
    return (
      req.ip ||
      (req.connection as any)?.remoteAddress ||
      (req.socket as any)?.remoteAddress ||
      "unknown"
    );
  }

  /**
   * Get user agent
   */
  static getUserAgent(req: Request): string {
    return req.get("User-Agent") || "unknown";
  }

  /**
   * Log to file
   */
  private logToFile(
    logData: RequestLogData,
    logType: string = "requests"
  ): void {
    try {
      const logFileName = `${logType}-${
        new Date().toISOString().split("T")[0]
      }.log`;
      const logFilePath = path.join(this.logsDir, logFileName);
      const logEntry = JSON.stringify(logData) + "\n";

      fs.appendFileSync(logFilePath, logEntry);
    } catch (error) {
      console.error("Failed to write to log file:", error);
    }
  }

  /**
   * Main request logging middleware
   */
  static requestLogger() {
    const logger = new RequestLogger();

    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = Date.now();

      // Log request
      const requestData: RequestLogData = {
        timestamp: RequestLogger.formatTimestamp(),
        method: req.method,
        url: req.url,
        ip: RequestLogger.getClientIP(req),
        userAgent: RequestLogger.getUserAgent(req),
        contentType: req.get("Content-Type") || "unknown",
        contentLength: req.get("Content-Length") || "0",
        userId: req.user?.id || null,
        type: "request",
      };

      logger.logToFile(requestData, "requests");

      // Override res.json to log response
      const originalJson = res.json;
      res.json = function (body: any) {
        const endTime = Date.now();
        const responseTime = `${endTime - startTime}ms`;

        const responseData: RequestLogData = {
          ...requestData,
          type: "response",
          statusCode: res.statusCode,
          responseTime,
          success: res.statusCode >= 200 && res.statusCode < 300,
        };

        logger.logToFile(responseData, "responses");

        return originalJson.call(this, body);
      };

      next();
    };
  }

  /**
   * Error logging middleware
   */
  static errorLogger() {
    const logger = new RequestLogger();

    return (
      error: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ): void => {
      const errorData: RequestLogData = {
        timestamp: RequestLogger.formatTimestamp(),
        method: req.method,
        url: req.url,
        ip: RequestLogger.getClientIP(req),
        userAgent: RequestLogger.getUserAgent(req),
        contentType: req.get("Content-Type") || "unknown",
        contentLength: req.get("Content-Length") || "0",
        userId: req.user?.id || null,
        type: "error",
        statusCode: res.statusCode,
        success: false,
        error: {
          message: error.message,
          stack: error.stack || "",
          name: error.name,
        },
      };

      logger.logToFile(errorData, "errors");
      next(error);
    };
  }

  /**
   * Authentication logging
   */
  static authLogger(req: Request, res: Response, next: NextFunction): void {
    const logger = new RequestLogger();

    const authData: RequestLogData = {
      timestamp: RequestLogger.formatTimestamp(),
      method: req.method,
      url: req.url,
      ip: RequestLogger.getClientIP(req),
      userAgent: RequestLogger.getUserAgent(req),
      contentType: req.get("Content-Type") || "unknown",
      contentLength: req.get("Content-Length") || "0",
      userId: req.user?.id || null,
      type: "auth",
      success: true,
    };

    logger.logToFile(authData, "auth");
    next();
  }

  /**
   * Security event logging
   */
  static securityLogger(eventType: string, details: any): void {
    const logger = new RequestLogger();

    const securityData: RequestLogData = {
      timestamp: RequestLogger.formatTimestamp(),
      method: "SECURITY",
      url: eventType,
      ip: details.ip || "unknown",
      userAgent: details.userAgent || "unknown",
      contentType: "security/event",
      contentLength: 0,
      userId: details.userId || null,
      type: "security",
      success: false,
      error: {
        message: details.message || eventType,
        stack: details.stack || "",
        name: eventType,
      },
    };

    logger.logToFile(securityData, "security");
  }

  /**
   * Performance logging middleware
   */
  static performanceLogger() {
    const logger = new RequestLogger();

    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = process.hrtime.bigint();

      res.on("finish", () => {
        const endTime = process.hrtime.bigint();
        const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds

        // Only log slow requests (> 1 second)
        if (duration > 1000) {
          const performanceData: RequestLogData = {
            timestamp: RequestLogger.formatTimestamp(),
            method: req.method,
            url: req.url,
            ip: RequestLogger.getClientIP(req),
            userAgent: RequestLogger.getUserAgent(req),
            contentType: req.get("Content-Type") || "unknown",
            contentLength: req.get("Content-Length") || "0",
            userId: req.user?.id || null,
            type: "response",
            statusCode: res.statusCode,
            responseTime: `${duration.toFixed(2)}ms`,
            success: res.statusCode >= 200 && res.statusCode < 300,
          };

          logger.logToFile(performanceData, "performance");
        }
      });

      next();
    };
  }

  /**
   * Daily log cleanup (call this in a cron job)
   */
  static cleanupOldLogs(retentionDays: number = 30): void {
    const logger = new RequestLogger();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    try {
      const files = fs.readdirSync(logger.logsDir);

      files.forEach((file) => {
        const filePath = path.join(logger.logsDir, file);
        const stats = fs.statSync(filePath);

        if (stats.mtime < cutoffDate) {
          fs.unlinkSync(filePath);
          console.log(`Deleted old log file: ${file}`);
        }
      });
    } catch (error) {
      console.error("Error cleaning up log files:", error);
    }
  }
}

export default RequestLogger;
