import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db";
import { Comment, CommentWithUser, DatabaseResult } from "../types";
export class CommentRepository {
  /**   * Get all comments for a specific post   */ static async findByPostId(
    postId: number
  ): Promise<CommentWithUser[]> {
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
      WHERE comments.post_id = ?
      ORDER BY comments.createdTimestamp DESC
    `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [postId]);
    return rows as CommentWithUser[];
  }
  /**   * Get all comments by a specific user   */ static async findByUserId(
    userId: number
  ): Promise<CommentWithUser[]> {
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
    const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
    return rows as CommentWithUser[];
  }
  /**   * Find comment by ID   */ static async findById(
    commentId: number
  ): Promise<CommentWithUser | null> {
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
    const [rows] = await pool.query<RowDataPacket[]>(query, [commentId]);
    return rows.length > 0 ? (rows[0] as CommentWithUser) : null;
  }
  /**   * Create a new comment   */ static async create(
    commentText: string,
    userId: number,
    postId: number
  ): Promise<DatabaseResult> {
    const query =
      "INSERT INTO comments (content, user_id, post_id) VALUES (?, ?, ?)";
    const [result] = await pool.execute<ResultSetHeader>(query, [
      commentText,
      userId,
      postId,
    ]);
    return { insertId: result.insertId, affectedRows: result.affectedRows };
  }
  /**   * Update a comment   */ static async update(
    commentId: number,
    commentText: string,
    userId: number
  ): Promise<DatabaseResult> {
    const query =
      "UPDATE comments SET content = ? WHERE comment_id = ? AND user_id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [
      commentText,
      commentId,
      userId,
    ]);
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    };
  }
  /**   * Delete a comment   */ static async delete(
    commentId: number,
    userId: number
  ): Promise<DatabaseResult> {
    const query = "DELETE FROM comments WHERE comment_id = ? AND user_id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [
      commentId,
      userId,
    ]);
    return { affectedRows: result.affectedRows };
  }
  /**   * Delete all comments for a post (when post is deleted)   */ static async deleteByPostId(
    postId: number
  ): Promise<DatabaseResult> {
    const query = "DELETE FROM comments WHERE post_id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [postId]);
    return { affectedRows: result.affectedRows };
  }
  /**   * Check if comment exists and belongs to user   */ static async checkOwnership(
    commentId: number,
    userId: number
  ): Promise<boolean> {
    const query =
      "SELECT COUNT(*) as count FROM comments WHERE comment_id = ? AND user_id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [
      commentId,
      userId,
    ]);
    return (rows[0] as { count: number }).count > 0;
  }
  /**   * Get comment count for a specific post   */ static async getCommentCountByPostId(
    postId: number
  ): Promise<number> {
    const query = "SELECT COUNT(*) as count FROM comments WHERE post_id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [postId]);
    return (rows[0] as { count: number }).count;
  }
  /**   * Get total comment count for a user   */ static async getCommentCountByUserId(
    userId: number
  ): Promise<number> {
    const query = "SELECT COUNT(*) as count FROM comments WHERE user_id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
    return (rows[0] as { count: number }).count;
  }
  /**   * Get comments with pagination for a post   */ static async findByPostIdWithPagination(
    postId: number,
    offset: number,
    limit: number
  ): Promise<CommentWithUser[]> {
    const query = `      SELECT         comments.comment_id,        comments.content,        comments.user_id,        comments.post_id,        comments.createdTimestamp,        users.fullname as author      FROM comments      JOIN users ON comments.user_id = users.id      WHERE comments.post_id = ?      ORDER BY comments.createdTimestamp DESC      LIMIT ? OFFSET ?    `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [
      postId,
      limit,
      offset,
    ]);
    return rows as CommentWithUser[];
  }
  /**   * Search comments by text content   */ static async search(
    searchTerm: string
  ): Promise<CommentWithUser[]> {
    const query = `      SELECT         comments.comment_id,        comments.content,        comments.user_id,        comments.post_id,        comments.createdTimestamp,        users.fullname as author      FROM comments      JOIN users ON comments.user_id = users.id      WHERE comments.content LIKE ?      ORDER BY comments.createdTimestamp DESC    `;
    const searchPattern = `%${searchTerm}%`;
    const [rows] = await pool.query<RowDataPacket[]>(query, [searchPattern]);
    return rows as CommentWithUser[];
  }
  /**   * Get recent comments across all posts (for admin or feed purposes)   */ static async getRecentComments(
    limit: number = 10
  ): Promise<CommentWithUser[]> {
    const query = `      SELECT         comments.comment_id,        comments.content,        comments.user_id,        comments.post_id,        comments.createdTimestamp,        users.fullname as author      FROM comments      JOIN users ON comments.user_id = users.id      ORDER BY comments.createdTimestamp DESC      LIMIT ?    `;
    const [rows] = await pool.query<RowDataPacket[]>(query, [limit]);
    return rows as CommentWithUser[];
  }
  /**   * Get comments with post information (for user profile or admin purposes)   */ static async findWithPostInfo(
    userId?: number
  ): Promise<any[]> {
    let query = `      SELECT         comments.comment_id,        comments.content,        comments.user_id,        comments.post_id,        comments.createdTimestamp,        users.fullname as author,        posts.title as post_title      FROM comments      JOIN users ON comments.user_id = users.id      JOIN posts ON comments.post_id = posts.post_id    `;
    const params: number[] = [];
    if (userId) {
      query += " WHERE comments.user_id = ?";
      params.push(userId);
    }
    query += " ORDER BY comments.createdTimestamp DESC";
    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return rows;
  }
  /**   * Check if comment exists   */ static async exists(
    commentId: number
  ): Promise<boolean> {
    const query = "SELECT COUNT(*) as count FROM comments WHERE comment_id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [commentId]);
    return (rows[0] as { count: number }).count > 0;
  }
  /**   * Check if post exists (before creating comment)   */ static async postExists(
    postId: number
  ): Promise<boolean> {
    const query = "SELECT COUNT(*) as count FROM posts WHERE post_id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [postId]);
    return (rows[0] as { count: number }).count > 0;
  }
}
export default CommentRepository;
