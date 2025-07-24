"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const repositories_1 = require("../repositories");
const socketService_1 = require("./socketService");
class CommentService {
    /**
     * Validate comment content
     */
    static validateCommentContent(content) {
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
    static async canUserComment(userId, postId) {
        // Basic check - user exists and post exists
        // You can add more business logic here (e.g., banned users, private posts, etc.)
        const postExists = await repositories_1.CommentRepository.postExists(postId);
        return postExists && userId > 0;
    }
    /**
     * Get comments for a specific post (flat list)
     */
    static async getCommentsByPostId(postId) {
        // Validate postId
        if (!postId || isNaN(postId) || postId <= 0) {
            throw new Error("Invalid postId");
        }
        const comments = await repositories_1.CommentRepository.findByPostId(postId);
        return comments;
    }
    /**
     * Get comments organized as threads for a specific post
     */
    static async getCommentThreadsByPostId(postId) {
        // Validate postId
        if (!postId || isNaN(postId) || postId <= 0) {
            throw new Error("Invalid postId");
        }
        const threads = await repositories_1.CommentRepository.findThreadsByPostId(postId);
        return threads;
    }
    /**
     * Add a new comment to a post
     */
    static async addComment(commentText, userId, postId) {
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
        const postExists = await repositories_1.CommentRepository.postExists(postId);
        if (!postExists) {
            throw new Error("Post not found");
        }
        const result = await repositories_1.CommentRepository.create(commentText.trim(), userId, postId);
        if (!result.insertId) {
            throw new Error("Failed to create comment");
        }
        const comment = {
            comment_id: result.insertId,
            content: commentText.trim(),
            createdTimestamp: new Date().toISOString(),
        };
        // Get full comment details for real-time emission
        const fullComment = await repositories_1.CommentRepository.getCommentDetails(result.insertId);
        if (fullComment) {
            // Emit real-time update
            socketService_1.socketService.emitNewComment(postId, fullComment);
            // Send notification to post author (implement later)
            // await this.sendCommentNotification(postId, userId, fullComment);
        }
        return comment;
    }
    /**
     * Add a reply to a comment
     */
    static async addReply(commentText, userId, postId, parentCommentId) {
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
        const postExists = await repositories_1.CommentRepository.postExists(postId);
        if (!postExists) {
            throw new Error("Post not found");
        }
        // Check if parent comment exists
        const parentCommentExists = await repositories_1.CommentRepository.commentExists(parentCommentId);
        if (!parentCommentExists) {
            throw new Error("Parent comment not found");
        }
        const result = await repositories_1.CommentRepository.createReply(commentText.trim(), userId, postId, parentCommentId);
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
        const fullReply = await repositories_1.CommentRepository.getCommentDetails(result.insertId);
        if (fullReply) {
            // Emit real-time update
            socketService_1.socketService.emitCommentReply(postId, fullReply);
            // Send notification to parent comment author (implement later)
            // await this.sendReplyNotification(parentCommentId, userId, fullReply);
        }
        return reply;
    }
    /**
     * Update an existing comment
     */
    static async updateComment(commentId, userId, content) {
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
        const hasOwnership = await repositories_1.CommentRepository.checkOwnership(commentId, userId);
        if (!hasOwnership) {
            throw new Error("Comment not found or you are not the owner of this comment");
        }
        const result = await repositories_1.CommentRepository.update(commentId, content.trim(), userId);
        if (result.affectedRows === 0) {
            throw new Error("Failed to update comment");
        }
        return "Comment updated successfully";
    }
    /**
     * Delete a comment
     */
    static async deleteComment(commentId, userId) {
        // Validate inputs
        if (!commentId || commentId <= 0) {
            throw new Error("Valid comment ID is required");
        }
        if (!userId || userId <= 0) {
            throw new Error("Valid user ID is required");
        }
        // Check if comment exists and belongs to user
        const hasOwnership = await repositories_1.CommentRepository.checkOwnership(commentId, userId);
        if (!hasOwnership) {
            throw new Error("Comment not found or you are not the owner of this comment");
        }
        const result = await repositories_1.CommentRepository.delete(commentId, userId);
        if (result.affectedRows === 0) {
            throw new Error("Failed to delete comment");
        }
        return "Comment deleted successfully";
    }
    /**
     * Get comments by user ID
     */
    static async getCommentsByUserId(userId) {
        if (!userId || userId <= 0) {
            throw new Error("Valid user ID is required");
        }
        const comments = await repositories_1.CommentRepository.findByUserId(userId);
        return comments;
    }
    /**
     * Get comment by ID
     */
    static async getCommentById(commentId) {
        if (!commentId || commentId <= 0) {
            throw new Error("Valid comment ID is required");
        }
        const comment = await repositories_1.CommentRepository.findById(commentId);
        return comment;
    }
    /**
     * Get comments with pagination for a post
     */
    static async getCommentsWithPagination(postId, page = 1, limit = 10) {
        if (!postId || postId <= 0) {
            throw new Error("Valid post ID is required");
        }
        const offset = (page - 1) * limit;
        const comments = await repositories_1.CommentRepository.findByPostIdWithPagination(postId, offset, limit);
        const totalComments = await repositories_1.CommentRepository.getCommentCountByPostId(postId);
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
    static async searchComments(searchTerm) {
        if (!searchTerm || searchTerm.trim().length === 0) {
            return [];
        }
        const comments = await repositories_1.CommentRepository.search(searchTerm.trim());
        return comments;
    }
    /**
     * Get recent comments (admin/moderation purposes)
     */
    static async getRecentComments(limit = 10) {
        if (limit <= 0 || limit > 100) {
            limit = 10; // Default limit
        }
        const comments = await repositories_1.CommentRepository.getRecentComments(limit);
        return comments;
    }
    /**
     * Get comment count for a post
     */
    static async getCommentCount(postId) {
        if (!postId || postId <= 0) {
            throw new Error("Valid post ID is required");
        }
        const count = await repositories_1.CommentRepository.getCommentCountByPostId(postId);
        return count;
    }
    /**
     * Get comment count for a user
     */
    static async getUserCommentCount(userId) {
        if (!userId || userId <= 0) {
            throw new Error("Valid user ID is required");
        }
        const count = await repositories_1.CommentRepository.getCommentCountByUserId(userId);
        return count;
    }
}
exports.CommentService = CommentService;
exports.default = CommentService;
//# sourceMappingURL=commentService.js.map