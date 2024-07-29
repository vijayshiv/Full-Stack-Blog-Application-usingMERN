const express = require("express");
const db = require("../db");
const util = require("../utils");
const encrypt = require("crypto-js");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");
const nodemailer = require("nodemailer"); // Use a package to send emails

const router = express.Router();

// Register route
router.post("/register", async (req, res) => {
  const { fullname, email, password } = req.body;
  const encryptedPassword = String(encrypt.SHA256(password));
  const query = "INSERT INTO users(fullname, email, password) VALUES(?,?,?)";

  try {
    const [result] = await db.pool.execute(query, [
      fullname,
      email,
      encryptedPassword,
    ]);
    res.send(util.successMessage(result));
  } catch (error) {
    console.error("Error during registration:", error);
    res.send(util.errorMessage("Error during registration"));
  }
});

// Check email route
router.post("/check-email", async (req, res) => {
  const { email } = req.body;
  const query = "SELECT COUNT(*) as count FROM users WHERE email = ?";

  try {
    const [results] = await db.pool.execute(query, [email]);
    const count = results[0].count;
    res.send({ isUnique: count === 0 });
  } catch (error) {
    console.error("Database query error:", error);
    res.send(util.errorMessage("Database query error"));
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const encryptedPassword = String(encrypt.SHA256(password));
  const query =
    "SELECT id, fullname, email, password, isDeleted FROM users WHERE email = ? AND password = ? AND isDeleted = 0";

  try {
    const [users] = await db.pool.execute(query, [email, encryptedPassword]);
    if (users.length === 0) {
      return res.send(util.errorMessage("No user found"));
    }

    const user = users[0];
    if (user.isDeleted) {
      return res.send(util.errorMessage("Account is deleted"));
    }

    const payload = { id: user.id, name: user.fullname };
    const token = jwt.sign(payload, config.secretKey);
    const userData = { token, id: user.id, name: user.fullname };
    res.send(util.successMessage(userData));
  } catch (error) {
    console.error("Error during login:", error);
    res.send(util.errorMessage("Error during login"));
  }
});

// Get user details route
router.get("/details", async (req, res) => {
  const userId = req.user.id;
  const query = "SELECT fullname, email, isDeleted FROM users WHERE id = ?";

  try {
    const [data] = await db.pool.execute(query, [userId]);
    if (data.length === 0) {
      return res.send(util.errorMessage("No user found"));
    }
    res.send(util.successMessage(data[0]));
  } catch (error) {
    console.error("Database Error:", error);
    res.send(util.errorMessage("Error retrieving user details"));
  }
});

// Update user route
router.put("/update", async (req, res) => {
  const { id, email, fullname, oldPassword, newPassword } = req.body;

  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const [userData] = await db.pool.query(
      "SELECT password FROM users WHERE id = ?",
      [id]
    );

    if (userData.length === 0) {
      return res.send(util.errorMessage("User not found"));
    }

    if (newPassword && oldPassword) {
      const hashedOldPassword = String(encrypt.SHA256(oldPassword));
      if (hashedOldPassword !== userData[0].password) {
        return res.send(util.errorMessage("Old password is incorrect"));
      }
    }

    let query = "UPDATE users SET";
    const values = [];

    if (email) {
      query += " email = ?,";
      values.push(email);
    }
    if (fullname) {
      query += " fullname = ?,";
      values.push(fullname);
    }
    if (newPassword) {
      const hashedNewPassword = String(encrypt.SHA256(newPassword));
      query += " password = ?,";
      values.push(hashedNewPassword);
    }

    query = query.slice(0, -1) + " WHERE id = ?";
    values.push(id);

    await db.pool.execute(query, values);
    res.send(util.successMessage("User updated successfully"));
  } catch (error) {
    console.error("Database Error:", error);
    res.send(util.errorMessage("Error updating user"));
  }
});

// Delete user route
router.post("/delete", async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.send(util.errorMessage("User ID is required"));
  }

  const query = "UPDATE users SET isDeleted = 1 WHERE id = ?";

  try {
    const [result] = await db.pool.execute(query, [id]);
    if (result.affectedRows === 0) {
      return res.send(util.errorMessage("User not found or cannot be deleted"));
    }
    res.send(util.successMessage("User deleted successfully"));
  } catch (error) {
    console.error("Database Error:", error);
    res.send(util.errorMessage("Failed to delete user"));
  }
});

// Forgot password route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const query = "SELECT id FROM users WHERE email = ?";
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: config.emailUser,
      pass: config.emailPass,
    },
  });

  try {
    const [users] = await db.pool.execute(query, [email]);
    if (users.length === 0) {
      return res.send(util.errorMessage("Email not found"));
    }

    const userId = users[0].id;
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiration = new Date(Date.now() + 3600000); // 1 hour

    await db.pool.execute(
      "UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE id = ?",
      [resetToken, resetTokenExpiration, userId]
    );

    // Send reset link via email
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
    await transporter.sendMail({
      to: email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click the link below to reset your password:</p>
             <a href="${resetLink}">Reset Password</a>`,
    });

    res.send(util.successMessage("Password reset link sent to your email"));
  } catch (error) {
    console.error("Error during password reset request:", error);
    res.send(util.errorMessage("Error sending password reset email"));
  }
});

// Reset password route
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  const encryptedPassword = String(
    crypto.createHash("sha256").update(password).digest("hex")
  );

  try {
    const [users] = await db.pool.execute(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiration > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.send(util.errorMessage("Invalid or expired token"));
    }

    const userId = users[0].id;
    await db.pool.execute(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?",
      [encryptedPassword, userId]
    );

    res.send(util.successMessage("Password reset successful"));
  } catch (error) {
    console.error("Error resetting password:", error);
    res.send(util.errorMessage("Error resetting password"));
  }
});

module.exports = router;
