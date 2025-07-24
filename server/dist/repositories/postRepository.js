"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostRepository = void 0;
const db_1 = require("../db");
class PostRepository {
    /**
     * Get all posts with author information
     */
    static async findAll() {
        const query = `
      SELECT 
        posts.post_id, 
        posts.title, 
        posts.content, 
        posts.category, 
        posts.img, 
        posts.user_id, 
        posts.createdTimestamp,
        users.fullname as author
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      ORDER BY posts.createdTimestamp DESC
    `;
        const [rows] = await db_1.pool.query(query);
        return rows;
    }
    /**
     * Find post by ID with author information
     */
    static async findById(id) {
        const query = `
      SELECT 
        posts.post_id, 
        posts.title, 
        posts.content, 
        posts.category, 
        posts.img, 
        posts.user_id, 
        posts.createdTimestamp,
        users.fullname as author
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      WHERE posts.post_id = ? AND posts.isDeleted = 0
    `;
        const [rows] = await db_1.pool.query(query, [id]);
        return rows.length > 0 ? rows[0] : null;
    }
    /**
     * Get single post with user name (for frontend compatibility)
     */
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
      WHERE posts.post_id = ?
    `;
        const [rows] = await db_1.pool.query(query, [id]);
        return rows;
    }
    /**
     * Find posts by category
     */
    static async findByCategory(category) {
        const query = `
      SELECT 
        posts.post_id, 
        posts.title, 
        posts.content, 
        posts.category, 
        posts.img, 
        posts.user_id, 
        posts.createdTimestamp,
        users.fullname as author
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      WHERE posts.category = ?
      ORDER BY posts.createdTimestamp DESC
    `;
        const [rows] = await db_1.pool.query(query, [category]);
        return rows;
    }
    /**
     * Find posts by user ID
     */
    static async findByUserId(userId) {
        const query = `
      SELECT 
        posts.post_id, 
        posts.title, 
        posts.content, 
        posts.category, 
        posts.img, 
        posts.user_id, 
        posts.createdTimestamp,
        users.fullname as author
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      WHERE posts.user_id = ?
      ORDER BY posts.createdTimestamp DESC
    `;
        const [rows] = await db_1.pool.query(query, [userId]);
        return rows;
    }
    /**
     * Create a new post
     */
    static async create(title, content, category, image, userId) {
        const query = "INSERT INTO posts (title, content, category, img, user_id) VALUES (?, ?, ?, ?, ?)";
        const [result] = await db_1.pool.execute(query, [
            title,
            content,
            category,
            image || null,
            userId,
        ]);
        return {
            insertId: result.insertId,
            affectedRows: result.affectedRows,
        };
    }
    /**
     * Update a post
     */
    static async update(postId, title, content, category, image) {
        let query;
        let params;
        if (image) {
            query =
                "UPDATE posts SET title = ?, content = ?, category = ?, img = ? WHERE post_id = ?";
            params = [title, content, category, image, postId];
        }
        else {
            query =
                "UPDATE posts SET title = ?, content = ?, category = ? WHERE post_id = ?";
            params = [title, content, category, postId];
        }
        const [result] = await db_1.pool.execute(query, params);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
        };
    }
    /**
     * Delete a post
     */
    static async delete(postId, userId) {
        const query = "DELETE FROM posts WHERE post_id = ? AND user_id = ?";
        const [result] = await db_1.pool.execute(query, [
            postId,
            userId,
        ]);
        return {
            affectedRows: result.affectedRows,
        };
    }
    /**
     * Search posts by title or content
     */
    static async search(searchTerm) {
        const query = `
      SELECT 
        posts.post_id, 
        posts.title, 
        posts.content, 
        posts.category, 
        posts.img, 
        posts.user_id, 
        posts.createdTimestamp,
        users.fullname as author
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      WHERE posts.title LIKE ? OR posts.content LIKE ? OR posts.category LIKE ?
      ORDER BY posts.createdTimestamp DESC
    `;
        const searchPattern = `%${searchTerm}%`;
        const [rows] = await db_1.pool.query(query, [
            searchPattern,
            searchPattern,
            searchPattern,
        ]);
        return rows;
    }
    /**
     * Get post count
     */
    static async getPostCount() {
        const query = "SELECT COUNT(*) as count FROM posts";
        const [rows] = await db_1.pool.query(query);
        return rows[0].count;
    }
    /**
     * Get posts with pagination
     */
    static async findWithPagination(offset, limit) {
        const query = `
      SELECT 
        posts.post_id, 
        posts.title, 
        posts.content, 
        posts.category, 
        posts.img, 
        posts.user_id, 
        posts.createdTimestamp,
        users.fullname as author
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      ORDER BY posts.createdTimestamp DESC
      LIMIT ? OFFSET ?
    `;
        const [rows] = await db_1.pool.query(query, [limit, offset]);
        return rows;
    }
    /**
     * Get all categories
     */
    static async getCategories() {
        const query = "SELECT DISTINCT category FROM posts ORDER BY category";
        const [rows] = await db_1.pool.query(query);
        return rows.map((row) => row.category);
    }
    /**
     * Check if post exists and belongs to user
     */
    static async checkOwnership(postId, userId) {
        const query = "SELECT COUNT(*) as count FROM posts WHERE post_id = ? AND user_id = ?";
        const [rows] = await db_1.pool.query(query, [postId, userId]);
        return rows[0].count > 0;
    }
    /**
     * Get likes count for a post
     */
    static async getLikesCount(postId) {
        const query = "SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?";
        const [rows] = await db_1.pool.query(query, [postId]);
        return rows[0].count;
    }
    /**
     * Check if user liked a post
     */
    static async isLikedByUser(postId, userId) {
        const query = "SELECT COUNT(*) as count FROM post_likes WHERE post_id = ? AND user_id = ?";
        const [rows] = await db_1.pool.query(query, [postId, userId]);
        return rows[0].count > 0;
    }
    /**
     * Add like to a post
     */
    static async addLike(postId, userId) {
        const query = "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)";
        const [result] = await db_1.pool.execute(query, [
            postId,
            userId,
        ]);
        return {
            insertId: result.insertId,
            affectedRows: result.affectedRows,
        };
    }
    /**
     * Remove like from a post
     */
    static async removeLike(postId, userId) {
        const query = "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?";
        const [result] = await db_1.pool.execute(query, [
            postId,
            userId,
        ]);
        return {
            affectedRows: result.affectedRows,
        };
    }
}
exports.PostRepository = PostRepository;
exports.default = PostRepository;
//# sourceMappingURL=postRepository.js.map