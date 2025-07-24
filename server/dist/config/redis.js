"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redisService = void 0;
const redis_1 = require("redis");
const index_1 = __importDefault(require("./index"));
class RedisService {
    constructor() {
        this.client = null;
        this.isConnected = false;
    }
    async connect() {
        try {
            this.client = (0, redis_1.createClient)({
                url: index_1.default.redis.url || "redis://localhost:6379",
                socket: {
                    reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
                },
            });
            this.client.on("error", (err) => {
                console.error("Redis Client Error:", err);
                this.isConnected = false;
            });
            this.client.on("connect", () => {
                console.log("Redis Client Connected");
                this.isConnected = true;
            });
            this.client.on("disconnect", () => {
                console.log("Redis Client Disconnected");
                this.isConnected = false;
            });
            await this.client.connect();
        }
        catch (error) {
            console.error("Failed to connect to Redis:", error);
            throw error;
        }
    }
    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
            this.isConnected = false;
        }
    }
    getClient() {
        if (!this.client || !this.isConnected) {
            throw new Error("Redis client is not connected");
        }
        return this.client;
    }
    isRedisConnected() {
        return this.isConnected;
    }
    // Notification-specific methods
    async storeNotification(userId, notification) {
        if (!this.isConnected)
            return;
        const key = `notifications:${userId}`;
        const notificationData = {
            ...notification,
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false,
        };
        await this.client.lPush(key, JSON.stringify(notificationData));
        // Keep only last 100 notifications per user
        await this.client.lTrim(key, 0, 99);
        // Set expiry for 30 days
        await this.client.expire(key, 30 * 24 * 60 * 60);
    }
    async getNotifications(userId, limit = 20) {
        if (!this.isConnected)
            return [];
        const key = `notifications:${userId}`;
        const notifications = await this.client.lRange(key, 0, limit - 1);
        return notifications.map((n) => JSON.parse(n));
    }
    async markNotificationAsRead(userId, notificationId) {
        if (!this.isConnected)
            return;
        const key = `notifications:${userId}`;
        const notifications = await this.client.lRange(key, 0, -1);
        for (let i = 0; i < notifications.length; i++) {
            const notification = JSON.parse(notifications[i]);
            if (notification.id === notificationId) {
                notification.read = true;
                await this.client.lSet(key, i, JSON.stringify(notification));
                break;
            }
        }
    }
    async getUnreadCount(userId) {
        if (!this.isConnected)
            return 0;
        const notifications = await this.getNotifications(userId, 100);
        return notifications.filter((n) => !n.read).length;
    }
}
exports.redisService = new RedisService();
//# sourceMappingURL=redis.js.map