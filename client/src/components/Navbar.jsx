import { useState, useEffect, useRef } from "react";
import logo from "../images/logo.png";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import CategoryDropdown from "./CategoryDropdown";
import NotificationBell from "./NotificationBell";
import { useSocket } from "../context/SocketContext";
import { SpinnerLoader } from "./Loader";

const Navbar = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
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

  const handleNavigation = (path) => {
    setIsNavigating(true);
    // Small delay for visual feedback
    setTimeout(() => {
      navigate(path);
      setIsNavigating(false);
    }, 300);
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
      {/* Navigation Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-[55] flex items-center justify-center">
          <div className="text-center">
            <SpinnerLoader size="xl" color="blue" />
            <p className="mt-4 text-gray-600 font-medium animate-pulse">Loading...</p>
          </div>
        </div>
      )}

      <header className="sticky z-50 top-0 w-full">
        <nav className="bg-white border-b border-gray-200 shadow-sm w-full">
          <div className="flex flex-wrap justify-between items-center w-full px-4 lg:px-6 py-2">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center transition-transform duration-300 hover:scale-105"
              onClick={() => handleNavigation("/")}
            >
              <img
                src={logo}
                className="w-20 md:w-32 mr-2 sm:h-8 md:h-12"
                alt="Logo"
              />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 order-3 transition-all duration-300"
            >
              <span className="sr-only">Open main menu</span>
              <div className={`w-6 h-6 relative transform transition-all duration-300 ${isMobileMenuOpen ? 'rotate-45' : ''}`}>
                <span className={`block absolute h-0.5 w-full bg-current transform transition duration-300 ${isMobileMenuOpen ? 'rotate-90 top-3' : 'top-1'}`}></span>
                <span className={`block absolute h-0.5 w-full bg-current transform transition duration-300 top-3 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block absolute h-0.5 w-full bg-current transform transition duration-300 ${isMobileMenuOpen ? '-rotate-90 top-3' : 'top-5'}`}></span>
              </div>
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
                    className={`block py-2 pr-4 pl-3 duration-200 transition-all ${
                      isActive("/") ? "text-blue-700 nav-active" : "text-gray-700"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 text-base md:text-lg lg:text-xl`}
                    onClick={() => handleNavigation("/")}
                  >
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/write"
                    className={`block py-2 pr-4 pl-3 duration-200 transition-all ${
                      isActive("/write") ? "text-blue-700 nav-active" : "text-gray-700"
                    } border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 hover:text-blue-700 lg:p-0 text-base md:text-lg lg:text-xl`}
                    onClick={() => handleNavigation("/write")}
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
                      className="text-sm md:text-base font-serif px-2 py-1 rounded-md focus:outline-none hover:bg-gray-100 transition-colors flex items-center"
                    >
                      {userName}
                      <svg
                        className={`w-3 h-3 ml-1 transition-transform transform ${
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
                      <ul className="absolute right-0 bg-white border border-gray-200 rounded-lg mt-2 py-1 w-32 md:w-40 z-50 shadow-lg animate-fade-in">
                        <li>
                          <NavLink
                            to="/profile"
                            className="text-sm md:text-base block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => handleNavigation("/profile")}
                          >
                            Profile
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/my-post"
                            className="text-sm md:text-base block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => handleNavigation("/my-post")}
                          >
                            My Posts
                          </NavLink>
                        </li>
                        <li>
                          <NavLink
                            to="/meetings"
                            className="text-sm md:text-base block px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                            onClick={() => handleNavigation("/meetings")}
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
                  className="text-sm md:text-base text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:ring-4 focus:ring-red-300 rounded-lg px-3 py-1.5 focus:outline-none transition-all duration-300 transform hover:scale-105"
                >
                  Logout
                </button>
              ) : (
                <div className="flex space-x-2">
                  <Link
                    to="/login"
                    className="text-sm md:text-base text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg px-3 py-1.5 focus:outline-none transition-all duration-300 transform hover:scale-105"
                    onClick={() => handleNavigation("/login")}
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="text-sm md:text-base text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg px-3 py-1.5 focus:outline-none transition-all duration-300 transform hover:scale-105"
                    onClick={() => handleNavigation("/register")}
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
