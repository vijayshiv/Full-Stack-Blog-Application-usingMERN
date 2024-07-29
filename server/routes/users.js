const express = require("express");
const db = require("../db");
const util = require("../utils");
const encrypt = require("crypto-js");
const jwt = require("jsonwebtoken");
const config = require("../config");

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

module.exports = router;
