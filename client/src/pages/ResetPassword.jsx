import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../config/api";
import { useParams } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const res = await api.post("/user/reset-password", { token, password });
      if (res.data.status === "success") {
        toast.success("Password has been reset. You can now log in.");
      } else {
        toast.error("Failed to reset password.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred. Please try again.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bg-grey-lighter min-h-[80vh] flex flex-col">
        <div className="container max-w-sm mx-auto mt-20 flex items-center justify-center px-2">
          <div className="bg-gray-50 px-6 py-8 rounded shadow-blue-800 shadow-2xl text-black w-full">
            <h1 className="mb-8 text-3xl text-center font-bold">
              Reset Password
            </h1>
            <input
              type="password"
              className="block border border-gray-950 w-full p-3 rounded mb-4"
              placeholder="New Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              className="block border border-gray-950 w-full p-3 rounded mb-4"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full text-center py-3 rounded bg-blue-700 text-white hover:bg-blue-800 focus:outline-none my-1"
            >
              Reset Password
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
