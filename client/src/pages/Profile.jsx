import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profile = () => {
  const [user, setUser] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch user details when component mounts
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:4000/user/details", {
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
      const userData = { ...user, id: id };
      const response = await axios.put(
        "http://localhost:4000/user/update",
        userData,
        {
          headers: { token },
        }
      );
      if (response.data.status === "success") {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
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
      const response = await axios.post(
        "http://localhost:4000/user/delete",
        {
          id: localStorage.getItem("id"),
        },
        {
          headers: { token },
        }
      );
      if (response.data.status === "success") {
        toast.success("Account deleted successfully");
        // Clear both session storage and local storage
        sessionStorage.clear();
        localStorage.clear();
        // Redirect to login page
        window.location.href = "/login"; // Adjust the path as needed
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
    <div className="container mx-auto mt-16">
      <ToastContainer />
      <h1 className="font-bold text-4xl lg:text-6xl text-blue-900 mb-8 leading-tight font-serif">
        Profile
      </h1>
      <form className="grid grid-cols-1 gap-8 items-start">
        <div>
          <label className="block text-lg font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            name="fullname"
            value={user.fullname}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={user.password}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-4 py-2"
          />
        </div>
        <button
          type="submit"
          className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            loading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-4`}
          disabled={loading}
          onClick={handleUpdate}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
        <button
          type="button"
          onClick={confirmDelete}
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mt-4"
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete Account"}
        </button>
      </form>
    </div>
  );
};

export default Profile;
