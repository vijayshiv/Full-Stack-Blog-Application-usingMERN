import * as encrypt from "crypto-js";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import config from "../config";
import { UserRepository } from "../repositories";
import { User, DatabaseResult, LoginResponse } from "../types";

export class UserService {
  /**
   * Register a new user
   */
  static async registerUser(
    fullname: string,
    email: string,
    password: string
  ): Promise<DatabaseResult> {
    const encryptedPassword = String(encrypt.SHA256(password));
    const result = await UserRepository.create(
      fullname,
      email,
      encryptedPassword
    );
    return result;
  }

  /**
   * Check if email is unique
   */
  static async isEmailUnique(email: string): Promise<boolean> {
    const exists = await UserRepository.checkEmailExists(email);
    return !exists;
  }

  /**
   * Login user
   */
  static async loginUser(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const encryptedPassword = String(encrypt.SHA256(password));
    const users = await UserRepository.findByEmailAndPassword(
      email,
      encryptedPassword
    );

    if (users.length === 0) {
      throw new Error("No user found");
    }

    const user = users[0];
    if (user.isDeleted) {
      throw new Error("Account is deleted");
    }

    const payload = { id: user.id, name: user.fullname };
    const token = jwt.sign(payload, config.secretKey);

    // Return format expected by frontend: { token, id, name }
    return {
      token,
      id: user.id,
      name: user.fullname,
    };
  }

  /**
   * Get user details
   */
  static async getUserDetails(userId: number): Promise<User> {
    const data = await UserRepository.findById(userId);
    if (!data) {
      throw new Error("No user found");
    }
    return data;
  }

  /**
   * Update user
   */
  static async updateUser(
    id: number,
    email?: string,
    fullname?: string,
    oldPassword?: string,
    newPassword?: string
  ): Promise<string> {
    const userData = await UserRepository.findPasswordById(id);
    if (userData.length === 0) {
      throw new Error("User not found");
    }

    if (newPassword && oldPassword) {
      const hashedOldPassword = String(encrypt.SHA256(oldPassword));
      if (hashedOldPassword !== userData[0].password) {
        throw new Error("Old password is incorrect");
      }
    }

    const updateFields: string[] = [];
    const values: string[] = [];

    if (email) {
      updateFields.push("email = ?");
      values.push(email);
    }
    if (fullname) {
      updateFields.push("fullname = ?");
      values.push(fullname);
    }
    if (newPassword) {
      const hashedNewPassword = String(encrypt.SHA256(newPassword));
      updateFields.push("password = ?");
      values.push(hashedNewPassword);
    }

    await UserRepository.updateFlexible(updateFields, values, id);
    return "User updated successfully";
  }

  /**
   * Delete user
   */
  static async deleteUser(id: number): Promise<string> {
    const result = await UserRepository.softDelete(id);
    if (result.affectedRows === 0) {
      throw new Error("User not found or cannot be deleted");
    }
    return "User deleted successfully";
  }

  /**
   * Forgot password
   */
  static async forgotPassword(email: string): Promise<string> {
    const users = await UserRepository.findByEmail(email);
    if (users.length === 0) {
      throw new Error("Email not found");
    }

    const userId = users[0].id;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour

    await UserRepository.updateResetToken(
      resetToken,
      resetTokenExpiration,
      userId
    );

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
      secure: true,
      port: 465,
      tls: {
        rejectUnauthorized: false,
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    try {
      await transporter.sendMail({
        from: `"Blog App" <${config.emailUser}>`,
        to: email,
        subject: "Password Reset Request - Blog App",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your Blog App account.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you didn't request this reset, please ignore this email.</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(
        `Failed to send password reset email: ${
          emailError instanceof Error ? emailError.message : "Unknown error"
        }`
      );
    }

    return "Password reset link sent to your email";
  }

  /**
   * Reset password
   */
  static async resetPassword(token: string, password: string): Promise<string> {
    console.log(
      "DEBUG: Reset password attempt with token:",
      token?.substring(0, 8) + "..."
    );

    const encryptedPassword = String(
      crypto.createHash("sha256").update(password).digest("hex")
    );

    const users = await UserRepository.findByResetToken(token);
    console.log("DEBUG: Users found with valid token:", users.length);

    if (users.length === 0) {
      throw new Error("Invalid or expired token");
    }

    const userId = users[0].id;
    await UserRepository.updatePasswordAndClearToken(encryptedPassword, userId);

    console.log("DEBUG: Password reset successful for user ID:", userId);
    return "Password reset successful";
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const users = await UserRepository.findByEmail(email);
    return users.length > 0 ? users[0] : null;
  }

  /**
   * Get all users (admin function)
   */
  static async getAllUsers(): Promise<User[]> {
    return await UserRepository.findAll();
  }

  /**
   * Check if user exists
   */
  static async userExists(userId: number): Promise<boolean> {
    return await UserRepository.exists(userId);
  }

  /**
   * Get user statistics
   */
  static async getUserStats(userId: number): Promise<{
    postsCount: number;
    commentsCount: number;
  }> {
    const postsCount = await UserRepository.getPostsCount(userId);
    const commentsCount = await UserRepository.getCommentsCount(userId);

    return {
      postsCount,
      commentsCount,
    };
  }
}

export default UserService;
