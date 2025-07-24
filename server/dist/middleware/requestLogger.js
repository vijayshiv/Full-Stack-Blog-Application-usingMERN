"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class RequestLogger {
    constructor() {
        // Ensure logs directory exists
        this.logsDir = path_1.default.join(__dirname, "..", "..", "logs");
        if (!fs_1.default.existsSync(this.logsDir)) {
            fs_1.default.mkdirSync(this.logsDir, { recursive: true });
        }
    }
    /**
     * Format timestamp
     */
    static formatTimestamp() {
        return new Date().toISOString();
    }
    /**
     * Get client IP address
     */
    static getClientIP(req) {
        return (req.ip ||
            req.connection?.remoteAddress ||
            req.socket?.remoteAddress ||
            "unknown");
    }
    /**
     * Get user agent
     */
    static getUserAgent(req) {
        return req.get("User-Agent") || "unknown";
    }
    /**
     * Log to file
     */
    logToFile(logData, logType = "requests") {
        try {
            const logFileName = `${logType}-${new Date().toISOString().split("T")[0]}.log`;
            const logFilePath = path_1.default.join(this.logsDir, logFileName);
            const logEntry = JSON.stringify(logData) + "\n";
            fs_1.default.appendFileSync(logFilePath, logEntry);
        }
        catch (error) {
            console.error("Failed to write to log file:", error);
        }
    }
    /**
     * Main request logging middleware
     */
    static requestLogger() {
        const logger = new RequestLogger();
        return (req, res, next) => {
            const startTime = Date.now();
            // Log request
            const requestData = {
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
            res.json = function (body) {
                const endTime = Date.now();
                const responseTime = `${endTime - startTime}ms`;
                const responseData = {
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
        return (error, req, res, next) => {
            const errorData = {
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
    static authLogger(req, res, next) {
        const logger = new RequestLogger();
        const authData = {
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
    static securityLogger(eventType, details) {
        const logger = new RequestLogger();
        const securityData = {
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
        return (req, res, next) => {
            const startTime = process.hrtime.bigint();
            res.on("finish", () => {
                const endTime = process.hrtime.bigint();
                const duration = Number(endTime - startTime) / 1000000; // Convert to milliseconds
                // Only log slow requests (> 1 second)
                if (duration > 1000) {
                    const performanceData = {
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
    static cleanupOldLogs(retentionDays = 30) {
        const logger = new RequestLogger();
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        try {
            const files = fs_1.default.readdirSync(logger.logsDir);
            files.forEach((file) => {
                const filePath = path_1.default.join(logger.logsDir, file);
                const stats = fs_1.default.statSync(filePath);
                if (stats.mtime < cutoffDate) {
                    fs_1.default.unlinkSync(filePath);
                    console.log(`Deleted old log file: ${file}`);
                }
            });
        }
        catch (error) {
            console.error("Error cleaning up log files:", error);
        }
    }
}
exports.RequestLogger = RequestLogger;
exports.default = RequestLogger;
//# sourceMappingURL=requestLogger.js.map