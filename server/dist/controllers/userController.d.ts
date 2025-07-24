import { Request, Response } from "express";
export declare class UserController {
    /**
     * Register a new user
     */
    static register(req: Request, res: Response): Promise<void>;
    /**
     * Check email uniqueness
     */
    static checkEmail(req: Request, res: Response): Promise<void>;
    /**
     * Login user
     */
    static login(req: Request, res: Response): Promise<void>;
    /**
     * Get user details (authenticated route)
     */
    static getDetails(req: Request, res: Response): Promise<void>;
    /**
     * Update user information
     */
    static updateUser(req: Request, res: Response): Promise<void>;
    /**
     * Delete user account
     */
    static deleteUser(req: Request, res: Response): Promise<void>;
    /**
     * Forgot password - send reset email
     */
    static forgotPassword(req: Request, res: Response): Promise<void>;
    /**
     * Reset password with token
     */
    static resetPassword(req: Request, res: Response): Promise<void>;
    /**
     * Get user profile by email (admin function)
     */
    static getUserByEmail(req: Request, res: Response): Promise<void>;
    /**
     * Validate user session (check if token is valid)
     */
    static validateSession(req: Request, res: Response): Promise<void>;
    /**
     * Change password (authenticated route)
     */
    static changePassword(req: Request, res: Response): Promise<void>;
    /**
     * Get user profile (alias for getDetails)
     */
    static getProfile(req: Request, res: Response): Promise<void>;
    /**
     * Update user profile
     */
    static updateProfile(req: Request, res: Response): Promise<void>;
    /**
     * Upload profile image
     */
    static uploadImage(req: Request, res: Response): Promise<void>;
    /**
     * Refresh JWT token
     */
    static refreshToken(req: Request, res: Response): Promise<void>;
}
export default UserController;
//# sourceMappingURL=userController.d.ts.map