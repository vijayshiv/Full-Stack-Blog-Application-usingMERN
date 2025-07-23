import { Request, Response } from "express";
import { UserService } from "../services";
import { successMessage, errorMessage } from "../utils";
import {
  UserRegistrationRequest,
  UserLoginRequest,
  EmailCheckRequest,
  UserUpdateRequest,
  PasswordResetRequest,
  JWTPayload,
} from "../types";

export class UserController {
  /**
   * Register a new user
   */
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { fullname, email, password }: UserRegistrationRequest = req.body;

      // Validate required fields
      if (!fullname || !email || !password) {
        res.json(errorMessage("All fields are required"));
        return;
      }

      const result = await UserService.registerUser(fullname, email, password);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error during registration:", error);
      const message =
        error instanceof Error ? error.message : "Error during registration";
      res.json(errorMessage(message));
    }
  }

  /**
   * Check email uniqueness
   */
  static async checkEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email }: EmailCheckRequest = req.body;

      if (!email) {
        res.json(errorMessage("Email is required"));
        return;
      }

      const isUnique = await UserService.isEmailUnique(email);
      res.json({ isUnique });
    } catch (error) {
      console.error("Database query error:", error);
      res.json(errorMessage("Database query error"));
    }
  }

  /**
   * Login user
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: UserLoginRequest = req.body;

      if (!email || !password) {
        res.json(errorMessage("Email and password are required"));
        return;
      }

      const userData = await UserService.loginUser(email, password);
      res.json(successMessage(userData));
    } catch (error) {
      console.error("Error during login:", error);
      const message =
        error instanceof Error ? error.message : "Error during login";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get user details (authenticated route)
   */
  static async getDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const userDetails = await UserService.getUserDetails(userId);
      res.json(successMessage(userDetails));
    } catch (error) {
      console.error("Database Error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving user details";
      res.json(errorMessage(message));
    }
  }

  /**
   * Update user information
   */
  static async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { fullname, email, oldPassword, newPassword } = req.body;

      const result = await UserService.updateUser(
        userId,
        email,
        fullname,
        oldPassword,
        newPassword
      );
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error updating user:", error);
      const message =
        error instanceof Error ? error.message : "Error updating user";
      res.json(errorMessage(message));
    }
  }

  /**
   * Delete user account
   */
  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const result = await UserService.deleteUser(userId);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error deleting user:", error);
      const message =
        error instanceof Error ? error.message : "Error deleting user";
      res.json(errorMessage(message));
    }
  }

  /**
   * Forgot password - send reset email
   */
  static async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.json(errorMessage("Email is required"));
        return;
      }

      const result = await UserService.forgotPassword(email);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error in forgot password:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error processing password reset";
      res.json(errorMessage(message));
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.json(errorMessage("Token and new password are required"));
        return;
      }

      const result = await UserService.resetPassword(token, password);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error resetting password:", error);
      const message =
        error instanceof Error ? error.message : "Error resetting password";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get user profile by email (admin function)
   */
  static async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.query;

      if (!email || typeof email !== "string") {
        res.json(errorMessage("Valid email is required"));
        return;
      }

      const user = await UserService.getUserByEmail(email);
      if (!user) {
        res.json(errorMessage("User not found"));
        return;
      }

      // Remove sensitive information
      const { password, resetToken, resetTokenExpiration, ...safeUser } = user;
      res.json(successMessage(safeUser));
    } catch (error) {
      console.error("Error getting user by email:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving user";
      res.json(errorMessage(message));
    }
  }

  /**
   * Validate user session (check if token is valid)
   */
  static async validateSession(req: Request, res: Response): Promise<void> {
    try {
      // If we reach here, the token is valid (middleware already validated it)
      const userId = req.user!.id;
      const userDetails = await UserService.getUserDetails(userId);

      // Return user info without sensitive data
      const { password, resetToken, resetTokenExpiration, ...safeUser } =
        userDetails;
      res.json(successMessage({ valid: true, user: safeUser }));
    } catch (error) {
      console.error("Error validating session:", error);
      res.json(errorMessage("Invalid session"));
    }
  }

  /**
   * Change password (authenticated route)
   */
  static async changePassword(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.json(
          errorMessage("Current password and new password are required")
        );
        return;
      }

      const result = await UserService.updateUser(
        userId,
        undefined,
        undefined,
        currentPassword,
        newPassword
      );
      res.json(successMessage("Password changed successfully"));
    } catch (error) {
      console.error("Error changing password:", error);
      const message =
        error instanceof Error ? error.message : "Error changing password";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get user profile (alias for getDetails)
   */
  static async getProfile(req: Request, res: Response): Promise<void> {
    return UserController.getDetails(req, res);
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { fullname } = req.body;

      const result = await UserService.updateUser(userId, fullname);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error updating profile:", error);
      const message =
        error instanceof Error ? error.message : "Error updating profile";
      res.json(errorMessage(message));
    }
  }

  /**
   * Upload profile image
   */
  static async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const imageFile = req.file;

      if (!imageFile) {
        res.json(errorMessage("No image file provided"));
        return;
      }

      // This would be implemented in UserService
      const imageUrl = `/images/${imageFile.filename}`;
      res.json(
        successMessage({
          message: "Profile image uploaded successfully",
          imageUrl,
        })
      );
    } catch (error) {
      console.error("Error uploading image:", error);
      const message =
        error instanceof Error ? error.message : "Error uploading image";
      res.json(errorMessage(message));
    }
  }

  /**
   * Refresh JWT token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      // Get user details and generate new token
      const userDetails = await UserService.getUserDetails(userId);

      // For now, return a simple success message
      // In a real implementation, we'd generate a new JWT token
      res.json(
        successMessage({
          message: "Token refreshed successfully",
          user: userDetails,
        })
      );
    } catch (error) {
      console.error("Error refreshing token:", error);
      const message =
        error instanceof Error ? error.message : "Error refreshing token";
      res.json(errorMessage(message));
    }
  }
}

export default UserController;
