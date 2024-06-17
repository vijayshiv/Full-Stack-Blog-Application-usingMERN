import React, { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

const CategoryDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleToggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative inline-block" // Change here
    >
      <button
        onClick={handleToggleDropdown}
        className={`block py-2 pr-4 pl-3 duration-200 ${
          isActive("/cat=?") ? "text-blue-700" : "text-gray-700"
        } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 text-3xl`}
        style={{ zIndex: 1 }}
      >
        Category
        <svg
          className={`w-4 h-4 inline-block ml-1 transition-transform transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M10 12a1 1 0 01-.7-.29l-4-4a1 1 0 111.42-1.42L10 10.59l3.29-3.3a1 1 0 111.42 1.42l-4 4a1 1 0 01-.71.29z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isDropdownOpen && (
        <ul
          className="absolute bg-white border border-gray-200 rounded-lg mt-2 py-1 w-36 z-50"
          style={{ top: "3rem" }}
        >
          {" "}
          {/* Adjust top position here */}
          <li>
            <NavLink
              to="/?cat=art"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-700"
            >
              Art
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/?cat=technology"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-700"
            >
              Technology
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/?cat=science"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-700"
            >
              Science
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/?cat=design"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-700"
            >
              Design
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/?cat=food"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-700"
            >
              Food
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/?cat=cinema"
              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-700"
            >
              Cinema
            </NavLink>
          </li>
        </ul>
      )}
    </div>
  );
};

export default CategoryDropdown;
