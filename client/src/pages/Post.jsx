import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
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
          fetchSuggestions(response.data.data[0].category); // Fetch suggestions based on category
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

  const fetchSuggestions = async (category) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/posts/by-category/${category}`
      );
      if (response.data.status === "success") {
        setSuggestions(
          response.data.data.filter((item) => item.post_id !== id)
        ); // Exclude the current post from suggestions
      } else {
        toast.error("Failed to fetch suggestions");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Failed to fetch suggestions");
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto mt-16">
        <div className="flex">
          <div className="w-3/4">
            <h1 className="font-bold text-4xl lg:text-6xl text-blue-900 mb-8 leading-tight font-serif">
              "{post.title}"
            </h1>
            <div className="clearfix">
              <img
                className="float-left mr-10 mb-5 max-w-[50%] rounded-md shadow-md object-cover cursor-pointer"
                src={`http://localhost:4000/images/${post.img}`}
                alt={post.title}
                onClick={() => (window.location.href = `/post/${post.post_id}`)}
              />
              <div
                className="text-lg lg:text-2xl text-justify mt-4"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
            <div className="flex justify-between text-lg lg:text-xl mt-8">
              <p></p>
              <p>
                <span className="uppercase font-bold">Category : </span>{" "}
                {post.category}
              </p>
            </div>
            <hr className="border-2 border-gray-700 bg-gray-700 h-px w-auto my-8" />
          </div>
          <div className="w-1/4 h- overflow-y-auto">
            {" "}
            {/* Adjusted height */}
            <div className="mt-3 ml-12">
              <h2 className="font-bold text-2xl mb-4">
                Other Suggested Posts You May Like
              </h2>
              <ul>
                {suggestions.map((item) => (
                  <li key={item.post_id} className="mb-4">
                    <Link to={`/post/${item.post_id}`} className="block">
                      <img
                        src={`http://localhost:4000/images/${item.img}`}
                        alt={item.title}
                        className="w-full h-56  object-cover rounded-md mb-2 cursor-pointer"
                      />
                      <h3 className="text-2xl mb-4 font-semibold text-blue-700 hover:underline cursor-pointer">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600">{item.category}</p>
                    <Link
                      to={`/post/${item.post_id}`}
                      className="text-black-700 hover:underline bg-slate-200 hover:bg-slate-300 p-1 rounded-sm"
                    >
                      Read More
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
