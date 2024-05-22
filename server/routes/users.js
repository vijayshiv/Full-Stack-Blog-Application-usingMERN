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

module.exports = router;
