const { pool } = require('../db');

class PostRepository {

  // Get all posts
  static async findAll() {
    const query = "SELECT post_id, title, content, img FROM posts;";
    const [rows] = await pool.query(query);
    return rows;
  }

  // Create a new post
  static async create(title, content, img, category, userId) {
    const query = "INSERT INTO posts(title, content, img, category, user_id) VALUES (?,?,?,?,?);";
    const [result] = await pool.execute(query, [title, content, img, category, userId]);
    return result;
  }

  // Get single post with user name
  static async findByIdWithUser(id) {
    const query = `
      SELECT 
        posts.title, 
        posts.content, 
        posts.img, 
        posts.category, 
        posts.user_id, 
        users.fullname AS user_name 
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      WHERE posts.post_id = ?;
    `;
    const [rows] = await pool.query(query, [id]);
    return rows;
  }

  // Get posts by category
  static async findByCategory(category) {
    const query = "SELECT post_id, title, content, img FROM posts WHERE category = ?;";
    const [rows] = await pool.query(query, [category]);
    return rows;
  }

  // Get posts by user
  static async findByUserId(userId) {
    const query = `SELECT post_id, title, content, img, category FROM posts WHERE user_id = ? AND isDeleted = 0;`;
    const [rows] = await pool.query(query, [userId]);
    return rows;
  }

  // Update post
  static async update(updateFields, queryParams, postId) {
    const updateQuery = `UPDATE posts SET ${updateFields.join(", ")} WHERE post_id = ?`;
    queryParams.push(postId);
    const [result] = await pool.execute(updateQuery, queryParams);
    return result;
  }

  // Soft delete post
  static async softDelete(postId) {
    const query = `UPDATE posts SET isDeleted = 1 WHERE post_id = ?`;
    const [result] = await pool.execute(query, [postId]);
    return result;
  }

  // Search posts
  static async search(searchValue) {
    const query = `SELECT post_id, title, content, img FROM posts WHERE LOWER(title) LIKE ? OR LOWER(content) LIKE ?`;
    const [rows] = await pool.query(query, [searchValue, searchValue]);
    return rows;
  }

  // Get post likes count
  static async getLikesCount(postId) {
    const query = "SELECT likes FROM posts WHERE post_id = ? AND isDeleted = 0";
    const [rows] = await pool.query(query, [postId]);
    return rows;
  }

  // Check if user liked post
  static async checkUserLiked(postId, userId) {
    const query = "SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?";
    const [rows] = await pool.query(query, [postId, userId]);
    return rows;
  }

  // Add like
  static async addLike(postId, userId) {
    const query = "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)";
    const [result] = await pool.query(query, [postId, userId]);
    return result;
  }

  // Remove like
  static async removeLike(postId, userId) {
    const query = "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?";
    const [result] = await pool.query(query, [postId, userId]);
    return result;
  }

  // Update likes count
  static async updateLikesCount(postId) {
    const query = `
      UPDATE posts 
      SET likes = (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) 
      WHERE post_id = ?;
    `;
    const [result] = await pool.query(query, [postId, postId]);
    return result;
  }
}

module.exports = PostRepository;
