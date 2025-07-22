const express = require("express");
const { PostController, CommentController } = require("../controllers");
const { ValidationMiddleware, ErrorHandler, RateLimiter } = require("../middleware");
const multer = require("multer");
const upload = multer({ dest: "images/" });

const router = express.Router();
const rateLimiter = new RateLimiter();

/**
 * @swagger
 * tags:
 *   - name: Posts
 *     description: Blog post management
 *   - name: Comments
 *     description: Comment management for posts
 */

/**
 * @swagger
 * /posts/all:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: List of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 */
router.get("/all", 
  ErrorHandler.asyncErrorHandler(PostController.getAllPosts)
);

/**
 * @swagger
 * /posts/add-post:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: "My Amazing Blog Post"
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 example: "<p>This is the content of my blog post...</p>"
 *               category:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Technology"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: "Post image file"
 *     responses:
 *       200:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post("/add-post", 
  rateLimiter.postCreationRateLimit(),
  upload.single("image"), 
  ValidationMiddleware.validatePostCreation,
  ErrorHandler.asyncErrorHandler(PostController.createPost)
);

/**
 * @swagger
 * /posts/post/{id}:
 *   get:
 *     summary: Get a specific post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Post ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/post/:id", 
  ValidationMiddleware.validateId('id'),
  ErrorHandler.asyncErrorHandler(PostController.getPostById)
);

/**
 * @swagger
 * /posts/by-category/{category}:
 *   get:
 *     summary: Get posts by category
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           maxLength: 50
 *         description: Post category
 *         example: "Technology"
 *     responses:
 *       200:
 *         description: Posts in the specified category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get("/by-category/:category", 
  ValidationMiddleware.validateCategory,
  ErrorHandler.asyncErrorHandler(PostController.getPostsByCategory)
);

/**
 * @swagger
 * /posts/my-all-post:
 *   get:
 *     summary: Get current user's posts
 *     tags: [Posts]
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: User's posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *       401:
 *         $ref: '#/components/responses/AuthError'
 */
router.get("/my-all-post", 
  ErrorHandler.asyncErrorHandler(PostController.getUserPosts)
);

/**
 * @swagger
 * /posts/update-post/{postId}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Post ID to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *                 example: "Updated Blog Post Title"
 *               content:
 *                 type: string
 *                 minLength: 10
 *                 example: "<p>Updated content...</p>"
 *               category:
 *                 type: string
 *                 maxLength: 50
 *                 example: "Technology"
 *               img:
 *                 type: string
 *                 format: binary
 *                 description: "New post image file"
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put("/update-post/:postId", 
  ValidationMiddleware.validateId('postId'),
  upload.single("img"), 
  ValidationMiddleware.validatePostCreation,
  ErrorHandler.asyncErrorHandler(PostController.updatePost)
);

/**
 * @swagger
 * /posts/delete-post/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Post ID to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/delete-post/:postId", 
  ValidationMiddleware.validateId('postId'),
  ErrorHandler.asyncErrorHandler(PostController.deletePost)
);

/**
 * @swagger
 * /posts/search:
 *   get:
 *     summary: Search posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *         example: "javascript"
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *         example: "Technology"
 *     responses:
 *       200:
 *         description: Search results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 */
router.get("/search", 
  ErrorHandler.asyncErrorHandler(PostController.searchPosts)
);

/**
 * @swagger
 * /posts/likes/{postId}:
 *   get:
 *     summary: Get post likes count
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Post ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Post likes information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     likes:
 *                       type: integer
 *                       example: 15
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get("/likes/:postId", 
  ValidationMiddleware.validateId('postId'),
  ErrorHandler.asyncErrorHandler(PostController.getPostLikes)
);

/**
 * @swagger
 * /posts/is-liked/{postId}:
 *   get:
 *     summary: Check if user liked a post
 *     tags: [Posts]
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Post ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Like status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                       example: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthError'
 */
router.get("/is-liked/:postId", 
  ValidationMiddleware.validateId('postId'),
  ErrorHandler.asyncErrorHandler(PostController.checkUserLiked)
);

/**
 * @swagger
 * /posts/like/{postId}:
 *   post:
 *     summary: Toggle like/unlike a post
 *     tags: [Posts]
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Post ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     liked:
 *                       type: boolean
 *                       example: true
 *                     message:
 *                       type: string
 *                       example: "Post liked successfully"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post("/like/:postId", 
  rateLimiter.likeRateLimit(),
  ValidationMiddleware.validateId('postId'),
  ErrorHandler.asyncErrorHandler(PostController.toggleLike)
);

/**
 * @swagger
 * /posts/comments/{postId}:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Post ID
 *         example: 1
 *     responses:
 *       200:
 *         description: List of comments for the post
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get("/comments/:postId", 
  ValidationMiddleware.validateId('postId'),
  ErrorHandler.asyncErrorHandler(CommentController.getComments)
);

/**
 * @swagger
 * /posts/comment/{postId}:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Post ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 1000
 *                 example: "Great post! Thanks for sharing this information."
 *     responses:
 *       200:
 *         description: Comment added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/AuthError'
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */
router.post("/comment/:postId", 
  rateLimiter.commentRateLimit(),
  ValidationMiddleware.validateId('postId'),
  ValidationMiddleware.validateComment,
  ErrorHandler.asyncErrorHandler(CommentController.addComment)
);
router.put("/comment/:commentId", CommentController.updateComment);
router.delete("/comment/:commentId", CommentController.deleteComment);

module.exports = router;
