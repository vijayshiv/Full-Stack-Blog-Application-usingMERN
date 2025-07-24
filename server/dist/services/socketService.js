"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketService = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config"));
const redis_1 = require("../config/redis");
class SocketService {
    constructor() {
        this.io = null;
        this.userSockets = new Map();
    }
    initialize(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.CLIENT_URL || "http://localhost:5173",
                methods: ["GET", "POST"],
                credentials: true,
            },
            transports: ["websocket", "polling"],
        });
        this.io.use(this.authenticateSocket.bind(this));
        this.io.on("connection", this.handleConnection.bind(this));
        console.log("Socket.io server initialized");
    }
    async authenticateSocket(socket, next) {
        try {
            const token = socket.handshake.auth.token ||
                socket.handshake.headers.authorization?.replace("Bearer ", "");
            if (!token) {
                return next(new Error("Authentication token required"));
            }
            const decoded = jsonwebtoken_1.default.verify(token, config_1.default.auth.secretKey);
            socket.userId = decoded.id;
            socket.userInfo = decoded;
            console.log(`User ${decoded.fullname} (ID: ${decoded.id}) connected via Socket.io`);
            next();
        }
        catch (error) {
            console.error("Socket authentication error:", error);
            next(new Error("Invalid authentication token"));
        }
    }
    handleConnection(socket) {
        if (!socket.userId)
            return;
        // Store user socket mapping
        this.addUserSocket(socket.userId, socket.id);
        // Join user to their notification room
        socket.join(`user_${socket.userId}`);
        console.log(`User ${socket.userId} connected with socket ${socket.id}`);
        // Handle comment events
        socket.on("join_post", (postId) => {
            socket.join(`post_${postId}`);
            console.log(`User ${socket.userId} joined post ${postId} room`);
        });
        socket.on("leave_post", (postId) => {
            socket.leave(`post_${postId}`);
            console.log(`User ${socket.userId} left post ${postId} room`);
        });
        // Handle meeting requests
        socket.on("meeting_request", (data) => {
            this.handleMeetingRequest(socket, data);
        });
        socket.on("meeting_response", (data) => {
            this.handleMeetingResponse(socket, data);
        });
        // Handle disconnect
        socket.on("disconnect", () => {
            this.removeUserSocket(socket.userId, socket.id);
            console.log(`User ${socket.userId} disconnected from socket ${socket.id}`);
        });
    }
    addUserSocket(userId, socketId) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, []);
        }
        this.userSockets.get(userId).push(socketId);
    }
    removeUserSocket(userId, socketId) {
        if (this.userSockets.has(userId)) {
            const sockets = this.userSockets
                .get(userId)
                .filter((id) => id !== socketId);
            if (sockets.length === 0) {
                this.userSockets.delete(userId);
            }
            else {
                this.userSockets.set(userId, sockets);
            }
        }
    }
    async handleMeetingRequest(socket, data) {
        const requestId = `meeting_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        const meetingRequest = {
            requestId,
            fromUserId: socket.userId,
            fromUserName: socket.userInfo.fullname,
            toUserId: data.targetUserId,
            postId: data.postId,
            commentId: data.commentId,
            timestamp: new Date().toISOString(),
            status: "pending",
        };
        // Store in Redis temporarily
        await redis_1.redisService
            .getClient()
            .setEx(`meeting_request:${requestId}`, 300, JSON.stringify(meetingRequest)); // 5 minutes expiry
        // Send to target user
        this.io.to(`user_${data.targetUserId}`).emit("meeting_request_received", meetingRequest);
        // Confirm to sender
        socket.emit("meeting_request_sent", { requestId, status: "sent" });
    }
    async handleMeetingResponse(socket, data) {
        try {
            const requestData = await redis_1.redisService
                .getClient()
                .get(`meeting_request:${data.requestId}`);
            if (!requestData) {
                socket.emit("meeting_error", {
                    message: "Meeting request expired or not found",
                });
                return;
            }
            const meetingRequest = JSON.parse(requestData);
            if (data.accepted) {
                // Create meeting room
                const roomId = `meeting_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}`;
                // Store meeting room info
                const meetingRoom = {
                    roomId,
                    participants: [meetingRequest.fromUserId, socket.userId],
                    createdAt: new Date().toISOString(),
                    postId: meetingRequest.postId,
                    commentId: meetingRequest.commentId,
                };
                await redis_1.redisService
                    .getClient()
                    .setEx(`meeting_room:${roomId}`, 3600, JSON.stringify(meetingRoom)); // 1 hour expiry
                // Notify both users
                this.io.to(`user_${meetingRequest.fromUserId}`).emit("meeting_accepted", { roomId, meetingRoom });
                this.io.to(`user_${socket.userId}`).emit("meeting_started", {
                    roomId,
                    meetingRoom,
                });
            }
            else {
                // Notify requester of rejection
                this.io.to(`user_${meetingRequest.fromUserId}`).emit("meeting_rejected", {
                    requestId: data.requestId,
                    rejectedBy: socket.userInfo.fullname,
                });
            }
            // Clean up request
            await redis_1.redisService.getClient().del(`meeting_request:${data.requestId}`);
        }
        catch (error) {
            console.error("Error handling meeting response:", error);
            socket.emit("meeting_error", {
                message: "Failed to process meeting response",
            });
        }
    }
    // Notification methods
    async sendNotification(userId, notification) {
        if (!this.io)
            return;
        // Store in Redis
        await redis_1.redisService.storeNotification(userId, notification);
        // Send real-time notification if user is online
        this.io.to(`user_${userId}`).emit("notification", notification);
    }
    // Comment-related methods
    emitNewComment(postId, comment) {
        if (!this.io)
            return;
        this.io.to(`post_${postId}`).emit("new_comment", comment);
    }
    emitCommentReply(postId, reply) {
        if (!this.io)
            return;
        this.io.to(`post_${postId}`).emit("new_reply", reply);
    }
    emitCommentUpdate(postId, comment) {
        if (!this.io)
            return;
        this.io.to(`post_${postId}`).emit("comment_updated", comment);
    }
    emitCommentDelete(postId, commentId) {
        if (!this.io)
            return;
        this.io.to(`post_${postId}`).emit("comment_deleted", { commentId });
    }
    getConnectedUsers() {
        return Array.from(this.userSockets.keys());
    }
    isUserOnline(userId) {
        return this.userSockets.has(userId);
    }
    /**
     * Send notification to a specific user
     */
    sendNotificationToUser(userId, notification) {
        if (!this.io)
            return;
        this.io.to(`user_${userId}`).emit("newNotification", notification);
        console.log(`Notification sent to user ${userId}:`, notification.message);
    }
    /**
     * Send notification to multiple users
     */
    sendNotificationToUsers(userIds, notification) {
        if (!this.io)
            return;
        userIds.forEach((userId) => {
            this.io.to(`user_${userId}`).emit("newNotification", notification);
        });
        console.log(`Notification sent to users ${userIds.join(", ")}:`, notification.message);
    }
    /**
     * Emit notification read event
     */
    emitNotificationRead(userId, notificationId) {
        if (!this.io)
            return;
        this.io.to(`user_${userId}`).emit("notificationRead", notificationId);
    }
    /**
     * Get online users count
     */
    getOnlineUsersCount() {
        return this.userSockets.size;
    }
}
exports.socketService = new SocketService();
//# sourceMappingURL=socketService.js.map