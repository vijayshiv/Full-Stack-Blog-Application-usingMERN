import { Request, Response } from "express";
export declare class PostController {
    /**
     * Get all posts
     */
    static getAllPosts(req: Request, res: Response): Promise<void>;
    /**
     * Get posts with pagination
     */
    static getPostsWithPagination(req: Request, res: Response): Promise<void>;
    /**
     * Create a new post
     */
    static createPost(req: Request, res: Response): Promise<void>;
    /**
     * Get a single post by ID
     */
    static getPostById(req: Request, res: Response): Promise<void>;
    /**
     * Get posts by category
     */
    static getPostsByCategory(req: Request, res: Response): Promise<void>;
    /**
     * Get user's posts
     */
    static getUserPosts(req: Request, res: Response): Promise<void>;
    /**
     * Get posts by specific user ID (for public profiles)
     */
    static getPostsByUserId(req: Request, res: Response): Promise<void>;
    /**
     * Update a post
     */
    static updatePost(req: Request, res: Response): Promise<void>;
    /**
     * Delete a post
     */
    static deletePost(req: Request, res: Response): Promise<void>;
    /**
     * Search posts
     */
    static searchPosts(req: Request, res: Response): Promise<void>;
    /**
     * Get post likes count
     */
    static getPostLikes(req: Request, res: Response): Promise<void>;
    /**
     * Check if user liked a post
     */
    static isPostLikedByUser(req: Request, res: Response): Promise<void>;
    /**
     * Check if user liked post (for frontend compatibility)
     */
    static checkUserLiked(req: Request, res: Response): Promise<void>;
    /**
     * Toggle like on a post
     */
    static togglePostLike(req: Request, res: Response): Promise<void>;
    /**
     * Get all categories
     */
    static getCategories(req: Request, res: Response): Promise<void>;
    /**
     * Get post statistics (likes and comments count)
     */
    static getPostStats(req: Request, res: Response): Promise<void>;
    /**
     * Toggle like on a post
     */
    static toggleLike(req: Request, res: Response): Promise<void>;
    /**
     * Get like information for a post
     */
    static getLikeInfo(req: Request, res: Response): Promise<void>;
}
export default PostController;
//# sourceMappingURL=postController.d.ts.map