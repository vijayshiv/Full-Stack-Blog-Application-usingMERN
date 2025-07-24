import { User, DatabaseResult, LoginResponse } from "../types";
export declare class UserService {
    /**
     * Register a new user
     */
    static registerUser(fullname: string, email: string, password: string): Promise<DatabaseResult>;
    /**
     * Check if email is unique
     */
    static isEmailUnique(email: string): Promise<boolean>;
    /**
     * Login user
     */
    static loginUser(email: string, password: string): Promise<LoginResponse>;
    /**
     * Get user details
     */
    static getUserDetails(userId: number): Promise<User>;
    /**
     * Update user
     */
    static updateUser(id: number, email?: string, fullname?: string, oldPassword?: string, newPassword?: string): Promise<string>;
    /**
     * Delete user
     */
    static deleteUser(id: number): Promise<string>;
    /**
     * Forgot password
     */
    static forgotPassword(email: string): Promise<string>;
    /**
     * Reset password
     */
    static resetPassword(token: string, password: string): Promise<string>;
    /**
     * Get user by email
     */
    static getUserByEmail(email: string): Promise<User | null>;
    /**
     * Get all users (admin function)
     */
    static getAllUsers(): Promise<User[]>;
    /**
     * Check if user exists
     */
    static userExists(userId: number): Promise<boolean>;
    /**
     * Get user statistics
     */
    static getUserStats(userId: number): Promise<{
        postsCount: number;
        commentsCount: number;
    }>;
}
export default UserService;
//# sourceMappingURL=userService.d.ts.map