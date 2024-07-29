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
      console.log("API Response Data:", response.data);

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
      console.log(response.data);

      if (response.data.status === "success") {
        console.log("Comment response data:", response.data.data);
        if (response.data.data.comment_id) {
          toast.success("Comment added!");
          setComments((prevComments) => [
            ...prevComments,
            {
              comment_id: response.data.data.comment_id,
              content: newComment,
              createdTimestamp: new Date().toISOString(),
              name: "Anonymous", // Placeholder name
            },
          ]);
          setNewComment(""); // Clear the comment input
        } else {
          toast.error("Invalid response structure");
        }
      } else {
        console.error("Error response data:", response.data);
        toast.error("Error adding comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error("Error adding comment");
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-3xl font-semibold mb-6 border-b pb-2">Comments</h2>
      <form onSubmit={handleCommentSubmit} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add a comment"
          rows="4"
        />
        <button
          type="submit"
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
      {comments.length > 0 ? (
        comments.map((comment) => (
          <div
            key={comment.comment_id}
            className="mb-4 p-4 border border-gray-200 rounded-md shadow-sm"
          >
            <p className="text-lg font-medium mb-2 text-left">
              {comment.content}
            </p>
            <div className="text-gray-500 text-sm flex justify-between items-end">
              <span className="capitalize">{comment.fullname}</span>
              <span>{new Date(comment.createdTimestamp).toLocaleString()}</span>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No comments yet.</p>
      )}
    </div>
  );
};

export default Comments;
