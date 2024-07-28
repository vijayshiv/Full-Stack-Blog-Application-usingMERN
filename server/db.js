const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "vijayshiv",
  password: "Shiva123@",
  database: "blogapp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = { pool };
