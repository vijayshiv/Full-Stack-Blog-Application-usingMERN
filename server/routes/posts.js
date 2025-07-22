const express = require("express");
const { PostController, CommentController } = require("../controllers");
const multer = require("multer");
const upload = multer({ dest: "images/" });

const router = express.Router();

// Post routes
router.get("/all", PostController.getAllPosts);
router.post("/add-post", upload.single("image"), PostController.createPost);
router.get("/post/:id", PostController.getPostById);
router.get("/by-category/:category", PostController.getPostsByCategory);
router.get("/my-all-post", PostController.getUserPosts);
router.put("/update-post/:postId", upload.single("img"), PostController.updatePost);
router.delete("/delete-post/:postId", PostController.deletePost);
router.get("/search", PostController.searchPosts);

// Post interaction routes
router.get("/likes/:postId", PostController.getPostLikes);
router.get("/is-liked/:postId", PostController.checkUserLiked);
router.post("/like/:postId", PostController.toggleLike);

// Comment routes
router.get("/comments/:postId", CommentController.getComments);
router.post("/comment/:postId", CommentController.addComment);
router.put("/comment/:commentId", CommentController.updateComment);
router.delete("/comment/:commentId", CommentController.deleteComment);

module.exports = router;
