import { Request, Response } from "express";
import { PostService } from "../services";
import { successMessage, errorMessage } from "../utils";
import {
  PostCreationRequest,
  PostUpdateRequest,
  PostSearchQuery,
  JWTPayload,
} from "../types";

export class PostController {
  /**
   * Get all posts
   */
  static async getAllPosts(req: Request, res: Response): Promise<void> {
    try {
      const posts = await PostService.getAllPosts();
      res.json(successMessage(posts));
    } catch (error) {
      console.error("Error getting all posts:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving posts";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get posts with pagination
   */
  static async getPostsWithPagination(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await PostService.getPostsWithPagination(page, limit);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error getting posts with pagination:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving posts";
      res.json(errorMessage(message));
    }
  }

  /**
   * Create a new post
   */
  static async createPost(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { title, content, category }: PostCreationRequest = req.body;
      const image = req.file ? req.file.filename : undefined;

      // Validate required fields
      if (!title || !content || !category) {
        res.json(errorMessage("Title, content, and category are required"));
        return;
      }

      // Validate post data
      PostService.validatePostData(title, content, category);

      const message = await PostService.createPost(
        title,
        content,
        category,
        image,
        userId
      );
      res.json(successMessage(message));
    } catch (error) {
      console.error("Error creating post:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error occurred while processing the request";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get a single post by ID
   */
  static async getPostById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id) || id <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      const posts = await PostService.getPostById(id);

      if (!posts || posts.length === 0) {
        res.json(errorMessage("Post not found"));
        return;
      }

      res.json(successMessage(posts));
    } catch (error) {
      console.error("Error getting post by ID:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving post";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get posts by category
   */
  static async getPostsByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.params;

      if (!category) {
        res.json(errorMessage("Category is required"));
        return;
      }

      const posts = await PostService.getPostsByCategory(category);
      res.json(successMessage(posts));
    } catch (error) {
      console.error("Error getting posts by category:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving posts";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get user's posts
   */
  static async getUserPosts(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const posts = await PostService.getUserPosts(userId);
      res.json(successMessage(posts));
    } catch (error) {
      console.error("Error getting user posts:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving user posts";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get posts by specific user ID (for public profiles)
   */
  static async getPostsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId) || userId <= 0) {
        res.json(errorMessage("Valid user ID is required"));
        return;
      }

      const posts = await PostService.getUserPosts(userId);
      res.json(successMessage(posts));
    } catch (error) {
      console.error("Error getting posts by user ID:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving posts";
      res.json(errorMessage(message));
    }
  }

  /**
   * Update a post
   */
  static async updatePost(req: Request, res: Response): Promise<void> {
    try {
      // Handle both :id and :postId parameter names for compatibility
      const postId = parseInt(req.params.id || req.params.postId);
      const userId = req.user!.id;
      const { title, content, category } = req.body;
      const image = req.file ? req.file.filename : undefined;

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      // Check if user owns the post
      const isOwner = await PostService.checkPostOwnership(postId, userId);
      if (!isOwner) {
        res.json(
          errorMessage("Unauthorized: You can only update your own posts")
        );
        return;
      }

      // Validate required fields
      if (!title || !content || !category) {
        res.json(errorMessage("Title, content, and category are required"));
        return;
      }

      // Validate post data
      PostService.validatePostData(title, content, category);

      const message = await PostService.updatePost(
        postId,
        title,
        content,
        category,
        image
      );
      res.json(successMessage(message));
    } catch (error) {
      console.error("Error updating post:", error);
      const message =
        error instanceof Error ? error.message : "Error updating post";
      res.json(errorMessage(message));
    }
  }

  /**
   * Delete a post
   */
  static async deletePost(req: Request, res: Response): Promise<void> {
    try {
      // Handle both :id and :postId parameter names for compatibility
      const postId = parseInt(req.params.id || req.params.postId);
      const userId = req.user!.id;

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      const message = await PostService.deletePost(postId, userId);
      res.json(successMessage(message));
    } catch (error) {
      console.error("Error deleting post:", error);
      const message =
        error instanceof Error ? error.message : "Error deleting post";
      res.json(errorMessage(message));
    }
  }

  /**
   * Search posts
   */
  static async searchPosts(req: Request, res: Response): Promise<void> {
    try {
      const {
        q: searchTerm,
        category,
        page = 1,
        limit = 10,
      }: PostSearchQuery = req.query;

      if (!searchTerm) {
        res.json(successMessage([]));
        return;
      }

      const posts = await PostService.searchPosts(searchTerm);

      // Filter by category if specified
      let filteredPosts = posts;
      if (category) {
        filteredPosts = posts.filter(
          (post) => post.category.toLowerCase() === category.toLowerCase()
        );
      }

      // Apply pagination
      const pageNum = parseInt(page.toString()) || 1;
      const limitNum = parseInt(limit.toString()) || 10;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

      res.json(
        successMessage({
          posts: paginatedPosts,
          totalPosts: filteredPosts.length,
          totalPages: Math.ceil(filteredPosts.length / limitNum),
          currentPage: pageNum,
        })
      );
    } catch (error) {
      console.error("Error searching posts:", error);
      const message =
        error instanceof Error ? error.message : "Error searching posts";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get post likes count
   */
  static async getPostLikes(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.id);

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      const result = await PostService.getPostLikes(postId);
      res.json(successMessage({ likes: result.likes })); // Changed from likeCount to likes
    } catch (error) {
      console.error("Error getting post likes:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving post likes";
      res.json(errorMessage(message));
    }
  }

  /**
   * Check if user liked a post
   */
  static async isPostLikedByUser(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user!.id;

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      const result = await PostService.isPostLikedByUser(postId, userId);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error checking post like status:", error);
      const message =
        error instanceof Error ? error.message : "Error checking like status";
      res.json(errorMessage(message));
    }
  }

  /**
   * Check if user liked post (for frontend compatibility)
   */
  static async checkUserLiked(req: Request, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const userId = req.user?.id;

      // If no user is authenticated, return false for like status
      if (!userId) {
        res.json(successMessage({ liked: false }));
        return;
      }

      const result = await PostService.isPostLikedByUser(
        parseInt(postId),
        userId
      );
      res.json(successMessage(result)); // result already contains { liked: boolean }
    } catch (error) {
      console.error("Error checking user liked status:", error);
      const message =
        error instanceof Error ? error.message : "Error checking like status";
      res.json(errorMessage(message));
    }
  }
  /**
   * Toggle like on a post
   */
  static async togglePostLike(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.id);
      const userId = req.user!.id;

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      const result = await PostService.togglePostLike(postId, userId);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error toggling post like:", error);
      const message =
        error instanceof Error ? error.message : "Error toggling like";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get all categories
   */
  static async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await PostService.getCategories();
      res.json(successMessage(categories));
    } catch (error) {
      console.error("Error getting categories:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving categories";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get post statistics (likes and comments count)
   */
  static async getPostStats(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.id);

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      const stats = await PostService.getPostStats(postId);
      res.json(successMessage(stats));
    } catch (error) {
      console.error("Error getting post stats:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving post statistics";
      res.json(errorMessage(message));
    }
  }

  /**
   * Toggle like on a post
   */
  static async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.postId);
      const userId = req.user!.id;

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      // Toggle like/unlike using PostService
      const result = await PostService.togglePostLike(postId, userId);

      // Get updated like count
      const likeCountResult = await PostService.getPostLikes(postId);
      const likeCount = likeCountResult.likes;

      // Return format expected by frontend: response.data.status === "success"
      res.json({
        status: "success",
        message: result.liked
          ? "Post liked successfully"
          : "Post unliked successfully",
        data: {
          liked: result.liked,
          likes: likeCount, // Frontend expects 'likes' not 'likeCount'
        },
      });
    } catch (error) {
      console.error("Error toggling like:", error);
      const message =
        error instanceof Error ? error.message : "Error updating like status";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get like information for a post
   */
  static async getLikeInfo(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.postId);
      const userId = req.user ? (req.user as JWTPayload).id : undefined;

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      // Get actual like count from database
      const likeCountResult = await PostService.getPostLikes(postId);
      const likeCount = likeCountResult.likes;

      // Check if current user liked the post (if authenticated)
      const userLikedResult = userId
        ? await PostService.isPostLikedByUser(postId, userId)
        : { liked: false };
      const userLiked = userLikedResult.liked;
      // Return format expected by frontend: response.data.data.likes
      res.json({
        status: "success",
        message: "Like information retrieved successfully",
        data: {
          likes: likeCount, // Frontend expects 'likes' not 'likeCount'
          userLiked,
        },
      });
    } catch (error) {
      console.error("Error getting like info:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving like information";
      res.json(errorMessage(message));
    }
  }
}

export default PostController;
