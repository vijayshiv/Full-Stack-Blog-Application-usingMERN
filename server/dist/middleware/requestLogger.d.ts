import { Request, Response, NextFunction } from "express";
export declare class RequestLogger {
    private logsDir;
    constructor();
    /**
     * Format timestamp
     */
    static formatTimestamp(): string;
    /**
     * Get client IP address
     */
    static getClientIP(req: Request): string;
    /**
     * Get user agent
     */
    static getUserAgent(req: Request): string;
    /**
     * Log to file
     */
    private logToFile;
    /**
     * Main request logging middleware
     */
    static requestLogger(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Error logging middleware
     */
    static errorLogger(): (error: Error, req: Request, res: Response, next: NextFunction) => void;
    /**
     * Authentication logging
     */
    static authLogger(req: Request, res: Response, next: NextFunction): void;
    /**
     * Security event logging
     */
    static securityLogger(eventType: string, details: any): void;
    /**
     * Performance logging middleware
     */
    static performanceLogger(): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Daily log cleanup (call this in a cron job)
     */
    static cleanupOldLogs(retentionDays?: number): void;
}
export default RequestLogger;
//# sourceMappingURL=requestLogger.d.ts.map