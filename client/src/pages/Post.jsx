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
      <div className="container mx-auto mt-16 px-4 sm:px-6 lg:px-8">
        <h1 className="font-bold text-4xl lg:text-6xl text-blue-900 mb-8 leading-tight font-serif">
          "{post.title}"
        </h1>
        <div className="clearfix">
          <img
            className="float-left mr-4 mb-4 sm:mr-6 sm:mb-6 md:mr-8 md:mb-8 lg:mr-10 lg:mb-10 w-full md:max-w-[50%] rounded-md shadow-md object-cover"
            src={`http://localhost:4000/images/${post.img}`}
            alt={post.title}
          />
          <div
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-justify mt-4"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
        <div className="flex flex-col sm:flex-row justify-between text-base sm:text-lg md:text-xl lg:text-xl mt-8">
          <p></p>
          <p>
            <span className="uppercase font-bold">Category : </span>{" "}
            {post.category}
          </p>
        </div>
        <hr className="border-2 border-gray-700 bg-gray-700 h-px w-auto my-8" />
      </div>
    </>
  );
};

export default Post;
