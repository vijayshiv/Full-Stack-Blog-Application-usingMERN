const express = require("express");
const db = require("../db");
const util = require("../utils");
const encrypt = require("crypto-js");
const jwt = require("jsonwebtoken");
const config = require("../config");

const router = express.Router();
router.post("/register", (req, res) => {
  const query = "INSERT INTO register(fullname, email, password) VALUES(?,?,?)";
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
    "SELECT id, fullname, email, password, isDeleted FROM register WHERE email = ? AND password = ? AND isDeleted = 0;";
  const { fullname, email, password } = req.body;
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
          const payload = { id: user.id };
          const token = jwt.sign(payload, config.secretKey);
          const userData = {
            token,
            fullname: `${user["fullname"]}`,
          };
          res.send(util.successMessage(userData));
        }
      }
    }
  });
});


module.exports = router;
