import { RedisClientType } from "redis";
declare class RedisService {
    private client;
    private isConnected;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getClient(): RedisClientType;
    isRedisConnected(): boolean;
    storeNotification(userId: number, notification: any): Promise<void>;
    getNotifications(userId: number, limit?: number): Promise<any[]>;
    markNotificationAsRead(userId: number, notificationId: string): Promise<void>;
    getUnreadCount(userId: number): Promise<number>;
}
export declare const redisService: RedisService;
export {};
//# sourceMappingURL=redis.d.ts.map