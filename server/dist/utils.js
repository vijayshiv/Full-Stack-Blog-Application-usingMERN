"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMessage = exports.successMessage = exports.Utils = void 0;
/**
 * Utility functions for API responses and common operations
 */
class Utils {
    /**
     * Create a success response
     */
    static successMessage(data) {
        return {
            status: 'success',
            data
        };
    }
    /**
     * Create an error response
     */
    static errorMessage(error) {
        return {
            status: 'error',
            error
        };
    }
    /**
     * Generate a random string for password reset tokens
     */
    static generateRandomString(length = 32) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    /**
     * Validate email format
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    /**
     * Sanitize string for SQL queries (basic)
     */
    static sanitizeString(str) {
        return str.replace(/[<>'"]/g, '');
    }
    /**
     * Format date for MySQL
     */
    static formatDateForMySQL(date = new Date()) {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    }
    /**
     * Get file extension from filename
     */
    static getFileExtension(filename) {
        return filename.split('.').pop()?.toLowerCase() || '';
    }
    /**
     * Check if file is an image
     */
    static isImageFile(filename) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        const extension = this.getFileExtension(filename);
        return imageExtensions.includes(extension);
    }
    /**
     * Generate a unique filename
     */
    static generateUniqueFilename(originalName) {
        const extension = this.getFileExtension(originalName);
        const timestamp = Date.now();
        const randomString = this.generateRandomString(8);
        return `${timestamp}_${randomString}.${extension}`;
    }
    /**
     * Convert string to slug (URL-friendly)
     */
    static stringToSlug(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    /**
     * Truncate text to specified length
     */
    static truncateText(text, maxLength) {
        if (text.length <= maxLength)
            return text;
        return text.substring(0, maxLength).trim() + '...';
    }
    /**
     * Validate password strength
     */
    static isStrongPassword(password) {
        const errors = [];
        if (password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        if (password.length > 128) {
            errors.push('Password must be less than 128 characters');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    /**
     * Calculate pagination offset
     */
    static calculateOffset(page, limit) {
        return Math.max(0, (page - 1) * limit);
    }
    /**
     * Format bytes to human readable format
     */
    static formatBytes(bytes, decimals = 2) {
        if (bytes === 0)
            return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
    /**
     * Deep clone object
     */
    static deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    /**
     * Remove undefined and null values from object
     */
    static removeNullUndefined(obj) {
        const cleaned = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value !== null && value !== undefined) {
                cleaned[key] = value;
            }
        }
        return cleaned;
    }
}
exports.Utils = Utils;
// Export individual functions for backward compatibility
exports.successMessage = Utils.successMessage;
exports.errorMessage = Utils.errorMessage;
exports.default = Utils;
//# sourceMappingURL=utils.js.map