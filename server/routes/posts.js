const express = require("express");
const db = require("../db");
const util = require("../utils");
const multer = require("multer");
const upload = multer({ dest: "images/" });

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
  const userId = req.user.id;

  try {
    const query =
      "INSERT INTO posts(title, content, img, category, user_id) VALUES (?,?,?,?,?);";
    const { title, content, category } = req.body;
    const img = req.file ? req.file.filename : null;
    db.pool.execute(
      query,
      [title, content, img, category, userId],
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

router.put("/update-post/:postId", upload.single("img"), async (req, res) => {
  const postId = req.params.postId;
  const { title, content } = req.body;
  let img = req.file ? req.file.filename : null;

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

    // Construct the update query
    const updateQuery = `UPDATE posts SET ${updateFields.join(
      ", "
    )} WHERE post_id = ?`;
    queryParams.push(postId);

    console.log(updateQuery);
    // Execute the update query
    await db.pool.execute(updateQuery, queryParams);

    return res.send(util.successMessage("Post updated successfully"));
  } catch (error) {
    console.error("Error updating post:", error);
    return res.send(util.errorMessage("Internal server error"));
  }
});

router.delete("/delete-post/:postId", (req, res) => {
  const postId = req.params.postId;

  const query = `UPDATE posts SET isDeleted = 1 WHERE post_id = ?`;

  db.pool.execute(query, [postId], (error, result) => {
    if (error) {
      res.send(util.errorMessage("Internal server error"));
    } else {
      if (result.affectedRows > 0) {
        res.send(util.successMessage("Post deleted successfully"));
      } else {
        res.send(util.errorMessage("Post not found"));
      }
    }
  });
});

router.get("/search", (req, res) => {
  const searchTerm = req.query.q;
  const query = `SELECT post_id, title, content, img FROM posts WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ?`; // Updated SQL query to search in both title and content in a case-insensitive manner
  const searchValue = `%${searchTerm.toLowerCase()}%`; // Convert the search term to lowercase for case-insensitive search
  const searchValues = [searchValue, searchValue];
  db.pool.query(query, searchValues, (error, data) => {
    if (error) {
      res.send(util.errorMessage(error));
    } else {
      res.send(util.successMessage(data));
    }
  });
});

module.exports = router;
