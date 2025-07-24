import { CommentWithUser, CommentThreadWithUser, DatabaseResult } from "../types";
export declare class CommentRepository {
    /**
     * Get all comments for a specific post with threading support
     */
    static findByPostId(postId: number): Promise<CommentWithUser[]>;
    /**
     * Get comments organized as threads for a specific post
     */
    static findThreadsByPostId(postId: number): Promise<CommentThreadWithUser[]>;
    /**
     * Get replies for a specific comment
     */
    static findRepliesByCommentId(commentId: number): Promise<CommentWithUser[]>;
    /**
     * Organize flat comments into threaded structure
     */
    static organizeCommentsIntoThreads(comments: CommentWithUser[]): CommentThreadWithUser[];
    /**   * Get all comments by a specific user   */ static findByUserId(userId: number): Promise<CommentWithUser[]>;
    /**   * Find comment by ID   */ static findById(commentId: number): Promise<CommentWithUser | null>;
    /**
     * Create a new comment or reply
     */
    static create(commentText: string, userId: number, postId: number, parentCommentId?: number): Promise<DatabaseResult>;
    /**
     * Create a reply to a comment
     */
    static createReply(commentText: string, userId: number, postId: number, parentCommentId: number): Promise<DatabaseResult>;
    /**   * Update a comment   */ static update(commentId: number, commentText: string, userId: number): Promise<DatabaseResult>;
    /**   * Delete a comment   */ static delete(commentId: number, userId: number): Promise<DatabaseResult>;
    /**   * Delete all comments for a post (when post is deleted)   */ static deleteByPostId(postId: number): Promise<DatabaseResult>;
    /**
     * Check if comment exists and belongs to user
     */
    static checkOwnership(commentId: number, userId: number): Promise<boolean>;
    /**
     * Check if comment exists (for reply validation)
     */
    static commentExists(commentId: number): Promise<boolean>;
    /**
     * Get comment details by ID
     */
    static getCommentDetails(commentId: number): Promise<CommentWithUser | null>;
    /**   * Get comment count for a specific post   */ static getCommentCountByPostId(postId: number): Promise<number>;
    /**   * Get total comment count for a user   */ static getCommentCountByUserId(userId: number): Promise<number>;
    /**   * Get comments with pagination for a post   */ static findByPostIdWithPagination(postId: number, offset: number, limit: number): Promise<CommentWithUser[]>;
    /**   * Search comments by text content   */ static search(searchTerm: string): Promise<CommentWithUser[]>;
    /**   * Get recent comments across all posts (for admin or feed purposes)   */ static getRecentComments(limit?: number): Promise<CommentWithUser[]>;
    /**   * Get comments with post information (for user profile or admin purposes)   */ static findWithPostInfo(userId?: number): Promise<any[]>;
    /**   * Check if comment exists   */ static exists(commentId: number): Promise<boolean>;
    /**   * Check if post exists (before creating comment)   */ static postExists(postId: number): Promise<boolean>;
}
export default CommentRepository;
//# sourceMappingURL=commentRepository.d.ts.map