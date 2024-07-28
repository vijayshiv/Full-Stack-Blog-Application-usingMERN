// Comments.jsx
import React, { useState, useEffect } from "react";
import api from "../config/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
        setComments(response.data.data);
      } else {
        // toast.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      //   toast.error("Failed to fetch comments");
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
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.status === "success") {
        toast.success("Comment added!");
        setComments((prevComments) => [
          ...prevComments,
          response.data.data.comment,
        ]);
        setNewComment(""); // Clear the comment input
      } else {
        toast.error("Error adding comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold my-4">Comments</h2>
      <form onSubmit={handleCommentSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Add a comment"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
        >
          Submit
        </button>
      </form>
      {comments.map((comment, index) => (
        <div key={index} className="border-b py-2">
          <p>{comment.comment}</p>
        </div>
      ))}
    </div>
  );
};

export default Comments;
