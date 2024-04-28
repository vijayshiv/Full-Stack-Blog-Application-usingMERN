const express = require("express");
const encrypt = require("crypto-js");
const db = require("../db");
const utils = require("../utils");
const router = express.Router();

router.post("/register", (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;
  const query = `INSERT INTO register(firstName, lastName, email, password, phone) VALUES(?,?,?,?,?);`;
  const encryptedPassword = String(encrypt.SHA224(password));
  db.pool.execute(
    query,
    [firstName, lastName, email, encryptedPassword, phone],
    (error, data) => {
      res.send(utils.resultMsg(error, data));
    }
  );
});

module.exports = router;
