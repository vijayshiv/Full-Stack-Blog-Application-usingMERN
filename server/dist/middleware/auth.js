"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const utils_1 = require("../utils");
class AuthMiddleware {
    /**
     * Verify JWT token and add user to request
     */
    static verifyToken(req, res, next) {
        // Check for token in multiple header formats
        let token = req.headers["token"];
        // Also check for Bearer token in Authorization header
        if (!token) {
            const authHeader = req.headers["authorization"];
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7); // Remove "Bearer " prefix
            }
        }
        if (!token || token.length === 0) {
            res.status(401).json((0, utils_1.errorMessage)("Missing Token"));
            return;
        }
        try {
            const payload = jsonwebtoken_1.default.verify(token, config_1.default.secretKey);
            req.user = payload;
            next();
        }
        catch (error) {
            console.error("JWT verification failed:", error);
            res.status(401).json((0, utils_1.errorMessage)("Invalid Token"));
        }
    }
    /**
     * Optional authentication - adds user to request if token is present
     */
    static optionalAuth(req, res, next) {
        // Check for token in multiple header formats
        let token = req.headers["token"];
        // Also check for Bearer token in Authorization header
        if (!token) {
            const authHeader = req.headers["authorization"];
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7); // Remove "Bearer " prefix
            }
        }
        if (token && token.length > 0) {
            try {
                const payload = jsonwebtoken_1.default.verify(token, config_1.default.secretKey);
                req.user = payload;
            }
            catch (error) {
                // Silently ignore invalid tokens for optional auth
                console.warn("Optional auth - invalid token:", error);
            }
        }
        next();
    }
    /**
     * Check if user is authenticated (requires verifyToken to be called first)
     */
    static requireAuth(req, res, next) {
        if (!req.user) {
            res.status(401).json((0, utils_1.errorMessage)("Authentication required"));
            return;
        }
        next();
    }
    /**
     * Check if user owns the resource (for user-specific resources)
     */
    static checkResourceOwnership(paramKey = "userId") {
        return (req, res, next) => {
            if (!req.user) {
                res.status(401).json((0, utils_1.errorMessage)("Authentication required"));
                return;
            }
            const resourceUserId = parseInt(req.params[paramKey]);
            if (isNaN(resourceUserId)) {
                res.status(400).json((0, utils_1.errorMessage)("Invalid user ID"));
                return;
            }
            if (req.user.id !== resourceUserId) {
                res
                    .status(403)
                    .json((0, utils_1.errorMessage)("Access denied: You can only access your own resources"));
                return;
            }
            next();
        };
    }
    /**
     * Extract user ID from token for routes that need it
     */
    static extractUserId(req, res, next) {
        if (!req.user) {
            res.status(401).json((0, utils_1.errorMessage)("Authentication required"));
            return;
        }
        // Add userId to request params for easy access
        req.params.userId = req.user.id.toString();
        next();
    }
    /**
     * Generate JWT token
     */
    static generateToken(payload) {
        return jsonwebtoken_1.default.sign(payload, config_1.default.secretKey, {
            expiresIn: "24h",
        });
    }
    /**
     * Refresh token if it's close to expiry
     */
    static refreshTokenIfNeeded(req, res, next) {
        if (!req.user) {
            next();
            return;
        }
        const now = Math.floor(Date.now() / 1000);
        const tokenExp = req.user.exp;
        // If token expires in less than 1 hour, issue a new one
        if (tokenExp && tokenExp - now < 3600) {
            const newPayload = {
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
    static createAuthMiddleware(options = {}) {
        const middlewares = [];
        // Add token verification
        if (options.required !== false) {
            middlewares.push(AuthMiddleware.verifyToken);
        }
        else {
            middlewares.push(AuthMiddleware.optionalAuth);
        }
        // Add ownership check if specified
        if (options.checkOwnership) {
            middlewares.push(AuthMiddleware.checkResourceOwnership(options.checkOwnership));
        }
        // Add token refresh if specified
        if (options.refreshToken) {
            middlewares.push(AuthMiddleware.refreshTokenIfNeeded);
        }
        return middlewares;
    }
}
exports.AuthMiddleware = AuthMiddleware;
exports.default = AuthMiddleware;
//# sourceMappingURL=auth.js.map