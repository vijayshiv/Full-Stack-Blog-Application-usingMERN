import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db";
import { User, DatabaseResult } from "../types";

export class UserRepository {
  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User[]> {
    const query = "SELECT * FROM users WHERE email = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [email]);
    return rows as User[];
  }

  /**
   * Find user by ID
   */
  static async findById(id: number): Promise<User | null> {
    const query = "SELECT * FROM users WHERE id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  /**
   * Create a new user
   */
  static async create(
    fullname: string,
    email: string,
    hashedPassword: string
  ): Promise<DatabaseResult> {
    const query =
      "INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)";
    const [result] = await pool.execute<ResultSetHeader>(query, [
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
  static async update(id: number, fullname: string): Promise<DatabaseResult> {
    const query = "UPDATE users SET fullname = ? WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [fullname, id]);
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    };
  }

  /**
   * Delete user by ID
   */
  static async delete(id: number): Promise<DatabaseResult> {
    const query = "DELETE FROM users WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);
    return {
      affectedRows: result.affectedRows,
    };
  }

  /**
   * Get all users (admin function)
   */
  static async findAll(): Promise<User[]> {
    const query =
      "SELECT id, fullname, email, createdTimestamp FROM users ORDER BY createdTimestamp DESC";
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as User[];
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    const query = "SELECT COUNT(*) as count FROM users WHERE email = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [email]);
    return (rows[0] as { count: number }).count > 0;
  }

  /**
   * Update user password
   */
  static async updatePassword(
    email: string,
    hashedPassword: string
  ): Promise<DatabaseResult> {
    const query = "UPDATE users SET password = ? WHERE email = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [
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
  static async getUserCount(): Promise<number> {
    const query = "SELECT COUNT(*) as count FROM users";
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return (rows[0] as { count: number }).count;
  }

  /**
   * Get users with pagination
   */
  static async findWithPagination(
    offset: number,
    limit: number
  ): Promise<User[]> {
    const query = `
      SELECT id, fullname, email, createdTimestamp 
      FROM users 
      ORDER BY createdTimestamp DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [limit, offset]);
    return rows as User[];
  }

  /**
   * Search users by name or email
   */
  static async search(searchTerm: string): Promise<User[]> {
    const query = `
      SELECT id, fullname, email, createdTimestamp 
      FROM users 
      WHERE fullname LIKE ? OR email LIKE ?
      ORDER BY createdTimestamp DESC
    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await pool.query<RowDataPacket[]>(query, [
      searchPattern,
      searchPattern,
    ]);
    return rows as User[];
  }

  /**
   * Check if email exists (alias for emailExists)
   */
  static async checkEmailExists(email: string): Promise<boolean> {
    return this.emailExists(email);
  }

  /**
   * Find user by email and password for login
   */
  static async findByEmailAndPassword(
    email: string,
    hashedPassword: string
  ): Promise<User[]> {
    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [
      email,
      hashedPassword,
    ]);
    return rows as User[];
  }

  /**
   * Find user password by ID (for password updates)
   */
  static async findPasswordById(id: number): Promise<{ password: string }[]> {
    const query = "SELECT password FROM users WHERE id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    return rows as { password: string }[];
  }

  /**
   * Update user with flexible fields
   */
  static async updateFlexible(
    updateFields: string[],
    values: string[],
    id: number
  ): Promise<DatabaseResult> {
    const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
    const allValues = [...values, id.toString()];
    const [result] = await pool.execute<ResultSetHeader>(query, allValues);
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    };
  }

  /**
   * Soft delete user (mark as deleted)
   */
  static async softDelete(id: number): Promise<DatabaseResult> {
    const query = "UPDATE users SET isDeleted = 1 WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [id]);
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    };
  }

  /**
   * Update reset token for password reset
   */
  static async updateResetToken(
    resetToken: string,
    resetTokenExpiration: Date,
    userId: number
  ): Promise<DatabaseResult> {
    const query =
      "UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [
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
  static async findByResetToken(token: string): Promise<User[]> {
    // Get the user with reset token regardless of expiration first
    const query = "SELECT * FROM users WHERE reset_token = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [token]);

    if (rows.length === 0) {
      return [];
    }

    // Check expiration in application layer to handle timezone properly
    const dbUser = rows[0];
    const now = new Date();

    // Map database snake_case to camelCase for TypeScript
    const user: User = {
      id: dbUser.id,
      fullname: dbUser.fullname,
      email: dbUser.email,
      password: dbUser.password,
      createdTimestamp: dbUser.created_at,
      resetToken: dbUser.reset_token,
      resetTokenExpiration: dbUser.reset_token_expiration,
    };

    const expiration = new Date(user.resetTokenExpiration!);

    console.log("DEBUG: Repository - Token validation:");
    console.log("  Token found:", token?.substring(0, 8) + "...");
    console.log("  Current time (UTC):", now.toISOString());
    console.log("  Token expires (DB):", user.resetTokenExpiration);
    console.log("  Token expires (UTC):", expiration.toISOString());
    console.log(
      "  Time difference (minutes):",
      (expiration.getTime() - now.getTime()) / (1000 * 60)
    );
    console.log("  Is expired:", now > expiration);

    // Return user only if token is not expired
    if (now > expiration) {
      console.log(
        "DEBUG: Repository - Token is expired, returning empty result"
      );
      return [];
    }

    return [user];
  }

  /**
   * Update password and clear reset token
   */
  static async updatePasswordAndClearToken(
    hashedPassword: string,
    userId: number
  ): Promise<DatabaseResult> {
    const query =
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [
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
  static async exists(userId: number): Promise<boolean> {
    const query = "SELECT COUNT(*) as count FROM users WHERE id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
    return (rows[0] as { count: number }).count > 0;
  }

  /**
   * Get posts count for a user
   */
  static async getPostsCount(userId: number): Promise<number> {
    const query = "SELECT COUNT(*) as count FROM posts WHERE user_id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
    return (rows[0] as { count: number }).count;
  }

  /**
   * Get comments count for a user
   */
  static async getCommentsCount(userId: number): Promise<number> {
    const query = "SELECT COUNT(*) as count FROM comments WHERE user_id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
    return (rows[0] as { count: number }).count;
  }

  /**
   * Update user password by user ID (used for password reset)
   */
  static async updatePasswordByUserId(
    hashedPassword: string,
    userId: number
  ): Promise<DatabaseResult> {
    const query =
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [
      hashedPassword,
      userId,
    ]);
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    };
  }
}

export default UserRepository;
