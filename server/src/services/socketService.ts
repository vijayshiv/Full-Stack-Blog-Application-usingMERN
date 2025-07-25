import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { JWTPayload } from "../types";
import jwt from "jsonwebtoken";
import config from "../config";
import { redisService } from "../config/redis";

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userInfo?: JWTPayload;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<number, string[]> = new Map();

  initialize(httpServer: HttpServer): void {
    this.io = new SocketIOServer(httpServer, {
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

  private async authenticateSocket(
    socket: AuthenticatedSocket,
    next: Function
  ): Promise<void> {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, config.auth.secretKey) as JWTPayload;
      socket.userId = decoded.id;
      socket.userInfo = decoded;

      console.log(
        `User ${decoded.fullname} (ID: ${decoded.id}) connected via Socket.io`
      );
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Invalid authentication token"));
    }
  }

  private handleConnection(socket: AuthenticatedSocket): void {
    if (!socket.userId) return;

    // Store user socket mapping
    this.addUserSocket(socket.userId, socket.id);

    // Join user to their notification room
    socket.join(`user_${socket.userId}`);

    console.log(`User ${socket.userId} connected with socket ${socket.id}`);

    // Handle test message (for debugging)
    socket.on("test_message", (data) => {
      console.log(`📧 Test message from user ${socket.userId}:`, data);
      socket.emit("test_response", {
        message: "Server received your test!",
        userId: socket.userId,
      });
    });

    // Handle comment events
    socket.on("join_post", (postId: number) => {
      socket.join(`post_${postId}`);
      console.log(`User ${socket.userId} joined post ${postId} room`);
    });

    socket.on("leave_post", (postId: number) => {
      socket.leave(`post_${postId}`);
      console.log(`User ${socket.userId} left post ${postId} room`);
    });

    // Handle meeting requests
    socket.on(
      "meeting_request",
      (data: { targetUserId: number; postId: number; commentId: number }) => {
        this.handleMeetingRequest(socket, data);
      }
    );

    socket.on(
      "meeting_response",
      (data: {
        requestId: string;
        accepted: boolean;
        targetUserId: number;
      }) => {
        this.handleMeetingResponse(socket, data);
      }
    );

    // WebRTC signaling events
    socket.on("joinMeeting", (meetingId: string) => {
      this.joinMeetingRoom(socket, meetingId);
    });

    socket.on("leaveMeeting", (meetingId: string) => {
      this.leaveMeetingRoom(socket, meetingId);
    });

    socket.on(
      "webrtcOffer",
      (data: { meetingId: string; targetUserId: number; offer: any }) => {
        this.sendWebRTCOffer(
          socket,
          data.meetingId,
          data.targetUserId,
          data.offer
        );
      }
    );

    socket.on(
      "webrtcAnswer",
      (data: { meetingId: string; targetUserId: number; answer: any }) => {
        this.sendWebRTCAnswer(
          socket,
          data.meetingId,
          data.targetUserId,
          data.answer
        );
      }
    );

    socket.on(
      "iceCandidate",
      (data: { meetingId: string; targetUserId: number; candidate: any }) => {
        this.sendICECandidate(
          socket,
          data.meetingId,
          data.targetUserId,
          data.candidate
        );
      }
    );

    socket.on(
      "meetingMessage",
      (data: { meetingId: string; message: string; type: string }) => {
        this.broadcastToMeetingRoom(socket, data.meetingId, "meetingMessage", {
          message: data.message,
          type: data.type,
          timestamp: new Date().toISOString(),
        });
      }
    );

    // Handle disconnect
    socket.on("disconnect", () => {
      this.removeUserSocket(socket.userId!, socket.id);
      console.log(
        `User ${socket.userId} disconnected from socket ${socket.id}`
      );
    });
  }

  private addUserSocket(userId: number, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, []);
    }
    this.userSockets.get(userId)!.push(socketId);
  }

  private removeUserSocket(userId: number, socketId: string): void {
    if (this.userSockets.has(userId)) {
      const sockets = this.userSockets
        .get(userId)!
        .filter((id) => id !== socketId);
      if (sockets.length === 0) {
        this.userSockets.delete(userId);
      } else {
        this.userSockets.set(userId, sockets);
      }
    }
  }

  private async handleMeetingRequest(
    socket: AuthenticatedSocket,
    data: { targetUserId: number; postId: number; commentId: number }
  ): Promise<void> {
    const requestId = `meeting_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const meetingRequest = {
      requestId,
      fromUserId: socket.userId!,
      fromUserName: socket.userInfo!.fullname,
      toUserId: data.targetUserId,
      postId: data.postId,
      commentId: data.commentId,
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    // Store in Redis temporarily
    await redisService
      .getClient()
      .setEx(
        `meeting_request:${requestId}`,
        300,
        JSON.stringify(meetingRequest)
      ); // 5 minutes expiry

    // Send to target user
    this.io!.to(`user_${data.targetUserId}`).emit(
      "meeting_request_received",
      meetingRequest
    );

    // Confirm to sender
    socket.emit("meeting_request_sent", { requestId, status: "sent" });
  }

  private async handleMeetingResponse(
    socket: AuthenticatedSocket,
    data: { requestId: string; accepted: boolean; targetUserId: number }
  ): Promise<void> {
    try {
      const requestData = await redisService
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
          participants: [meetingRequest.fromUserId, socket.userId!],
          createdAt: new Date().toISOString(),
          postId: meetingRequest.postId,
          commentId: meetingRequest.commentId,
        };

        await redisService
          .getClient()
          .setEx(`meeting_room:${roomId}`, 3600, JSON.stringify(meetingRoom)); // 1 hour expiry

        // Notify both users
        this.io!.to(`user_${meetingRequest.fromUserId}`).emit(
          "meeting_accepted",
          { roomId, meetingRoom }
        );
        this.io!.to(`user_${socket.userId!}`).emit("meeting_started", {
          roomId,
          meetingRoom,
        });
      } else {
        // Notify requester of rejection
        this.io!.to(`user_${meetingRequest.fromUserId}`).emit(
          "meeting_rejected",
          {
            requestId: data.requestId,
            rejectedBy: socket.userInfo!.fullname,
          }
        );
      }

      // Clean up request
      await redisService.getClient().del(`meeting_request:${data.requestId}`);
    } catch (error) {
      console.error("Error handling meeting response:", error);
      socket.emit("meeting_error", {
        message: "Failed to process meeting response",
      });
    }
  }

  // Notification methods
  async sendNotification(userId: number, notification: any): Promise<void> {
    if (!this.io) return;

    // Store in Redis
    await redisService.storeNotification(userId, notification);

    // Send real-time notification if user is online
    this.io.to(`user_${userId}`).emit("notification", notification);
  }

  // Comment-related methods
  emitNewComment(postId: number, comment: any): void {
    if (!this.io) return;
    this.io.to(`post_${postId}`).emit("new_comment", comment);
  }

  emitCommentReply(postId: number, reply: any): void {
    if (!this.io) return;
    this.io.to(`post_${postId}`).emit("new_reply", reply);
  }

  emitCommentUpdate(postId: number, comment: any): void {
    if (!this.io) return;
    this.io.to(`post_${postId}`).emit("comment_updated", comment);
  }

  emitCommentDelete(postId: number, commentId: number): void {
    if (!this.io) return;
    this.io.to(`post_${postId}`).emit("comment_deleted", { commentId });
  }

  getConnectedUsers(): number[] {
    return Array.from(this.userSockets.keys());
  }

  isUserOnline(userId: number): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Send notification to a specific user
   */
  sendNotificationToUser(userId: number, notification: any): void {
    if (!this.io) return;

    this.io.to(`user_${userId}`).emit("newNotification", notification);
    console.log(`Notification sent to user ${userId}:`, notification.message);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: number[], notification: any): void {
    if (!this.io) return;

    userIds.forEach((userId) => {
      this.io!.to(`user_${userId}`).emit("newNotification", notification);
    });
    console.log(
      `Notification sent to users ${userIds.join(", ")}:`,
      notification.message
    );
  }

  /**
   * Emit notification read event
   */
  emitNotificationRead(userId: number, notificationId: number): void {
    if (!this.io) return;

    this.io.to(`user_${userId}`).emit("notificationRead", notificationId);
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Join a meeting room
   */
  joinMeetingRoom(socket: AuthenticatedSocket, meetingId: string): void {
    socket.join(`meeting_${meetingId}`);
    console.log(`User ${socket.userId} joined meeting room: ${meetingId}`);

    // Notify others in the room
    socket.to(`meeting_${meetingId}`).emit("userJoined", {
      userId: socket.userId,
      userInfo: socket.userInfo,
    });
  }

  /**
   * Leave a meeting room
   */
  leaveMeetingRoom(socket: AuthenticatedSocket, meetingId: string): void {
    socket.leave(`meeting_${meetingId}`);
    console.log(`User ${socket.userId} left meeting room: ${meetingId}`);

    // Notify others in the room
    socket.to(`meeting_${meetingId}`).emit("userLeft", {
      userId: socket.userId,
    });
  }

  /**
   * Send WebRTC offer to specific user in meeting room
   */
  sendWebRTCOffer(
    socket: AuthenticatedSocket,
    meetingId: string,
    targetUserId: number,
    offer: any
  ): void {
    const targetSockets = this.userSockets.get(targetUserId);
    if (targetSockets && targetSockets.length > 0) {
      targetSockets.forEach((socketId) => {
        this.io!.to(socketId).emit("webrtcOffer", {
          from: socket.userId,
          meetingId,
          offer,
        });
      });
      console.log(
        `WebRTC offer sent from ${socket.userId} to ${targetUserId} in meeting ${meetingId}`
      );
    }
  }

  /**
   * Send WebRTC answer to specific user in meeting room
   */
  sendWebRTCAnswer(
    socket: AuthenticatedSocket,
    meetingId: string,
    targetUserId: number,
    answer: any
  ): void {
    const targetSockets = this.userSockets.get(targetUserId);
    if (targetSockets && targetSockets.length > 0) {
      targetSockets.forEach((socketId) => {
        this.io!.to(socketId).emit("webrtcAnswer", {
          from: socket.userId,
          meetingId,
          answer,
        });
      });
      console.log(
        `WebRTC answer sent from ${socket.userId} to ${targetUserId} in meeting ${meetingId}`
      );
    }
  }

  /**
   * Send ICE candidate to specific user in meeting room
   */
  sendICECandidate(
    socket: AuthenticatedSocket,
    meetingId: string,
    targetUserId: number,
    candidate: any
  ): void {
    const targetSockets = this.userSockets.get(targetUserId);
    if (targetSockets && targetSockets.length > 0) {
      targetSockets.forEach((socketId) => {
        this.io!.to(socketId).emit("iceCandidate", {
          from: socket.userId,
          meetingId,
          candidate,
        });
      });
      console.log(
        `ICE candidate sent from ${socket.userId} to ${targetUserId} in meeting ${meetingId}`
      );
    }
  }

  /**
   * Broadcast to meeting room (except sender)
   */
  broadcastToMeetingRoom(
    socket: AuthenticatedSocket,
    meetingId: string,
    event: string,
    data: any
  ): void {
    socket.to(`meeting_${meetingId}`).emit(event, {
      from: socket.userId,
      ...data,
    });
  }
}

export const socketService = new SocketService();
