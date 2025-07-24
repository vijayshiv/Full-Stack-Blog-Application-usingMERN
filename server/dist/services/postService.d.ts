import { PostWithAuthor } from "../types";
export declare class PostService {
    /**
     * Get all posts with author information
     */
    static getAllPosts(): Promise<PostWithAuthor[]>;
    /**
     * Create a new post
     */
    static createPost(title: string, content: string, category: string, image: string | undefined, userId: number): Promise<string>;
    /**
     * Get single post by ID with author information
     */
    static getPostById(id: number): Promise<PostWithAuthor[]>;
    /**
     * Get posts by category
     */
    static getPostsByCategory(category: string): Promise<PostWithAuthor[]>;
    /**
     * Get user's posts
     */
    static getUserPosts(userId: number): Promise<PostWithAuthor[]>;
    /**
     * Update post
     */
    static updatePost(postId: number, title: string, content: string, category: string, image?: string): Promise<string>;
    /**
     * Delete post
     */
    static deletePost(postId: number, userId: number): Promise<string>;
    /**
     * Search posts by title, content, or category
     */
    static searchPosts(searchTerm: string): Promise<PostWithAuthor[]>;
    /**
     * Get post likes count
     */
    static getPostLikes(postId: number): Promise<{
        likes: number;
    }>;
    /**
     * Check if user liked a post
     */
    static isPostLikedByUser(postId: number, userId: number): Promise<{
        liked: boolean;
    }>;
    /**
     * Toggle like on post (add or remove)
     */
    static togglePostLike(postId: number, userId: number): Promise<{
        message: string;
        liked: boolean;
    }>;
    /**
     * Get posts with pagination
     */
    static getPostsWithPagination(page?: number, limit?: number): Promise<{
        posts: PostWithAuthor[];
        totalPosts: number;
        totalPages: number;
        currentPage: number;
    }>;
    /**
     * Get all categories
     */
    static getCategories(): Promise<string[]>;
    /**
     * Check if user owns the post
     */
    static checkPostOwnership(postId: number, userId: number): Promise<boolean>;
    /**
     * Get post statistics
     */
    static getPostStats(postId: number): Promise<{
        likes: number;
        comments: number;
    }>;
    /**
     * Validate post data
     */
    static validatePostData(title: string, content: string, category: string): void;
}
export default PostService;
//# sourceMappingURL=postService.d.ts.map