import React, { useState, useEffect } from "react";
import api from "../config/api";

const LikeButton = ({ postId }) => {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchLikes();
    checkIfLiked();
  }, [postId]);

  const fetchLikes = async () => {
    try {
      const response = await api.get(`/posts/likes/${postId}`, {
        headers: {
          token: sessionStorage.getItem("token"),
        },
      });
      if (response.data.status === "success") {
        setLikes(response.data.data.likes);
      } else {
        console.error("Error fetching likes:", response.data.message);
      }
    } catch (error) {
      console.log("Error fetching likes:", error);
    }
  };

  const checkIfLiked = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const response = await api.get(`/posts/is-liked/${postId}`, {
        headers: {
          token: token,
        },
      });
      if (response.data.status === "success") {
        setLiked(response.data.data.liked);
      } else {
        console.error("Error checking if liked:", response.data.message);
      }
    } catch (error) {
      console.error("Error checking if liked:", error);
    }
  };

  const handleLike = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const response = await api.post(
        `/posts/like/${postId}`,
        {},
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.data.status === "success") {
        // Fetch updated like count after successful like/unlike
        fetchLikes();
        setLiked(!liked);
      } else {
        console.error("Error liking post:", response.data.message);
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`px-4 py-2 rounded ${
        liked ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
      }`}
    >
      {liked ? "Unlike" : "Like"} ({likes})
    </button>
  );
};

export default LikeButton;
