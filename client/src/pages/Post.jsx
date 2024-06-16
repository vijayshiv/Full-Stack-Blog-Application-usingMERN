import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Post = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
          const fetchedPost = response.data.data[0];
          console.log("Fetched post:", fetchedPost);
          setPost(fetchedPost);
          fetchSuggestions(fetchedPost.category, fetchedPost.post_id);
        } else {
          toast.error("Failed to fetch post");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(error.message);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchSuggestions = async (category, postId) => {
    try {
      const response = await axios.get(
        `http://localhost:4000/posts/by-category/${category}`
      );
      postId = id;
      if (response.data.status === "success") {
        const filteredSuggestions = response.data.data.filter((item) => {
          const isCurrentPost = item.post_id == id;
          if (isCurrentPost) {
            console.log(
              `Excluding current post from suggestions: ${item.title}`
            );
          }
          return !isCurrentPost;
        });
        // console.log(shuffleArray(filteredSuggestions).slice(0, 1));
        setSuggestions(shuffleArray(filteredSuggestions).slice(0, 4));
      } else {
        toast.error("Failed to fetch suggestions");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Failed to fetch suggestions");
    }
  };

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
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
                onClick={() => navigate(`/post/${post.post_id}`)}
              />
              <div
                className="text-lg lg:text-2xl text-justify mt-4"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
            <div className="flex justify-between text-lg lg:text-xl mt-16">
              <p></p>
              <p className="text-2xl capitalize">
                <span className="uppercase font-bold">Category : </span>
                {post.category}
              </p>
            </div>
          </div>
          <div className="w-1/4 h- overflow-y-auto">
            <div className="mt-3 ml-12">
              <h2 className="font-bold text-2xl mb-4">
                Other Suggested Posts You May Like
              </h2>
              <ul>
                {suggestions.map((item) => (
                  <li key={item.post_id} className="mb-4">
                    <Link
                      to={`/post/${item.post_id}`}
                      className="block"
                      onClick={() => window.scrollTo(0, 0)}
                    >
                      <img
                        src={`http://localhost:4000/images/${item.img}`}
                        alt={item.title}
                        className="w-full h-56 object-cover rounded-md mb-2 cursor-pointer"
                      />
                      <h3 className="text-2xl mb-4 font-semibold text-blue-700 hover:underline cursor-pointer">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-gray-600">{item.category}</p>
                    <Link
                      to={`/post/${item.post_id}`}
                      className="text-black-700 hover:underline bg-slate-200 hover:bg-slate-300 p-1 rounded-sm"
                      onClick={() => window.scrollTo(0, 0)}
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
