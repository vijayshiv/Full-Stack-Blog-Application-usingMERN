import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { RiEdit2Line, RiDeleteBinLine } from "react-icons/ri";
import { Link } from "react-router-dom";
import api from "../config/api";
import baseURL from "../config/apiURL";

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

      const response = await api.get("/posts/my-all-post", {
        headers: { token, id },
      });
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
      const response = await api.delete(
        `/posts/delete-post/${postIdToDelete}`,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-4xl">
        {/* Enhanced Title Section */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="relative inline-block">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 font-serif relative z-10
                           bg-gradient-to-r from-slate-800 via-blue-800 to-purple-900 bg-clip-text text-transparent
                           animate-slide-up">
              {userName}'s Posts
            </h1>
            {/* Decorative underline */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 
                            bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-scale-in"></div>
          </div>
          <p className="text-sm text-gray-600 mt-3 animate-slide-up delay-300">
            Manage and showcase your creative content
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in delay-500">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <div
                key={post.post_id}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl 
                           transition-all duration-500 transform hover:-translate-y-2 hover:scale-105
                           border border-gray-100 overflow-hidden animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* 3D Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Image Section */}
                {post.img && (
                  <div className="relative overflow-hidden rounded-t-2xl">
                    <Link to={`/post/${post.post_id}`}>
                      <img
                        src={`${baseURL}/images/${post.img}`}
                        alt={post.title}
                        className="w-full h-32 object-cover transition-transform duration-500 
                                   group-hover:scale-110 group-hover:rotate-1"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent 
                                      opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </Link>
                  </div>
                )}
                
                {/* Content Section */}
                <div className="p-4 relative z-10">
                  <Link to={`/post/${post.post_id}`}>
                    <h2 className="mb-2 text-lg font-bold tracking-tight text-gray-900 
                                   group-hover:text-blue-700 transition-colors duration-300
                                   line-clamp-2">
                      {post.title}
                    </h2>
                  </Link>
                  <p className="mb-3 font-normal text-gray-600 text-sm leading-relaxed line-clamp-2">
                    {truncateContent(post.content, 8)}
                  </p>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <Link to={`/edit-post/${post.post_id}`}>
                      <button className="group/btn flex items-center space-x-2 px-3 py-2 rounded-xl 
                                         bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                         hover:from-blue-600 hover:to-blue-700 
                                         transform hover:scale-105 transition-all duration-300
                                         shadow-md hover:shadow-lg text-sm">
                        <RiEdit2Line className="group-hover/btn:rotate-12 transition-transform duration-300" />
                        <span className="font-medium">Edit</span>
                      </button>
                    </Link>
                    <button
                      onClick={() => confirmDelete(post.post_id)}
                      className="group/btn flex items-center space-x-2 px-3 py-2 rounded-xl 
                                 bg-gradient-to-r from-red-500 to-red-600 text-white 
                                 hover:from-red-600 hover:to-red-700 
                                 transform hover:scale-105 transition-all duration-300
                                 shadow-md hover:shadow-lg text-sm"
                    >
                      <RiDeleteBinLine className="group-hover/btn:rotate-12 transition-transform duration-300" />
                      <span className="font-medium">Delete</span>
                    </button>
                  </div>
                </div>

                {/* Decorative corner accent */}
                <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-blue-500/20 to-transparent 
                                rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 animate-fade-in">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-gray-100">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Posts Yet</h3>
                <p className="text-gray-600 mb-6">Start creating amazing content to see it here!</p>
                <Link 
                  to="/write"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                             text-white rounded-xl hover:from-blue-600 hover:to-purple-700 
                             transform hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Create Your First Post
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 
                        animate-fade-in p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 
                          animate-scale-in transform transition-all duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <RiDeleteBinLine className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Delete Post</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed">
                Are you sure you want to delete this post? This will permanently remove 
                the post and all associated data.
              </p>
            </div>
            
            {/* Modal Footer */}
            <div className="flex flex-col sm:flex-row gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 
                           font-medium rounded-xl transition-all duration-300 
                           transform hover:scale-105"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 
                           hover:from-red-600 hover:to-red-700 text-white font-medium 
                           rounded-xl transition-all duration-300 transform hover:scale-105 
                           shadow-lg hover:shadow-xl"
              >
                Delete Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPosts;
