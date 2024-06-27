import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import baseURL from "../config/apiConfig";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const category = new URLSearchParams(location.search).get("cat");

  const isMobile = useMediaQuery({ maxWidth: 768 }); // Define mobile breakpoint here
  const isMediumOrAbove = useMediaQuery({ minWidth: 769 }); // Define medium and larger screens

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let url = `${baseURL}/posts/all`;
        if (category) {
          url = `${baseURL}/posts/by-category/${category}`;
        }
        const res = await axios.get(url);
        if (res.data.status === "success") {
          const fetchedPosts = res.data.data;
          setPosts(shuffleArray(fetchedPosts)); // Shuffle the posts array before setting it
        } else {
          console.log("Failed to fetch posts");
        }
      } catch (error) {
        console.log("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [category]);

  // Function to shuffle an array
  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderPosts = () => {
    return filteredPosts.map((post) => {
      const truncateContent = (content, maxLength) => {
        const div = document.createElement("div");
        div.innerHTML = content;
        let text = div.textContent || div.innerText || "";
        text = text.trim();
        return text.length > maxLength
          ? `${text.substring(0, maxLength)}...`
          : text;
      };

      const imageWrapperClass = isMediumOrAbove ? "relative image-wrapper" : "";
      const flexDirection = isMediumOrAbove
        ? posts.indexOf(post) % 2 === 0
          ? "row"
          : "row-reverse"
        : "column";

      return (
        <div
          key={post.post_id}
          className={`flex flex-col md:flex-row text-xl font-sans list-disc my-4 ${
            isMobile ? "flex-col" : ""
          }`}
          style={{ flexDirection: flexDirection }}
        >
          <div className={imageWrapperClass}>
            <img
              className={`${
                isMediumOrAbove
                  ? "mt-12 mr-20 relative z-10 h-32 w-52 md:h-[333px] md:w-[600px]"
                  : "mx-auto mb-4 h-48 w-auto"
              }`}
              src={`${baseURL}/images/${post.img}`}
              alt={post.title}
            />
          </div>
          <div
            className={`${
              isMobile
                ? "text-center"
                : "flex flex-col justify-between flex-grow"
            } ${
              isMobile
                ? "px-4 text-sm"
                : "px-10 text-xs md:text-lg lg:text-xl text-justify flex-grow"
            }`}
          >
            <Link to={`/post/${post.post_id}`}>
              <h1
                className={`${
                  isMobile
                    ? "text-xl font-bold mt-4 mb-2 text-center"
                    : "text-xl md:text-2xl font-bold lg:text-4xl mt-4 py-10 ml-14"
                }`}
              >
                {post.title}
              </h1>
            </Link>
            <div
              className="sm:m-0 text-justify md:ml-14"
              dangerouslySetInnerHTML={{
                __html: truncateContent(post.content, isMobile ? 150 : 250),
              }}
            />
            <div
              className={`${
                isMobile
                  ? "flex justify-center mt-2 mb-4"
                  : "flex justify-start mr-10 mb-10 ml-14"
              }`}
            >
              <Link to={`/post/${post.post_id}`}>
                <button
                  className={`${
                    isMobile
                      ? "px-2 py-2 text-sm"
                      : "px-1 py-1 md:p-2 mt-4 ml-5 text-[10px] md:text-lg"
                  } border-2 border-solid border-black hover:bg-gray-200`}
                >
                  Read More
                </button>
              </Link>
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div>
      <div className="p-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-[95%] md:w-1/2 px-3 py-2 border rounded-md shadow-md focus:outline-none focus:border-blue-500"
        />
      </div>
      {renderPosts()}
    </div>
  );
}
