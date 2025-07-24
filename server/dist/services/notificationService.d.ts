import { NotificationData } from "../types";
export declare class NotificationService {
    /**
     * Create a new notification
     */
    static createNotification(userId: number, type: string, message: string, relatedPostId?: number, relatedCommentId?: number): Promise<NotificationData>;
    /**
     * Get notifications for a user with pagination
     */
    static getUserNotifications(userId: number, page?: number, limit?: number): Promise<NotificationData[]>;
    /**
     * Mark a notification as read
     */
    static markAsRead(notificationId: number, userId: number): Promise<void>;
    /**
     * Mark all notifications as read for a user
     */
    static markAllAsRead(userId: number): Promise<void>;
    /**
     * Delete a specific notification
     */
    static deleteNotification(notificationId: number, userId: number): Promise<void>;
    /**
     * Clear all notifications for a user
     */
    static clearAllNotifications(userId: number): Promise<void>;
    /**
     * Get unread notification count for a user
     */
    static getUnreadCount(userId: number): Promise<number>;
    /**
     * Create notification for new comment on user's post
     */
    static notifyPostAuthor(postId: number, commenterName: string, commentContent: string): Promise<NotificationData | null>;
}
export default NotificationService;
//# sourceMappingURL=notificationService.d.ts.map