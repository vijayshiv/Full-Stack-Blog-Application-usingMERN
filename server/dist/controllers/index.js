"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentControllerDefault = exports.PostControllerDefault = exports.UserControllerDefault = exports.CommentController = exports.PostController = exports.UserController = void 0;
var userController_1 = require("./userController");
Object.defineProperty(exports, "UserController", { enumerable: true, get: function () { return userController_1.UserController; } });
var postController_1 = require("./postController");
Object.defineProperty(exports, "PostController", { enumerable: true, get: function () { return postController_1.PostController; } });
var commentController_1 = require("./commentController");
Object.defineProperty(exports, "CommentController", { enumerable: true, get: function () { return commentController_1.CommentController; } });
// Re-export default exports as well
var userController_2 = require("./userController");
Object.defineProperty(exports, "UserControllerDefault", { enumerable: true, get: function () { return __importDefault(userController_2).default; } });
var postController_2 = require("./postController");
Object.defineProperty(exports, "PostControllerDefault", { enumerable: true, get: function () { return __importDefault(postController_2).default; } });
var commentController_2 = require("./commentController");
Object.defineProperty(exports, "CommentControllerDefault", { enumerable: true, get: function () { return __importDefault(commentController_2).default; } });
//# sourceMappingURL=index.js.map