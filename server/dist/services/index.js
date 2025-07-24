"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationServiceDefault = exports.CommentServiceDefault = exports.PostServiceDefault = exports.UserServiceDefault = exports.NotificationService = exports.CommentService = exports.PostService = exports.UserService = void 0;
var userService_1 = require("./userService");
Object.defineProperty(exports, "UserService", { enumerable: true, get: function () { return userService_1.UserService; } });
var postService_1 = require("./postService");
Object.defineProperty(exports, "PostService", { enumerable: true, get: function () { return postService_1.PostService; } });
var commentService_1 = require("./commentService");
Object.defineProperty(exports, "CommentService", { enumerable: true, get: function () { return commentService_1.CommentService; } });
var notificationService_1 = require("./notificationService");
Object.defineProperty(exports, "NotificationService", { enumerable: true, get: function () { return notificationService_1.NotificationService; } });
// Re-export default exports as well
var userService_2 = require("./userService");
Object.defineProperty(exports, "UserServiceDefault", { enumerable: true, get: function () { return __importDefault(userService_2).default; } });
var postService_2 = require("./postService");
Object.defineProperty(exports, "PostServiceDefault", { enumerable: true, get: function () { return __importDefault(postService_2).default; } });
var commentService_2 = require("./commentService");
Object.defineProperty(exports, "CommentServiceDefault", { enumerable: true, get: function () { return __importDefault(commentService_2).default; } });
var notificationService_2 = require("./notificationService");
Object.defineProperty(exports, "NotificationServiceDefault", { enumerable: true, get: function () { return __importDefault(notificationService_2).default; } });
//# sourceMappingURL=index.js.map