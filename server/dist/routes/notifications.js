"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationController_1 = require("../controllers/notificationController");
const middleware_1 = require("../middleware");
const errorHandler_1 = require("../middleware/errorHandler");
const router = express_1.default.Router();
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
router.get("/", middleware_1.AuthMiddleware.verifyToken, errorHandler_1.ErrorHandler.asyncHandler(notificationController_1.NotificationController.getUserNotifications));
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
router.put("/:notificationId/read", middleware_1.AuthMiddleware.verifyToken, middleware_1.ValidationMiddleware.validateNotificationId, errorHandler_1.ErrorHandler.asyncHandler(notificationController_1.NotificationController.markNotificationAsRead));
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
router.put("/mark-all-read", middleware_1.AuthMiddleware.verifyToken, errorHandler_1.ErrorHandler.asyncHandler(notificationController_1.NotificationController.markAllNotificationsAsRead));
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
router.delete("/:notificationId", middleware_1.AuthMiddleware.verifyToken, middleware_1.ValidationMiddleware.validateNotificationId, errorHandler_1.ErrorHandler.asyncHandler(notificationController_1.NotificationController.deleteNotification));
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
router.delete("/clear-all", middleware_1.AuthMiddleware.verifyToken, errorHandler_1.ErrorHandler.asyncHandler(notificationController_1.NotificationController.clearAllNotifications));
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
router.get("/unread-count", middleware_1.AuthMiddleware.verifyToken, errorHandler_1.ErrorHandler.asyncHandler(notificationController_1.NotificationController.getUnreadCount));
exports.default = router;
//# sourceMappingURL=notifications.js.map