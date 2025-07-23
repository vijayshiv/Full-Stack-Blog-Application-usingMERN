import { PostRepository, CommentRepository } from "../repositories";
import {
  PostWithAuthor,
  PostCreationRequest,
  PostUpdateRequest,
  DatabaseResult,
} from "../types";

export class PostService {
  /**
   * Get all posts with author information
   */
  static async getAllPosts(): Promise<PostWithAuthor[]> {
    const posts = await PostRepository.findAll();
    return posts;
  }

  /**
   * Create a new post
   */
  static async createPost(
    title: string,
    content: string,
    category: string,
    image: string | undefined,
    userId: number
  ): Promise<string> {
    await PostRepository.create(title, content, category, image, userId);
    return "Post added successfully";
  }

  /**
   * Get single post by ID with author information
   */
  static async getPostById(id: number): Promise<PostWithAuthor[]> {
    const posts = await PostRepository.findByIdWithUser(id);
    return posts;
  }

  /**
   * Get posts by category
   */
  static async getPostsByCategory(category: string): Promise<PostWithAuthor[]> {
    const posts = await PostRepository.findByCategory(category);
    return posts;
  }

  /**
   * Get user's posts
   */
  static async getUserPosts(userId: number): Promise<PostWithAuthor[]> {
    const posts = await PostRepository.findByUserId(userId);
    return posts;
  }

  /**
   * Update post
   */
  static async updatePost(
    postId: number,
    title: string,
    content: string,
    category: string,
    image?: string
  ): Promise<string> {
    const result = await PostRepository.update(
      postId,
      title,
      content,
      category,
      image
    );

    if (result.affectedRows === 0) {
      throw new Error("Post not found or no changes made");
    }

    return "Post updated successfully";
  }

  /**
   * Delete post
   */
  static async deletePost(postId: number, userId: number): Promise<string> {
    const result = await PostRepository.delete(postId, userId);

    if (result.affectedRows === 0) {
      throw new Error("Post not found or unauthorized");
    }

    return "Post deleted successfully";
  }

  /**
   * Search posts by title, content, or category
   */
  static async searchPosts(searchTerm: string): Promise<PostWithAuthor[]> {
    if (!searchTerm || searchTerm.trim() === "") {
      return [];
    }

    const posts = await PostRepository.search(searchTerm.trim());
    return posts;
  }

  /**
   * Get post likes count
   */
  static async getPostLikes(postId: number): Promise<{ likes: number }> {
    const likesCount = await PostRepository.getLikesCount(postId);
    return { likes: likesCount };
  }

  /**
   * Check if user liked a post
   */
  static async isPostLikedByUser(
    postId: number,
    userId: number
  ): Promise<{ liked: boolean }> {
    const liked = await PostRepository.isLikedByUser(postId, userId);
    return { liked };
  }

  /**
   * Toggle like on post (add or remove)
   */
  static async togglePostLike(
    postId: number,
    userId: number
  ): Promise<{ message: string; liked: boolean }> {
    const isLiked = await PostRepository.isLikedByUser(postId, userId);

    if (isLiked) {
      // User has already liked the post, so remove the like
      await PostRepository.removeLike(postId, userId);
      return { message: "Like removed", liked: false };
    } else {
      // User has not liked the post, so add the like
      await PostRepository.addLike(postId, userId);
      return { message: "Like added", liked: true };
    }
  }

  /**
   * Get posts with pagination
   */
  static async getPostsWithPagination(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    posts: PostWithAuthor[];
    totalPosts: number;
    totalPages: number;
    currentPage: number;
  }> {
    const offset = (page - 1) * limit;
    const posts = await PostRepository.findWithPagination(offset, limit);
    const totalPosts = await PostRepository.getPostCount();
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
  static async getCategories(): Promise<string[]> {
    const categories = await PostRepository.getCategories();
    return categories;
  }

  /**
   * Check if user owns the post
   */
  static async checkPostOwnership(
    postId: number,
    userId: number
  ): Promise<boolean> {
    const isOwner = await PostRepository.checkOwnership(postId, userId);
    return isOwner;
  }

  /**
   * Get post statistics
   */
  static async getPostStats(postId: number): Promise<{
    likes: number;
    comments: number;
  }> {
    const [likesCount, commentsCount] = await Promise.all([
      PostRepository.getLikesCount(postId),
      CommentRepository.getCommentCountByPostId(postId),
    ]);

    return {
      likes: likesCount,
      comments: commentsCount,
    };
  }

  /**
   * Validate post data
   */
  static validatePostData(
    title: string,
    content: string,
    category: string
  ): void {
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

export default PostService;
