const { CommentService } = require("../services");
const util = require("../utils");

class CommentController {

  // Get comments for a post
  static async getComments(req, res) {
    try {
      const postId = req.params.postId;
      const comments = await CommentService.getCommentsByPostId(postId);
      res.json({ status: "success", data: comments });
    } catch (error) {
      console.error("Error fetching comments:", error.message);
      res.status(500).json({ status: "error", message: error.message || "Internal server error" });
    }
  }

  // Add a comment
  static async addComment(req, res) {
    try {
      const postId = req.params.postId;
      const userId = req.user.id;
      const comment = req.body.comment;

      const result = await CommentService.addComment(postId, userId, comment);
      res.json({ status: "success", data: result });
    } catch (error) {
      console.error("Error adding comment:", error.message);
      res.status(500).json({ status: "error", message: error.message || "Internal server error" });
    }
  }

  // Update a comment
  static async updateComment(req, res) {
    try {
      const commentId = req.params.commentId;
      const userId = req.user.id;
      const { content } = req.body;

      const message = await CommentService.updateComment(commentId, userId, content);
      res.json({ status: "success", message });
    } catch (error) {
      console.error("Error updating comment:", error.message);
      if (error.message.includes("not found") || error.message.includes("not the owner")) {
        res.status(404).json({ status: "error", message: error.message });
      } else {
        res.status(500).json({ status: "error", message: "Internal server error" });
      }
    }
  }

  // Delete a comment
  static async deleteComment(req, res) {
    try {
      const commentId = req.params.commentId;
      const userId = req.user.id;

      const message = await CommentService.deleteComment(commentId, userId);
      res.json({ status: "success", message });
    } catch (error) {
      console.error("Error deleting comment:", error.message);
      if (error.message.includes("not found") || error.message.includes("not the owner")) {
        res.status(404).json({ status: "error", message: error.message });
      } else {
        res.status(500).json({ status: "error", message: "Internal server error" });
      }
    }
  }
}

module.exports = CommentController;
