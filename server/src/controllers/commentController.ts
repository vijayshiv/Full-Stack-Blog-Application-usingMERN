import { Request, Response } from "express";
import { CommentService } from "../services";
import { successMessage, errorMessage } from "../utils";
import { CommentRequest, JWTPayload } from "../types";

export class CommentController {
  /**
   * Get comments for a specific post
   */
  static async getCommentsByPostId(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.postId);

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      const comments = await CommentService.getCommentsByPostId(postId);
      res.json(successMessage(comments));
    } catch (error) {
      console.error("Error getting comments:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving comments";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get comments with pagination for a post
   */
  static async getCommentsWithPagination(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const postId = parseInt(req.params.postId);
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      const result = await CommentService.getCommentsWithPagination(
        postId,
        page,
        limit
      );
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error getting comments with pagination:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving comments";
      res.json(errorMessage(message));
    }
  }

  /**
   * Add a new comment to a post
   */
  static async addComment(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.postId);
      const userId = req.user!.id;

      // Match JavaScript backend exactly: expect req.body.comment
      const comment = req.body.comment || req.body.content;

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      if (!comment) {
        res.json(errorMessage("Comment content is required"));
        return;
      }

      // Validate comment content
      CommentService.validateCommentContent(comment);

      // Check if user can comment on this post
      const canComment = await CommentService.canUserComment(userId, postId);
      if (!canComment) {
        res.json(errorMessage("You cannot comment on this post"));
        return;
      }

      const result = await CommentService.addComment(comment, userId, postId);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error adding comment:", error);
      const message =
        error instanceof Error ? error.message : "Error adding comment";
      res.json(errorMessage(message));
    }
  }

  /**
   * Update an existing comment
   */
  static async updateComment(req: Request, res: Response): Promise<void> {
    try {
      const commentId = parseInt(req.params.commentId);
      const userId = req.user!.id;
      const { content } = req.body;

      if (isNaN(commentId) || commentId <= 0) {
        res.json(errorMessage("Valid comment ID is required"));
        return;
      }

      if (!content) {
        res.json(errorMessage("Comment content is required"));
        return;
      }

      // Validate comment content
      CommentService.validateCommentContent(content);

      const result = await CommentService.updateComment(
        commentId,
        userId,
        content
      );
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error updating comment:", error);
      const message =
        error instanceof Error ? error.message : "Error updating comment";
      res.json(errorMessage(message));
    }
  }

  /**
   * Delete a comment
   */
  static async deleteComment(req: Request, res: Response): Promise<void> {
    try {
      const commentId = parseInt(req.params.commentId);
      const userId = req.user!.id;

      if (isNaN(commentId) || commentId <= 0) {
        res.json(errorMessage("Valid comment ID is required"));
        return;
      }

      const result = await CommentService.deleteComment(commentId, userId);
      res.json(successMessage(result));
    } catch (error) {
      console.error("Error deleting comment:", error);
      const message =
        error instanceof Error ? error.message : "Error deleting comment";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get comments by user ID
   */
  static async getCommentsByUserId(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const comments = await CommentService.getCommentsByUserId(userId);
      res.json(successMessage(comments));
    } catch (error) {
      console.error("Error getting user comments:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving user comments";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get comments by specific user ID (for public profiles)
   */
  static async getCommentsBySpecificUserId(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId) || userId <= 0) {
        res.json(errorMessage("Valid user ID is required"));
        return;
      }

      const comments = await CommentService.getCommentsByUserId(userId);
      res.json(successMessage(comments));
    } catch (error) {
      console.error("Error getting user comments:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving user comments";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get a single comment by ID
   */
  static async getCommentById(req: Request, res: Response): Promise<void> {
    try {
      const commentId = parseInt(req.params.commentId);

      if (isNaN(commentId) || commentId <= 0) {
        res.json(errorMessage("Valid comment ID is required"));
        return;
      }

      const comment = await CommentService.getCommentById(commentId);

      if (!comment) {
        res.json(errorMessage("Comment not found"));
        return;
      }

      res.json(successMessage(comment));
    } catch (error) {
      console.error("Error getting comment:", error);
      const message =
        error instanceof Error ? error.message : "Error retrieving comment";
      res.json(errorMessage(message));
    }
  }

  /**
   * Search comments by content
   */
  static async searchComments(req: Request, res: Response): Promise<void> {
    try {
      const { q: searchTerm } = req.query;

      if (!searchTerm || typeof searchTerm !== "string") {
        res.json(successMessage([]));
        return;
      }

      const comments = await CommentService.searchComments(searchTerm);
      res.json(successMessage(comments));
    } catch (error) {
      console.error("Error searching comments:", error);
      const message =
        error instanceof Error ? error.message : "Error searching comments";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get recent comments (admin/moderation)
   */
  static async getRecentComments(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const comments = await CommentService.getRecentComments(limit);
      res.json(successMessage(comments));
    } catch (error) {
      console.error("Error getting recent comments:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving recent comments";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get comment count for a post
   */
  static async getCommentCount(req: Request, res: Response): Promise<void> {
    try {
      const postId = parseInt(req.params.postId);

      if (isNaN(postId) || postId <= 0) {
        res.json(errorMessage("Valid post ID is required"));
        return;
      }

      const count = await CommentService.getCommentCount(postId);
      res.json(successMessage({ count }));
    } catch (error) {
      console.error("Error getting comment count:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving comment count";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get user's comment count
   */
  static async getUserCommentCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const count = await CommentService.getUserCommentCount(userId);
      res.json(successMessage({ count }));
    } catch (error) {
      console.error("Error getting user comment count:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving comment count";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get comment count for specific user (public)
   */
  static async getSpecificUserCommentCount(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);

      if (isNaN(userId) || userId <= 0) {
        res.json(errorMessage("Valid user ID is required"));
        return;
      }

      const count = await CommentService.getUserCommentCount(userId);
      res.json(successMessage({ count }));
    } catch (error) {
      console.error("Error getting user comment count:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving comment count";
      res.json(errorMessage(message));
    }
  }

  /**
   * Alias for getCommentsByPostId for route compatibility
   */
  static async getCommentsByPost(req: Request, res: Response): Promise<void> {
    return CommentController.getCommentsByPostId(req, res);
  }

  /**
   * Create a new comment (alias for addComment)
   */
  static async createComment(req: Request, res: Response): Promise<void> {
    return CommentController.addComment(req, res);
  }
}

export default CommentController;
