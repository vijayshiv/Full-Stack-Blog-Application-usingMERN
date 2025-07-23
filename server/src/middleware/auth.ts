import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import config from "../config";
import { errorMessage } from "../utils";
import { JWTPayload } from "../types";

// Extend Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export class AuthMiddleware {
  /**
   * Verify JWT token and add user to request
   */
  static verifyToken(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers["token"] as string;

    if (!token || token.length === 0) {
      res.status(401).json(errorMessage("Missing Token"));
      return;
    }

    try {
      const payload = jwt.verify(token, config.secretKey) as JWTPayload;
      req.user = payload;
      next();
    } catch (error) {
      console.error("JWT verification failed:", error);
      res.status(401).json(errorMessage("Invalid Token"));
    }
  }

  /**
   * Optional authentication - adds user to request if token is present
   */
  static optionalAuth(req: Request, res: Response, next: NextFunction): void {
    const token = req.headers["token"] as string;

    if (token && token.length > 0) {
      try {
        const payload = jwt.verify(token, config.secretKey) as JWTPayload;
        req.user = payload;
      } catch (error) {
        // Silently ignore invalid tokens for optional auth
        console.warn("Optional auth - invalid token:", error);
      }
    }

    next();
  }

  /**
   * Check if user is authenticated (requires verifyToken to be called first)
   */
  static requireAuth(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json(errorMessage("Authentication required"));
      return;
    }

    next();
  }

  /**
   * Check if user owns the resource (for user-specific resources)
   */
  static checkResourceOwnership(paramKey: string = "userId") {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json(errorMessage("Authentication required"));
        return;
      }

      const resourceUserId = parseInt(req.params[paramKey]);

      if (isNaN(resourceUserId)) {
        res.status(400).json(errorMessage("Invalid user ID"));
        return;
      }

      if (req.user.id !== resourceUserId) {
        res
          .status(403)
          .json(
            errorMessage(
              "Access denied: You can only access your own resources"
            )
          );
        return;
      }

      next();
    };
  }

  /**
   * Extract user ID from token for routes that need it
   */
  static extractUserId(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json(errorMessage("Authentication required"));
      return;
    }

    // Add userId to request params for easy access
    req.params.userId = req.user.id.toString();
    next();
  }

  /**
   * Generate JWT token
   */
  static generateToken(payload: Omit<JWTPayload, "iat" | "exp">): string {
    return jwt.sign(payload, config.secretKey, {
      expiresIn: "24h",
    });
  }

  /**
   * Refresh token if it's close to expiry
   */
  static refreshTokenIfNeeded(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (!req.user) {
      next();
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const tokenExp = req.user.exp;

    // If token expires in less than 1 hour, issue a new one
    if (tokenExp && tokenExp - now < 3600) {
      const newPayload: Omit<JWTPayload, "iat" | "exp"> = {
        id: req.user.id,
        email: req.user.email,
        fullname: req.user.fullname,
      };

      const newToken = AuthMiddleware.generateToken(newPayload);
      res.setHeader("X-New-Token", newToken);
    }

    next();
  }

  /**
   * Middleware to handle authentication for specific routes
   */
  static createAuthMiddleware(
    options: {
      required?: boolean;
      refreshToken?: boolean;
      checkOwnership?: string;
    } = {}
  ) {
    const middlewares: Array<
      (req: Request, res: Response, next: NextFunction) => void
    > = [];

    // Add token verification
    if (options.required !== false) {
      middlewares.push(AuthMiddleware.verifyToken);
    } else {
      middlewares.push(AuthMiddleware.optionalAuth);
    }

    // Add ownership check if specified
    if (options.checkOwnership) {
      middlewares.push(
        AuthMiddleware.checkResourceOwnership(options.checkOwnership)
      );
    }

    // Add token refresh if specified
    if (options.refreshToken) {
      middlewares.push(AuthMiddleware.refreshTokenIfNeeded);
    }

    return middlewares;
  }
}

export default AuthMiddleware;
