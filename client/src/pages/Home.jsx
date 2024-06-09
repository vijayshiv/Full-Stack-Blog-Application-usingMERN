import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("http://localhost:4000/posts/all");
        if (res.data.status === "success") {
          setPosts(res.data.data);
        } else {
          console.log("Failed to fetch posts");
        }
      } catch (error) {
        console.log("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      {posts.map((post, index) => {
        const isOdd = index % 2 !== 0;
        const truncatedContent =
          post.content.length > 220
            ? post.content.substring(0, 220) + "..."
            : post.content;
        return (
          <div
            key={post.post_id}
            className="flex flex-col md:flex-row text-xl font-sans list-disc"
            style={{
              flexDirection: isOdd ? "row" : "row-reverse",
            }}
          >
            <div className="md:flex-shrink-0 md:mr-10">
              <div className="relative image-wrapper">
                <img
                  className="m-10 relative z-10 h-[370px] w-[290px]"
                  src={`http://localhost:4000/images/${post.img}`}
                  alt={post.title}
                />
              </div>
            </div>

            <div className="flex-grow">
              <Link to={`/post/${post.post_id}`}>
                <h1 className="px-10 text-left font-bold text-3xl mt-10 py-10 ">
                  {post.title}
                </h1>
              </Link>
              <p
                className="px-10 text-2xl text-justify"
                dangerouslySetInnerHTML={{ __html: truncatedContent }}
              />
              <div
                className={`flex ${
                  isOdd ? "justify-end" : "justify-start ml-9"
                } mr-10`}
              >
                <Link to={`/post/${post.post_id}`}>
                  <button className="p-3 mt-10 text-xl border-2 border-solid border-black hover:bg-gray-200">
                    Read More
                  </button>
                </Link>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
