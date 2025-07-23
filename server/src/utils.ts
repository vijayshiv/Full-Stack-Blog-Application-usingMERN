import { ApiResponse } from './types';

/**
 * Utility functions for API responses and common operations
 */
export class Utils {
  
  /**
   * Create a success response
   */
  static successMessage<T>(data: T): ApiResponse<T> {
    return {
      status: 'success',
      data
    };
  }

  /**
   * Create an error response
   */
  static errorMessage(error: string): ApiResponse {
    return {
      status: 'error',
      error
    };
  }

  /**
   * Generate a random string for password reset tokens
   */
  static generateRandomString(length: number = 32): string {
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
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize string for SQL queries (basic)
   */
  static sanitizeString(str: string): string {
    return str.replace(/[<>'"]/g, '');
  }

  /**
   * Format date for MySQL
   */
  static formatDateForMySQL(date: Date = new Date()): string {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  /**
   * Get file extension from filename
   */
  static getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Check if file is an image
   */
  static isImageFile(filename: string): boolean {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const extension = this.getFileExtension(filename);
    return imageExtensions.includes(extension);
  }

  /**
   * Generate a unique filename
   */
  static generateUniqueFilename(originalName: string): string {
    const extension = this.getFileExtension(originalName);
    const timestamp = Date.now();
    const randomString = this.generateRandomString(8);
    return `${timestamp}_${randomString}.${extension}`;
  }

  /**
   * Convert string to slug (URL-friendly)
   */
  static stringToSlug(str: string): string {
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
  static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  /**
   * Validate password strength
   */
  static isStrongPassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
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
  static calculateOffset(page: number, limit: number): number {
    return Math.max(0, (page - 1) * limit);
  }

  /**
   * Format bytes to human readable format
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Deep clone object
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Remove undefined and null values from object
   */
  static removeNullUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
    const cleaned: Partial<T> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (value !== null && value !== undefined) {
        cleaned[key as keyof T] = value;
      }
    }
    
    return cleaned;
  }
}

// Export individual functions for backward compatibility
export const successMessage = Utils.successMessage;
export const errorMessage = Utils.errorMessage;

export default Utils;
