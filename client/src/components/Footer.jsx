import React, { useEffect } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  useEffect(() => {
    window.scrollTo(0, 0); // Scrolls to the top when component mounts
  }, []);

  return (
    <footer className="bg-white text-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between items-center">
          <div className="w-full md:w-1/3 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-2">Blog App</h2>
            <p className="mb-4">
              Sharing insights and stories from various categories like art,
              technology, science, design, food, and cinema.
            </p>
            <p>
              &copy; {new Date().getFullYear()} Blog App. All rights reserved.
            </p>
          </div>
          <div className="w-full md:w-1/3 text-center">
            <h3 className="text-xl font-bold mb-2">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-blue-800">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/write" className="hover:text-blue-800">
                  Write
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-800">
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div className="w-full md:w-1/3 text-center md:text-right">
            <h3 className="text-xl font-bold mb-2">Follow Us</h3>
            <div className="flex justify-center md:justify-end space-x-4">
              <a
                href="https://facebook.com"
                className="hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook-f">Facebook</i>
              </a>
              <a
                href="https://twitter.com"
                className="hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-twitter">Twitter</i>
              </a>
              <a
                href="https://instagram.com"
                className="hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram">Instagram</i>
              </a>
              <a
                href="https://linkedin.com"
                className="hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin">LinkedIn</i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
