const express = require("express");
const db = require("../db");
const util = require("../utils");
const jwt = require("jsonwebtoken");
const config = require("../config");
const multer = require("multer");
const upload = multer({ dest: "images/" }); // Destination folder for uploaded images

const router = express.Router();

const verifyToken = (req, res, next) => {
  // Get token from headers
  const token = req.headers["token"];

  // Check if token is provided
  if (!token) {
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized: No token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.secretKey);
    // Attach decoded payload to request object
    req.user = decoded;
    next(); // Move to the next middleware
  } catch (error) {
    // Token is invalid
    return res
      .status(401)
      .json({ status: "error", message: "Unauthorized: Invalid token" });
  }
};

// Get all posts
router.get("/all", (req, res) => {
  const query = "SELECT post_id, title, content, img FROM posts;";
  db.pool.query(query, (error, data) => {
    if (error) {
      res.send(util.errorMessage(error));
    } else {
      res.send(util.successMessage(data));
    }
  });
});

// Create a new post
router.post("/my-post", verifyToken, upload.single("image"), (req, res) => {
  // Use req.user.userId to get the user ID
  const userId = req.user.id;

  try {
    const query =
      "INSERT INTO posts(title, content, img, category, user_id) VALUES (?,?,?,?,?);";
    const { title, content, category } = req.body;
    const img = req.file ? req.file.filename : null; // Retrieve filename from multer
    db.pool.execute(
      query,
      [title, content, img, category, userId], // Use userId obtained from req.user
      (error, data) => {
        if (error) {
          res.send(util.errorMessage(error.message));
        } else {
          res.send(util.successMessage(data));
        }
      }
    );
  } catch (ex) {
    console.log(ex);
    res.send(util.errorMessage("Error occurred while processing the request"));
  }
});

router.get("/post/:id", (req, res) => {
  const { id } = req.params;
  const query = `SELECT title, content, img, category, user_id FROM posts WHERE post_id = ?;`;
  db.pool.execute(query, [id], (error, post) => {
    if (error) res.send(util.errorMessage(error));
    else res.send(util.successMessage(post));
  });
});

module.exports = router;
