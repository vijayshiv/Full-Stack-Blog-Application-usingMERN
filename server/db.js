const mysql = require("mysql2/promise");
const config = require("./config/index");

// Create a pool with promise support
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  waitForConnections: config.database.waitForConnections,
  connectionLimit: config.database.connectionLimit,
  queueLimit: config.database.queueLimit,
});

module.exports = { pool };
  