import React, { useState, useEffect } from "react";
import { FaRegHeart, FaHeart } from "react-icons/fa";
import api from "../config/api";
import { toast } from "react-toastify";

const LikeButton = ({ postId }) => {
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchLikeInfo();
  }, [postId]);

  const fetchLikeInfo = async () => {
    try {
      const response = await api.get(`/posts/likes/${postId}`, {
        headers: {
          token: sessionStorage.getItem("token"),
        },
      });
      if (response.data.status === "success") {
        setLikes(response.data.data.likes);
        setLiked(response.data.data.userLiked);
      } else {
        console.error("Error fetching like info:", response.data.message);
      }
    } catch (error) {
      toast.error("Error fetching like info:", error);
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
        // Use the data returned from backend instead of manually toggling
        setLiked(response.data.data.liked);
        setLikes(response.data.data.likes);
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
      className={`group relative flex items-center space-x-3 px-6 py-3 rounded-2xl
                  ${liked 
                    ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-200' 
                    : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-red-50 hover:to-pink-50 hover:text-red-500'
                  }
                  transition-all duration-300 transform hover:scale-105 hover:shadow-xl
                  active:scale-95 overflow-hidden border border-white/20`}
      disabled={!sessionStorage.getItem("token")}
    >
      {/* Animated background pulse */}
      <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300
                      ${liked 
                        ? 'bg-gradient-to-r from-red-400 to-pink-500 opacity-0 group-hover:opacity-20' 
                        : 'bg-gradient-to-r from-red-400 to-pink-500 opacity-0 group-hover:opacity-10'
                      }`} />
      
      {/* Heart icon with animation */}
      <div className="relative z-10 flex items-center">
        {liked ? (
          <FaHeart className={`size-5 transition-all duration-300 transform group-hover:scale-110
                              ${liked ? 'text-white drop-shadow-sm' : ''}`} />
        ) : (
          <FaRegHeart className="size-5 transition-all duration-300 transform group-hover:scale-110 
                                 group-hover:text-red-500" />
        )}
      </div>
      
      {/* Like count with animation */}
      <span className={`relative z-10 font-semibold transition-all duration-300
                        ${liked ? 'text-white' : 'text-gray-700 group-hover:text-red-500'}`}>
        {likes}
      </span>
      
      {/* Sparkle effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute top-1 right-2 w-1 h-1 bg-white rounded-full animate-ping delay-100" />
        <div className="absolute bottom-1 left-2 w-1 h-1 bg-white rounded-full animate-ping delay-300" />
        <div className="absolute top-2 left-1/2 w-0.5 h-0.5 bg-white rounded-full animate-ping delay-500" />
      </div>
      
      {/* Tooltip for non-authenticated users */}
      {!sessionStorage.getItem("token") && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 
                        bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300
                        whitespace-nowrap pointer-events-none z-20
                        after:content-[''] after:absolute after:top-full after:left-1/2 
                        after:transform after:-translate-x-1/2 after:border-4 
                        after:border-transparent after:border-t-gray-800">
          Login to like posts
        </div>
      )}
    </button>
  );
};

export default LikeButton;
