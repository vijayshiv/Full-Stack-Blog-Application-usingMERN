import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const onLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      const body = { email, password };
      const res = await axios.post("http://localhost:4000/user/login", body);
      if (res.data.status === "success") {
        const { token, id, name } = res.data.data;
        localStorage.setItem("token", token);
        localStorage.setItem("id", id);
        localStorage.setItem("name", name);
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("id", id);
        sessionStorage.setItem("name", name);
        toast.success("Login successful.");
        navigate("/");
      } else {
        toast.error("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error("Login failed. Please check your credentials.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="bg-grey-lighter min-h-screen flex flex-col">
        <div className="container max-w-sm mx-auto mt-20 flex items-center justify-center px-2">
          <div className="bg-gray-50 px-6 py-8 rounded shadow-blue-800 shadow-2xl text-black w-full">
            <h1 className="mb-8 text-3xl text-center font-bold">
              Welcome Back
            </h1>
            <input
              type="text"
              className="block border border-gray-950 w-full p-3 rounded mb-4"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="block border border-gray-950 w-full p-3 rounded mb-4"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="submit"
              onClick={onLogin}
              className="w-full text-center py-3 rounded bg-blue-700 text-white hover:bg-blue-800 focus:outline-none my-1"
            >
              Sign in
            </button>
            <p className="text-center mt-2">
              Don't have an account?{" "}
              <Link to="/register" className="underline ml-2">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
