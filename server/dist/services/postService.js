"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostService = void 0;
const repositories_1 = require("../repositories");
class PostService {
    /**
     * Get all posts with author information
     */
    static async getAllPosts() {
        const posts = await repositories_1.PostRepository.findAll();
        return posts;
    }
    /**
     * Create a new post
     */
    static async createPost(title, content, category, image, userId) {
        await repositories_1.PostRepository.create(title, content, category, image, userId);
        return "Post added successfully";
    }
    /**
     * Get single post by ID with author information
     */
    static async getPostById(id) {
        const posts = await repositories_1.PostRepository.findByIdWithUser(id);
        return posts;
    }
    /**
     * Get posts by category
     */
    static async getPostsByCategory(category) {
        const posts = await repositories_1.PostRepository.findByCategory(category);
        return posts;
    }
    /**
     * Get user's posts
     */
    static async getUserPosts(userId) {
        const posts = await repositories_1.PostRepository.findByUserId(userId);
        return posts;
    }
    /**
     * Update post
     */
    static async updatePost(postId, title, content, category, image) {
        const result = await repositories_1.PostRepository.update(postId, title, content, category, image);
        if (result.affectedRows === 0) {
            throw new Error("Post not found or no changes made");
        }
        return "Post updated successfully";
    }
    /**
     * Delete post
     */
    static async deletePost(postId, userId) {
        const result = await repositories_1.PostRepository.delete(postId, userId);
        if (result.affectedRows === 0) {
            throw new Error("Post not found or unauthorized");
        }
        return "Post deleted successfully";
    }
    /**
     * Search posts by title, content, or category
     */
    static async searchPosts(searchTerm) {
        if (!searchTerm || searchTerm.trim() === "") {
            return [];
        }
        const posts = await repositories_1.PostRepository.search(searchTerm.trim());
        return posts;
    }
    /**
     * Get post likes count
     */
    static async getPostLikes(postId) {
        const likesCount = await repositories_1.PostRepository.getLikesCount(postId);
        return { likes: likesCount };
    }
    /**
     * Check if user liked a post
     */
    static async isPostLikedByUser(postId, userId) {
        const liked = await repositories_1.PostRepository.isLikedByUser(postId, userId);
        return { liked };
    }
    /**
     * Toggle like on post (add or remove)
     */
    static async togglePostLike(postId, userId) {
        const isLiked = await repositories_1.PostRepository.isLikedByUser(postId, userId);
        if (isLiked) {
            // User has already liked the post, so remove the like
            await repositories_1.PostRepository.removeLike(postId, userId);
            return { message: "Like removed", liked: false };
        }
        else {
            // User has not liked the post, so add the like
            await repositories_1.PostRepository.addLike(postId, userId);
            return { message: "Like added", liked: true };
        }
    }
    /**
     * Get posts with pagination
     */
    static async getPostsWithPagination(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const posts = await repositories_1.PostRepository.findWithPagination(offset, limit);
        const totalPosts = await repositories_1.PostRepository.getPostCount();
        const totalPages = Math.ceil(totalPosts / limit);
        return {
            posts,
            totalPosts,
            totalPages,
            currentPage: page,
        };
    }
    /**
     * Get all categories
     */
    static async getCategories() {
        const categories = await repositories_1.PostRepository.getCategories();
        return categories;
    }
    /**
     * Check if user owns the post
     */
    static async checkPostOwnership(postId, userId) {
        const isOwner = await repositories_1.PostRepository.checkOwnership(postId, userId);
        return isOwner;
    }
    /**
     * Get post statistics
     */
    static async getPostStats(postId) {
        const [likesCount, commentsCount] = await Promise.all([
            repositories_1.PostRepository.getLikesCount(postId),
            repositories_1.CommentRepository.getCommentCountByPostId(postId),
        ]);
        return {
            likes: likesCount,
            comments: commentsCount,
        };
    }
    /**
     * Validate post data
     */
    static validatePostData(title, content, category) {
        if (!title || title.trim().length === 0) {
            throw new Error("Title is required");
        }
        if (!content || content.trim().length === 0) {
            throw new Error("Content is required");
        }
        if (!category || category.trim().length === 0) {
            throw new Error("Category is required");
        }
        if (title.length > 255) {
            throw new Error("Title must be less than 255 characters");
        }
        if (content.length > 10000) {
            throw new Error("Content must be less than 10000 characters");
        }
    }
}
exports.PostService = PostService;
exports.default = PostService;
//# sourceMappingURL=postService.js.map