import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { RiEdit2Line, RiDeleteBinLine } from "react-icons/ri"; // Import React Icons

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const name = sessionStorage.getItem("name");
    const token = sessionStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      setUserName(name ? capitalizeName(name) : "Someone");
    }
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const id = sessionStorage.getItem("id");
      if (!token) {
        toast.error("Please log in to view your posts.");
        return;
      }

      const response = await axios.get(
        "http://localhost:4000/posts/my-all-post",
        { headers: { token, id } }
      );
      console.log("Response:", response.data.data); // Log the response data
      setPosts(response.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("An error occurred while fetching your posts.");
    }
  };

  const truncateContent = (content, lineLimit) => {
    // Remove HTML tags and truncate content to specified number of lines
    const plainText = content.replace(/<[^>]+>/g, "");
    const lines = plainText.split("\n");
    if (lines.length > lineLimit) {
      return lines.slice(0, lineLimit).join("\n") + "...";
    }
    return plainText;
  };

  const capitalizeName = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  return (
    <div className="container mx-auto">
      <h1
        className="text-5xl font-semibold mb-10 mt-4 font-serif pb-2 relative"
        style={{
          backgroundImage: "linear-gradient(to right, #003366, #330066)",
          color: "white",
          WebkitTextFillColor: "transparent",
          WebkitBackgroundClip: "text",
          textShadow: "0px 0px 0px rgba(0, 0, 0, 1)",
        }}
      >
        <span className="block relative z-10">{userName}'s Posts</span>
        <span className="absolute inset-0 bg-gradient-to-r from-blue-800 to-purple-900 opacity-75 rounded-lg shadow-lg"></span>{" "}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.post_id}
              className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden relative"
            >
              {post.img && (
                <img
                  src={`http://localhost:4000/images/${post.img}`}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              <div className="p-5">
                <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 text-balance">
                  {post.title}
                </h2>
                <p
                  className="mb-3 font-normal text-gray-700 text-justify"
                  style={{ maxHeight: "8.4rem", overflow: "clip" }}
                >
                  {truncateContent(post.content, 10)} {/* Limit to 8 lines */}
                </p>
                <div className="absolute left-3 bottom-3">
                  <button className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                    <RiEdit2Line />
                  </button>
                </div>
                <div className="absolute right-3 bottom-3">
                  <button className="p-2 rounded-full bg-red-700 text-white hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300">
                    <RiDeleteBinLine />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No posts found.</p>
        )}
      </div>
    </div>
  );
};

export default MyPosts;
