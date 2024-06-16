import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Suggestions from "../components/Suggestions";

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
            <h1 className="font-bold text-3xl lg:text-5xl text-blue-900 mb-8 leading-tight font-serif">
              "{post.title}"
            </h1>
            <div className="clearfix">
              <img
                className="float-left mr-10 mb-5 max-w-[55%] rounded-md shadow-md object-cover cursor-pointer"
                src={`http://localhost:4000/images/${post.img}`}
                alt={post.title}
                onClick={() => navigate(`/post/${post.post_id}`)}
              />
              <div
                className="mt-4"
                style={{
                  fontSize: "130%",
                  textAlign: "justify",
                }}
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
          <Suggestions suggestions={suggestions} />
        </div>
      </div>
    </>
  );
};

export default Post;
