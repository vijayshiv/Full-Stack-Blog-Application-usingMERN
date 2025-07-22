const { pool } = require('../db');

class UserRepository {
  
  // Create a new user
  static async create(fullname, email, encryptedPassword) {
    const query = "INSERT INTO users(fullname, email, password) VALUES(?,?,?)";
    const [result] = await pool.execute(query, [fullname, email, encryptedPassword]);
    return result;
  }

  // Check if email exists
  static async checkEmailExists(email) {
    const query = "SELECT COUNT(*) as count FROM users WHERE email = ?";
    const [results] = await pool.execute(query, [email]);
    return results[0].count > 0;
  }

  // Find user by email and password
  static async findByEmailAndPassword(email, encryptedPassword) {
    const query = "SELECT id, fullname, email, password, isDeleted FROM users WHERE email = ? AND password = ? AND isDeleted = 0";
    const [users] = await pool.execute(query, [email, encryptedPassword]);
    return users;
  }

  // Find user by ID
  static async findById(userId) {
    const query = "SELECT fullname, email, isDeleted FROM users WHERE id = ?";
    const [data] = await pool.execute(query, [userId]);
    return data;
  }

  // Find user password by ID
  static async findPasswordById(userId) {
    const query = "SELECT password FROM users WHERE id = ?";
    const [userData] = await pool.execute(query, [userId]);
    return userData;
  }

  // Update user
  static async update(updateFields, values, userId) {
    const query = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
    values.push(userId);
    const [result] = await pool.execute(query, values);
    return result;
  }

  // Soft delete user
  static async softDelete(userId) {
    const query = "UPDATE users SET isDeleted = 1 WHERE id = ?";
    const [result] = await pool.execute(query, [userId]);
    return result;
  }

  // Find user by email for password reset
  static async findByEmail(email) {
    const query = "SELECT id FROM users WHERE email = ?";
    const [users] = await pool.execute(query, [email]);
    return users;
  }

  // Update reset token
  static async updateResetToken(resetToken, resetTokenExpiration, userId) {
    const query = "UPDATE users SET reset_token = ?, reset_token_expiration = ? WHERE id = ?";
    const [result] = await pool.execute(query, [resetToken, resetTokenExpiration, userId]);
    return result;
  }

  // Find user by reset token
  static async findByResetToken(token) {
    const query = "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiration > NOW()";
    const [users] = await pool.execute(query, [token]);
    return users;
  }

  // Update password and clear reset token
  static async updatePasswordAndClearToken(encryptedPassword, userId) {
    const query = "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiration = NULL WHERE id = ?";
    const [result] = await pool.execute(query, [encryptedPassword, userId]);
    return result;
  }
}

module.exports = UserRepository;
