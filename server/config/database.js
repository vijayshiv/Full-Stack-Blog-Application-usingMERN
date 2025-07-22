const database = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root", 
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "blogapp",
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true
};

module.exports = database;
