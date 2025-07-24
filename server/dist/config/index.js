"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisConfig = exports.serverConfig = exports.emailConfig = exports.authConfig = exports.databaseConfig = void 0;
// Database configuration
const databaseConfig = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "root",
    database: process.env.DB_NAME || "blogapp",
    connectionLimit: 10,
    queueLimit: 0,
    waitForConnections: true,
};
exports.databaseConfig = databaseConfig;
// Authentication configuration
const authConfig = {
    secretKey: process.env.JWT_SECRET || "nRtdxIt1QgT9VHjftlSvfbFYl55EZit1",
    tokenExpiry: process.env.JWT_EXPIRY || "24h",
};
exports.authConfig = authConfig;
// Email configuration
const emailConfig = {
    user: process.env.EMAIL_USER || "riprogressmedia@gmail.com",
    password: process.env.EMAIL_PASS || "sclweqmbmawenjeb",
    service: process.env.EMAIL_SERVICE || "gmail",
};
exports.emailConfig = emailConfig;
// Server configuration
const serverConfig = {
    port: parseInt(process.env.PORT || "4000", 10),
    host: process.env.HOST || "0.0.0.0",
    nodeEnv: process.env.NODE_ENV || "development",
};
exports.serverConfig = serverConfig;
// Redis configuration
const redisConfig = {
    url: process.env.REDIS_URL || "redis://localhost:6379",
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    password: process.env.REDIS_PASSWORD,
};
exports.redisConfig = redisConfig;
// Main configuration object with backward compatibility
const config = {
    database: databaseConfig,
    auth: authConfig,
    email: emailConfig,
    server: serverConfig,
    redis: redisConfig,
    // Legacy properties for backward compatibility
    dbHost: databaseConfig.host,
    dbUser: databaseConfig.user,
    dbPassword: databaseConfig.password,
    dbName: databaseConfig.database,
    secretKey: authConfig.secretKey,
    emailUser: emailConfig.user,
    emailPass: emailConfig.password,
};
exports.default = config;
//# sourceMappingURL=index.js.map