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
        toast.success("Comment updated successfully");
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

  const handleDeleteComment = async (commentId, toastId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.delete(`/posts/comment/${commentId}`, {
        headers: { token },
      });
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.comment_id !== commentId)
        );
        toast.success("Comment deleted successfully");
        toast.dismiss(toastId); // Dismiss the toast after deletion
      } else {
        toast.error("Failed to delete comment");
        toast.dismiss(toastId); // Dismiss the toast on failure
      }
    } catch (error) {
      console.error("Error deleting comment:", error.message);
      toast.error("An error occurred while deleting comment");
      toast.dismiss(toastId); // Dismiss the toast on error
    }
  };

  const confirmDelete = (commentId) => {
    const toastId = toast.dark(
      <>
        Are you sure you want to delete this comment?
        <button
          onClick={() => handleDeleteComment(commentId, toastId)}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4"
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss(toastId)}
          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded ml-4"
        >
          No
        </button>
      </>,
      {
        position: "top-center",
        hideProgressBar: true,
        closeOnClick: false,
        draggable: false,
        pauseOnHover: true,
        autoClose: false,
      }
    );
  };

  return (
    <div className="container">
      <h2 className="heading">Comments</h2>
      <form onSubmit={handleCommentSubmit} className="form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="textarea border-black"
        />

        <button type="submit" className="button">
          Submit
        </button>
      </form>

      <div className="mt-4">
        {comments.length > 0 ? (
          <ul className="list">
            {comments.map((comment) => (
              <li key={comment.comment_id} className="listItem">
                {editCommentId === comment.comment_id ? (
                  <div>
                    <textarea
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                      className="textarea edit-textarea md:w-[80%] sm:w-[50%]"
                    />
                    <div className="icons save-cancel-icons">
                      <button
                        onClick={() => handleSaveEdit(comment.comment_id)}
                      >
                        <FaSave />
                      </button>
                      <button onClick={handleCancelEdit}>
                        <FaTimes />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="comment-content">
                    <div className="icons">
                      <FaEdit
                        onClick={() =>
                          handleEditComment(comment.comment_id, comment.content)
                        }
                      />
                      <FaTrash
                        onClick={() => confirmDelete(comment.comment_id)}
                      />
                    </div>
                    <p className="text">{comment.content}</p>
                    <div className="meta">
                      <p className="capitalize md:text-right">
                        {comment.fullname},{" "}
                        {new Date(comment.createdTimestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No comments yet.</p>
        )}
      </div>
    </div>
  );
};

export default Comments;
