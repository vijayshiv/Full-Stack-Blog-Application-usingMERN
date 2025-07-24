"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const services_1 = require("../services");
const utils_1 = require("../utils");
class NotificationController {
    /**
     * Get all notifications for the authenticated user
     */
    static async getUserNotifications(req, res) {
        try {
            const user = req.user;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const notifications = await services_1.NotificationService.getUserNotifications(user.id, page, limit);
            res.json((0, utils_1.successMessage)(notifications));
        }
        catch (error) {
            console.error("Error getting user notifications:", error);
            const message = error instanceof Error
                ? error.message
                : "Error retrieving notifications";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Mark a specific notification as read
     */
    static async markNotificationAsRead(req, res) {
        try {
            const user = req.user;
            const notificationId = parseInt(req.params.notificationId);
            if (isNaN(notificationId) || notificationId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid notification ID is required"));
                return;
            }
            await services_1.NotificationService.markAsRead(notificationId, user.id);
            res.json((0, utils_1.successMessage)({ message: "Notification marked as read" }));
        }
        catch (error) {
            console.error("Error marking notification as read:", error);
            const message = error instanceof Error
                ? error.message
                : "Error marking notification as read";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Mark all notifications as read for the authenticated user
     */
    static async markAllNotificationsAsRead(req, res) {
        try {
            const user = req.user;
            await services_1.NotificationService.markAllAsRead(user.id);
            res.json((0, utils_1.successMessage)({ message: "All notifications marked as read" }));
        }
        catch (error) {
            console.error("Error marking all notifications as read:", error);
            const message = error instanceof Error
                ? error.message
                : "Error marking notifications as read";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Delete a specific notification
     */
    static async deleteNotification(req, res) {
        try {
            const user = req.user;
            const notificationId = parseInt(req.params.notificationId);
            if (isNaN(notificationId) || notificationId <= 0) {
                res.json((0, utils_1.errorMessage)("Valid notification ID is required"));
                return;
            }
            await services_1.NotificationService.deleteNotification(notificationId, user.id);
            res.json((0, utils_1.successMessage)({ message: "Notification deleted" }));
        }
        catch (error) {
            console.error("Error deleting notification:", error);
            const message = error instanceof Error ? error.message : "Error deleting notification";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Clear all notifications for the authenticated user
     */
    static async clearAllNotifications(req, res) {
        try {
            const user = req.user;
            await services_1.NotificationService.clearAllNotifications(user.id);
            res.json((0, utils_1.successMessage)({ message: "All notifications cleared" }));
        }
        catch (error) {
            console.error("Error clearing all notifications:", error);
            const message = error instanceof Error ? error.message : "Error clearing notifications";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
    /**
     * Get unread notification count for the authenticated user
     */
    static async getUnreadCount(req, res) {
        try {
            const user = req.user;
            const count = await services_1.NotificationService.getUnreadCount(user.id);
            res.json((0, utils_1.successMessage)({ count }));
        }
        catch (error) {
            console.error("Error getting unread count:", error);
            const message = error instanceof Error
                ? error.message
                : "Error retrieving unread count";
            res.json((0, utils_1.errorMessage)(message));
        }
    }
}
exports.NotificationController = NotificationController;
exports.default = NotificationController;
//# sourceMappingURL=notificationController.js.map