import React from "react";
import { Link } from "react-router-dom";
import baseURL from "../config/apiURL";

const Suggestions = ({ suggestions }) => {
  // Display only the first 4 items on medium screens and above
  const visibleSuggestions = suggestions.slice(0, 3);

  return (
    <div className="text-center">
      <h2 className="font-bold text-lg mb-3 text-center">
        Other Suggested Posts You May Like
      </h2>
      <div className="overflow-x-auto lg:overflow-y-auto">
        <ul
          className="flex lg:block space-x-4 lg:space-x-0"
          style={{ listStyleType: "none" }}
        >
          {visibleSuggestions.map((item) => (
            <li key={item.post_id} className="mb-3">
              <Link
                to={`/post/${item.post_id}`}
                className="block"
                onClick={() => window.scrollTo(0, 0)}
              >
                <img
                  src={`${baseURL}/images/${item.img}`}
                  alt={item.title}
                  className="w-32 h-32 lg:w-full lg:h-40 object-cover rounded-md mb-2 cursor-pointer mx-auto"
                />
                <h3 className="text-sm text-center lg:text-base mb-2 font-semibold text-blue-700 hover:underline cursor-pointer truncate-text">
                  {item.title}
                </h3>
              </Link>
              <p className="text-gray-600 text-xs text-center">{item.category}</p>
              <Link
                to={`/post/${item.post_id}`}
                className="text-black-700 hover:underline bg-slate-200 hover:bg-slate-300 p-1 rounded-sm text-xs inline-block mt-1"
                onClick={() => window.scrollTo(0, 0)}
              >
                Read More
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <style>
        {`
          @media (max-width: 768px) {
            .truncate-text {
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: 150px; 
            }
          }
        `}
      </style>
    </div>
  );
};

export default Suggestions;
