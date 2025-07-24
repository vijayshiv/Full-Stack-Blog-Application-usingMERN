import { CommentRepository } from "../repositories";
import {
  CommentWithUser,
  CommentThreadWithUser,
  CommentRequest,
  DatabaseResult,
} from "../types";
import { socketService } from "./socketService";
import { redisService } from "../config/redis";

export class CommentService {
  /**
   * Validate comment content
   */
  static validateCommentContent(content: string): void {
    if (!content || content.trim().length === 0) {
      throw new Error("Comment content is required");
    }
    if (content.length > 1000) {
      throw new Error("Comment content too long (max 1000 characters)");
    }
  }

  /**
   * Check if user can comment on a post
   */
  static async canUserComment(
    userId: number,
    postId: number
  ): Promise<boolean> {
    // Basic check - user exists and post exists
    // You can add more business logic here (e.g., banned users, private posts, etc.)
    const postExists = await CommentRepository.postExists(postId);
    return postExists && userId > 0;
  }

  /**
   * Get comments for a specific post (flat list)
   */
  static async getCommentsByPostId(postId: number): Promise<CommentWithUser[]> {
    // Validate postId
    if (!postId || isNaN(postId) || postId <= 0) {
      throw new Error("Invalid postId");
    }

    const comments = await CommentRepository.findByPostId(postId);
    return comments;
  }

  /**
   * Get comments organized as threads for a specific post
   */
  static async getCommentThreadsByPostId(
    postId: number
  ): Promise<CommentThreadWithUser[]> {
    // Validate postId
    if (!postId || isNaN(postId) || postId <= 0) {
      throw new Error("Invalid postId");
    }

    const threads = await CommentRepository.findThreadsByPostId(postId);
    return threads;
  }

  /**
   * Add a new comment to a post
   */
  static async addComment(
    commentText: string,
    userId: number,
    postId: number
  ): Promise<{
    comment_id: number;
    content: string;
    createdTimestamp: string;
  }> {
    // Validate inputs
    if (!commentText || commentText.trim().length === 0) {
      throw new Error("Comment text is required");
    }

    if (!userId || userId <= 0) {
      throw new Error("Valid user ID is required");
    }

    if (!postId || postId <= 0) {
      throw new Error("Valid post ID is required");
    }

    // Check if post exists
    const postExists = await CommentRepository.postExists(postId);
    if (!postExists) {
      throw new Error("Post not found");
    }

    const result = await CommentRepository.create(
      commentText.trim(),
      userId,
      postId
    );

    if (!result.insertId) {
      throw new Error("Failed to create comment");
    }

    const comment = {
      comment_id: result.insertId,
      content: commentText.trim(),
      createdTimestamp: new Date().toISOString(),
    };

    // Get full comment details for real-time emission
    const fullComment = await CommentRepository.getCommentDetails(
      result.insertId
    );
    if (fullComment) {
      // Emit real-time update
      socketService.emitNewComment(postId, fullComment);

      // Send notification to post author (implement later)
      // await this.sendCommentNotification(postId, userId, fullComment);
    }

    return comment;
  }

  /**
   * Add a reply to a comment
   */
  static async addReply(
    commentText: string,
    userId: number,
    postId: number,
    parentCommentId: number
  ): Promise<{
    comment_id: number;
    content: string;
    createdTimestamp: string;
    parent_comment_id: number;
  }> {
    // Validate inputs
    if (!commentText || commentText.trim().length === 0) {
      throw new Error("Reply text is required");
    }

    if (!userId || userId <= 0) {
      throw new Error("Valid user ID is required");
    }

    if (!postId || postId <= 0) {
      throw new Error("Valid post ID is required");
    }

    if (!parentCommentId || parentCommentId <= 0) {
      throw new Error("Valid parent comment ID is required");
    }

    // Check if post exists
    const postExists = await CommentRepository.postExists(postId);
    if (!postExists) {
      throw new Error("Post not found");
    }

    // Check if parent comment exists
    const parentCommentExists = await CommentRepository.commentExists(
      parentCommentId
    );
    if (!parentCommentExists) {
      throw new Error("Parent comment not found");
    }

    const result = await CommentRepository.createReply(
      commentText.trim(),
      userId,
      postId,
      parentCommentId
    );

    if (!result.insertId) {
      throw new Error("Failed to create reply");
    }

    const reply = {
      comment_id: result.insertId,
      content: commentText.trim(),
      createdTimestamp: new Date().toISOString(),
      parent_comment_id: parentCommentId,
    };

    // Get full reply details for real-time emission
    const fullReply = await CommentRepository.getCommentDetails(
      result.insertId
    );
    if (fullReply) {
      // Emit real-time update
      socketService.emitCommentReply(postId, fullReply);

      // Send notification to parent comment author (implement later)
      // await this.sendReplyNotification(parentCommentId, userId, fullReply);
    }

    return reply;
  }

  /**
   * Update an existing comment
   */
  static async updateComment(
    commentId: number,
    userId: number,
    content: string
  ): Promise<string> {
    // Validate inputs
    if (!commentId || commentId <= 0) {
      throw new Error("Valid comment ID is required");
    }

    if (!userId || userId <= 0) {
      throw new Error("Valid user ID is required");
    }

    if (!content || content.trim().length === 0) {
      throw new Error("Comment content is required");
    }

    // Check if comment exists and belongs to user
    const hasOwnership = await CommentRepository.checkOwnership(
      commentId,
      userId
    );
    if (!hasOwnership) {
      throw new Error(
        "Comment not found or you are not the owner of this comment"
      );
    }

    const result = await CommentRepository.update(
      commentId,
      content.trim(),
      userId
    );

    if (result.affectedRows === 0) {
      throw new Error("Failed to update comment");
    }

    return "Comment updated successfully";
  }

  /**
   * Delete a comment
   */
  static async deleteComment(
    commentId: number,
    userId: number
  ): Promise<string> {
    // Validate inputs
    if (!commentId || commentId <= 0) {
      throw new Error("Valid comment ID is required");
    }

    if (!userId || userId <= 0) {
      throw new Error("Valid user ID is required");
    }

    // Check if comment exists and belongs to user
    const hasOwnership = await CommentRepository.checkOwnership(
      commentId,
      userId
    );
    if (!hasOwnership) {
      throw new Error(
        "Comment not found or you are not the owner of this comment"
      );
    }

    const result = await CommentRepository.delete(commentId, userId);

    if (result.affectedRows === 0) {
      throw new Error("Failed to delete comment");
    }

    return "Comment deleted successfully";
  }

  /**
   * Get comments by user ID
   */
  static async getCommentsByUserId(userId: number): Promise<CommentWithUser[]> {
    if (!userId || userId <= 0) {
      throw new Error("Valid user ID is required");
    }

    const comments = await CommentRepository.findByUserId(userId);
    return comments;
  }

  /**
   * Get comment by ID
   */
  static async getCommentById(
    commentId: number
  ): Promise<CommentWithUser | null> {
    if (!commentId || commentId <= 0) {
      throw new Error("Valid comment ID is required");
    }

    const comment = await CommentRepository.findById(commentId);
    return comment;
  }

  /**
   * Get comments with pagination for a post
   */
  static async getCommentsWithPagination(
    postId: number,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    comments: CommentWithUser[];
    totalComments: number;
    totalPages: number;
    currentPage: number;
  }> {
    if (!postId || postId <= 0) {
      throw new Error("Valid post ID is required");
    }

    const offset = (page - 1) * limit;
    const comments = await CommentRepository.findByPostIdWithPagination(
      postId,
      offset,
      limit
    );
    const totalComments = await CommentRepository.getCommentCountByPostId(
      postId
    );
    const totalPages = Math.ceil(totalComments / limit);

    return {
      comments,
      totalComments,
      totalPages,
      currentPage: page,
    };
  }

  /**
   * Search comments by text content
   */
  static async searchComments(searchTerm: string): Promise<CommentWithUser[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return [];
    }

    const comments = await CommentRepository.search(searchTerm.trim());
    return comments;
  }

  /**
   * Get recent comments (admin/moderation purposes)
   */
  static async getRecentComments(
    limit: number = 10
  ): Promise<CommentWithUser[]> {
    if (limit <= 0 || limit > 100) {
      limit = 10; // Default limit
    }

    const comments = await CommentRepository.getRecentComments(limit);
    return comments;
  }

  /**
   * Get comment count for a post
   */
  static async getCommentCount(postId: number): Promise<number> {
    if (!postId || postId <= 0) {
      throw new Error("Valid post ID is required");
    }

    const count = await CommentRepository.getCommentCountByPostId(postId);
    return count;
  }

  /**
   * Get comment count for a user
   */
  static async getUserCommentCount(userId: number): Promise<number> {
    if (!userId || userId <= 0) {
      throw new Error("Valid user ID is required");
    }

    const count = await CommentRepository.getCommentCountByUserId(userId);
    return count;
  }
}

export default CommentService;
