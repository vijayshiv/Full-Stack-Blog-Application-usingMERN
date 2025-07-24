import { User, DatabaseResult } from "../types";
export declare class UserRepository {
    /**
     * Find user by email
     */
    static findByEmail(email: string): Promise<User[]>;
    /**
     * Find user by ID
     */
    static findById(id: number): Promise<User | null>;
    /**
     * Create a new user
     */
    static create(fullname: string, email: string, hashedPassword: string): Promise<DatabaseResult>;
    /**
     * Update user information
     */
    static update(id: number, fullname: string): Promise<DatabaseResult>;
    /**
     * Delete user by ID
     */
    static delete(id: number): Promise<DatabaseResult>;
    /**
     * Get all users (admin function)
     */
    static findAll(): Promise<User[]>;
    /**
     * Check if email exists
     */
    static emailExists(email: string): Promise<boolean>;
    /**
     * Update user password
     */
    static updatePassword(email: string, hashedPassword: string): Promise<DatabaseResult>;
    /**
     * Get user count
     */
    static getUserCount(): Promise<number>;
    /**
     * Get users with pagination
     */
    static findWithPagination(offset: number, limit: number): Promise<User[]>;
    /**
     * Search users by name or email
     */
    static search(searchTerm: string): Promise<User[]>;
    /**
     * Check if email exists (alias for emailExists)
     */
    static checkEmailExists(email: string): Promise<boolean>;
    /**
     * Find user by email and password for login
     */
    static findByEmailAndPassword(email: string, hashedPassword: string): Promise<User[]>;
    /**
     * Find user password by ID (for password updates)
     */
    static findPasswordById(id: number): Promise<{
        password: string;
    }[]>;
    /**
     * Update user with flexible fields
     */
    static updateFlexible(updateFields: string[], values: string[], id: number): Promise<DatabaseResult>;
    /**
     * Soft delete user (mark as deleted)
     */
    static softDelete(id: number): Promise<DatabaseResult>;
    /**
     * Update reset token for password reset
     */
    static updateResetToken(resetToken: string, resetTokenExpiration: Date, userId: number): Promise<DatabaseResult>;
    /**
     * Find user by reset token
     */
    static findByResetToken(token: string): Promise<User[]>;
    /**
     * Update password and clear reset token
     */
    static updatePasswordAndClearToken(hashedPassword: string, userId: number): Promise<DatabaseResult>;
    /**
     * Check if user exists
     */
    static exists(userId: number): Promise<boolean>;
    /**
     * Get posts count for a user
     */
    static getPostsCount(userId: number): Promise<number>;
    /**
     * Get comments count for a user
     */
    static getCommentsCount(userId: number): Promise<number>;
    /**
     * Update user password by user ID (used for password reset)
     */
    static updatePasswordByUserId(hashedPassword: string, userId: number): Promise<DatabaseResult>;
}
export default UserRepository;
//# sourceMappingURL=userRepository.d.ts.map