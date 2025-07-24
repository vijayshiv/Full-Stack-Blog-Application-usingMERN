import { Request, Response } from "express";
export declare class NotificationController {
    /**
     * Get all notifications for the authenticated user
     */
    static getUserNotifications(req: Request, res: Response): Promise<void>;
    /**
     * Mark a specific notification as read
     */
    static markNotificationAsRead(req: Request, res: Response): Promise<void>;
    /**
     * Mark all notifications as read for the authenticated user
     */
    static markAllNotificationsAsRead(req: Request, res: Response): Promise<void>;
    /**
     * Delete a specific notification
     */
    static deleteNotification(req: Request, res: Response): Promise<void>;
    /**
     * Clear all notifications for the authenticated user
     */
    static clearAllNotifications(req: Request, res: Response): Promise<void>;
    /**
     * Get unread notification count for the authenticated user
     */
    static getUnreadCount(req: Request, res: Response): Promise<void>;
}
export default NotificationController;
//# sourceMappingURL=notificationController.d.ts.map