// Database entity interfaces
export interface User {
  id: number;
  fullname: string;
  email: string;
  password?: string; // Optional for responses (security)
  createdTimestamp: Date;
  isDeleted?: boolean; // For soft delete functionality
  resetToken?: string; // For password reset functionality
  resetTokenExpiration?: Date; // For password reset functionality
}

// Express Request Extensions
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
  author?: string; // From JOIN with users table
}

export interface Comment {
  comment_id: number;
  content: string;
  post_id: number;
  user_id: number;
  createdTimestamp: Date;
  fullname?: string; // From JOIN with users table
  id?: number; // User ID alias from JOIN
  parent_comment_id?: number; // For threading
  reply_count?: number; // Number of replies
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

// Request DTOs (Data Transfer Objects)
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
  image?: string; // File upload
}

export interface PostUpdateRequest {
  title: string;
  content: string;
  category: string;
  img?: string; // File upload
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

// Response DTOs
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

// Query parameters
export interface PostSearchQuery {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}

// JWT Payload
export interface JWTPayload {
  id: number;
  email: string;
  fullname: string;
  iat?: number;
  exp?: number;
}

// Database result interfaces
export interface DatabaseResult {
  insertId?: number;
  affectedRows: number;
  changedRows?: number;
}

// Error types
export interface ValidationError {
  field: string;
  message: string;
}

export interface DatabaseError extends Error {
  code?: string;
  errno?: number;
  sqlState?: string;
}

// Configuration interfaces
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
  // Legacy properties for backward compatibility
  dbHost: string;
  dbUser: string;
  dbPassword: string;
  dbName: string;
  secretKey: string;
  emailUser: string;
  emailPass: string;
}

// Middleware types
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

// Express Request extension
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export {};
