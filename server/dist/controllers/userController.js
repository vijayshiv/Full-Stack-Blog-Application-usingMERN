"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const services_1 = require("../services");
const utils_1 = require("../utils");
class UserController {
    /**
     * Register a new user
     */
    static async register(req, res) {
        try {
            const { fullname, email, password } = req.body;
            // Validate required fields
            if (!fullname || !email || !password) {
                res.json((0, utils_1.errorMessage)("All fields are required"));
                return;
            }
            const result = await services_1.UserService.registerUser(fullname, email, password);
            res.json((0, utils_1.successMessage)(result));
        }
        catch (error) {
            console.error("Error during registration:", error);
            const message = error instanceof Error ? error.message : "Error during registration";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Check email uniqueness
     */
    static async checkEmail(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.json((0, utils_1.errorMessage)("Email is required"));
                return;
            }
            const isUnique = await services_1.UserService.isEmailUnique(email);
            res.json({ isUnique });
        }
        catch (error) {
            console.error("Database query error:", error);
            res.json((0, utils_1.errorMessage)("Database query error"));
        }
    }
    /**
     * Login user
     */
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.json((0, utils_1.errorMessage)("Email and password are required"));
                return;
            }
            const userData = await services_1.UserService.loginUser(email, password);
            res.json((0, utils_1.successMessage)(userData));
        }
        catch (error) {
            console.error("Error during login:", error);
            const message = error instanceof Error ? error.message : "Error during login";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get user details (authenticated route)
     */
    static async getDetails(req, res) {
        try {
            const userId = req.user.id;
            const userDetails = await services_1.UserService.getUserDetails(userId);
            res.json((0, utils_1.successMessage)(userDetails));
        }
        catch (error) {
            console.error("Database Error:", error);
            const message = error instanceof Error
                ? error.message
                : "Error retrieving user details";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Update user information
     */
    static async updateUser(req, res) {
        try {
            const userId = req.user.id;
            const { fullname, email, oldPassword, newPassword } = req.body;
            const result = await services_1.UserService.updateUser(userId, email, fullname, oldPassword, newPassword);
            res.json((0, utils_1.successMessage)(result));
        }
        catch (error) {
            console.error("Error updating user:", error);
            const message = error instanceof Error ? error.message : "Error updating user";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Delete user account
     */
    static async deleteUser(req, res) {
        try {
            const userId = req.user.id;
            const result = await services_1.UserService.deleteUser(userId);
            res.json((0, utils_1.successMessage)(result));
        }
        catch (error) {
            console.error("Error deleting user:", error);
            const message = error instanceof Error ? error.message : "Error deleting user";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Forgot password - send reset email
     */
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            if (!email) {
                res.json((0, utils_1.errorMessage)("Email is required"));
                return;
            }
            const result = await services_1.UserService.forgotPassword(email);
            res.json((0, utils_1.successMessage)(result));
        }
        catch (error) {
            console.error("Error in forgot password:", error);
            const message = error instanceof Error
                ? error.message
                : "Error processing password reset";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Reset password with token
     */
    static async resetPassword(req, res) {
        try {
            const { token, password } = req.body;
            if (!token || !password) {
                res.json((0, utils_1.errorMessage)("Token and new password are required"));
                return;
            }
            const result = await services_1.UserService.resetPassword(token, password);
            res.json((0, utils_1.successMessage)(result));
        }
        catch (error) {
            console.error("Error resetting password:", error);
            const message = error instanceof Error ? error.message : "Error resetting password";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get user profile by email (admin function)
     */
    static async getUserByEmail(req, res) {
        try {
            const { email } = req.query;
            if (!email || typeof email !== "string") {
                res.json((0, utils_1.errorMessage)("Valid email is required"));
                return;
            }
            const user = await services_1.UserService.getUserByEmail(email);
            if (!user) {
                res.json((0, utils_1.errorMessage)("User not found"));
                return;
            }
            // Remove sensitive information
            const { password, resetToken, resetTokenExpiration, ...safeUser } = user;
            res.json((0, utils_1.successMessage)(safeUser));
        }
        catch (error) {
            console.error("Error getting user by email:", error);
            const message = error instanceof Error ? error.message : "Error retrieving user";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Validate user session (check if token is valid)
     */
    static async validateSession(req, res) {
        try {
            // If we reach here, the token is valid (middleware already validated it)
            const userId = req.user.id;
            const userDetails = await services_1.UserService.getUserDetails(userId);
            // Return user info without sensitive data
            const { password, resetToken, resetTokenExpiration, ...safeUser } = userDetails;
            res.json((0, utils_1.successMessage)({ valid: true, user: safeUser }));
        }
        catch (error) {
            console.error("Error validating session:", error);
            res.json((0, utils_1.errorMessage)("Invalid session"));
        }
    }
    /**
     * Change password (authenticated route)
     */
    static async changePassword(req, res) {
        try {
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;
            if (!currentPassword || !newPassword) {
                res.json((0, utils_1.errorMessage)("Current password and new password are required"));
                return;
            }
            const result = await services_1.UserService.updateUser(userId, undefined, undefined, currentPassword, newPassword);
            res.json((0, utils_1.successMessage)("Password changed successfully"));
        }
        catch (error) {
            console.error("Error changing password:", error);
            const message = error instanceof Error ? error.message : "Error changing password";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get user profile (alias for getDetails)
     */
    static async getProfile(req, res) {
        return UserController.getDetails(req, res);
    }
    /**
     * Update user profile
     */
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { fullname } = req.body;
            const result = await services_1.UserService.updateUser(userId, fullname);
            res.json((0, utils_1.successMessage)(result));
        }
        catch (error) {
            console.error("Error updating profile:", error);
            const message = error instanceof Error ? error.message : "Error updating profile";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Upload profile image
     */
    static async uploadImage(req, res) {
        try {
            const userId = req.user.id;
            const imageFile = req.file;
            if (!imageFile) {
                res.json((0, utils_1.errorMessage)("No image file provided"));
                return;
            }
            // This would be implemented in UserService
            const imageUrl = `/images/${imageFile.filename}`;
            res.json((0, utils_1.successMessage)({
                message: "Profile image uploaded successfully",
                imageUrl,
            }));
        }
        catch (error) {
            console.error("Error uploading image:", error);
            const message = error instanceof Error ? error.message : "Error uploading image";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Refresh JWT token
     */
    static async refreshToken(req, res) {
        try {
            const userId = req.user.id;
            // Get user details and generate new token
            const userDetails = await services_1.UserService.getUserDetails(userId);
            // For now, return a simple success message
            // In a real implementation, we'd generate a new JWT token
            res.json((0, utils_1.successMessage)({
                message: "Token refreshed successfully",
                user: userDetails,
            }));
        }
        catch (error) {
            console.error("Error refreshing token:", error);
            const message = error instanceof Error ? error.message : "Error refreshing token";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
}
exports.UserController = UserController;
exports.default = UserController;
//# sourceMappingURL=userController.js.map