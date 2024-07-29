import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../config/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const handleSubmit = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      const res = await api.post("/user/forgot-password", { email });
      if (res.data.status === "success") {
        toast.success("Password reset link sent to your email.");
      } else {
        toast.error("Failed to send password reset link.");
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
              Forgot Password
            </h1>
            <input
              type="email"
              className="block border border-gray-950 w-full p-3 rounded mb-4"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full text-center py-3 rounded bg-blue-700 text-white hover:bg-blue-800 focus:outline-none my-1"
            >
              Send Reset Link
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
