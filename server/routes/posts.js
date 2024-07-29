const express = require("express");
const { pool } = require("../db"); // Make sure this uses mysql2/promise
const util = require("../utils");
const multer = require("multer");
const upload = multer({ dest: "images/" });

const router = express.Router();

// Get all posts
router.get("/all", async (req, res) => {
  const query = "SELECT post_id, title, content, img FROM posts;";
  try {
    const [rows] = await pool.query(query);
    res.send(util.successMessage(rows));
  } catch (error) {
    res.send(util.errorMessage(error.message));
  }
});

// Create a new post
router.post("/add-post", upload.single("image"), async (req, res) => {
  const userId = req.user.id;

  try {
    const query =
      "INSERT INTO posts(title, content, img, category, user_id) VALUES (?,?,?,?,?);";
    const { title, content, category } = req.body;
    const img = req.file ? req.file.filename : null;
    await pool.execute(query, [title, content, img, category, userId]);
    res.send(util.successMessage("Post added successfully"));
  } catch (error) {
    console.log(error);
    res.send(util.errorMessage("Error occurred while processing the request"));
  }
});

// Get a single post
router.get("/post/:id", async (req, res) => {
  const { id } = req.params;
  const query = `SELECT title, content, img, category, user_id FROM posts WHERE post_id = ?;`;
  try {
    const [rows] = await pool.query(query, [id]);
    res.send(util.successMessage(rows));
  } catch (error) {
    res.send(util.errorMessage(error.message));
  }
});

// Get all posts by category
router.get("/by-category/:category", async (req, res) => {
  const { category } = req.params;
  const query =
    "SELECT post_id, title, content, img FROM posts WHERE category = ?;";
  try {
    const [rows] = await pool.query(query, [category]);
    res.send(util.successMessage(rows));
  } catch (error) {
    res.send(util.errorMessage(error.message));
  }
});

// Get all posts by the logged-in user
router.get("/my-all-post", async (req, res) => {
  const userId = req.user.id;
  const query = `SELECT post_id, title, content, img, category FROM posts WHERE user_id = ? AND isDeleted = 0;`;
  try {
    const [rows] = await pool.query(query, [userId]);
    res.send(util.successMessage(rows));
  } catch (error) {
    res.send(util.errorMessage(error.message));
  }
});

// Update a post
router.put("/update-post/:postId", upload.single("img"), async (req, res) => {
  const postId = req.params.postId;
  const { title, content } = req.body;
  const img = req.file ? req.file.filename : null;

  try {
    const queryParams = [];
    const updateFields = [];

    if (title) {
      updateFields.push("title = ?");
      queryParams.push(title);
    }

    if (content) {
      updateFields.push("content = ?");
      queryParams.push(content);
    }

    if (img) {
      updateFields.push("img = ?");
      queryParams.push(img);
    }

    if (updateFields.length === 0) {
      return res.send(util.errorMessage("No fields to update"));
    }

    const updateQuery = `UPDATE posts SET ${updateFields.join(
      ", "
    )} WHERE post_id = ?`;
    queryParams.push(postId);

    await pool.execute(updateQuery, queryParams);
    res.send(util.successMessage("Post updated successfully"));
  } catch (error) {
    console.error("Error updating post:", error.message);
    res.send(util.errorMessage("Internal server error"));
  }
});

// Delete a post
router.delete("/delete-post/:postId", async (req, res) => {
  const postId = req.params.postId;
  const query = `UPDATE posts SET isDeleted = 1 WHERE post_id = ?`;

  try {
    const [result] = await pool.execute(query, [postId]);
    if (result.affectedRows > 0) {
      res.send(util.successMessage("Post deleted successfully"));
    } else {
      res.send(util.errorMessage("Post not found"));
    }
  } catch (error) {
    res.send(util.errorMessage("Internal server error"));
  }
});

// Search posts
router.get("/search", async (req, res) => {
  const searchTerm = req.query.q;
  if (!searchTerm) {
    return res.send(util.successMessage([]));
  }
  const query = `SELECT post_id, title, content, img FROM posts WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ?`;
  const searchValue = `%${searchTerm.toLowerCase()}%`;
  try {
    const [rows] = await pool.query(query, [searchValue, searchValue]);
    res.send(util.successMessage(rows));
  } catch (error) {
    res.send(util.errorMessage(error.message));
  }
});

// Get the number of likes for a post (public)
router.get("/likes/:postId", async (req, res) => {
  const { postId } = req.params;
  const query = "SELECT likes FROM posts WHERE post_id = ? AND isDeleted = 0";
  try {
    const [rows] = await pool.query(query, [postId]);
    if (rows.length > 0) {
      res.send(util.successMessage({ likes: rows[0].likes }));
    } else {
      res.send(util.errorMessage("Post not found"));
    }
  } catch (error) {
    res.send(util.errorMessage(error.message));
  }
});

// Check if a post is liked by the user
router.get("/is-liked/:postId", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;
  const query = "SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?";
  try {
    const [rows] = await pool.query(query, [postId, userId]);
    res.send(util.successMessage({ liked: rows.length > 0 }));
  } catch (error) {
    res.send(util.errorMessage(error.message));
  }
});

// Add or remove a like from a post (authentication required)
router.post("/like/:postId", async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id;

  const checkIfLikedQuery =
    "SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?";
  const addLikeQuery =
    "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)";
  const removeLikeQuery =
    "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?";
  const updateLikesQuery = `
    UPDATE posts 
    SET likes = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) 
    WHERE post_id = ?;
  `;

  try {
    const [result] = await pool.query(checkIfLikedQuery, [postId, userId]);

    if (result.length > 0) {
      // User has already liked the post, so remove the like
      await pool.query(removeLikeQuery, [postId, userId]);
    } else {
      // User has not liked the post, so add the like
      await pool.query(addLikeQuery, [postId, userId]);
    }
    // Update the like count in posts table
    await pool.query(updateLikesQuery, [postId, postId]);

    res.send(
      util.successMessage({
        message: result.length > 0 ? "Like removed" : "Like added",
      })
    );
  } catch (error) {
    res.send(util.errorMessage(error.message));
  }
});

// Fetch comments for a post (public)
router.get("/comments/:postId", async (req, res) => {
  const postId = req.params.postId;

  try {
    const query = `
      SELECT 
        comments.comment_id, 
        comments.content, 
        comments.createdTimestamp, 
        users.fullname 
      FROM comments 
      JOIN users ON comments.user_id = users.id 
      WHERE comments.post_id = ?
    `;

    const [rows] = await pool.query(query, [postId]);
    res.json({ status: "success", data: rows });
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Add a comment to a post (authentication required)
router.post("/comment/:postId", async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  const comment = req.body.comment;

  try {
    const query =
      "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)";
    const [result] = await pool.execute(query, [postId, userId, comment]);

    // Retrieve the newly added comment ID
    const commentId = result.insertId;

    res.json({
      status: "success",
      data: {
        comment_id: commentId, // Include the newly added comment ID
        content: comment,
        createdTimestamp: new Date().toISOString(), // Include timestamp
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Edit a comment (authentication required)
router.put("/comment/:commentId", async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.id;
  const { content } = req.body;

  try {
    const query =
      "UPDATE comments SET content = ? WHERE comment_id = ? AND user_id = ?";
    const [result] = await pool.execute(query, [content, commentId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found or you are not the owner of this comment",
      });
    }

    res.json({ status: "success", message: "Comment updated successfully" });
  } catch (error) {
    console.error("Error updating comment:", error.message);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

// Delete a comment (authentication required)
router.delete("/comment/:commentId", async (req, res) => {
  const commentId = req.params.commentId;
  const userId = req.user.id;

  try {
    const query = "DELETE FROM comments WHERE comment_id = ? AND user_id = ?";
    const [result] = await pool.execute(query, [commentId, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: "error",
        message: "Comment not found or you are not the owner of this comment",
      });
    }

    res.json({ status: "success", message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error.message);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
});

module.exports = router;
