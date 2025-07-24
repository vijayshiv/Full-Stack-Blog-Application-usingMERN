import { Request, Response } from "express";
export declare class CommentController {
    /**
     * Get comments for a specific post (flat list)
     */
    static getCommentsByPostId(req: Request, res: Response): Promise<void>;
    /**
     * Get comments organized as threads for a specific post
     */
    static getCommentThreadsByPostId(req: Request, res: Response): Promise<void>;
    /**
     * Add a new comment to a post
     */
    static addComment(req: Request, res: Response): Promise<void>;
    /**
     * Add a reply to a comment
     */
    static addReply(req: Request, res: Response): Promise<void>;
    /**
     * Get comments with pagination for a post
     */
    static getCommentsWithPagination(req: Request, res: Response): Promise<void>;
    /**
     * Update an existing comment
     */
    static updateComment(req: Request, res: Response): Promise<void>;
    /**
     * Delete a comment
     */
    static deleteComment(req: Request, res: Response): Promise<void>;
    /**
     * Get comments by user ID
     */
    static getCommentsByUserId(req: Request, res: Response): Promise<void>;
    /**
     * Get comments by specific user ID (for public profiles)
     */
    static getCommentsBySpecificUserId(req: Request, res: Response): Promise<void>;
    /**
     * Get a single comment by ID
     */
    static getCommentById(req: Request, res: Response): Promise<void>;
    /**
     * Search comments by content
     */
    static searchComments(req: Request, res: Response): Promise<void>;
    /**
     * Get recent comments (admin/moderation)
     */
    static getRecentComments(req: Request, res: Response): Promise<void>;
    /**
     * Get comment count for a post
     */
    static getCommentCount(req: Request, res: Response): Promise<void>;
    /**
     * Get user's comment count
     */
    static getUserCommentCount(req: Request, res: Response): Promise<void>;
    /**
     * Get comment count for specific user (public)
     */
    static getSpecificUserCommentCount(req: Request, res: Response): Promise<void>;
    /**
     * Alias for getCommentsByPostId for route compatibility
     */
    static getCommentsByPost(req: Request, res: Response): Promise<void>;
    /**
     * Create a new comment (alias for addComment)
     */
    static createComment(req: Request, res: Response): Promise<void>;
}
export default CommentController;
//# sourceMappingURL=commentController.d.ts.map