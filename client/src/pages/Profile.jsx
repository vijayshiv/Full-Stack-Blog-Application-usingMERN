import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

      const response = await axios.put(
        "http://localhost:4000/user/update",
        userData,
        {
          headers: { token },
        }
      );
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
            Old Password
          </label>
          <input
            type="password"
            name="oldPassword"
            value={user.oldPassword}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md px-4 py-2"
          />
        </div>
        <div>
          <label className="block text-lg font-medium text-gray-700">
            New Password
          </label>
          <input
            type="password"
            name="newPassword"
            value={user.newPassword}
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
