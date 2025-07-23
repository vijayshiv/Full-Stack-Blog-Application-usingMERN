import mysql from 'mysql2/promise';
import config from './config';
import { DatabaseConfig } from './types';

// Create connection pool with TypeScript types
const pool = mysql.createPool({
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
  connectionLimit: config.database.connectionLimit,
  queueLimit: config.database.queueLimit,
  waitForConnections: config.database.waitForConnections,
  charset: 'utf8mb4',
  timezone: '+00:00'
});

// Test database connection
export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Graceful shutdown
export const closeConnection = async (): Promise<void> => {
  try {
    await pool.end();
    console.log('📦 Database connection pool closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
    throw error;
  }
};

export { pool };
export default pool;
