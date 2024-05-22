import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
export default function Register() {
  const [fullname, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const submitData = async () => {
    const body = { fullname, email, password };
    const req = await axios.post("http://localhost:4000/user/register", body);
    if (req.data.status == "success") {
      console.log("success");
      navigate("/login");
    }
  };

  return (
    <>
      <div className="bg-grey-lighter min-h-screen flex flex-col">
        <div className="container  max-w-sm mx-auto flex mt-20 items-center justify-center px-2">
          <div className=" bg-gray-50 px-6 py-8 rounded shadow-blue-800 shadow-2xl text-black w-full">
            <h1 className="mb-8 text-3xl text-center font-bold">Sign up</h1>
            <input
              type="text"
              className="block border border-gray-950 w-full p-3 rounded mb-4"
              placeholder="Full Name"
              onChange={(e) => {
                console.log(e.target.value);
                setFullName(e.target.value);
              }}
            />
            <input
              type="text"
              className="block border  border-gray-950 w-full p-3 rounded mb-4"
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              className="block border  border-gray-950 w-full p-3 rounded mb-4"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
            <input
              type="password"
              className="block border  border-gray-950 w-full p-3 rounded mb-4"
              placeholder="Confirm Password"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="submit"
              onClick={submitData}
              className="w-full text-center py-3 rounded bg-blue-700 text-white hover:bg-blue-800 focus:outline-none my-1"
            >
              Create Account
            </button>
            Already have an account?
            <Link to="/login" className="underline ml-2">
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
