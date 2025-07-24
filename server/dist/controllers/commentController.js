"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const services_1 = require("../services");
const utils_1 = require("../utils");
const socketService_1 = require("../services/socketService");
class CommentController {
    /**
     * Get comments for a specific post (flat list)
     */
    static async getCommentsByPostId(req, res) {
        try {
            const postId = parseInt(req.params.postId);
            if (isNaN(postId) || postId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid post ID is required"));
                return;
            }
            const comments = await services_1.CommentService.getCommentsByPostId(postId);
            res.json((0, utils_1.successMessage)(comments));
        }
        catch (error) {
            console.error("Error getting comments:", error);
            const message = error instanceof Error ? error.message : "Error retrieving comments";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get comments organized as threads for a specific post
     */
    static async getCommentThreadsByPostId(req, res) {
        try {
            const postId = parseInt(req.params.postId);
            if (isNaN(postId) || postId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid post ID is required"));
                return;
            }
            const threads = await services_1.CommentService.getCommentThreadsByPostId(postId);
            res.json((0, utils_1.successMessage)(threads));
        }
        catch (error) {
            console.error("Error getting comment threads:", error);
            const message = error instanceof Error
                ? error.message
                : "Error retrieving comment threads";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Add a new comment to a post
     */
    static async addComment(req, res) {
        try {
            const postId = parseInt(req.params.postId);
            const { content, parentCommentId } = req.body;
            const user = req.user;
            if (isNaN(postId) || postId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid post ID is required"));
                return;
            }
            if (!content || content.trim().length === 0) {
                res.json((0, utils_1.errorMessage)("Comment content is required"));
                return;
            }
            // If parentCommentId is provided, this is a reply
            if (parentCommentId && parentCommentId > 0) {
                const result = await services_1.CommentService.addReply(content, user.id, postId, parentCommentId);
                // Create and send notification for reply
                try {
                    const notification = await services_1.NotificationService.notifyPostAuthor(postId, user.fullname || "Someone", content);
                    if (notification) {
                        socketService_1.socketService.sendNotificationToUser(notification.user_id, notification);
                    }
                }
                catch (notifError) {
                    console.error("Error sending reply notification:", notifError);
                }
                res.json((0, utils_1.successMessage)(result));
            }
            else {
                // This is a regular comment
                const result = await services_1.CommentService.addComment(content, user.id, postId);
                // Create and send notification for new comment
                try {
                    const notification = await services_1.NotificationService.notifyPostAuthor(postId, user.fullname || "Someone", content);
                    if (notification) {
                        socketService_1.socketService.sendNotificationToUser(notification.user_id, notification);
                    }
                }
                catch (notifError) {
                    console.error("Error sending comment notification:", notifError);
                }
                res.json((0, utils_1.successMessage)(result));
            }
        }
        catch (error) {
            console.error("Error adding comment:", error);
            const message = error instanceof Error ? error.message : "Error adding comment";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Add a reply to a comment
     */
    static async addReply(req, res) {
        try {
            const postId = parseInt(req.params.postId);
            const parentCommentId = parseInt(req.params.commentId);
            const { content } = req.body;
            const user = req.user;
            if (isNaN(postId) || postId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid post ID is required"));
                return;
            }
            if (isNaN(parentCommentId) || parentCommentId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid comment ID is required"));
                return;
            }
            if (!content || content.trim().length === 0) {
                res.json((0, utils_1.errorMessage)("Reply content is required"));
                return;
            }
            const result = await services_1.CommentService.addReply(content, user.id, postId, parentCommentId);
            res.json((0, utils_1.successMessage)(result));
        }
        catch (error) {
            console.error("Error adding reply:", error);
            const message = error instanceof Error ? error.message : "Error adding reply";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get comments with pagination for a post
     */
    static async getCommentsWithPagination(req, res) {
        try {
            const postId = parseInt(req.params.postId);
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            if (isNaN(postId) || postId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid post ID is required"));
                return;
            }
            const result = await services_1.CommentService.getCommentsWithPagination(postId, page, limit);
            res.json((0, utils_1.successMessage)(result));
        }
        catch (error) {
            console.error("Error getting comments with pagination:", error);
            const message = error instanceof Error ? error.message : "Error retrieving comments";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Update an existing comment
     */
    static async updateComment(req, res) {
        try {
            const commentId = parseInt(req.params.commentId);
            const userId = req.user.id;
            const { content } = req.body;
            if (isNaN(commentId) || commentId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid comment ID is required"));
                return;
            }
            if (!content) {
                res.json((0, utils_1.errorMessage)("Comment content is required"));
                return;
            }
            // Validate comment content
            services_1.CommentService.validateCommentContent(content);
            const result = await services_1.CommentService.updateComment(commentId, userId, content);
            res.json((0, utils_1.successMessage)(result));
        }
        catch (error) {
            console.error("Error updating comment:", error);
            const message = error instanceof Error ? error.message : "Error updating comment";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Delete a comment
     */
    static async deleteComment(req, res) {
        try {
            const commentId = parseInt(req.params.commentId);
            const userId = req.user.id;
            if (isNaN(commentId) || commentId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid comment ID is required"));
                return;
            }
            const result = await services_1.CommentService.deleteComment(commentId, userId);
            res.json((0, utils_1.successMessage)(result));
        }
        catch (error) {
            console.error("Error deleting comment:", error);
            const message = error instanceof Error ? error.message : "Error deleting comment";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get comments by user ID
     */
    static async getCommentsByUserId(req, res) {
        try {
            const userId = req.user.id;
            const comments = await services_1.CommentService.getCommentsByUserId(userId);
            res.json((0, utils_1.successMessage)(comments));
        }
        catch (error) {
            console.error("Error getting user comments:", error);
            const message = error instanceof Error
                ? error.message
                : "Error retrieving user comments";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get comments by specific user ID (for public profiles)
     */
    static async getCommentsBySpecificUserId(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId) || userId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid user ID is required"));
                return;
            }
            const comments = await services_1.CommentService.getCommentsByUserId(userId);
            res.json((0, utils_1.successMessage)(comments));
        }
        catch (error) {
            console.error("Error getting user comments:", error);
            const message = error instanceof Error
                ? error.message
                : "Error retrieving user comments";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get a single comment by ID
     */
    static async getCommentById(req, res) {
        try {
            const commentId = parseInt(req.params.commentId);
            if (isNaN(commentId) || commentId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid comment ID is required"));
                return;
            }
            const comment = await services_1.CommentService.getCommentById(commentId);
            if (!comment) {
                res.json((0, utils_1.errorMessage)("Comment not found"));
                return;
            }
            res.json((0, utils_1.successMessage)(comment));
        }
        catch (error) {
            console.error("Error getting comment:", error);
            const message = error instanceof Error ? error.message : "Error retrieving comment";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Search comments by content
     */
    static async searchComments(req, res) {
        try {
            const { q: searchTerm } = req.query;
            if (!searchTerm || typeof searchTerm !== "string") {
                res.json((0, utils_1.successMessage)([]));
                return;
            }
            const comments = await services_1.CommentService.searchComments(searchTerm);
            res.json((0, utils_1.successMessage)(comments));
        }
        catch (error) {
            console.error("Error searching comments:", error);
            const message = error instanceof Error ? error.message : "Error searching comments";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get recent comments (admin/moderation)
     */
    static async getRecentComments(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const comments = await services_1.CommentService.getRecentComments(limit);
            res.json((0, utils_1.successMessage)(comments));
        }
        catch (error) {
            console.error("Error getting recent comments:", error);
            const message = error instanceof Error
                ? error.message
                : "Error retrieving recent comments";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get comment count for a post
     */
    static async getCommentCount(req, res) {
        try {
            const postId = parseInt(req.params.postId);
            if (isNaN(postId) || postId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid post ID is required"));
                return;
            }
            const count = await services_1.CommentService.getCommentCount(postId);
            res.json((0, utils_1.successMessage)({ count }));
        }
        catch (error) {
            console.error("Error getting comment count:", error);
            const message = error instanceof Error
                ? error.message
                : "Error retrieving comment count";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get user's comment count
     */
    static async getUserCommentCount(req, res) {
        try {
            const userId = req.user.id;
            const count = await services_1.CommentService.getUserCommentCount(userId);
            res.json((0, utils_1.successMessage)({ count }));
        }
        catch (error) {
            console.error("Error getting user comment count:", error);
            const message = error instanceof Error
                ? error.message
                : "Error retrieving comment count";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get comment count for specific user (public)
     */
    static async getSpecificUserCommentCount(req, res) {
        try {
            const userId = parseInt(req.params.userId);
            if (isNaN(userId) || userId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid user ID is required"));
                return;
            }
            const count = await services_1.CommentService.getUserCommentCount(userId);
            res.json((0, utils_1.successMessage)({ count }));
        }
        catch (error) {
            console.error("Error getting user comment count:", error);
            const message = error instanceof Error
                ? error.message
                : "Error retrieving comment count";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Alias for getCommentsByPostId for route compatibility
     */
    static async getCommentsByPost(req, res) {
        return CommentController.getCommentsByPostId(req, res);
    }
    /**
     * Create a new comment (alias for addComment)
     */
    static async createComment(req, res) {
        return CommentController.addComment(req, res);
    }
}
exports.CommentController = CommentController;
exports.default = CommentController;
//# sourceMappingURL=commentController.js.map