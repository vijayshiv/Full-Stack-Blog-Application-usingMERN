const { UserService } = require("../services");
const util = require("../utils");

class UserController {

  // Register user
  static async register(req, res) {
    try {
      const { fullname, email, password } = req.body;
      const result = await UserService.registerUser(fullname, email, password);
      res.send(util.successMessage(result));
    } catch (error) {
      console.error("Error during registration:", error);
      res.send(util.errorMessage("Error during registration"));
    }
  }

  // Check email uniqueness
  static async checkEmail(req, res) {
    try {
      const { email } = req.body;
      const isUnique = await UserService.isEmailUnique(email);
      res.send({ isUnique });
    } catch (error) {
      console.error("Database query error:", error);
      res.send(util.errorMessage("Database query error"));
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const userData = await UserService.loginUser(email, password);
      res.send(util.successMessage(userData));
    } catch (error) {
      console.error("Error during login:", error);
      res.send(util.errorMessage(error.message || "Error during login"));
    }
  }

  // Get user details
  static async getDetails(req, res) {
    try {
      const userId = req.user.id;
      const userDetails = await UserService.getUserDetails(userId);
      res.send(util.successMessage(userDetails));
    } catch (error) {
      console.error("Database Error:", error);
      res.send(util.errorMessage(error.message || "Error retrieving user details"));
    }
  }

  // Update user
  static async update(req, res) {
    try {
      const { id, email, fullname, oldPassword, newPassword } = req.body;

      if (!id) {
        return res.status(400).json({ error: "User ID is required" });
      }

      // Validate new password only if it is provided
      if (newPassword && !oldPassword) {
        return res.send(util.errorMessage("Please provide the old password to change the password"));
      }

      const message = await UserService.updateUser(id, email, fullname, oldPassword, newPassword);
      res.send(util.successMessage(message));
    } catch (error) {
      console.error("Database Error:", error);
      res.send(util.errorMessage(error.message || "Error updating user"));
    }
  }

  // Delete user
  static async delete(req, res) {
    try {
      const { id } = req.body;

      if (!id) {
        return res.send(util.errorMessage("User ID is required"));
      }

      const message = await UserService.deleteUser(id);
      res.send(util.successMessage(message));
    } catch (error) {
      console.error("Database Error:", error);
      res.send(util.errorMessage(error.message || "Failed to delete user"));
    }
  }

  // Forgot password
  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const message = await UserService.forgotPassword(email);
      res.send(util.successMessage(message));
    } catch (error) {
      console.error("Error during password reset request:", error);
      res.send(util.errorMessage(error.message || "Error sending password reset email"));
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      const message = await UserService.resetPassword(token, password);
      res.send(util.successMessage(message));
    } catch (error) {
      console.error("Error resetting password:", error);
      res.send(util.errorMessage(error.message || "Error resetting password"));
    }
  }
}

module.exports = UserController;
