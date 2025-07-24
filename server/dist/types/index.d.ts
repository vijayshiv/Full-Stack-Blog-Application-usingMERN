export interface User {
    id: number;
    fullname: string;
    email: string;
    password?: string;
    createdTimestamp: Date;
    isDeleted?: boolean;
    resetToken?: string;
    resetTokenExpiration?: Date;
}
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
            file?: Express.Multer.File;
        }
    }
}
export interface Post {
    post_id: number;
    title: string;
    content: string;
    category: string;
    image?: string;
    user_id: number;
    createdTimestamp: Date;
    author?: string;
}
export interface Comment {
    comment_id: number;
    content: string;
    post_id: number;
    user_id: number;
    createdTimestamp: Date;
    fullname?: string;
    id?: number;
    parent_comment_id?: number;
    reply_count?: number;
}
export interface CommentThread extends Comment {
    replies?: CommentThread[];
    depth_level?: number;
}
export interface CommentWithUser extends Comment {
    fullname: string;
}
export interface CommentThreadWithUser extends CommentWithUser {
    replies?: CommentThreadWithUser[];
    depth_level?: number;
}
export interface PostLike {
    like_id: number;
    post_id: number;
    user_id: number;
    createdTimestamp: Date;
}
export interface UserRegistrationRequest {
    fullname: string;
    email: string;
    password: string;
}
export interface UserLoginRequest {
    email: string;
    password: string;
}
export interface PostCreationRequest {
    title: string;
    content: string;
    category: string;
    image?: string;
}
export interface PostUpdateRequest {
    title: string;
    content: string;
    category: string;
    img?: string;
}
export interface CommentRequest {
    content: string;
    parentCommentId?: number;
}
export interface NotificationData {
    id: number;
    user_id: number;
    type: string;
    message: string;
    related_post_id?: number;
    related_comment_id?: number;
    read: boolean;
    createdAt: string;
    postTitle?: string;
}
export interface EmailCheckRequest {
    email: string;
}
export interface PasswordResetRequest {
    email: string;
    token: string;
    newPassword: string;
}
export interface UserUpdateRequest {
    fullname?: string;
    email?: string;
}
export interface ApiResponse<T = any> {
    status: "success" | "error";
    data?: T;
    error?: string;
}
export interface LoginResponse {
    token: string;
    id: number;
    name: string;
}
export interface PostWithAuthor extends Post {
    author: string;
}
export interface CommentWithUser extends Comment {
    fullname: string;
}
export interface PostSearchQuery {
    q?: string;
    category?: string;
    page?: number;
    limit?: number;
}
export interface JWTPayload {
    id: number;
    email: string;
    fullname: string;
    iat?: number;
    exp?: number;
}
export interface DatabaseResult {
    insertId?: number;
    affectedRows: number;
    changedRows?: number;
}
export interface ValidationError {
    field: string;
    message: string;
}
export interface DatabaseError extends Error {
    code?: string;
    errno?: number;
    sqlState?: string;
}
export interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    connectionLimit: number;
    queueLimit: number;
    waitForConnections: boolean;
}
export interface AuthConfig {
    secretKey: string;
    tokenExpiry: string;
}
export interface EmailConfig {
    user: string;
    password: string;
    service: string;
}
export interface ServerConfig {
    port: number;
    host: string;
    nodeEnv: string;
}
export interface RedisConfig {
    url: string;
    host: string;
    port: number;
    password?: string;
}
export interface AppConfig {
    database: DatabaseConfig;
    auth: AuthConfig;
    email: EmailConfig;
    server: ServerConfig;
    redis: RedisConfig;
    dbHost: string;
    dbUser: string;
    dbPassword: string;
    dbName: string;
    secretKey: string;
    emailUser: string;
    emailPass: string;
}
export interface RateLimitOptions {
    maxRequests: number;
    windowMs: number;
    message: string;
    identifier: "ip" | "user";
    skipSuccessfulRequests: boolean;
}
export interface RequestLogData {
    timestamp: string;
    method: string;
    url: string;
    ip: string;
    userAgent: string;
    contentType: string;
    contentLength: string | number;
    userId: number | null;
    type: "request" | "response" | "error" | "auth" | "security";
    statusCode?: number;
    responseTime?: string;
    success?: boolean;
    error?: {
        message: string;
        stack: string;
        name: string;
    };
}
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload;
        }
    }
}
export {};
//# sourceMappingURL=index.d.ts.map