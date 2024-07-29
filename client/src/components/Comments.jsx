import React, { useState, useEffect } from "react";
import api from "../config/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Comments.css"; // Ensure this is correctly imported

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

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
          toast.success("Comment added!");
          setComments((prevComments) => [
            ...prevComments,
            {
              comment_id: response.data.data.comment_id,
              content: newComment,
              createdTimestamp: new Date().toISOString(),
              fullname: "Anonymous", // Placeholder name
            },
          ]);
          setNewComment(""); // Clear the comment input
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

  return (
    <div className="container">
      <h2 className="heading">Comments</h2>
      <form onSubmit={handleCommentSubmit} className="form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="textarea"
          style={{ border: "1px solid black" }} // Temporary inline style
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
                <p className="text">{comment.content}</p>
                <div className="meta">
                  <p className="capitalize">
                    {comment.fullname},{" "}
                    {new Date(comment.createdTimestamp).toLocaleString()}
                  </p>
                </div>
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
