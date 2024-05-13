import React, { useState } from "react";
import logo from "../images/logo.png";
import { Link, NavLink, useLocation } from "react-router-dom";

export default function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  const handleClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const isActive = (path) => {
    const location = useLocation();
    return location.pathname === path;
  };

  return (
    <>
      <header className="sticky z-50 top-0">
        <nav className="bg-white border-gray-800 px-4 lg:px-6 py-2.5">
          <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            <Link to="/" className="flex items-center">
              <img src={logo} className="mr-3 h-16 w-44" alt="Logo" />
            </Link>
            <div className="flex items-center lg:order-2">
              <Link
                to="/login"
                className="text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-xl px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-xl px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none"
              >
                Sign up
              </Link>
            </div>
            <div
              className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1"
              id="mobile-menu-2"
            >
              <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
                <li>
                  <NavLink
                    to="/"
                    className={`block py-2 pr-4 pl-3 duration-200 ${
                      isActive("/") ? "text-blue-700" : "text-gray-700"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 text-xl`}
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/write"
                    className={`block py-2 pr-4 pl-3 duration-200 ${
                      isActive("/Write") ? "text-blue-700" : "text-gray-700"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 text-xl`}
                  >
                    Write
                  </NavLink>
                </li>
                <li
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <NavLink
                    to="#"
                    className={`block py-2 pr-4 pl-3 duration-100 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 ${
                      isDropdownOpen ? "hover:cursor-pointer" : ""
                    } text-xl`}
                    onClick={handleClick}
                  >
                    Dropdown
                  </NavLink>
                  {isDropdownOpen && (
                    <ul className="absolute bg-white border border-gray-200 rounded-lg mt-2 py-1 w-36">
                      <li>
                        <NavLink
                          to="/?cat=art"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Art
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/?cat=technology"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Technology
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/?cat=science"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Science
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/?cat=design"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Design
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/?cat=food"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Food
                        </NavLink>
                      </li>
                      <li>
                        <NavLink
                          to="/?cat=cinema"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        >
                          Cinema
                        </NavLink>
                      </li>
                    </ul>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
