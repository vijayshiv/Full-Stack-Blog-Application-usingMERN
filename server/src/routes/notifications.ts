import express from "express";
import { NotificationController } from "../controllers/notificationController";
import { AuthMiddleware, ValidationMiddleware } from "../middleware";
import { ErrorHandler } from "../middleware/errorHandler";

const router = express.Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of notifications per page
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get(
  "/",
  AuthMiddleware.verifyToken,
  ErrorHandler.asyncHandler(NotificationController.getUserNotifications)
);

/**
 * @swagger
 * /notifications/{notificationId}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.put(
  "/:notificationId/read",
  AuthMiddleware.verifyToken,
  ValidationMiddleware.validateNotificationId,
  ErrorHandler.asyncHandler(NotificationController.markNotificationAsRead)
);

/**
 * @swagger
 * /notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put(
  "/mark-all-read",
  AuthMiddleware.verifyToken,
  ErrorHandler.asyncHandler(NotificationController.markAllNotificationsAsRead)
);

/**
 * @swagger
 * /notifications/{notificationId}:
 *   delete:
 *     summary: Delete a notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted
 */
router.delete(
  "/:notificationId",
  AuthMiddleware.verifyToken,
  ValidationMiddleware.validateNotificationId,
  ErrorHandler.asyncHandler(NotificationController.deleteNotification)
);

/**
 * @swagger
 * /notifications/clear-all:
 *   delete:
 *     summary: Clear all notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications cleared
 */
router.delete(
  "/clear-all",
  AuthMiddleware.verifyToken,
  ErrorHandler.asyncHandler(NotificationController.clearAllNotifications)
);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 */
router.get(
  "/unread-count",
  AuthMiddleware.verifyToken,
  ErrorHandler.asyncHandler(NotificationController.getUnreadCount)
);

export default router;
