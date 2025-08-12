import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes, FaSpinner } from "react-icons/fa";
import { Brain } from "lucide-react";
import baseURL from "../config/apiURL";
import { aiAPI } from "../config/aiApi";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const location = useLocation();
  const category = new URLSearchParams(location.search).get("cat");

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const isMediumOrAbove = useMediaQuery({ minWidth: 769 });

  // Search function definition
  const performSearch = useCallback(async (term) => {
    try {
      setIsSearching(true);
      console.log(`🔍 ${isSemanticSearch ? 'Semantic' : 'Regular'} searching for: "${term}"`);
      
      if (isSemanticSearch) {
        // Use AI semantic search
        const response = await aiAPI.semanticSearch(term, 10);
        if (response.status === 'success') {
          // Transform semantic search results to match post structure
          const transformedResults = response.data.results?.map(result => {
            // Handle blog posts differently from external sources
            if (result.source === 'blog') {
              return {
                post_id: result.id,
                title: result.title,
                content: result.content,
                category: result.category,
                user_name: result.author,
                img: result.image,
                date: result.date,
                score: result.relevance_score,
                source: 'blog',
                isExternal: false
              };
            } else {
              // Handle external sources (Wikipedia, Stack Overflow) - these should not be clickable as blog posts
              return {
                post_id: `external-${result.id || Math.random()}`,
                title: result.title || 'External Result',
                content: `Source: ${result.source}\n${result.content || 'Click the link below to view the full content.'}`,
                category: result.tags?.join(', ') || result.topic || result.source,
                user_name: result.source === 'stackoverflow' ? 'Stack Overflow' : 'Wikipedia',
                img: null,
                date: new Date().toISOString(),
                score: result.relevance_score,
                source: result.source,
                external_url: result.url,
                isExternal: true
              };
            }
          }) || [];
          
          console.log("🔍 Transformed semantic search results:", transformedResults);
          setSearchResults(transformedResults);
          setPosts([]); // Clear regular posts when showing search results
        } else {
          setSearchResults([]);
        }
      } else {
        // Use regular search
        const url = `${baseURL}/posts/search?q=${encodeURIComponent(term)}`;
        const res = await axios.get(url);
        
        console.log("🔍 Search response:", res.data);
        
        if (res.data.status === "success") {
          const searchData = res.data.data;
          setSearchResults(searchData);
          setPosts([]); // Clear regular posts when showing search results
        } else {
          setSearchResults([]);
        }
      }
    } catch (error) {
      console.error("Error searching posts:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [isSemanticSearch]);

  const fetchAllPosts = useCallback(async () => {
    try {
      setIsSearching(true);
      const url = `${baseURL}/posts/all`;
      const res = await axios.get(url);
      if (res.data.status === "success") {
        const fetchedPosts = res.data.data;
        setPosts(shuffleArray(fetchedPosts));
        setSearchResults([]);
      }
    } catch (error) {
      console.log("Error fetching posts:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const fetchPostsByCategory = useCallback(async (cat) => {
    try {
      setIsSearching(true);
      const url = `${baseURL}/posts/by-category/${cat}`;
      const res = await axios.get(url);
      if (res.data.status === "success") {
        const fetchedPosts = res.data.data;
        setPosts(shuffleArray(fetchedPosts));
        setSearchResults([]);
      }
    } catch (error) {
      console.log("Error fetching posts:", error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const shuffleArray = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };

    // Debounced search function
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchTerm.trim()) {
        performSearch(searchTerm.trim());
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, performSearch]);

  useEffect(() => {
    if (!searchTerm && category) {
      fetchPostsByCategory(category);
    } else if (!searchTerm && !category) {
      fetchAllPosts();
    }
  }, [category, searchTerm, fetchAllPosts, fetchPostsByCategory]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults([]);
    setCurrentPage(1);
    fetchAllPosts();
  };

  // Determine which posts to display
  const postsToDisplay = searchTerm.trim() ? searchResults : posts;

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentDisplayPosts = postsToDisplay.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
  };

  const renderPosts = () => {
    if (isSearching) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-gray-600">Searching...</div>
        </div>
      );
    }

    if (searchTerm && postsToDisplay.length === 0) {
      return (
        <div className="flex justify-center py-8">
          <div className="text-gray-600">No posts found for &quot;{searchTerm}&quot;</div>
        </div>
      );
    }

    return currentDisplayPosts.map((post) => {
      const truncateContent = (content, maxLength) => {
        const div = document.createElement("div");
        div.innerHTML = content;
        let text = div.textContent || div.innerText || "";
        text = text.trim();
        return text.length > maxLength
          ? `${text.substring(0, maxLength)}...`
          : text;
      };

      const imageWrapperClass = isMediumOrAbove ? "relative image-wrapper" : "";
      const flexDirection = isMediumOrAbove
        ? currentDisplayPosts.indexOf(post) % 2 === 0
          ? "row"
          : "row-reverse"
        : "column";
      
      // Determine button alignment based on layout
      const isEvenPost = currentDisplayPosts.indexOf(post) % 2 === 0;
      const buttonAlignment = isMediumOrAbove 
        ? isEvenPost 
          ? "justify-end" // Image left, button right
          : "justify-start" // Image right, button left
        : "justify-center"; // Mobile center

      return (
        <div
          key={post.post_id}
          className={`flex flex-col md:flex-row text-xl font-sans list-disc ${
            isMobile ? "flex-col my-8" : "my-4"
          }`}
          style={{ flexDirection: flexDirection }}
        >
          <div className={imageWrapperClass}>
            {post.isExternal || !post.img ? (
              <div className={`${
                isMediumOrAbove
                  ? "mt-12 mr-20 relative z-10 h-[350px] w-[820px] rounded-sm shadow-lg flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
                  : "mx-auto mb-4 h-48 w-full max-w-sm rounded-sm shadow-md flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"
              }`}>
                <div className="text-center p-6">
                  <div className="text-3xl mb-2">🌐</div>
                  <div className="text-lg font-semibold text-gray-700">
                    {post.source === 'stackoverflow' ? 'Stack Overflow' : 
                     post.source === 'wikipedia' ? 'Wikipedia' : 'External Source'}
                  </div>
                </div>
              </div>
            ) : (
              <img
                className={`${
                  isMediumOrAbove
                    ? "mt-12 mr-20 relative z-10 h-[350px] w-[820px] object-cover rounded-sm shadow-lg"
                    : "mx-auto mb-4 h-48 w-full max-w-sm object-cover rounded-sm shadow-md"
                }`}
                src={`${baseURL}/images/${post.img}`}
                alt={post.title}
              />
            )}
          </div>
          <div
            className={`${
              isMobile
                ? "text-center px-4 py-4"
                : "flex flex-col justify-between flex-grow"
            } ${
              isMobile
                ? "text-sm"
                : "px-10 text-xs md:text-lg lg:text-xl text-justify flex-grow"
            }`}
          >
            {post.isExternal ? (
              <a href={post.external_url} target="_blank" rel="noopener noreferrer">
                <h1
                  className={`${
                    isMobile
                      ? "text-xl font-bold mt-4 mb-4 text-center hover:text-blue-600"
                      : "text-xl md:text-2xl font-bold lg:text-4xl mt-4 py-10 px-14 hover:text-blue-600"
                  } transition-colors`}
                >
                  {post.title} 🔗
                </h1>
              </a>
            ) : (
              <Link to={`/post/${post.post_id}`}>
                <h1
                  className={`${
                    isMobile
                      ? "text-xl font-bold mt-4 mb-4 text-center"
                      : "text-xl md:text-2xl font-bold lg:text-4xl mt-4 py-10 px-14"
                  }`}
                >
                  {post.title}
                </h1>
              </Link>
            )}
            <div
              className={`${
                isMobile 
                  ? "sm:m-0 text-justify" 
                  : "sm:m-0 text-justify px-14"
              }`}
              dangerouslySetInnerHTML={{
                __html: truncateContent(post.content, isMobile ? 150 : 250),
              }}
            />
            <div
              className={`${
                isMobile
                  ? "flex justify-center mt-4 mb-6"
                  : `flex ${buttonAlignment} mr-10 mb-10 px-14`
              }`}
            >
              {post.isExternal ? (
                <a href={post.external_url} target="_blank" rel="noopener noreferrer">
                  <button
                    className={`${
                      isMobile
                        ? "px-2 py-2 text-sm"
                        : "px-4 py-2 mt-4 text-sm md:text-lg"
                    } border-2 border-solid border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors`}
                  >
                    View Source 🔗
                  </button>
                </a>
              ) : (
                <Link to={`/post/${post.post_id}`}>
                  <button
                    className={`${
                      isMobile
                        ? "px-2 py-2 text-sm"
                        : "px-4 py-2 mt-4 text-sm md:text-lg"
                    } border-2 border-solid border-black hover:bg-gray-200 transition-colors`}
                  >
                    Read More
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(postsToDisplay.length / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePrevClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleNextClick = () => {
    if (currentPage < Math.ceil(posts.length / postsPerPage)) {
      setCurrentPage(currentPage + 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div>
      <div className="p-4 flex flex-col items-center">
        {/* Unified Search Box with Toggle */}
        <div className="relative w-[95%] md:w-1/2 max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={isSemanticSearch ? "AI Semantic Search..." : "Search by title, category, or content..."}
            value={searchTerm}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-20 py-2 border rounded-md shadow-md focus:outline-none ${
              isSemanticSearch 
                ? 'focus:border-green-500 border-green-300' 
                : 'focus:border-blue-500'
            }`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {isSearching && (
              <FaSpinner className="animate-spin text-gray-400 mr-2" />
            )}
            <button
              onClick={() => setIsSemanticSearch(!isSemanticSearch)}
              className={`p-1 rounded mr-2 transition-colors ${
                isSemanticSearch 
                  ? 'text-green-600 hover:text-green-700 bg-green-50' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isSemanticSearch ? "Switch to Regular Search" : "Switch to AI Semantic Search"}
            >
              <Brain className="w-4 h-4" />
            </button>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600 text-center">
            {isSearching 
              ? (isSemanticSearch ? "AI Searching..." : "Searching...") 
              : `Found ${postsToDisplay.length} results ${isSemanticSearch ? '(AI Search)' : ''}`
            }
          </div>
        )}
      </div>
      
      {/* Only show posts when not in semantic search mode */}
      
      {/* Posts and Pagination */}
      {renderPosts()}
      <ul className="flex justify-center items-center">
            <li>
              <button
                onClick={handlePrevClick}
                className={`mx-1 px-1 py-1 md:px-2 rounded-2xl md:py-2 focus:outline-none bg-white text-black hover:bg-slate-200 ${
                  currentPage === 1 ? "cursor-not-allowed opacity-50" : ""
                }`}
                disabled={currentPage === 1}
              >
                <FaChevronLeft />
              </button>
            </li>
            {pageNumbers.map((number) => (
              <li key={number}>
                <button
                  className={`mx-1 px-2 py-1  hover:underline md:px-2 border md:py-1 rounded-sm shadow-md focus:outline-none bg-white text-black hover:bg-slate-200 ${
                    number === currentPage ? "shadow-blue-400  " : ""
                  }`}
                  onClick={() => paginate(number)}
                >
                  {number}
                </button>
              </li>
            ))}
            <li>
              <button
                onClick={handleNextClick}
                className={`mx-1 px-1 py-1 md:px-2 rounded-2xl md:py-2 focus:outline-none bg-white text-black hover:bg-slate-200  ${
                  currentPage === Math.ceil(posts.length / postsPerPage)
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                disabled={currentPage === Math.ceil(posts.length / postsPerPage)}
              >
                <FaChevronRight />
              </button>
            </li>
          </ul>
    </div>
  );
}
