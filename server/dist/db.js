"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.closeConnection = exports.testConnection = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = __importDefault(require("./config"));
// Create connection pool with TypeScript types
const pool = promise_1.default.createPool({
    host: config_1.default.database.host,
    user: config_1.default.database.user,
    password: config_1.default.database.password,
    database: config_1.default.database.database,
    connectionLimit: config_1.default.database.connectionLimit,
    queueLimit: config_1.default.database.queueLimit,
    waitForConnections: config_1.default.database.waitForConnections,
    charset: 'utf8mb4',
    timezone: '+00:00'
});
exports.pool = pool;
// Test database connection
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        throw error;
    }
};
exports.testConnection = testConnection;
// Graceful shutdown
const closeConnection = async () => {
    try {
        await pool.end();
        console.log('📦 Database connection pool closed');
    }
    catch (error) {
        console.error('❌ Error closing database connection:', error);
        throw error;
    }
};
exports.closeConnection = closeConnection;
exports.default = pool;
//# sourceMappingURL=db.js.map