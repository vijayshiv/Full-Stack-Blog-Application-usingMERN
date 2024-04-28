const express = require("express");
const encrypt = require("crypto-js");
const jwt = require("jsonwebtoken");
const db = require("../db");
const utils = require("../utils");
const key = require("../config");
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

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query = `SELECT id, firstName, lastName, email, password, phone, isDeleted FROM register;`;
  const decryptedPassword = String(encrypt.SHA224(password));
  db.pool.execute(query, [email, decryptedPassword], (error, data) => {
    if (error) {
      res.send(utils.errorResult(error));
    } else {
      if (data.length == 0) {
        res.send(utils.errorResult("User not found!!!"));
      } else {
        if (data[0]["isDeleted"] == 1) {
          res.send(utils.errorResult("Account Deleted"));
        } else {
          const payload = { id: data[0].id };
          const token = jwt.sign(payload, key.secretKey);

          const user = {
            name: `${data[0].firstName} ${data[0].lastName}`,
            email: data[0].email,
            token,
          };
          res.send(utils.successResult(user));
        }
      }
    }
  });
});

router.get("/profile", (req, res) => {
  const token = req.headers["token"];

  if (!token || token.length == 0) {
    res.send(utils.errorResult("Token not found"));
    return;
  }

  try {
    const query = `SELECT firstName, lastName, email, phone FROM register WHERE id = ?;`;
    const payload = jwt.verify(token, key.secretKey);
    const { id } = payload;

    db.pool.execute(query, [id], (error, data) => {
      if (error) {
        res.send(utils.errorResult(error));
      } else {
        if (data.length == 0) {
          res.send(utils.errorResult("User not found!!!"));
        } else {
          res.send(utils.successResult(data[0]));
        }
      }
    });
  } catch (ex) {
    res.send(utils.errorResult("Invalid Token"));
  }
});
module.exports = router;
