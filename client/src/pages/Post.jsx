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

        console.log("Response from server:", response.data);
        if (response.data.status === "success") {
          console.log(response.data.data[0]);
          setPost(response.data.data[0]);
        } else {
          toast.error("Failed to fetch post");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
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

      <div className="container mx-auto mt-12">
        <h1 className="font-bold text-4xl lg:text-6xl text-blue-900 mb-8 leading-tight">
          {post.title}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <img
              className="rounded-md shadow-md object-cover h-auto w-full"
              src={`http://localhost:4000/images/${post.img}`}
              alt={post.title}
            />
          </div>
          <div>
            <div
              className="text-lg lg:text-xl text-justify mt-4 lg:mt-0"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <div className="flex justify-between text-lg lg:text-xl mt-8">
              <p>
                <strong>Category:</strong> {post.category}
              </p>
              <p>
                <strong>User ID:</strong> {post.user_id}
              </p>
            </div>
          </div>
        </div>
      </div>
      <hr className="border-2 border-gray-700 bg-gray-700 h-px w-auto my-8" />
    </>
  );
};

export default Post;
