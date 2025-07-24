"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const encrypt = __importStar(require("crypto-js"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
const repositories_1 = require("../repositories");
class UserService {
    /**
     * Register a new user
     */
    static async registerUser(fullname, email, password) {
        const encryptedPassword = String(encrypt.SHA256(password));
        const result = await repositories_1.UserRepository.create(fullname, email, encryptedPassword);
        return result;
    }
    /**
     * Check if email is unique
     */
    static async isEmailUnique(email) {
        const exists = await repositories_1.UserRepository.checkEmailExists(email);
        return !exists;
    }
    /**
     * Login user
     */
    static async loginUser(email, password) {
        const encryptedPassword = String(encrypt.SHA256(password));
        const users = await repositories_1.UserRepository.findByEmailAndPassword(email, encryptedPassword);
        if (users.length === 0) {
            throw new Error("No user found");
        }
        const user = users[0];
        if (user.isDeleted) {
            throw new Error("Account is deleted");
        }
        const payload = { id: user.id, name: user.fullname };
        const token = jsonwebtoken_1.default.sign(payload, config_1.default.secretKey);
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
    static async getUserDetails(userId) {
        const data = await repositories_1.UserRepository.findById(userId);
        if (!data) {
            throw new Error("No user found");
        }
        return data;
    }
    /**
     * Update user
     */
    static async updateUser(id, email, fullname, oldPassword, newPassword) {
        const userData = await repositories_1.UserRepository.findPasswordById(id);
        if (userData.length === 0) {
            throw new Error("User not found");
        }
        if (newPassword && oldPassword) {
            const hashedOldPassword = String(encrypt.SHA256(oldPassword));
            if (hashedOldPassword !== userData[0].password) {
                throw new Error("Old password is incorrect");
            }
        }
        const updateFields = [];
        const values = [];
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
        await repositories_1.UserRepository.updateFlexible(updateFields, values, id);
        return "User updated successfully";
    }
    /**
     * Delete user
     */
    static async deleteUser(id) {
        const result = await repositories_1.UserRepository.softDelete(id);
        if (result.affectedRows === 0) {
            throw new Error("User not found or cannot be deleted");
        }
        return "User deleted successfully";
    }
    /**
     * Forgot password
     */
    static async forgotPassword(email) {
        const users = await repositories_1.UserRepository.findByEmail(email);
        if (users.length === 0) {
            throw new Error("Email not found");
        }
        const userId = users[0].id;
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour
        await repositories_1.UserRepository.updateResetToken(resetToken, resetTokenExpiration, userId);
        // Send email
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: config_1.default.emailUser,
                pass: config_1.default.emailPass,
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
                from: `"Blog App" <${config_1.default.emailUser}>`,
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
        }
        catch (emailError) {
            console.error("Error sending email:", emailError);
            throw new Error(`Failed to send password reset email: ${emailError instanceof Error ? emailError.message : "Unknown error"}`);
        }
        return "Password reset link sent to your email";
    }
    /**
     * Reset password
     */
    static async resetPassword(token, password) {
        console.log("DEBUG: Reset password attempt with token:", token?.substring(0, 8) + "...");
        const encryptedPassword = String(crypto_1.default.createHash("sha256").update(password).digest("hex"));
        const users = await repositories_1.UserRepository.findByResetToken(token);
        console.log("DEBUG: Users found with valid token:", users.length);
        if (users.length === 0) {
            throw new Error("Invalid or expired token");
        }
        const userId = users[0].id;
        await repositories_1.UserRepository.updatePasswordAndClearToken(encryptedPassword, userId);
        console.log("DEBUG: Password reset successful for user ID:", userId);
        return "Password reset successful";
    }
    /**
     * Get user by email
     */
    static async getUserByEmail(email) {
        const users = await repositories_1.UserRepository.findByEmail(email);
        return users.length > 0 ? users[0] : null;
    }
    /**
     * Get all users (admin function)
     */
    static async getAllUsers() {
        return await repositories_1.UserRepository.findAll();
    }
    /**
     * Check if user exists
     */
    static async userExists(userId) {
        return await repositories_1.UserRepository.exists(userId);
    }
    /**
     * Get user statistics
     */
    static async getUserStats(userId) {
        const postsCount = await repositories_1.UserRepository.getPostsCount(userId);
        const commentsCount = await repositories_1.UserRepository.getCommentsCount(userId);
        return {
            postsCount,
            commentsCount,
        };
    }
}
exports.UserService = UserService;
exports.default = UserService;
//# sourceMappingURL=userService.js.map