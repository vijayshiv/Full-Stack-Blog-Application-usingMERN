import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { RiEdit2Line, RiDeleteBinLine } from "react-icons/ri";
import { Link } from "react-router-dom";

const MyPosts = () => {
  const [posts, setPosts] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [postIdToDelete, setPostIdToDelete] = useState(null);

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

      console.log(response.data.data);
      setPosts(response.data.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
      toast.error("An error occurred while fetching your posts.");
    }
  };

  const truncateContent = (content, lineLimit) => {
    const plainText = content.replace(/<[^>]+>/g, "");
    const lines = plainText.split("\n");
    if (lines.length > lineLimit) {
      return lines.slice(0, lineLimit).join("\n") + "...";
    }
    return plainText;
  };

  const confirmDelete = (postId) => {
    setPostIdToDelete(postId);
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to delete posts.");
        return;
      }

      const response = await axios.delete(
        `http://localhost:4000/posts/delete-post/${postIdToDelete}`,
        { headers: { token } }
      );
      console.log(response.data);
      console.log(response.data.data);
      if (response.data.status === "success") {
        console.log("calling fetchPost()");
        fetchPosts();
        toast.success(response.data.data);
        // Remove the deleted post from the posts array
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      toast.error("An error occurred while deleting the post.");
    } finally {
      // Reset state after deletion
      setShowDeleteConfirmation(false);
      setPostIdToDelete(null);
    }
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
                <Link to={`/post/${post.post_id}`}>
                  <img
                    src={`http://localhost:4000/images/${post.img}`}
                    alt={post.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                </Link>
              )}
              <div className="p-5">
                <Link to={`/post/${post.post_id}`}>
                  <h2 className="mb-2 text-xl font-bold tracking-tight text-gray-900 text-balance">
                    {post.title}
                  </h2>
                </Link>
                <p
                  className="mb-3 font-normal text-gray-700 text-justify"
                  style={{ maxHeight: "8.4rem", overflow: "clip" }}
                >
                  {truncateContent(post.content, 10)} {/* Limit to 8 lines */}
                </p>
                <div className="absolute left-3 bottom-3">
                  <Link to={`/edit-post/${post.post_id}`}>
                    <button className="p-2 rounded-full bg-blue-700 text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
                      <RiEdit2Line />
                    </button>
                  </Link>
                </div>
                <div className="absolute right-3 bottom-3">
                  <button
                    onClick={() => confirmDelete(post.post_id)}
                    className="p-2 rounded-full bg-red-700 text-white hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300"
                  >
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded shadow-md">
            <p className="mb-2">Are you sure you want to delete this post?</p>
            <div className="flex justify-center">
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Yes
              </button>
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded ml-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
