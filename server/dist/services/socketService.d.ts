import { Server as HttpServer } from "http";
declare class SocketService {
    private io;
    private userSockets;
    initialize(httpServer: HttpServer): void;
    private authenticateSocket;
    private handleConnection;
    private addUserSocket;
    private removeUserSocket;
    private handleMeetingRequest;
    private handleMeetingResponse;
    sendNotification(userId: number, notification: any): Promise<void>;
    emitNewComment(postId: number, comment: any): void;
    emitCommentReply(postId: number, reply: any): void;
    emitCommentUpdate(postId: number, comment: any): void;
    emitCommentDelete(postId: number, commentId: number): void;
    getConnectedUsers(): number[];
    isUserOnline(userId: number): boolean;
    /**
     * Send notification to a specific user
     */
    sendNotificationToUser(userId: number, notification: any): void;
    /**
     * Send notification to multiple users
     */
    sendNotificationToUsers(userIds: number[], notification: any): void;
    /**
     * Emit notification read event
     */
    emitNotificationRead(userId: number, notificationId: number): void;
    /**
     * Get online users count
     */
    getOnlineUsersCount(): number;
}
export declare const socketService: SocketService;
export {};
//# sourceMappingURL=socketService.d.ts.map