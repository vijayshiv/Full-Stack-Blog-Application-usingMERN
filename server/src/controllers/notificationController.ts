import { Request, Response } from "express";
import { NotificationService } from "../services";
import { successMessage, errorMessage } from "../utils";
import { JWTPayload } from "../types";

export class NotificationController {
  /**
   * Get all notifications for the authenticated user
   */
  static async getUserNotifications(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user = req.user as JWTPayload;
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit as string) || 20)
      );

      console.log(
        `📧 Getting notifications for user ${user.id}, page ${page}, limit ${limit}`
      );
      console.log(`📧 User object:`, user);

      const notifications = await NotificationService.getUserNotifications(
        Number(user.id),
        Number(page),
        Number(limit)
      );

      console.log(
        `📧 Found ${notifications.length} notifications for user ${user.id}`
      );
      res.json(successMessage(notifications));
    } catch (error) {
      console.error("❌ Error getting user notifications:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Failed to retrieve notifications";
      res.json(errorMessage(message));
    }
  }

  /**
   * Mark a specific notification as read
   */
  static async markNotificationAsRead(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user = req.user as JWTPayload;
      const notificationId = parseInt(req.params.notificationId);

      if (isNaN(notificationId) || notificationId <= 0) {
        res.json(errorMessage("Valid notification ID is required"));
        return;
      }

      await NotificationService.markAsRead(notificationId, user.id);
      res.json(successMessage({ message: "Notification marked as read" }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error marking notification as read";
      res.json(errorMessage(message));
    }
  }

  /**
   * Mark all notifications as read for the authenticated user
   */
  static async markAllNotificationsAsRead(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user = req.user as JWTPayload;

      await NotificationService.markAllAsRead(user.id);
      res.json(successMessage({ message: "All notifications marked as read" }));
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error marking notifications as read";
      res.json(errorMessage(message));
    }
  }

  /**
   * Delete a specific notification
   */
  static async deleteNotification(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as JWTPayload;
      const notificationId = parseInt(req.params.notificationId);

      if (isNaN(notificationId) || notificationId <= 0) {
        res.json(errorMessage("Valid notification ID is required"));
        return;
      }

      await NotificationService.deleteNotification(notificationId, user.id);
      res.json(successMessage({ message: "Notification deleted" }));
    } catch (error) {
      console.error("Error deleting notification:", error);
      const message =
        error instanceof Error ? error.message : "Error deleting notification";
      res.json(errorMessage(message));
    }
  }

  /**
   * Clear all notifications for the authenticated user
   */
  static async clearAllNotifications(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const user = req.user as JWTPayload;

      await NotificationService.clearAllNotifications(user.id);
      res.json(successMessage({ message: "All notifications cleared" }));
    } catch (error) {
      console.error("Error clearing all notifications:", error);
      const message =
        error instanceof Error ? error.message : "Error clearing notifications";
      res.json(errorMessage(message));
    }
  }

  /**
   * Get unread notification count for the authenticated user
   */
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as JWTPayload;

      const count = await NotificationService.getUnreadCount(user.id);
      res.json(successMessage({ count }));
    } catch (error) {
      console.error("Error getting unread count:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Error retrieving unread count";
      res.json(errorMessage(message));
    }
  }
}

export default NotificationController;
