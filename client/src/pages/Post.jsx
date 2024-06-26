import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Suggestions from "../components/Suggestions";
import DOMPurify from "dompurify";

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
      <style>
        {`
    .post-content ul {
      list-style-type: disc;
      padding-left: 40px; /* Add padding for indentation */
      margin-left: 0; /* Reset margin to align with padding */
    }

    .post-content ol {
      list-style-type: none; /* Remove default numbering */
      counter-reset: list-counter; /* Initialize counter */
      padding-left: 40px; /* Add padding for indentation */
      margin-left: 0; /* Reset margin to align with padding */
    }

    .post-content ol li {
      counter-increment: list-counter; /* Increment counter */
      position: relative;
      padding-left: 1.5em; /* Add padding to list items */
    }

    .post-content ol li::before {
      content: counter(list-counter) ". "; /* Add number and period */
      font-weight: bold; /* Make the number bold */
      position: absolute;
      left: 0; /* Position number correctly */
    }

    /* Default styles */
    .post-content h1 {
      font-size: 1.25rem; /* Default size for small screens */
      color: #1a202c;
      margin-top: 1em;
      margin-bottom: 0.5em;
    }

    .post-content h2 {
      font-size: 1rem; /* Default size for small screens */
      color: #2d3748;
      margin-top: 0.75em;
      margin-bottom: 0.5em;
    }

    .post-content h3 {
      font-size: 0.875rem; /* Default size for small screens */
      color: #4a5568;
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }

    .post-content p {
      margin: 0.5em 0;
      line-height: 1.6;
    }

    .post-content strong, .post-content b {
      font-weight: bold;
    }

    .post-content em, .post-content i {
      font-style: italic;
    }

    .post-content a {
      color: #3182ce;
      text-decoration: underline;
    }

    .post-content a:hover {
      color: #2c5282;
    }

    /* Medium screens (md) */
    @media (min-width: 768px) {
      .post-content h1 {
        font-size: 2rem; /* Increased by 60% for medium screens */
      }

      .post-content h2 {
        font-size: 1.6rem; /* Increased by 60% for medium screens */
      }

      .post-content h3 {
        font-size: 1.4rem; /* Increased by 60% for medium screens */
      }
    }

    /* Large screens (lg) */
    @media (min-width: 1024px) {
      .post-content h1 {
        font-size: 2.2rem; /* Original size for large screens */
      }

      .post-content h2 {
        font-size: 1.9rem; /* Original size for large screens */
      }

      .post-content h3 {
        font-size: 1.4rem; /* Original size for large screens */
      }
    }
  `}
      </style>

      <div className="container mx-auto mt-16 px-4">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-3/4">
            <h1 className="font-bold text-2xl sm:text-3xl lg:text-5xl text-blue-900 mb-8 leading-tight font-serif">
              "{post.title}"
            </h1>
            <div className="clearfix">
              <img
                className="float-left mr-10 mb-5 max-w-[55%] rounded-md shadow-md object-cover cursor-pointer"
                src={`http://localhost:4000/images/${post.img}`}
                alt={post.title}
              />
              <div
                className="post-content mt-4"
                style={{
                  textAlign: "justify",
                  fontSize: "1rem", // Base font size
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.content),
                }}
              />
            </div>
            <div className="flex justify-between text-lg lg:text-xl mt-16">
              <p></p>
              <p className="text-xl sm:text-2xl capitalize">
                <span className="uppercase font-bold">Category : </span>
                {post.category}
              </p>
            </div>
          </div>
          <div className="lg:w-1/4 lg:ml-12 mt-8 lg:mt-0">
            <Suggestions suggestions={suggestions} />
          </div>
        </div>
      </div>
    </>
  );
};

export default Post;
