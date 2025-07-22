const { PostRepository } = require("../repositories");

class PostService {

  // Get all posts
  static async getAllPosts() {
    const posts = await PostRepository.findAll();
    return posts;
  }

  // Create a new post
  static async createPost(title, content, img, category, userId) {
    await PostRepository.create(title, content, img, category, userId);
    return "Post added successfully";
  }

  // Get single post with user details
  static async getPostById(id) {
    const posts = await PostRepository.findByIdWithUser(id);
    return posts;
  }

  // Get posts by category
  static async getPostsByCategory(category) {
    const posts = await PostRepository.findByCategory(category);
    return posts;
  }

  // Get user's posts
  static async getUserPosts(userId) {
    const posts = await PostRepository.findByUserId(userId);
    return posts;
  }

  // Update post
  static async updatePost(postId, title, content, img) {
    const updateFields = [];
    const queryParams = [];

    if (title) {
      updateFields.push("title = ?");
      queryParams.push(title);
    }

    if (content) {
      updateFields.push("content = ?");
      queryParams.push(content);
    }

    if (img) {
      updateFields.push("img = ?");
      queryParams.push(img);
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    await PostRepository.update(updateFields, queryParams, postId);
    return "Post updated successfully";
  }

  // Delete post
  static async deletePost(postId) {
    const result = await PostRepository.softDelete(postId);
    if (result.affectedRows > 0) {
      return "Post deleted successfully";
    } else {
      throw new Error("Post not found");
    }
  }

  // Search posts
  static async searchPosts(searchTerm) {
    if (!searchTerm) {
      return [];
    }
    const searchValue = `%${searchTerm.toLowerCase()}%`;
    const posts = await PostRepository.search(searchValue);
    return posts;
  }

  // Get post likes
  static async getPostLikes(postId) {
    const rows = await PostRepository.getLikesCount(postId);
    if (rows.length > 0) {
      return { likes: rows[0].likes };
    } else {
      throw new Error("Post not found");
    }
  }

  // Check if user liked post
  static async isPostLikedByUser(postId, userId) {
    const rows = await PostRepository.checkUserLiked(postId, userId);
    return { liked: rows.length > 0 };
  }

  // Toggle like on post
  static async togglePostLike(postId, userId) {
    const result = await PostRepository.checkUserLiked(postId, userId);

    if (result.length > 0) {
      // User has already liked the post, so remove the like
      await PostRepository.removeLike(postId, userId);
      await PostRepository.updateLikesCount(postId);
      return { message: "Like removed" };
    } else {
      // User has not liked the post, so add the like
      await PostRepository.addLike(postId, userId);
      await PostRepository.updateLikesCount(postId);
      return { message: "Like added" };
    }
  }
}

module.exports = PostService;
