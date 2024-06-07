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
        {posts.map((post) => {
          const isOdd = post.post_id % 2 !== 0;
          console.log("Is post_id odd?", isOdd); // Add this line for troubleshooting
          return (
            <div
              key={post.post_id}
              className="flex flex-col md:flex-row text-2xl font-sans list-disc"
              style={{
                flexDirection: isOdd ? "row" : "row-reverse",
              }}
            >
              <div className="md:flex-shrink-0 md:mr-10">
                <div className="relative image-wrapper">
                  <img
                    className="m-10 relative z-10 h-[370px] w-[290px]"
                    src={post.img}
                    alt="Fine"
                  />
                </div>
              </div>

              <div className="flex-grow">
                <Link to={`/post/${post.post_id}`}>
                  <h1 className="px-10 text-justify font-bold text-5xl mt-10 py-10">
                    {post.title}
                  </h1>
                </Link>
                <p className="px-10 text-2xl text-justify">
                  {post.content.substring(0, 220)}...
                </p>
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
    </div>
  );
}
