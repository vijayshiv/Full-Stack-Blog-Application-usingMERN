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
          console.error("Failed to fetch posts");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <div>
        {posts.map((post, index) => (
          <div
            key={post.post_id}
            className={`flex flex-row text-2xl font-sans list-disc ${
              index % 2 !== 0 ? "flex-row-reverse" : ""
            }`}
          >
            <div className="flex basis-1/3 px-5 mt-14 relative">
              <div className="relative image-wrapper">
                <img
                  className="m-10 relative z-10 h-[370px] w-[290px]"
                  src={post.img}
                  alt="Fine"
                />
              </div>
            </div>

            <div className="relative basis-2/3 ml-10 py-2">
              <Link to={`/post/${post.post_id}`}>
                <h1 className="px-10 text-justify font-bold text-5xl mt-10 py-10">
                  {post.title}
                </h1>
              </Link>
              <p className="px-10 text-2xl text-justify">
                {post.content.substring(0, 220)}...
              </p>
              <button className="absolute p-3 text-xl bottom-24 left-10 border-2 border-solid border-black hover:bg-gray-200">
                <Link to={`/post/${post.post_id}`}>Read More</Link>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
