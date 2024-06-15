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
router.post("/add-post", upload.single("image"), (req, res) => {
  // Use req.user.id to get the user ID
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

router.get("/my-all-post", (req, res) => {
  // getting the user id which is stored in storage
  const userId = req.user.id;
  const query = `SELECT post_id, title, content, img, category FROM posts WHERE user_id = ? AND isDeleted = 0;`;

  db.pool.execute(query, [userId], (error, all_post) => {
    res.send(util.result(all_post, error));
  });
});

router.put("/update-post/:postId", (req, res) => {
  const postId = req.params.postId;
  const { title, content, img, category } = req.body;

  const query = `UPDATE posts SET title = ?, content = ?, img = ?, category = ? WHERE post_id = ?`;
  const values = [title, content, img, category, postId];

  db.pool.execute(query, values, (error, result) => {
    if (error) {
      res.send(util.errorMessage("Internal server error"));
    } else {
      if (result.affectedRows > 0) {
        res.send(util.errorMessage("Post updated successfully"));
      } else {
        res.send(util.errorMessage("Post not found"));
      }
    }
  });
});

router.delete("/delete-post/:postId", (req, res) => {
  const postId = req.params.postId;

  const query = `UPDATE posts SET isDeleted = 1 WHERE post_id = ?`;

  db.pool.execute(query, [postId], (error, result) => {
    if (error) {
      res.send(util.errorMessage("Internal server error"));
    } else {
      if (result.affectedRows > 0) {
        res.send(util.errorMessage("Post deleted successfully"));
      } else {
        res.send(util.errorMessage("Post not found"));
      }
    }
  });
});

module.exports = router;
