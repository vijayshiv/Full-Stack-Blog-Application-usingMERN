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
      console.log(response.data.status);
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
    <div className="container mx-auto mt-4">
      <ToastContainer />
      <h1 className="font-bold text-3xl lg:text-5xl text-blue-900 leading-tight font-serif text-center">
        Profile
      </h1>
      <h6 className="mb-4 text-center">You can change name and email too</h6>
      <div className="flex justify-center mb-4">
        <Link to="/my-post" className="flex items-center text-2xl underline">
          Go to your posts
          <FiArrowRight className="ml-1" />
        </Link>
      </div>
      <form className="max-w-md mx-auto">
        <div className="mb-2 text-left">
          <label className="text-xl font-medium text-gray-700 mb-2 block">
            Full Name
          </label>
          <input
            type="text"
            name="fullname"
            value={user.fullname}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-base focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2 text-left">
          <label className="text-xl font-medium text-gray-700 mb-2 block">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-base focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-2 text-left">
          <label className="text-xl font-medium text-gray-700 mb-2 block">
            Old Password
          </label>
          <input
            type="password"
            name="oldPassword"
            value={user.oldPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-base focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="mb-4 text-left">
          <label className="text-xl font-medium text-gray-700 mb-2 block">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={user.newPassword}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-base focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className={`w-full text-center py-2 rounded bg-blue-700 text-white hover:bg-blue-800 focus:outline-none my-1 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
          onClick={handleUpdate}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
        <button
          type="button"
          onClick={confirmDelete}
          className="w-full text-center py-2 rounded bg-red-600 text-white hover:bg-red-800 focus:outline-none my-1"
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete Account"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
