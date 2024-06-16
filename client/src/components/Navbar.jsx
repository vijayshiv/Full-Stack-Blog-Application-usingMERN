import React, { useState, useEffect, useRef } from "react";
import logo from "../images/logo.png";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const dropdownRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    const userId = sessionStorage.getItem("id");
    const name = sessionStorage.getItem("name");

    if (token && userId) {
      setIsLoggedIn(true);
      setUserName(name ? capitalizeName(name) : "");
    } else {
      setIsLoggedIn(false);
      setUserName("");
    }
  }, [location]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsDropdownOpen(false);
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false); // Close the mobile menu if it's open
      }
    }
  };

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.clear();
    setIsLoggedIn(false);
    setUserName("");
    navigate("/login");
  };

  const capitalizeName = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
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
              {isLoggedIn ? (
                <>
                  <Link
                    to="/profile"
                    className="text-xl mr-4 font-serif p-1.5 rounded-md border-2 border-solid border-black bg-gray-100 hover:bg-gray-200"
                  >
                    {userName}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-orange-300 rounded-lg text-xl px-4 lg:px-3 py-1 lg:py-2 mr-2 focus:outline-none"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 5h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2zm0 4h14a1 1 0 110 2H3a1 1 0 110-2z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>

            <div
              className={`${
                isMobileMenuOpen ? "block" : "hidden"
              } justify-between items-center w-full lg:flex lg:w-auto lg:order-1`}
              id="mobile-menu-2"
            >
              <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0 ">
                <li>
                  <NavLink
                    to="/"
                    className={`block py-2 pr-4 pl-3 duration-200 ${
                      isActive("/") ? "text-blue-700" : "text-gray-700"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 text-3xl`}
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/write"
                    className={`block py-2 pr-4 pl-3 duration-200 ${
                      isActive("/write") ? "text-blue-700" : "text-gray-700"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 text-3xl`}
                  >
                    Write
                  </NavLink>
                </li>
                <li>
                  <details ref={dropdownRef} className="dropdown">
                    <summary
                      onClick={handleDropdownToggle}
                      className={`block py-2 pr-4 pl-3 duration-100 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 ${
                        isDropdownOpen ? "hover:cursor-pointer" : ""
                      } text-3xl`}
                    >
                      Category
                      <svg
                        className={`w-6 h-6 inline-block ml-1 transition-transform transform ${
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
                    </summary>

                    {isDropdownOpen && (
                      <ul className="absolute bg-white border border-gray-200 rounded-lg mt-2 py-1 w-36 z-50">
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
                  </details>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
