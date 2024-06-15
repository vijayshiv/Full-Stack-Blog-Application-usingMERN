const express = require("express");
const db = require("../db");
const util = require("../utils");
const encrypt = require("crypto-js");
const jwt = require("jsonwebtoken");
const config = require("../config");

const router = express.Router();

router.post("/register", (req, res) => {
  const query = "INSERT INTO users(fullname, email, password) VALUES(?,?,?)";
  const { fullname, email, password } = req.body;
  const encryptedPassword = String(encrypt.SHA256(password));
  db.pool.execute(
    query,
    [fullname, email, encryptedPassword],
    (error, data) => {
      res.send(util.result(data, error));
    }
  );
});

router.post("/login", (req, res) => {
  const query =
    "SELECT id, fullname, email, password, isDeleted FROM users WHERE email = ? AND password = ? AND isDeleted = 0;";
  const { email, password } = req.body;
  const encryptedPassword = String(encrypt.SHA256(password));
  db.pool.query(query, [email, encryptedPassword], (error, users) => {
    if (error) {
      res.send(util.errorMessage(error));
    } else {
      if (users.length == 0) {
        res.send(util.errorMessage("No user found"));
      } else {
        const user = users[0];
        if (user.isDeleted) {
          res.send(util.errorMessage("Account is deleted"));
        } else {
          const payload = {
            id: user.id,
            name: user.fullname,
          };
          const token = jwt.sign(payload, config.secretKey);
          const userData = {
            token,
            id: user.id,
            name: user.fullname,
          };
          res.send(util.successMessage(userData));
        }
      }
    }
  });
});

router.get("/details", (req, res) => {
  const userId = req.user.id;
  const query = `SELECT fullname, email, isDeleted FROM users WHERE id = ?`;

  db.pool.execute(query, [userId], (error, data) => {
    if (error) {
      console.error("Database Error:", error);
      res.send(util.errorMessage(error));
    } else {
      if (data.length === 0) {
        res.send(util.errorMessage("No user found"));
      } else {
        const user = data[0];
        res.send(util.successMessage(user));
      }
    }
  });
});

router.put("/update", (req, res) => {
  const { id, email, fullname, password } = req.body;

  // Check if any of the fields are missing
  if (!id) {
    return res.send(util.errorMessage("User ID is required"));
  }

  // Construct the SQL UPDATE query based on the provided fields
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
  if (password) {
    // Hash the new password before updating
    const hashedPassword = String(encrypt.SHA256(password));
    query += " password = ?,";
    values.push(hashedPassword);
  }

  // Remove the trailing comma and add the WHERE clause
  query = query.slice(0, -1) + " WHERE id = ?";
  values.push(id);

  db.pool.execute(query, values, (error, result) => {
    if (error) {
      console.error("Database Error:", error);
      res.send(util.errorMessage(error));
    } else {
      if (result.affectedRows === 0) {
        res.send(util.errorMessage("User not found"));
      } else {
        res.send(util.successMessage("User updated successfully"));
      }
    }
  });
});

router.post("/delete", (req, res) => {
  const { id } = req.body;

  // Check if the user ID is missing or invalid
  if (!id) {
    return res.send(util.errorMessage("User ID is required"));
  }

  const query = `UPDATE users SET isDeleted = 1 WHERE id = ?`;

  db.pool.execute(query, [id], (error, data) => {
    if (error) {
      console.error("Database Error:", error);
      res.send(util.errorMessage("Failed to delete user"));
    } else {
      if (data.affectedRows === 0) {
        res.send(util.errorMessage("User not found or cannot be deleted"));
      } else {
        res.send(util.successMessage("User deleted successfully"));
      }
    }
  });
});

module.exports = router;
