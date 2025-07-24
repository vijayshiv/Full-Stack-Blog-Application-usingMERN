import { RowDataPacket, ResultSetHeader } from "mysql2";
import { pool } from "../db";
import { Post, PostWithAuthor, DatabaseResult } from "../types";

export class PostRepository {
  /**
   * Get all posts with author information
   */
  static async findAll(): Promise<PostWithAuthor[]> {
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
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows as PostWithAuthor[];
  }

  /**
   * Find post by ID with author information
   */
  static async findById(id: number): Promise<PostWithAuthor | null> {
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
    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    return rows.length > 0 ? (rows[0] as PostWithAuthor) : null;
  }

  /**
   * Get single post with user name (for frontend compatibility)
   */
  static async findByIdWithUser(id: number): Promise<PostWithAuthor[]> {
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
    const [rows] = await pool.query<RowDataPacket[]>(query, [id]);
    return rows as PostWithAuthor[];
  }

  /**
   * Find posts by category
   */
  static async findByCategory(category: string): Promise<PostWithAuthor[]> {
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
    const [rows] = await pool.query<RowDataPacket[]>(query, [category]);
    return rows as PostWithAuthor[];
  }

  /**
   * Find posts by user ID
   */
  static async findByUserId(userId: number): Promise<PostWithAuthor[]> {
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
    const [rows] = await pool.query<RowDataPacket[]>(query, [userId]);
    return rows as PostWithAuthor[];
  }

  /**
   * Create a new post
   */
  static async create(
    title: string,
    content: string,
    category: string,
    image: string | undefined,
    userId: number
  ): Promise<DatabaseResult> {
    const query =
      "INSERT INTO posts (title, content, category, img, user_id) VALUES (?, ?, ?, ?, ?)";
    const [result] = await pool.execute<ResultSetHeader>(query, [
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
  static async update(
    postId: number,
    title: string,
    content: string,
    category: string,
    image?: string
  ): Promise<DatabaseResult> {
    let query: string;
    let params: (string | number)[];

    if (image) {
      query =
        "UPDATE posts SET title = ?, content = ?, category = ?, img = ? WHERE post_id = ?";
      params = [title, content, category, image, postId];
    } else {
      query =
        "UPDATE posts SET title = ?, content = ?, category = ? WHERE post_id = ?";
      params = [title, content, category, postId];
    }

    const [result] = await pool.execute<ResultSetHeader>(query, params);
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    };
  }

  /**
   * Delete a post
   */
  static async delete(postId: number, userId: number): Promise<DatabaseResult> {
    const query = "DELETE FROM posts WHERE post_id = ? AND user_id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [
      postId,
      userId,
    ]);
    return {
      affectedRows: result.affectedRows,
    };
  }

  /**
   * Search posts by title, content, or category with relevance scoring
   */
  static async search(searchTerm: string): Promise<PostWithAuthor[]> {
    const query = `
      SELECT 
        posts.post_id, 
        posts.title, 
        posts.content, 
        posts.category, 
        posts.img, 
        posts.user_id, 
        posts.createdTimestamp,
        posts.isDeleted,
        users.fullname as author,
        (
          CASE 
            WHEN posts.title LIKE ? THEN 3
            WHEN posts.category LIKE ? THEN 2
            WHEN posts.content LIKE ? THEN 1
            ELSE 0
          END
        ) as relevance
      FROM posts 
      JOIN users ON posts.user_id = users.id 
      WHERE posts.isDeleted = 0 
        AND (posts.title LIKE ? OR posts.content LIKE ? OR posts.category LIKE ?)
      ORDER BY relevance DESC, posts.createdTimestamp DESC
    `;

    const searchPattern = `%${searchTerm}%`;
    const exactTitlePattern = `%${searchTerm}%`;
    const exactCategoryPattern = `%${searchTerm}%`;
    const exactContentPattern = `%${searchTerm}%`;

    const [rows] = await pool.query<RowDataPacket[]>(query, [
      exactTitlePattern, // For relevance scoring - title match
      exactCategoryPattern, // For relevance scoring - category match
      exactContentPattern, // For relevance scoring - content match
      searchPattern, // For WHERE clause - title
      searchPattern, // For WHERE clause - content
      searchPattern, // For WHERE clause - category
    ]);

    return rows as PostWithAuthor[];
  }

  /**
   * Get post count
   */
  static async getPostCount(): Promise<number> {
    const query = "SELECT COUNT(*) as count FROM posts";
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return (rows[0] as { count: number }).count;
  }

  /**
   * Get posts with pagination
   */
  static async findWithPagination(
    offset: number,
    limit: number
  ): Promise<PostWithAuthor[]> {
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
    const [rows] = await pool.query<RowDataPacket[]>(query, [limit, offset]);
    return rows as PostWithAuthor[];
  }

  /**
   * Get all categories
   */
  static async getCategories(): Promise<string[]> {
    const query = "SELECT DISTINCT category FROM posts ORDER BY category";
    const [rows] = await pool.query<RowDataPacket[]>(query);
    return rows.map((row) => (row as { category: string }).category);
  }

  /**
   * Check if post exists and belongs to user
   */
  static async checkOwnership(
    postId: number,
    userId: number
  ): Promise<boolean> {
    const query =
      "SELECT COUNT(*) as count FROM posts WHERE post_id = ? AND user_id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [postId, userId]);
    return (rows[0] as { count: number }).count > 0;
  }

  /**
   * Get likes count for a post
   */
  static async getLikesCount(postId: number): Promise<number> {
    const query = "SELECT COUNT(*) as count FROM post_likes WHERE post_id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [postId]);
    return (rows[0] as { count: number }).count;
  }

  /**
   * Check if user liked a post
   */
  static async isLikedByUser(postId: number, userId: number): Promise<boolean> {
    const query =
      "SELECT COUNT(*) as count FROM post_likes WHERE post_id = ? AND user_id = ?";
    const [rows] = await pool.query<RowDataPacket[]>(query, [postId, userId]);
    return (rows[0] as { count: number }).count > 0;
  }

  /**
   * Add like to a post
   */
  static async addLike(
    postId: number,
    userId: number
  ): Promise<DatabaseResult> {
    const query = "INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)";
    const [result] = await pool.execute<ResultSetHeader>(query, [
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
  static async removeLike(
    postId: number,
    userId: number
  ): Promise<DatabaseResult> {
    const query = "DELETE FROM post_likes WHERE post_id = ? AND user_id = ?";
    const [result] = await pool.execute<ResultSetHeader>(query, [
      postId,
      userId,
    ]);
    return {
      affectedRows: result.affectedRows,
    };
  }
}

export default PostRepository;
