"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const db_1 = require("../db");
class CommentRepository {
    /**
     * Get all comments for a specific post with threading support
     */
    static async findByPostId(postId) {
        const query = `
      SELECT 
        comments.comment_id,
        comments.content,
        comments.user_id,
        comments.post_id,
        comments.createdTimestamp,
        comments.parent_comment_id,
        comments.reply_count,
        users.fullname,
        users.id
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = ? AND users.isDeleted = 0
      ORDER BY 
        COALESCE(comments.parent_comment_id, comments.comment_id),
        comments.createdTimestamp ASC
    `;
        const [rows] = await db_1.pool.query(query, [postId]);
        return rows;
    }
    /**
     * Get comments organized as threads for a specific post
     */
    static async findThreadsByPostId(postId) {
        const comments = await this.findByPostId(postId);
        return this.organizeCommentsIntoThreads(comments);
    }
    /**
     * Get replies for a specific comment
     */
    static async findRepliesByCommentId(commentId) {
        const query = `
      SELECT 
        comments.comment_id,
        comments.content,
        comments.user_id,
        comments.post_id,
        comments.createdTimestamp,
        comments.parent_comment_id,
        comments.reply_count,
        users.fullname,
        users.id
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.parent_comment_id = ? AND users.isDeleted = 0
      ORDER BY comments.createdTimestamp ASC
    `;
        const [rows] = await db_1.pool.query(query, [commentId]);
        return rows;
    }
    /**
     * Organize flat comments into threaded structure
     */
    static organizeCommentsIntoThreads(comments) {
        const commentMap = new Map();
        const rootComments = [];
        // First pass: create comment objects and map them
        comments.forEach((comment) => {
            const threadComment = {
                ...comment,
                replies: [],
                depth_level: comment.parent_comment_id ? 1 : 0,
            };
            commentMap.set(comment.comment_id, threadComment);
        });
        // Second pass: organize into threads
        comments.forEach((comment) => {
            const threadComment = commentMap.get(comment.comment_id);
            if (comment.parent_comment_id) {
                // This is a reply
                const parentComment = commentMap.get(comment.parent_comment_id);
                if (parentComment) {
                    parentComment.replies.push(threadComment);
                    threadComment.depth_level = (parentComment.depth_level || 0) + 1;
                }
            }
            else {
                // This is a root comment
                rootComments.push(threadComment);
            }
        });
        return rootComments;
    }
    /**   * Get all comments by a specific user   */ static async findByUserId(userId) {
        const query = `
      SELECT 
        comments.comment_id,
        comments.content,
        comments.user_id,
        comments.post_id,
        comments.createdTimestamp,
        users.fullname,
        users.id
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.user_id = ?
      ORDER BY comments.createdTimestamp DESC
    `;
        const [rows] = await db_1.pool.query(query, [userId]);
        return rows;
    }
    /**   * Find comment by ID   */ static async findById(commentId) {
        const query = `
      SELECT 
        comments.comment_id,
        comments.content,
        comments.user_id,
        comments.post_id,
        comments.createdTimestamp,
        users.fullname,
        users.id
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.comment_id = ?
    `;
        const [rows] = await db_1.pool.query(query, [commentId]);
        return rows.length > 0 ? rows[0] : null;
    }
    /**
     * Create a new comment or reply
     */
    static async create(commentText, userId, postId, parentCommentId) {
        const connection = await db_1.pool.getConnection();
        try {
            await connection.beginTransaction();
            // Insert the comment
            const query = parentCommentId
                ? "INSERT INTO comments (content, user_id, post_id, parent_comment_id) VALUES (?, ?, ?, ?)"
                : "INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)";
            const params = parentCommentId
                ? [commentText, userId, postId, parentCommentId]
                : [commentText, userId, postId];
            const [result] = await connection.execute(query, params);
            // If this is a reply, increment the parent's reply count
            if (parentCommentId) {
                await connection.execute("UPDATE comments SET reply_count = reply_count + 1 WHERE comment_id = ?", [parentCommentId]);
            }
            await connection.commit();
            return { insertId: result.insertId, affectedRows: result.affectedRows };
        }
        catch (error) {
            await connection.rollback();
            throw error;
        }
        finally {
            connection.release();
        }
    }
    /**
     * Create a reply to a comment
     */
    static async createReply(commentText, userId, postId, parentCommentId) {
        return this.create(commentText, userId, postId, parentCommentId);
    }
    /**   * Update a comment   */ static async update(commentId, commentText, userId) {
        const query = "UPDATE comments SET content = ? WHERE comment_id = ? AND user_id = ?";
        const [result] = await db_1.pool.execute(query, [
            commentText,
            commentId,
            userId,
        ]);
        return {
            affectedRows: result.affectedRows,
            changedRows: result.changedRows,
        };
    }
    /**   * Delete a comment   */ static async delete(commentId, userId) {
        const query = "DELETE FROM comments WHERE comment_id = ? AND user_id = ?";
        const [result] = await db_1.pool.execute(query, [
            commentId,
            userId,
        ]);
        return { affectedRows: result.affectedRows };
    }
    /**   * Delete all comments for a post (when post is deleted)   */ static async deleteByPostId(postId) {
        const query = "DELETE FROM comments WHERE post_id = ?";
        const [result] = await db_1.pool.execute(query, [postId]);
        return { affectedRows: result.affectedRows };
    }
    /**
     * Check if comment exists and belongs to user
     */
    static async checkOwnership(commentId, userId) {
        const query = "SELECT COUNT(*) as count FROM comments WHERE comment_id = ? AND user_id = ?";
        const [rows] = await db_1.pool.query(query, [
            commentId,
            userId,
        ]);
        return rows[0].count > 0;
    }
    /**
     * Check if comment exists (for reply validation)
     */
    static async commentExists(commentId) {
        const query = "SELECT COUNT(*) as count FROM comments WHERE comment_id = ?";
        const [rows] = await db_1.pool.query(query, [commentId]);
        return rows[0].count > 0;
    }
    /**
     * Get comment details by ID
     */
    static async getCommentDetails(commentId) {
        const query = `
      SELECT 
        comments.comment_id,
        comments.content,
        comments.user_id,
        comments.post_id,
        comments.createdTimestamp,
        comments.parent_comment_id,
        comments.reply_count,
        users.fullname,
        users.id
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.comment_id = ? AND users.isDeleted = 0
    `;
        const [rows] = await db_1.pool.query(query, [commentId]);
        return rows.length > 0 ? rows[0] : null;
    }
    /**   * Get comment count for a specific post   */ static async getCommentCountByPostId(postId) {
        const query = "SELECT COUNT(*) as count FROM comments WHERE post_id = ?";
        const [rows] = await db_1.pool.query(query, [postId]);
        return rows[0].count;
    }
    /**   * Get total comment count for a user   */ static async getCommentCountByUserId(userId) {
        const query = "SELECT COUNT(*) as count FROM comments WHERE user_id = ?";
        const [rows] = await db_1.pool.query(query, [userId]);
        return rows[0].count;
    }
    /**   * Get comments with pagination for a post   */ static async findByPostIdWithPagination(postId, offset, limit) {
        const query = `      SELECT         comments.comment_id,        comments.content,        comments.user_id,        comments.post_id,        comments.createdTimestamp,        users.fullname as author      FROM comments      JOIN users ON comments.user_id = users.id      WHERE comments.post_id = ?      ORDER BY comments.createdTimestamp DESC      LIMIT ? OFFSET ?    `;
        const [rows] = await db_1.pool.query(query, [
            postId,
            limit,
            offset,
        ]);
        return rows;
    }
    /**   * Search comments by text content   */ static async search(searchTerm) {
        const query = `      SELECT         comments.comment_id,        comments.content,        comments.user_id,        comments.post_id,        comments.createdTimestamp,        users.fullname as author      FROM comments      JOIN users ON comments.user_id = users.id      WHERE comments.content LIKE ?      ORDER BY comments.createdTimestamp DESC    `;
        const searchPattern = `%${searchTerm}%`;
        const [rows] = await db_1.pool.query(query, [searchPattern]);
        return rows;
    }
    /**   * Get recent comments across all posts (for admin or feed purposes)   */ static async getRecentComments(limit = 10) {
        const query = `      SELECT         comments.comment_id,        comments.content,        comments.user_id,        comments.post_id,        comments.createdTimestamp,        users.fullname as author      FROM comments      JOIN users ON comments.user_id = users.id      ORDER BY comments.createdTimestamp DESC      LIMIT ?    `;
        const [rows] = await db_1.pool.query(query, [limit]);
        return rows;
    }
    /**   * Get comments with post information (for user profile or admin purposes)   */ static async findWithPostInfo(userId) {
        let query = `      SELECT         comments.comment_id,        comments.content,        comments.user_id,        comments.post_id,        comments.createdTimestamp,        users.fullname as author,        posts.title as post_title      FROM comments      JOIN users ON comments.user_id = users.id      JOIN posts ON comments.post_id = posts.post_id    `;
        const params = [];
        if (userId) {
            query += " WHERE comments.user_id = ?";
            params.push(userId);
        }
        query += " ORDER BY comments.createdTimestamp DESC";
        const [rows] = await db_1.pool.query(query, params);
        return rows;
    }
    /**   * Check if comment exists   */ static async exists(commentId) {
        const query = "SELECT COUNT(*) as count FROM comments WHERE comment_id = ?";
        const [rows] = await db_1.pool.query(query, [commentId]);
        return rows[0].count > 0;
    }
    /**   * Check if post exists (before creating comment)   */ static async postExists(postId) {
        const query = "SELECT COUNT(*) as count FROM posts WHERE post_id = ?";
        const [rows] = await db_1.pool.query(query, [postId]);
        return rows[0].count > 0;
    }
}
exports.CommentRepository = CommentRepository;
exports.default = CommentRepository;
//# sourceMappingURL=commentRepository.js.map