"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const db_1 = __importDefault(require("../db"));
class NotificationService {
    /**
     * Create a new notification
     */
    static async createNotification(userId, type, message, relatedPostId, relatedCommentId) {
        const query = `
      INSERT INTO notifications (user_id, type, message, related_post_id, related_comment_id, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
        try {
            const result = await db_1.default.execute(query, [
                userId,
                type,
                message,
                relatedPostId || null,
                relatedCommentId || null,
            ]);
            const insertId = result.insertId;
            // Fetch the created notification
            const fetchQuery = `
        SELECT 
          n.id,
          n.user_id,
          n.type,
          n.message,
          n.related_post_id,
          n.related_comment_id,
          n.read_status as read,
          n.created_at as createdAt,
          p.title as postTitle
        FROM notifications n
        LEFT JOIN posts p ON n.related_post_id = p.id
        WHERE n.id = ?
      `;
            const [rows] = await db_1.default.execute(fetchQuery, [insertId]);
            return rows[0];
        }
        catch (error) {
            console.error("Error creating notification:", error);
            throw new Error("Failed to create notification");
        }
    }
    /**
     * Get notifications for a user with pagination
     */
    static async getUserNotifications(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const query = `
      SELECT 
        n.id,
        n.user_id,
        n.type,
        n.message,
        n.related_post_id,
        n.related_comment_id,
        n.read_status as read,
        n.created_at as createdAt,
        p.title as postTitle
      FROM notifications n
      LEFT JOIN posts p ON n.related_post_id = p.id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `;
        try {
            const [rows] = await db_1.default.execute(query, [userId, limit, offset]);
            return rows;
        }
        catch (error) {
            console.error("Error getting user notifications:", error);
            throw new Error("Failed to retrieve notifications");
        }
    }
    /**
     * Mark a notification as read
     */
    static async markAsRead(notificationId, userId) {
        const query = `
      UPDATE notifications 
      SET read_status = 1 
      WHERE id = ? AND user_id = ?
    `;
        try {
            await db_1.default.execute(query, [notificationId, userId]);
        }
        catch (error) {
            console.error("Error marking notification as read:", error);
            throw new Error("Failed to mark notification as read");
        }
    }
    /**
     * Mark all notifications as read for a user
     */
    static async markAllAsRead(userId) {
        const query = `
      UPDATE notifications 
      SET read_status = 1 
      WHERE user_id = ? AND read_status = 0
    `;
        try {
            await db_1.default.execute(query, [userId]);
        }
        catch (error) {
            console.error("Error marking all notifications as read:", error);
            throw new Error("Failed to mark notifications as read");
        }
    }
    /**
     * Delete a specific notification
     */
    static async deleteNotification(notificationId, userId) {
        const query = `
      DELETE FROM notifications 
      WHERE id = ? AND user_id = ?
    `;
        try {
            await db_1.default.execute(query, [notificationId, userId]);
        }
        catch (error) {
            console.error("Error deleting notification:", error);
            throw new Error("Failed to delete notification");
        }
    }
    /**
     * Clear all notifications for a user
     */
    static async clearAllNotifications(userId) {
        const query = `
      DELETE FROM notifications 
      WHERE user_id = ?
    `;
        try {
            await db_1.default.execute(query, [userId]);
        }
        catch (error) {
            console.error("Error clearing all notifications:", error);
            throw new Error("Failed to clear notifications");
        }
    }
    /**
     * Get unread notification count for a user
     */
    static async getUnreadCount(userId) {
        const query = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND read_status = 0
    `;
        try {
            const [rows] = await db_1.default.execute(query, [userId]);
            return rows[0].count;
        }
        catch (error) {
            console.error("Error getting unread count:", error);
            throw new Error("Failed to get unread count");
        }
    }
    /**
     * Create notification for new comment on user's post
     */
    static async notifyPostAuthor(postId, commenterName, commentContent) {
        try {
            // Get post author
            const postQuery = `
        SELECT user_id, title 
        FROM posts 
        WHERE post_id = ?
      `;
            const [postRows] = await db_1.default.execute(postQuery, [postId]);
            const post = postRows[0];
            if (post) {
                const message = `${commenterName} commented on your post: "${commentContent.substring(0, 50)}${commentContent.length > 50 ? "..." : ""}"`;
                const notification = await this.createNotification(post.user_id, "comment", message, postId);
                return notification;
            }
            return null;
        }
        catch (error) {
            console.error("Error notifying post author:", error);
            throw new Error("Failed to notify post author");
        }
    }
}
exports.NotificationService = NotificationService;
exports.default = NotificationService;
//# sourceMappingURL=notificationService.js.map