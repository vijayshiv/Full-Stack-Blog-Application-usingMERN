const encrypt = require("crypto-js");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");
const { UserRepository } = require("../repositories");
const nodemailer = require("nodemailer");

class UserService {

  // Register a new user
  static async registerUser(fullname, email, password) {
    const encryptedPassword = String(encrypt.SHA256(password));
    const result = await UserRepository.create(fullname, email, encryptedPassword);
    return result;
  }

  // Check if email is unique
  static async isEmailUnique(email) {
    const exists = await UserRepository.checkEmailExists(email);
    return !exists;
  }

  // Login user
  static async loginUser(email, password) {
    const encryptedPassword = String(encrypt.SHA256(password));
    const users = await UserRepository.findByEmailAndPassword(email, encryptedPassword);
    
    if (users.length === 0) {
      throw new Error("No user found");
    }

    const user = users[0];
    if (user.isDeleted) {
      throw new Error("Account is deleted");
    }

    const payload = { id: user.id, name: user.fullname };
    const token = jwt.sign(payload, config.secretKey);
    
    return {
      token,
      id: user.id,
      name: user.fullname
    };
  }

  // Get user details
  static async getUserDetails(userId) {
    const data = await UserRepository.findById(userId);
    if (data.length === 0) {
      throw new Error("No user found");
    }
    return data[0];
  }

  // Update user
  static async updateUser(id, email, fullname, oldPassword, newPassword) {
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

    await UserRepository.update(updateFields, values, id);
    return "User updated successfully";
  }

  // Delete user
  static async deleteUser(id) {
    const result = await UserRepository.softDelete(id);
    if (result.affectedRows === 0) {
      throw new Error("User not found or cannot be deleted");
    }
    return "User deleted successfully";
  }

  // Forgot password
  static async forgotPassword(email) {
    const users = await UserRepository.findByEmail(email);
    if (users.length === 0) {
      throw new Error("Email not found");
    }

    const userId = users[0].id;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour

    await UserRepository.updateResetToken(resetToken, resetTokenExpiration, userId);

    // Send email
    const transporter = nodemailer.createTransporter({
      service: "Gmail",
      auth: {
        user: config.emailUser,
        pass: config.emailPass,
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>`,
    });

    return "Password reset link sent to your email";
  }

  // Reset password
  static async resetPassword(token, password) {
    const encryptedPassword = String(
      crypto.createHash("sha256").update(password).digest("hex")
    );

    const users = await UserRepository.findByResetToken(token);
    if (users.length === 0) {
      throw new Error("Invalid or expired token");
    }

    const userId = users[0].id;
    await UserRepository.updatePasswordAndClearToken(encryptedPassword, userId);
    
    return "Password reset successful";
  }
}

module.exports = UserService;
