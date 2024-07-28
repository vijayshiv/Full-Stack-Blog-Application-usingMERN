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
      console.log("API Response Data:", response.data); // Log full response data

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
      //   toast.error("Failed to fetch ?");
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
      {comments.map((comment) => (
        <div key={comment.comment_id} className="border-b py-2">
          <p>{comment.content}</p>
          <p className="text-gray-500 text-sm">
            {new Date(comment.createdTimestamp).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Comments;
