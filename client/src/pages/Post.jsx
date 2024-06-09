import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4000/posts/post/${id}`
        );

        console.log("Response from server:", response.data); // Log response data
        if (response.data.status === "success") {
          console.log(response.data.data[0]);
          setPost(response.data.data[0]); // Accessing data correctly
        } else {
          toast.error("Failed to fetch post");
        }
      } catch (error) {
        console.error("Error fetching post:", error); // Log error
        setError(error.message);
      }
    };
    fetchPost();
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ToastContainer />

      <div className="post mt-12">
        <h1 className="font-bold text-7xl text-left mb-8 leading-tight tracking-wide text-blue-900 filter ">
          {post.title}
        </h1>

        <br />
        <img
          className="h-2/3 w-2/3 rounded-lg shadow-lg object-cover"
          src={`http://localhost:4000/images/${post.img}`}
          alt={post.title}
        />
        <p className="text-2xl text-justify mt-8">{post.content}</p>
        <br />
        <div className="flex justify-between text-3xl">
          <p className="text-left">
            <strong>Category:</strong> {post.category}
          </p>
          <p className="text-right">
            <strong>User ID:</strong> {post.user_id}
          </p>
        </div>
      </div>
      <hr className="border-2 border-gray-700 bg-gray-700 h-px w-auto my-8" />
    </>
  );
};

export default Post;
