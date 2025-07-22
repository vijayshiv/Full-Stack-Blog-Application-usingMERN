const { PostService } = require("../services");
const util = require("../utils");

class PostController {

  // Get all posts
  static async getAllPosts(req, res) {
    try {
      const posts = await PostService.getAllPosts();
      res.send(util.successMessage(posts));
    } catch (error) {
      res.send(util.errorMessage(error.message));
    }
  }

  // Create a new post
  static async createPost(req, res) {
    try {
      const userId = req.user.id;
      const { title, content, category } = req.body;
      const img = req.file ? req.file.filename : null;
      
      const message = await PostService.createPost(title, content, img, category, userId);
      res.send(util.successMessage(message));
    } catch (error) {
      console.log(error);
      res.send(util.errorMessage("Error occurred while processing the request"));
    }
  }

  // Get a single post with user name
  static async getPostById(req, res) {
    try {
      const { id } = req.params;
      const posts = await PostService.getPostById(id);
      res.send(util.successMessage(posts));
    } catch (error) {
      res.send(util.errorMessage(error.message));
    }
  }

  // Get posts by category
  static async getPostsByCategory(req, res) {
    try {
      const { category } = req.params;
      const posts = await PostService.getPostsByCategory(category);
      res.send(util.successMessage(posts));
    } catch (error) {
      res.send(util.errorMessage(error.message));
    }
  }

  // Get user's posts
  static async getUserPosts(req, res) {
    try {
      const userId = req.user.id;
      const posts = await PostService.getUserPosts(userId);
      res.send(util.successMessage(posts));
    } catch (error) {
      res.send(util.errorMessage(error.message));
    }
  }

  // Update a post
  static async updatePost(req, res) {
    try {
      const postId = req.params.postId;
      const { title, content } = req.body;
      const img = req.file ? req.file.filename : null;

      const message = await PostService.updatePost(postId, title, content, img);
      res.send(util.successMessage(message));
    } catch (error) {
      console.error("Error updating post:", error.message);
      res.send(util.errorMessage(error.message || "Internal server error"));
    }
  }

  // Delete a post
  static async deletePost(req, res) {
    try {
      const postId = req.params.postId;
      const message = await PostService.deletePost(postId);
      res.send(util.successMessage(message));
    } catch (error) {
      res.send(util.errorMessage(error.message || "Internal server error"));
    }
  }

  // Search posts
  static async searchPosts(req, res) {
    try {
      const searchTerm = req.query.q;
      const posts = await PostService.searchPosts(searchTerm);
      res.send(util.successMessage(posts));
    } catch (error) {
      res.send(util.errorMessage(error.message));
    }
  }

  // Get post likes
  static async getPostLikes(req, res) {
    try {
      const { postId } = req.params;
      const likes = await PostService.getPostLikes(postId);
      res.send(util.successMessage(likes));
    } catch (error) {
      res.send(util.errorMessage(error.message));
    }
  }

  // Check if user liked post
  static async checkUserLiked(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      const liked = await PostService.isPostLikedByUser(postId, userId);
      res.send(util.successMessage(liked));
    } catch (error) {
      res.send(util.errorMessage(error.message));
    }
  }

  // Toggle post like
  static async toggleLike(req, res) {
    try {
      const { postId } = req.params;
      const userId = req.user.id;
      const result = await PostService.togglePostLike(postId, userId);
      res.send(util.successMessage(result));
    } catch (error) {
      res.send(util.errorMessage(error.message));
    }
  }
}

module.exports = PostController;
