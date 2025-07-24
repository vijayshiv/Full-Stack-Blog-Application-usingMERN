"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepo = exports.PostRepo = exports.UserRepo = exports.CommentRepository = exports.PostRepository = exports.UserRepository = void 0;
var userRepository_1 = require("./userRepository");
Object.defineProperty(exports, "UserRepository", { enumerable: true, get: function () { return userRepository_1.UserRepository; } });
var postRepository_1 = require("./postRepository");
Object.defineProperty(exports, "PostRepository", { enumerable: true, get: function () { return postRepository_1.PostRepository; } });
var commentRepository_1 = require("./commentRepository");
Object.defineProperty(exports, "CommentRepository", { enumerable: true, get: function () { return commentRepository_1.CommentRepository; } });
// Re-export default exports as well
var userRepository_2 = require("./userRepository");
Object.defineProperty(exports, "UserRepo", { enumerable: true, get: function () { return __importDefault(userRepository_2).default; } });
var postRepository_2 = require("./postRepository");
Object.defineProperty(exports, "PostRepo", { enumerable: true, get: function () { return __importDefault(postRepository_2).default; } });
var commentRepository_2 = require("./commentRepository");
Object.defineProperty(exports, "CommentRepo", { enumerable: true, get: function () { return __importDefault(commentRepository_2).default; } });
//# sourceMappingURL=index.js.map