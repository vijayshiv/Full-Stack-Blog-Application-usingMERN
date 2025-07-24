import { PostWithAuthor, DatabaseResult } from "../types";
export declare class PostRepository {
    /**
     * Get all posts with author information
     */
    static findAll(): Promise<PostWithAuthor[]>;
    /**
     * Find post by ID with author information
     */
    static findById(id: number): Promise<PostWithAuthor | null>;
    /**
     * Get single post with user name (for frontend compatibility)
     */
    static findByIdWithUser(id: number): Promise<PostWithAuthor[]>;
    /**
     * Find posts by category
     */
    static findByCategory(category: string): Promise<PostWithAuthor[]>;
    /**
     * Find posts by user ID
     */
    static findByUserId(userId: number): Promise<PostWithAuthor[]>;
    /**
     * Create a new post
     */
    static create(title: string, content: string, category: string, image: string | undefined, userId: number): Promise<DatabaseResult>;
    /**
     * Update a post
     */
    static update(postId: number, title: string, content: string, category: string, image?: string): Promise<DatabaseResult>;
    /**
     * Delete a post
     */
    static delete(postId: number, userId: number): Promise<DatabaseResult>;
    /**
     * Search posts by title or content
     */
    static search(searchTerm: string): Promise<PostWithAuthor[]>;
    /**
     * Get post count
     */
    static getPostCount(): Promise<number>;
    /**
     * Get posts with pagination
     */
    static findWithPagination(offset: number, limit: number): Promise<PostWithAuthor[]>;
    /**
     * Get all categories
     */
    static getCategories(): Promise<string[]>;
    /**
     * Check if post exists and belongs to user
     */
    static checkOwnership(postId: number, userId: number): Promise<boolean>;
    /**
     * Get likes count for a post
     */
    static getLikesCount(postId: number): Promise<number>;
    /**
     * Check if user liked a post
     */
    static isLikedByUser(postId: number, userId: number): Promise<boolean>;
    /**
     * Add like to a post
     */
    static addLike(postId: number, userId: number): Promise<DatabaseResult>;
    /**
     * Remove like from a post
     */
    static removeLike(postId: number, userId: number): Promise<DatabaseResult>;
}
export default PostRepository;
//# sourceMappingURL=postRepository.d.ts.map