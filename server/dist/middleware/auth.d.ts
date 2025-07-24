import { Request, Response, NextFunction } from "express";
import { JWTPayload } from "../types";
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
export declare class AuthMiddleware {
    /**
     * Verify JWT token and add user to request
     */
    static verifyToken(req: Request, res: Response, next: NextFunction): void;
    /**
     * Optional authentication - adds user to request if token is present
     */
    static optionalAuth(req: Request, res: Response, next: NextFunction): void;
    /**
     * Check if user is authenticated (requires verifyToken to be called first)
     */
    static requireAuth(req: Request, res: Response, next: NextFunction): void;
    /**
     * Check if user owns the resource (for user-specific resources)
     */
    static checkResourceOwnership(paramKey?: string): (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Extract user ID from token for routes that need it
     */
    static extractUserId(req: Request, res: Response, next: NextFunction): void;
    /**
     * Generate JWT token
     */
    static generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string;
    /**
     * Refresh token if it's close to expiry
     */
    static refreshTokenIfNeeded(req: Request, res: Response, next: NextFunction): void;
    /**
     * Middleware to handle authentication for specific routes
     */
    static createAuthMiddleware(options?: {
        required?: boolean;
        refreshToken?: boolean;
        checkOwnership?: string;
    }): ((req: Request, res: Response, next: NextFunction) => void)[];
}
export default AuthMiddleware;
//# sourceMappingURL=auth.d.ts.map