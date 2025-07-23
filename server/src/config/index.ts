import {
  AppConfig,
  DatabaseConfig,
  AuthConfig,
  EmailConfig,
  ServerConfig,
} from "../types";

// Database configuration
const databaseConfig: DatabaseConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "root",
  database: process.env.DB_NAME || "blogapp",
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
};

// Authentication configuration
const authConfig: AuthConfig = {
  secretKey: process.env.JWT_SECRET || "nRtdxIt1QgT9VHjftlSvfbFYl55EZit1",
  tokenExpiry: process.env.JWT_EXPIRY || "24h",
};

// Email configuration
const emailConfig: EmailConfig = {
  user: process.env.EMAIL_USER || "riprogressmedia@gmail.com",
  password: process.env.EMAIL_PASS || "sclweqmbmawenjeb",
  service: process.env.EMAIL_SERVICE || "gmail",
};

// Server configuration
const serverConfig: ServerConfig = {
  port: parseInt(process.env.PORT || "4000", 10),
  host: process.env.HOST || "0.0.0.0",
  nodeEnv: process.env.NODE_ENV || "development",
};

// Main configuration object with backward compatibility
const config: AppConfig = {
  database: databaseConfig,
  auth: authConfig,
  email: emailConfig,
  server: serverConfig,

  // Legacy properties for backward compatibility
  dbHost: databaseConfig.host,
  dbUser: databaseConfig.user,
  dbPassword: databaseConfig.password,
  dbName: databaseConfig.database,
  secretKey: authConfig.secretKey,
  emailUser: emailConfig.user,
  emailPass: emailConfig.password,
};

export default config;
export { databaseConfig, authConfig, emailConfig, serverConfig };
