import { Request, Response, NextFunction } from "express";
export declare class ValidationMiddleware {
    /**
     * User Registration Validation
     */
    static validateUserRegistration(req: Request, res: Response, next: NextFunction): void;
    /**
     * User Login Validation
     */
    static validateUserLogin(req: Request, res: Response, next: NextFunction): void;
    /**
     * Post Creation Validation
     */
    static validatePostCreation(req: Request, res: Response, next: NextFunction): void;
    /**
     * Post Update Validation
     */
    static validatePostUpdate(req: Request, res: Response, next: NextFunction): void;
    /**
     * Comment Validation
     */
    static validateComment(req: Request, res: Response, next: NextFunction): void;
    /**
     * Email Check Validation
     */
    static validateEmailCheck(req: Request, res: Response, next: NextFunction): void;
    /**
     * Password Reset Validation
     */
    static validatePasswordReset(req: Request, res: Response, next: NextFunction): void;
    /**
     * User Update Validation
     */
    static validateUserUpdate(req: Request, res: Response, next: NextFunction): void;
    /**
     * ID Parameter Validation (for routes with :id)
     */
    static validateIdParam(req: Request, res: Response, next: NextFunction): void;
    /**
     * Pagination Query Validation
     */
    static validatePaginationQuery(req: Request, res: Response, next: NextFunction): void;
    /**
     * User Registration Validation (alias)
     */
    static validateRegistration: typeof ValidationMiddleware.validateUserRegistration;
    /**
     * User Login Validation (alias)
     */
    static validateLogin: typeof ValidationMiddleware.validateUserLogin;
    /**
     * Profile Update Validation
     */
    static validateProfileUpdate(req: Request, res: Response, next: NextFunction): void;
    /**
     * Image Upload Validation
     */
    static validateImageUpload(req: Request, res: Response, next: NextFunction): void;
    /**
     * Password Change Validation
     */
    static validatePasswordChange(req: Request, res: Response, next: NextFunction): void;
    /**
     * Forgot Password Validation
     */
    static validateForgotPassword(req: Request, res: Response, next: NextFunction): void;
    /**
     * Reset Password Validation
     */
    static validateResetPassword(req: Request, res: Response, next: NextFunction): void;
    /**
     * Pagination validation (alias)
     */
    static validatePagination: typeof ValidationMiddleware.validatePaginationQuery;
    /**
     * Post ID validation
     */
    static validatePostId(req: Request, res: Response, next: NextFunction): void;
    /**
     * Comment ID validation
     */
    static validateCommentId(req: Request, res: Response, next: NextFunction): void;
    /**
     * Search query validation
     */
    static validateSearchQuery(req: Request, res: Response, next: NextFunction): void;
    /**
     * Category validation
     */
    static validateCategory(req: Request, res: Response, next: NextFunction): void;
    /**
     * Comment creation validation
     */
    static validateCommentCreation(req: Request, res: Response, next: NextFunction): void;
    /**
     * Comment update validation
     */
    static validateCommentUpdate(req: Request, res: Response, next: NextFunction): void;
    /**
     * Notification ID validation
     */
    static validateNotificationId(req: Request, res: Response, next: NextFunction): void;
}
export default ValidationMiddleware;
//# sourceMappingURL=validation.d.ts.map