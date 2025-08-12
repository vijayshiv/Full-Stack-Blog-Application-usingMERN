import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import api from "../config/api";

const Profile = () => {
  const [user, setUser] = useState({
    fullname: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/user/details", {
          headers: { token },
        });
        if (response.data.status === "success") {
          setUser(response.data.data);
        } else {
          toast.error("Failed to fetch user details");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("An error occurred while fetching user details");
      }
    };

    fetchUserDetails();
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("id");
      const { email, fullname, oldPassword, newPassword } = user;

      // Validate new password only if it is provided
      if (newPassword && !oldPassword) {
        toast.error("Please provide the old password to change the password");
        setLoading(false);
        return;
      }

      // Prepare the user data for update
      const userData = { id, email, fullname };
      if (oldPassword && newPassword) {
        userData.oldPassword = oldPassword;
        userData.newPassword = newPassword;
      }

      const response = await api.put("/user/update", userData, {
        headers: { token },
      });
      if (response.data.status === "success") {
        toast.success("Profile updated successfully");
        toast.success("Please login again");
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
      } else {
        toast.error(response.data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error.response?.data?.error ||
          "An error occurred while updating profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    toast.dark(
      <>
        Are you sure you want to delete your account?
        <button
          onClick={() => handleDelete()}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ml-4"
        >
          Yes
        </button>
        <button
          onClick={() => toast.dismiss()}
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

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await api.post(
        "/user/delete",
        {
          id: localStorage.getItem("id"),
        },
        {
          headers: { token },
        }
      );
      if (response.data.status === "success") {
        toast.success("Account deleted successfully");
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = "/login";
      } else {
        toast.error("Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("An error occurred while deleting account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      <ToastContainer />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10 max-w-4xl">
        {/* Enhanced Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative inline-block mb-6">
            {/* Profile Avatar */}
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-full 
                              flex items-center justify-center text-white text-2xl font-bold shadow-2xl
                              animate-scale-in transform hover:scale-110 transition-transform duration-300">
                {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 to-purple-600/30 
                              rounded-full animate-ping"></div>
            </div>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 font-serif
                           bg-gradient-to-r from-slate-800 via-blue-800 to-purple-900 bg-clip-text text-transparent
                           animate-slide-up">
              Profile Settings
            </h1>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-0.5 
                            bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-scale-in"></div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4 animate-slide-up delay-300">
            Manage your account information and preferences
          </p>
          
          {/* Quick Link to Posts */}
          <div className="flex justify-center mb-6 animate-slide-up delay-500">
            <Link 
              to="/my-post" 
              className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 
                         text-white rounded-xl hover:from-blue-600 hover:to-purple-700 
                         transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              <span className="font-medium">View Your Posts</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>

        {/* Enhanced Form Section */}
        <div className="max-w-xl mx-auto animate-fade-in delay-700">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 
                          hover:shadow-3xl transition-all duration-500 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-600/10 p-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 text-center">Account Information</h2>
              <p className="text-gray-600 text-center mt-1 text-sm">Update your personal details below</p>
            </div>
            
            <form className="p-6 space-y-4">
              {/* Full Name Field */}
              <div className="group animate-slide-up delay-800">
                <label className="block text-sm font-semibold text-gray-700 mb-2 
                                 group-focus-within:text-blue-600 transition-colors duration-300">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="fullname"
                    value={user.fullname}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm 
                               focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                               transition-all duration-300 bg-gray-50 hover:bg-white
                               placeholder-gray-400"
                    placeholder="Enter your full name"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                                  opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Email Field */}
              <div className="group animate-slide-up delay-900">
                <label className="block text-lg font-semibold text-gray-700 mb-3 
                                 group-focus-within:text-blue-600 transition-colors duration-300">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base 
                               focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                               transition-all duration-300 bg-gray-50 hover:bg-white
                               placeholder-gray-400"
                    placeholder="Enter your email address"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                                  opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group animate-slide-up delay-1000">
                  <label className="block text-lg font-semibold text-gray-700 mb-3 
                                   group-focus-within:text-blue-600 transition-colors duration-300">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="oldPassword"
                      value={user.oldPassword}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base 
                                 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                                 transition-all duration-300 bg-gray-50 hover:bg-white
                                 placeholder-gray-400"
                      placeholder="Enter current password"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                                    opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                <div className="group animate-slide-up delay-1100">
                  <label className="block text-lg font-semibold text-gray-700 mb-3 
                                   group-focus-within:text-blue-600 transition-colors duration-300">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="newPassword"
                      value={user.newPassword}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base 
                                 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100
                                 transition-all duration-300 bg-gray-50 hover:bg-white
                                 placeholder-gray-400"
                      placeholder="Enter new password"
                    />
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                                    opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 animate-slide-up delay-1200">
                <button
                  type="submit"
                  className={`flex-1 py-3 px-6 rounded-xl font-semibold text-lg transition-all duration-300 
                             transform hover:scale-105 shadow-lg hover:shadow-xl
                             ${loading 
                               ? "bg-gray-400 cursor-not-allowed" 
                               : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                             }`}
                  disabled={loading}
                  onClick={handleUpdate}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Update Profile"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-red-500 to-red-600 
                             hover:from-red-600 hover:to-red-700 text-white font-semibold text-lg 
                             rounded-xl transition-all duration-300 transform hover:scale-105 
                             shadow-lg hover:shadow-xl"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Delete Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
