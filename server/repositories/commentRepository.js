const { pool } = require('../db');

class CommentRepository {

  // Get comments for a post
  static async findByPostId(postId) {
    const query = `
      SELECT 
        comments.comment_id, 
        comments.content, 
        comments.createdTimestamp, 
        users.fullname,
        users.id
      FROM comments 
      JOIN users ON comments.user_id = users.id 
      WHERE comments.post_id = ?
    `;
    const [rows] = await pool.query(query, [postId]);
    return rows;
  }

  // Add a comment
  static async create(postId, userId, content) {
    const query = "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)";
    const [result] = await pool.execute(query, [postId, userId, content]);
    return result;
  }

  // Update a comment
  static async update(content, commentId, userId) {
    const query = "UPDATE comments SET content = ? WHERE comment_id = ? AND user_id = ?";
    const [result] = await pool.execute(query, [content, commentId, userId]);
    return result;
  }

  // Delete a comment
  static async delete(commentId, userId) {
    const query = "DELETE FROM comments WHERE comment_id = ? AND user_id = ?";
    const [result] = await pool.execute(query, [commentId, userId]);
    return result;
  }
}

module.exports = CommentRepository;
