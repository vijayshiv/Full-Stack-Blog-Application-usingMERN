import { CommentWithUser, CommentThreadWithUser } from "../types";
export declare class CommentService {
    /**
     * Validate comment content
     */
    static validateCommentContent(content: string): void;
    /**
     * Check if user can comment on a post
     */
    static canUserComment(userId: number, postId: number): Promise<boolean>;
    /**
     * Get comments for a specific post (flat list)
     */
    static getCommentsByPostId(postId: number): Promise<CommentWithUser[]>;
    /**
     * Get comments organized as threads for a specific post
     */
    static getCommentThreadsByPostId(postId: number): Promise<CommentThreadWithUser[]>;
    /**
     * Add a new comment to a post
     */
    static addComment(commentText: string, userId: number, postId: number): Promise<{
        comment_id: number;
        content: string;
        createdTimestamp: string;
    }>;
    /**
     * Add a reply to a comment
     */
    static addReply(commentText: string, userId: number, postId: number, parentCommentId: number): Promise<{
        comment_id: number;
        content: string;
        createdTimestamp: string;
        parent_comment_id: number;
    }>;
    /**
     * Update an existing comment
     */
    static updateComment(commentId: number, userId: number, content: string): Promise<string>;
    /**
     * Delete a comment
     */
    static deleteComment(commentId: number, userId: number): Promise<string>;
    /**
     * Get comments by user ID
     */
    static getCommentsByUserId(userId: number): Promise<CommentWithUser[]>;
    /**
     * Get comment by ID
     */
    static getCommentById(commentId: number): Promise<CommentWithUser | null>;
    /**
     * Get comments with pagination for a post
     */
    static getCommentsWithPagination(postId: number, page?: number, limit?: number): Promise<{
        comments: CommentWithUser[];
        totalComments: number;
        totalPages: number;
        currentPage: number;
    }>;
    /**
     * Search comments by text content
     */
    static searchComments(searchTerm: string): Promise<CommentWithUser[]>;
    /**
     * Get recent comments (admin/moderation purposes)
     */
    static getRecentComments(limit?: number): Promise<CommentWithUser[]>;
    /**
     * Get comment count for a post
     */
    static getCommentCount(postId: number): Promise<number>;
    /**
     * Get comment count for a user
     */
    static getUserCommentCount(userId: number): Promise<number>;
}
export default CommentService;
//# sourceMappingURL=commentService.d.ts.map