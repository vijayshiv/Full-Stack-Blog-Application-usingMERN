const express = require("express");
const db = require("../db");
const util = require("../utils");
const multer = require("multer");
const upload = multer({ dest: "images/" }); // Destination folder for uploaded images

const router = express.Router();

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
router.post("/my-post", upload.single("image"), (req, res) => {
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

// Get all posts by category
router.get("/by-category/:category", (req, res) => {
  const { category } = req.params;
  const query =
    "SELECT post_id, title, content, img FROM posts WHERE category = ?;";
  db.pool.query(query, [category], (error, data) => {
    if (error) {
      res.send(util.errorMessage(error));
    } else {
      res.send(util.successMessage(data));
    }
  });
});

module.exports = router;
