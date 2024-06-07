const express = require("express");
const db = require("../db");
const util = require("../utils");
const jwt = require("jsonwebtoken");
const config = require("../config");

const router = express.Router();

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

router.post("/my-post", (req, res) => {
  const token = req.headers["token"];
  if (!token || token.length == 0) {
    res.send(util.errorMessage("Token not found"));
  }
  try {
    const query =
      "INSERT INTO posts(title, content, img, user_id) VALUES (?,?,?,?);";
    const payload = jwt.verify(token, config.secretKey);
    const { title, content, img } = req.body;
    const { id } = payload;
    db.pool.execute(query, [title, content, img, id], (error, data) => {
      if (error) {
        res.send(util.errorMessage(error));
      } else {
        res.send(util.successMessage(data));
      }
    });
  } catch (ex) {}
});
module.exports = router;
