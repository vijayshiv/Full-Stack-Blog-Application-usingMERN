import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation();
  const category = new URLSearchParams(location.search).get("cat");

  const isMobile = useMediaQuery({ maxWidth: 768 }); // Define mobile breakpoint here
  const isMediumOrLarger = useMediaQuery({ minWidth: 769 }); // Define medium and larger screens

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let url = "http://localhost:4000/posts/all";
        if (category) {
          url = `http://localhost:4000/posts/by-category/${category}`;
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
    return filteredPosts.map((post, index) => {
      const isOdd = index % 2 !== 0;
      const truncatedContent = (str, maxLength) => {
        const div = document.createElement("div");
        div.innerHTML = str;
        let text = div.textContent || div.innerText || "";
        text = text.trim();
        return text.length > maxLength
          ? `${text.substring(0, maxLength)}...`
          : text;
      };

      const flexDirection =
        isMobile || (isMediumOrLarger && isOdd) ? "row" : "row-reverse";

      return (
        <div
          key={post.post_id}
          className="flex flex-col md:flex-row text-xl font-sans list-disc my-4"
          style={{
            flexDirection: flexDirection,
            alignItems: "stretch", // Ensure children stretch to same height
          }}
        >
          <div
            className="flex flex-col md:flex-row"
            style={{ flexDirection: flexDirection }}
          >
            <div className="md:flex-shrink-0 md:mr-10">
              <div className="relative image-wrapper">
                <img
                  className="m-10 relative z-10 h-32 w-52 md:h-[333px] md:w-[261px]" // Reduced by 10%
                  src={`http://localhost:4000/images/${post.img}`}
                  alt={post.title}
                />
              </div>
            </div>
            <div className="flex flex-col justify-between flex-grow">
              <Link to={`/post/${post.post_id}`}>
                <h1 className="text-xl md:text-2xl px-10 text-left font-bold lg:text-5xl mt-10 py-10">
                  {post.title}
                </h1>
              </Link>

              <div
                className="px-10 text-xs md:text-lg lg:text-xl text-justify flex-grow"
                dangerouslySetInnerHTML={{
                  __html: truncatedContent(post.content, 250),
                }}
              />
              <div
                className={`flex ${
                  isOdd ? "justify-end" : "justify-start ml-9"
                } mr-10 mb-10`} // Added mb-10 to ensure spacing at the bottom
              >
                <Link to={`/post/${post.post_id}`}>
                  <button className="px-1 py-1 md:p-3 mt-10 text-[10px] md:text-lg border-2 border-solid border-black hover:bg-gray-200">
                    Read More
                  </button>
                </Link>
              </div>
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
