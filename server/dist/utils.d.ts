import { ApiResponse } from './types';
/**
 * Utility functions for API responses and common operations
 */
export declare class Utils {
    /**
     * Create a success response
     */
    static successMessage<T>(data: T): ApiResponse<T>;
    /**
     * Create an error response
     */
    static errorMessage(error: string): ApiResponse;
    /**
     * Generate a random string for password reset tokens
     */
    static generateRandomString(length?: number): string;
    /**
     * Validate email format
     */
    static isValidEmail(email: string): boolean;
    /**
     * Sanitize string for SQL queries (basic)
     */
    static sanitizeString(str: string): string;
    /**
     * Format date for MySQL
     */
    static formatDateForMySQL(date?: Date): string;
    /**
     * Get file extension from filename
     */
    static getFileExtension(filename: string): string;
    /**
     * Check if file is an image
     */
    static isImageFile(filename: string): boolean;
    /**
     * Generate a unique filename
     */
    static generateUniqueFilename(originalName: string): string;
    /**
     * Convert string to slug (URL-friendly)
     */
    static stringToSlug(str: string): string;
    /**
     * Truncate text to specified length
     */
    static truncateText(text: string, maxLength: number): string;
    /**
     * Validate password strength
     */
    static isStrongPassword(password: string): {
        isValid: boolean;
        errors: string[];
    };
    /**
     * Calculate pagination offset
     */
    static calculateOffset(page: number, limit: number): number;
    /**
     * Format bytes to human readable format
     */
    static formatBytes(bytes: number, decimals?: number): string;
    /**
     * Deep clone object
     */
    static deepClone<T>(obj: T): T;
    /**
     * Remove undefined and null values from object
     */
    static removeNullUndefined<T extends Record<string, any>>(obj: T): Partial<T>;
}
export declare const successMessage: typeof Utils.successMessage;
export declare const errorMessage: typeof Utils.errorMessage;
export default Utils;
//# sourceMappingURL=utils.d.ts.map