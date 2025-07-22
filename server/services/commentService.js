const { CommentRepository } = require("../repositories");

class CommentService {

  // Get comments for a post
  static async getCommentsByPostId(postId) {
    // Validate postId
    if (!postId || isNaN(postId)) {
      throw new Error("Invalid postId");
    }

    const comments = await CommentRepository.findByPostId(postId);
    return comments;
  }

  // Add a comment
  static async addComment(postId, userId, comment) {
    const result = await CommentRepository.create(postId, userId, comment);
    const commentId = result.insertId;

    return {
      comment_id: commentId,
      content: comment,
      createdTimestamp: new Date().toISOString(),
    };
  }

  // Update a comment
  static async updateComment(commentId, userId, content) {
    const result = await CommentRepository.update(content, commentId, userId);

    if (result.affectedRows === 0) {
      throw new Error("Comment not found or you are not the owner of this comment");
    }

    return "Comment updated successfully";
  }

  // Delete a comment
  static async deleteComment(commentId, userId) {
    const result = await CommentRepository.delete(commentId, userId);

    if (result.affectedRows === 0) {
      throw new Error("Comment not found or you are not the owner of this comment");
    }

    return "Comment deleted successfully";
  }
}

module.exports = CommentService;
