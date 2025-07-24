"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const db_1 = require("../db");
class UserRepository {
    /**
     * Find user by email
     */
    static async findByEmail(email) {
        const query = "SELECT * FROM users WHERE email = ?";
        const [rows] = await db_1.pool.query(query, [email]);
        return rows;
    }
    /**
     * Find user by ID
     */
    static async findById(id) {
        const query = "SELECT * FROM users WHERE id = ?";
        const [rows] = await db_1.pool.query(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
    /**
     * Create a new user
     */
    static async create(fullname, email, hashedPassword) {
        const query = "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)";
        const [result] = await db_1.pool.execute(query, [
            fullname,
            email,
            hashedPassword,
        ]);
        return {
            insertId: result.insertId,
            affectedRows: result.affectedRows,
        };
    }
    /**
     * Update user information
     */
    static async update(id, fullname) {
        const query = "UPDATE users SET fullname = ? WHERE id = ?";
        const [result] = await db_1.pool.execute(query, [fullname, id]);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
        };
    }
    /**
     * Delete user by ID
     */
    static async delete(id) {
        const query = "DELETE FROM users WHERE id = ?";
        const [result] = await db_1.pool.execute(query, [id]);
        return {
            affectedRows: result.affectedRows,
        };
    }
    /**
     * Get all users (admin function)
     */
    static async findAll() {
        const query = "SELECT id, fullname, email, createdTimestamp FROM users ORDER BY createdTimestamp DESC";
        const [rows] = await db_1.pool.query(query);
        return rows;
    }
    /**
     * Check if email exists
     */
    static async emailExists(email) {
        const query = "SELECT COUNT(*) as count FROM users WHERE email = ?";
        const [rows] = await db_1.pool.query(query, [email]);
        return rows[0].count > 0;
    }
    /**
     * Update user password
     */
    static async updatePassword(email, hashedPassword) {
        const query = "UPDATE users SET password = ? WHERE email = ?";
        const [result] = await db_1.pool.execute(query, [
            hashedPassword,
            email,
        ]);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
        };
    }
    /**
     * Get user count
     */
    static async getUserCount() {
        const query = "SELECT COUNT(*) as count FROM users";
        const [rows] = await db_1.pool.query(query);
        return rows[0].count;
    }
    /**
     * Get users with pagination
     */
    static async findWithPagination(offset, limit) {
        const query = `
      SELECT id, fullname, email, createdTimestamp 
      FROM users 
      ORDER BY createdTimestamp DESC 
      LIMIT ? OFFSET ?
    `;
        const [rows] = await db_1.pool.query(query, [limit, offset]);
        return rows;
    }
    /**
     * Search users by name or email
     */
    static async search(searchTerm) {
        const query = `
      SELECT id, fullname, email, createdTimestamp 
      FROM users 
      WHERE fullname LIKE ? OR email LIKE ?
      ORDER BY createdTimestamp DESC
    `;
        const searchPattern = `%${searchTerm}%`;
        const [rows] = await db_1.pool.query(query, [
            searchPattern,
            searchPattern,
        ]);
        return rows;
    }
    /**
     * Check if email exists (alias for emailExists)
     */
    static async checkEmailExists(email) {
        return this.emailExists(email);
    }
    /**
     * Find user by email and password for login
     */
    static async findByEmailAndPassword(email, hashedPassword) {
        const query = "SELECT * FROM users WHERE email = ? AND password = ?";
        const [rows] = await db_1.pool.query(query, [
            email,
            hashedPassword,
        ]);
        return rows;
    }
    /**
     * Find user password by ID (for password updates)
     */
    static async findPasswordById(id) {
        const query = "SELECT password FROM users WHERE id = ?";
        const [rows] = await db_1.pool.query(query, [id]);
        return rows;
    }
    /**
     * Update user with flexible fields
     */
    static async updateFlexible(updateFields, values, id) {
        const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
        const allValues = [...values, id.toString()];
        const [result] = await db_1.pool.execute(query, allValues);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
        };
    }
    /**
     * Soft delete user (mark as deleted)
     */
    static async softDelete(id) {
        const query = "UPDATE users SET isDeleted = 1 WHERE id = ?";
        const [result] = await db_1.pool.execute(query, [id]);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
        };
    }
    /**
     * Update reset token for password reset
     */
    static async updateResetToken(resetToken, resetTokenExpiration, userId) {
        const query = "UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE id = ?";
        const [result] = await db_1.pool.execute(query, [
            resetToken,
            resetTokenExpiration,
            userId,
        ]);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
        };
    }
    /**
     * Find user by reset token
     */
    static async findByResetToken(token) {
        // Get the user with reset token regardless of expiration first
        const query = "SELECT * FROM users WHERE reset_token = ?";
        const [rows] = await db_1.pool.query(query, [token]);
        if (rows.length === 0) {
            return [];
        }
        // Check expiration in application layer to handle timezone properly
        const dbUser = rows[0];
        const now = new Date();
        // Map database snake_case to camelCase for TypeScript
        const user = {
            id: dbUser.id,
            fullname: dbUser.fullname,
            email: dbUser.email,
            password: dbUser.password,
            createdTimestamp: dbUser.created_at,
            resetToken: dbUser.reset_token,
            resetTokenExpiration: dbUser.reset_token_expiration,
        };
        const expiration = new Date(user.resetTokenExpiration);
        console.log("DEBUG: Repository - Token validation:");
        console.log("  Token found:", token?.substring(0, 8) + "...");
        console.log("  Current time (UTC):", now.toISOString());
        console.log("  Token expires (DB):", user.resetTokenExpiration);
        console.log("  Token expires (UTC):", expiration.toISOString());
        console.log("  Time difference (minutes):", (expiration.getTime() - now.getTime()) / (1000 * 60));
        console.log("  Is expired:", now > expiration);
        // Return user only if token is not expired
        if (now > expiration) {
            console.log("DEBUG: Repository - Token is expired, returning empty result");
            return [];
        }
        return [user];
    }
    /**
     * Update password and clear reset token
     */
    static async updatePasswordAndClearToken(hashedPassword, userId) {
        const query = "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?";
        const [result] = await db_1.pool.execute(query, [
            hashedPassword,
            userId,
        ]);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
        };
    }
    /**
     * Check if user exists
     */
    static async exists(userId) {
        const query = "SELECT COUNT(*) as count FROM users WHERE id = ?";
        const [rows] = await db_1.pool.query(query, [userId]);
        return rows[0].count > 0;
    }
    /**
     * Get posts count for a user
     */
    static async getPostsCount(userId) {
        const query = "SELECT COUNT(*) as count FROM posts WHERE user_id = ?";
        const [rows] = await db_1.pool.query(query, [userId]);
        return rows[0].count;
    }
    /**
     * Get comments count for a user
     */
    static async getCommentsCount(userId) {
        const query = "SELECT COUNT(*) as count FROM comments WHERE user_id = ?";
        const [rows] = await db_1.pool.query(query, [userId]);
        return rows[0].count;
    }
    /**
     * Update user password by user ID (used for password reset)
     */
    static async updatePasswordByUserId(hashedPassword, userId) {
        const query = "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?";
        const [result] = await db_1.pool.execute(query, [
            hashedPassword,
            userId,
        ]);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
        };
    }
}
exports.UserRepository = UserRepository;
exports.default = UserRepository;
//# sourceMappingURL=userRepository.js.map