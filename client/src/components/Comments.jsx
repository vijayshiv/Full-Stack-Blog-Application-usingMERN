import React, { useState, useEffect } from "react";
import api from "../config/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Comments.css";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa"; // Import icons

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/posts/comments/${postId}`);
      if (response.data.status === "success") {
        if (Array.isArray(response.data.data)) {
          setComments(response.data.data);
        } else {
          console.error("Invalid data format:", response.data.data);
          toast.error("Failed to fetch comments");
        }
      } else {
        toast.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error.message);
      toast.error("Failed to fetch comments");
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.post(
        `/posts/comment/${postId}`,
        { comment: newComment },
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.data.status === "success") {
        if (response.data.data.comment_id) {
          setComments((prevComments) => [
            ...prevComments,
            {
              comment_id: response.data.data.comment_id,
              content: newComment,
              createdTimestamp: new Date().toISOString(),
              fullname: "Anonymous", // Placeholder name
            },
          ]);
          setNewComment("");
        } else {
          toast.error("Invalid response structure");
        }
      } else {
        toast.error("Error adding comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    }
  };

  const handleEditComment = (commentId, content) => {
    setEditCommentId(commentId);
    setEditCommentContent(content);
  };

  const handleSaveEdit = async (commentId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.put(
        `/posts/comment/${commentId}`,
        { content: editCommentContent },
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.comment_id === commentId
              ? { ...comment, content: editCommentContent }
              : comment
          )
        );
        setEditCommentId(null);
        setEditCommentContent("");
      } else {
        toast.error("Error updating comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      toast.error("Error updating comment");
    }
  };

  const handleCancelEdit = () => {
    setEditCommentId(null);
    setEditCommentContent("");
  };

  const handleDeleteComment = async (commentId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.delete(`/posts/comment/${commentId}`, {
        headers: {
          token: token,
        },
      });
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.comment_id !== commentId)
        );
      } else {
        toast.error("Error deleting comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Error deleting comment");
    }
  };

  return (
    <div className="mt-8 p-2 bg-gray-100 rounded-lg comments-container">
      <h2 className="text-2xl font-semibold mb-4">Comments</h2>
      <form onSubmit={handleCommentSubmit} className="mb-4 flex items-center">
        <textarea
          className="flex-grow px-4 py-2 border rounded-l-md"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
        />
        <button
          type="submit"
          className="px-2 py-1 bg-blue-500 text-white rounded-md mb-8 ml-2"
        >
          Submit
        </button>
      </form>
      {comments.map((comment) => (
        <div
          key={comment.comment_id}
          className="bg-white rounded-lg shadow-md p-4 mb-4"
        >
          {editCommentId === comment.comment_id ? (
            <div className="flex flex-col">
              <textarea
                className="mb-2 p-2 border rounded-md"
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  onClick={() => handleSaveEdit(comment.comment_id)}
                  className="mr-2 px-4 py-2 bg-green-500 text-white rounded-md flex items-center"
                >
                  <FaSave className="mr-1" />
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-red-500 text-white rounded-md flex items-center"
                >
                  <FaTimes className="mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-start">
              <p className="text-gray-700">{comment.content}</p>
              <div className="flex items-center ml-4">
                <button
                  onClick={() =>
                    handleEditComment(comment.comment_id, comment.content)
                  }
                  className="mr-2 text-blue-500"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.comment_id)}
                  className="text-red-500"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          )}
          <div className="text-sm text-gray-500 mt-2 text-right">
            Posted by: {comment.fullname} on{" "}
            {new Date(comment.createdTimestamp).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Comments;
