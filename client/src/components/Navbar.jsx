import { useState, useEffect, useRef } from "react";
import logo from "../images/logo.png";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import CategoryDropdown from "./CategoryDropdown";
import NotificationBell from "./NotificationBell";
import { useSocket } from "../context/SocketContext";

const Navbar = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const userDropdownRef = useRef(null);
  const { socket } = useSocket();

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
    if (!userDropdownRef.current.contains(event.target)) {
      setIsUserDropdownOpen(false);
    }
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
      <header className="sticky z-30 top-0">
        <nav className="bg-white border-gray-800 px-4 lg:px-6 py-2.5">
          <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                className="w-24 md:w-44 mr-3 sm:h-12 md:h-16"
                alt="Logo"
              />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 order-3"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="w-4 h-4 md:w-6 md:h-6"
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

            {/* Navigation menu */}
            <div
              className={`${
                isMobileMenuOpen ? "block" : "hidden"
              } w-full lg:flex lg:w-auto lg:order-1`}
              id="mobile-menu-2"
            >
              <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0 lg:justify-center lg:items-center">
                <li>
                  <NavLink
                    to="/"
                    className={`block py-2 pr-4 pl-3 duration-200 ${
                      isActive("/") ? "text-blue-700" : "text-gray-700"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 text-lg md:text-xl lg:text-2xl`}
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/write"
                    className={`block py-2 pr-4 pl-3 duration-200 ${
                      isActive("/write") ? "text-blue-700" : "text-gray-700"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 text-lg md:text-xl lg:text-2xl`}
                  >
                    Write
                  </NavLink>
                </li>
                <li>
                  <CategoryDropdown />
                </li>
              </ul>
            </div>

            {/* User actions */}
            <div className="flex items-center lg:order-2 space-x-2">
              {isLoggedIn && (
                <>
                  {/* Notification Bell */}
                  <NotificationBell socket={socket} />
                  
                  {/* User Dropdown */}
                  <div ref={userDropdownRef} className="relative">
                    <button
                      onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                      className="text-sm md:text-base lg:text-lg font-serif px-3 py-2 rounded-md focus:outline-none hover:bg-gray-100 transition-colors flex items-center"
                    >
                      {userName}
                      <svg
                        className={`w-4 h-4 ml-1 transition-transform transform ${
                          isUserDropdownOpen ? "rotate-180" : ""
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

                    {isUserDropdownOpen && (
                      <ul className="absolute right-0 bg-white border border-gray-200 rounded-lg mt-2 py-1 w-32 md:w-40 z-40 shadow-lg">
                        <li>
                          <NavLink
                            to="/profile"
                            className="text-sm md:text-base block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            Profile
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/my-post"
                            className="text-sm md:text-base block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            My Posts
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/meetings"
                            className="text-sm md:text-base block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          >
                            Meetings
                          </NavLink>
                        </li>
                      </ul>
                    )}
                  </div>
                </>
              )}
              
              {/* Login/Logout buttons */}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-sm md:text-base lg:text-lg text-white bg-red-600 hover:bg-red-700 focus:ring-4 focus:ring-red-300 rounded-lg px-4 py-2 focus:outline-none transition-colors"
                >
                  Logout
                </button>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="text-sm md:text-base lg:text-lg text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm md:text-base lg:text-lg text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-4 py-2 focus:outline-none transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Navbar;
