import db from "../db";
import { NotificationData } from "../types";

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(
    userId: number,
    type: string,
    message: string,
    relatedPostId?: number | null,
    relatedCommentId?: number | null
  ): Promise<NotificationData> {
    const query = `
      INSERT INTO notifications (user_id, type, message, related_post_id, related_comment_id, created_at)
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    try {
      // Ensure null values instead of undefined
      const params = [
        userId,
        type,
        message,
        relatedPostId ?? null,
        relatedCommentId ?? null,
      ];

      console.log(`🔍 Creating notification with params:`, params);

      const result = await db.execute(query, params);
      const insertId = (result as any).insertId;

      // Fetch the created notification with a simple query
      const fetchQuery = `
        SELECT 
          id,
          user_id,
          type,
          message,
          related_post_id as post_id,
          related_comment_id,
          read_status as \`read\`,
          created_at as createdAt
        FROM notifications
        WHERE id = ?
      `;

      const [rows] = await db.execute(fetchQuery, [insertId]);
      return (rows as NotificationData[])[0];
    } catch (error) {
      console.error("Error creating notification:", error);
      throw new Error("Failed to create notification");
    }
  }

  /**
   * Get notifications for a user with pagination
   */
  static async getUserNotifications(
    userId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<NotificationData[]> {
    const offset = (page - 1) * limit;

    console.log(
      `🔍 Query params: userId=${userId}, limit=${limit}, offset=${offset}`
    );

    // Simplified query without JOIN first to test
    const query = `
      SELECT 
        id,
        user_id,
        type,
        message,
        related_post_id as post_id,
        related_comment_id,
        read_status as \`read\`,
        created_at as createdAt
      FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    try {
      // First, try a simple query to test
      const simpleQuery = `SELECT COUNT(*) as count FROM notifications WHERE user_id = ?`;
      const [countResult] = await db.execute(simpleQuery, [userId]);
      console.log(`🔍 Total notifications for user ${userId}:`, countResult);

      console.log(
        `🔍 Executing query without prepared statement for LIMIT/OFFSET`
      );

      const [rows] = await db.execute(query, [userId]);
      return rows as NotificationData[];
    } catch (error) {
      console.error("Error getting user notifications:", error);
      throw new Error("Failed to retrieve notifications");
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(
    notificationId: number,
    userId: number
  ): Promise<void> {
    const query = `
      UPDATE notifications 
      SET read_status = 1 
      WHERE id = ? AND user_id = ?
    `;

    try {
      await db.execute(query, [notificationId, userId]);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw new Error("Failed to mark notification as read");
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number): Promise<void> {
    const query = `
      UPDATE notifications 
      SET read_status = 1 
      WHERE user_id = ? AND read_status = 0
    `;

    try {
      await db.execute(query, [userId]);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw new Error("Failed to mark notifications as read");
    }
  }

  /**
   * Delete a specific notification
   */
  static async deleteNotification(
    notificationId: number,
    userId: number
  ): Promise<void> {
    const query = `
      DELETE FROM notifications 
      WHERE id = ? AND user_id = ?
    `;

    try {
      await db.execute(query, [notificationId, userId]);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw new Error("Failed to delete notification");
    }
  }

  /**
   * Clear all notifications for a user
   */
  static async clearAllNotifications(userId: number): Promise<void> {
    const query = `
      DELETE FROM notifications 
      WHERE user_id = ?
    `;

    try {
      await db.execute(query, [userId]);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      throw new Error("Failed to clear notifications");
    }
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM notifications 
      WHERE user_id = ? AND read_status = 0
    `;

    try {
      const [rows] = await db.execute(query, [userId]);
      return (rows as any)[0].count;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw new Error("Failed to get unread count");
    }
  }

  /**
   * Create notification for new comment on user's post
   */
  static async notifyPostAuthor(
    postId: number,
    commenterName: string,
    commentContent: string,
    commenterId: number
  ): Promise<NotificationData | null> {
    try {
      // Get post author
      const postQuery = `
        SELECT user_id, title 
        FROM posts 
        WHERE post_id = ?
      `;

      const [postRows] = await db.execute(postQuery, [postId]);
      const post = (postRows as any)[0];

      if (post) {
        // Don't notify if the commenter is the same as the post author
        if (post.user_id === commenterId) {
          console.log(
            "🔔 Skipping notification - user commented on their own post"
          );
          return null;
        }

        const message = `${commenterName} commented on your post: "${commentContent.substring(
          0,
          50
        )}${commentContent.length > 50 ? "..." : ""}"`;

        const notification = await this.createNotification(
          post.user_id,
          "comment",
          message,
          postId,
          undefined // relatedCommentId - we don't have the comment ID here
        );

        return notification;
      }

      return null;
    } catch (error) {
      console.error("Error notifying post author:", error);
      throw new Error("Failed to notify post author");
    }
  }

  /**
   * Notify comment author when someone replies to their comment
   */
  static async notifyCommentAuthor(
    parentCommentId: number,
    replierName: string,
    replyContent: string,
    postId: number,
    replierId: number
  ): Promise<any> {
    try {
      console.log(
        `🔔 Notifying comment author for reply to comment ${parentCommentId}`
      );

      // Get the comment author info
      const query = `
        SELECT c.user_id, c.content, p.title as post_title
        FROM comments c
        JOIN posts p ON c.post_id = p.post_id
        WHERE c.comment_id = ?
      `;

      const [commentRows] = await db.execute(query, [parentCommentId]);
      const comment = (commentRows as any)[0];

      if (comment) {
        // Don't notify if the replier is the same as the comment author
        if (comment.user_id === replierId) {
          console.log(
            "🔔 Skipping notification - user replied to their own comment"
          );
          return null;
        }

        const message = `${replierName} replied to your comment: "${replyContent.substring(
          0,
          50
        )}${replyContent.length > 50 ? "..." : ""}"`;

        const notification = await this.createNotification(
          comment.user_id,
          "reply",
          message,
          postId,
          parentCommentId
        );

        return notification;
      }

      return null;
    } catch (error) {
      console.error("Error notifying comment author:", error);
      throw new Error("Failed to notify comment author");
    }
  }

  /**
   * Create notification for meeting request
   */
  static async createMeetingRequestNotification(
    authorId: number,
    requesterName: string,
    postTitle: string,
    message: string,
    requestId: number,
    requesterId: number
  ): Promise<NotificationData | null> {
    try {
      const content = `${requesterName} wants to meet with you about "${postTitle}": ${message.substring(
        0,
        100
      )}${message.length > 100 ? "..." : ""}`;

      const notification = await this.createNotification(
        authorId,
        "meeting_request",
        content,
        requestId, // Use requestId as relatedPostId for now
        null // relatedCommentId is null for meeting requests
      );

      return notification;
    } catch (error) {
      console.error("Error creating meeting request notification:", error);
      throw new Error("Failed to create meeting request notification");
    }
  }

  /**
   * Create notification for meeting response (approval/decline)
   */
  static async createMeetingResponseNotification(
    requesterId: number,
    authorName: string,
    postTitle: string,
    action: "approve" | "decline",
    requestId: number,
    authorId: number,
    meetingUrl?: string
  ): Promise<NotificationData | null> {
    try {
      const actionText = action === "approve" ? "approved" : "declined";
      let content = `${authorName} has ${actionText} your meeting request about "${postTitle}"`;

      if (action === "approve" && meetingUrl) {
        content += ". The meeting room is ready!";
      }

      const notification = await this.createNotification(
        requesterId,
        `meeting_${action}`,
        content,
        requestId, // Use requestId as relatedPostId for now
        null // relatedCommentId is null for meeting responses
      );

      return notification;
    } catch (error) {
      console.error("Error creating meeting response notification:", error);
      throw new Error("Failed to create meeting response notification");
    }
  }
}

export default NotificationService;
