const express = require("express");
const db = require("../db");
const util = require("../utils");
const jwt = require("jsonwebtoken");
const config = require("../config");
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
  const token = req.headers["token"];
  if (!token || token.length == 0) {
    res.send(util.errorMessage("Token not found"));
    return;
  }
  try {
    const query =
      "INSERT INTO posts(title, content, img, category, user_id) VALUES (?,?,?,?,?);";
    const payload = jwt.verify(token, config.secretKey);
    const { title, content, category } = req.body;
    const img = req.file ? req.file.filename : null; // Retrieve filename from multer
    const { id } = payload;
    db.pool.execute(
      query,
      [title, content, img, category, id],
      (error, data) => {
        if (error) {
          res.send(util.errorMessage(error));
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
