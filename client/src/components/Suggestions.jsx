import React from "react";
import { Link } from "react-router-dom";

const Suggestions = ({ suggestions }) => {
  return (
    <div className="overflow-x-auto lg:overflow-y-auto">
      <div className="mt-3 lg:ml-12">
        <h2 className="font-bold text-2xl mb-4">
          Other Suggested Posts You May Like
        </h2>
        <ul className="flex lg:block space-x-4 lg:space-x-0" style={{ listStyleType: "none" }}>
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
                  className="w-40 h-40 lg:w-full lg:h-56 object-cover rounded-md mb-2 cursor-pointer"
                />
                <h3 className="text-xl lg:text-2xl mb-4 font-semibold text-blue-700 hover:underline cursor-pointer text-left">
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
  );
};

export default Suggestions;
