import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { useMediaQuery } from "react-responsive";
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes, FaSpinner } from "react-icons/fa";
import { Brain } from "lucide-react";
import baseURL from "../config/apiURL";
import { aiAPI } from "../config/aiApi";
import { PageLoader, SpinnerLoader, PostSkeleton } from "../components/Loader";
import { FadeIn, SlideInUp, StaggeredList, HoverScale } from "../components/Animations";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(6);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
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
      setIsPostsLoading(true);
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
      setIsPostsLoading(false);
      setIsPageLoading(false);
    }
  }, []);

  const fetchPostsByCategory = useCallback(async (cat) => {
    try {
      setIsPostsLoading(true);
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
      setIsPostsLoading(false);
      setIsPageLoading(false);
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
    if (!searchTerm.trim()) {
      return;
    }

    const searchTimeout = setTimeout(() => {
      console.log("🔍 Triggering search for:", searchTerm);
      performSearch(searchTerm);
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchTerm, performSearch]);

  useEffect(() => {
    if (!searchTerm && category) {
      console.log("🏷️ Loading posts for category:", category);
      fetchPostsByCategory(category);
    } else if (!searchTerm && !category) {
      console.log("🏠 Loading all posts");
      fetchAllPosts();
    }
    
    // Clear search when category changes
    if (category && searchTerm) {
      setSearchTerm("");
      setSearchResults([]);
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
    if (isPostsLoading) {
      return (
        <FadeIn className="px-4">
          <div className="grid gap-6 max-w-3xl mx-auto">
            {Array.from({ length: 6 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        </FadeIn>
      );
    }

    if (isSearching) {
      return (
        <FadeIn className="flex justify-center py-8">
          <div className="flex items-center space-x-3">
            <SpinnerLoader size="medium" color="blue" />
            <div className="text-gray-600">{isSemanticSearch ? "AI Searching..." : "Searching..."}</div>
          </div>
        </FadeIn>
      );
    }

    if (searchTerm && postsToDisplay.length === 0) {
      return (
        <SlideInUp className="flex justify-center py-8">
          <div className="text-gray-600">No posts found for &quot;{searchTerm}&quot;</div>
        </SlideInUp>
      );
    }

    return (
      <StaggeredList className="max-w-6xl mx-auto px-4">
        {currentDisplayPosts.map((post, index) => {
          const truncateContent = (content, maxLength) => {
            const div = document.createElement("div");
            div.innerHTML = content;
            let text = div.textContent || div.innerText || "";
            text = text.trim();
            return text.length > maxLength
              ? `${text.substring(0, maxLength)}...`
              : text;
          };

          // Helper function to capitalize category
          const capitalizeCategory = (category) => {
            return category ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() : '';
          };

          // Helper function to format date properly
          const formatDate = (dateString) => {
            try {
              const date = new Date(dateString);
              if (isNaN(date.getTime())) {
                return 'Recent';
              }
              return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
            } catch (error) {
              return 'Recent';
            }
          };

          const flexDirection = isMediumOrAbove
            ? index % 2 === 0
              ? "row"
              : "row-reverse"
            : "column";
          
          // Determine content alignment based on layout
          const isEvenPost = index % 2 === 0;
          const contentAlignment = isMediumOrAbove 
            ? isEvenPost 
              ? "text-left" // Image left, content right
              : "text-left" // Image right, content left
            : "text-left"; // Mobile left align

          const buttonAlignment = isMediumOrAbove 
            ? isEvenPost 
              ? "justify-start" // Image left, button left
              : "justify-start" // Image right, button left
            : "justify-start"; // Mobile left align

          return (
            <HoverScale
              key={post.post_id}
              className={`flex flex-col md:flex-row bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${
                isMobile ? "flex-col my-4" : "my-6"
              } overflow-hidden border border-gray-100 max-w-4xl mx-auto`}
              style={{ flexDirection: flexDirection }}
            >
              {/* Image Section */}
              <div className={`${isMediumOrAbove ? "flex-shrink-0" : "w-full"} relative`}>
                {post.isExternal || !post.img ? (
                  <div className={`${
                    isMediumOrAbove
                      ? "h-[200px] w-[280px] flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
                      : "h-40 w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
                  } relative overflow-hidden group`}>
                    {/* 3D Background Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 via-transparent to-purple-400/10"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/5 to-purple-400/5 transform rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                    
                    <div className="text-center p-4 relative z-10">
                      <div className="text-2xl mb-2 transform group-hover:scale-110 transition-transform duration-300">🌐</div>
                      <div className="text-sm font-semibold text-gray-700">
                        {post.source === 'stackoverflow' ? 'Stack Overflow' : 
                         post.source === 'wikipedia' ? 'Wikipedia' : 'External Source'}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative group overflow-hidden">
                    {/* 3D Shadow layers */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/15 via-purple-400/15 to-pink-400/15 rounded-lg transform rotate-1 group-hover:rotate-2 transition-all duration-300 opacity-40"></div>
                    
                    {/* Main Image */}
                    <img
                      className={`${
                        isMediumOrAbove
                          ? "h-[200px] w-[280px] object-cover"
                          : "h-40 w-full object-cover"
                      } rounded-md transition-all duration-300 group-hover:scale-105 relative z-10 shadow-md`}
                      src={`${baseURL}/images/${post.img}`}
                      alt={post.title}
                    />
                    
                    {/* 3D Highlight Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md z-20"></div>
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div
                className={`${
                  isMobile
                    ? "px-4 py-4"
                    : "flex flex-col justify-between flex-grow px-6 py-4"
                } ${contentAlignment}`}
              >
                <div>
                  <h2 className={`${
                    isMobile ? "text-lg" : "text-xl"
                  } font-bold mb-2 text-gray-800 leading-tight hover:text-gray-600 transition-colors duration-300 text-left`}>
                    {post.title}
                  </h2>
                  <p className={`${
                    isMobile ? "text-sm" : "text-sm"
                  } text-gray-600 mb-3 leading-relaxed text-left`}>
                    {truncateContent(post.content, isMobile ? 80 : 120)}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 mb-3">
                    <span className="font-medium text-gray-700">{post.user_name}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span>{formatDate(post.date)}</span>
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-xs font-medium">
                      {capitalizeCategory(post.category)}
                    </span>
                  </div>
                </div>
                
                <div className={`flex ${buttonAlignment} mt-2`}>
                  {post.isExternal && post.external_url ? (
                    <a href={post.external_url} target="_blank" rel="noopener noreferrer">
                      <button
                        className={`${
                          isMobile
                            ? "px-4 py-2 text-sm"
                            : "px-5 py-2 text-sm"
                        } bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium flex items-center space-x-1`}
                      >
                        <span>View Source</span>
                        <span>🔗</span>
                      </button>
                    </a>
                  ) : (
                    <Link to={`/post/${post.post_id}`}>
                      <button
                        className={`${
                          isMobile
                            ? "px-4 py-2 text-sm"
                            : "px-5 py-2 text-sm"
                        } bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg font-medium`}
                      >
                        Read More
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </HoverScale>
          );
        })}
      </StaggeredList>
    );
  };

  // Show page loader on initial load
  if (isPageLoading) {
    return <PageLoader message="Loading your feed..." />;
  }

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(postsToDisplay.length / postsPerPage); i++) {
    pageNumbers.push(i);
  }

  const handlePrevClick = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextClick = () => {
    if (currentPage < Math.ceil(postsToDisplay.length / postsPerPage)) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Search Section */}
      <SlideInUp className="p-4 flex flex-col items-center">
        <div className="relative w-[90%] md:w-[60%] max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400 text-sm" />
          </div>
          <input
            type="text"
            placeholder={isSemanticSearch ? "AI Semantic Search..." : "Search posts..."}
            value={searchTerm}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-20 py-3 border rounded-lg shadow-md focus:outline-none transition-all duration-300 bg-white ${
              isSemanticSearch 
                ? 'focus:border-green-500 border-green-300' 
                : 'focus:border-blue-500 border-gray-200'
            } text-sm`}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-1">
            {isSearching && (
              <FaSpinner className="animate-spin text-gray-400 text-sm" />
            )}
            <button
              onClick={() => setIsSemanticSearch(!isSemanticSearch)}
              className={`p-1.5 rounded-md transition-all duration-300 ${
                isSemanticSearch 
                  ? 'text-green-600 hover:text-green-700 bg-green-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              title={isSemanticSearch ? "Switch to Regular Search" : "Switch to AI Semantic Search"}
            >
              <Brain className="w-4 h-4" />
            </button>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors duration-200"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
        {searchTerm && (
          <FadeIn className="mt-3 text-sm text-gray-600 text-center">
            {isSearching 
              ? (isSemanticSearch ? "AI Searching..." : "Searching...") 
              : `Found ${postsToDisplay.length} results ${isSemanticSearch ? '(AI Search)' : ''}`
            }
          </FadeIn>
        )}
      </SlideInUp>
      
      {/* Posts Section */}
      <div className="pb-6">
        {renderPosts()}
      </div>

      {/* Pagination */}
      {postsToDisplay.length > postsPerPage && (
        <FadeIn className="flex justify-center items-center pb-6 space-x-1">
          <button
            onClick={handlePrevClick}
            className={`p-2 rounded-lg focus:outline-none bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 ${
              currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:scale-105"
            }`}
            disabled={currentPage === 1}
          >
            <FaChevronLeft className="w-3 h-3" />
          </button>
          
          {pageNumbers.map((number) => (
            <button
              key={number}
              className={`px-3 py-2 rounded-lg focus:outline-none transition-all duration-300 font-medium text-sm ${
                number === currentPage 
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105" 
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg hover:scale-105"
              }`}
              onClick={() => paginate(number)}
            >
              {number}
            </button>
          ))}
          
          <button
            onClick={handleNextClick}
            className={`p-2 rounded-lg focus:outline-none bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300 ${
              currentPage === Math.ceil(postsToDisplay.length / postsPerPage)
                ? "cursor-not-allowed opacity-50"
                : "hover:scale-105"
            }`}
            disabled={currentPage === Math.ceil(postsToDisplay.length / postsPerPage)}
          >
            <FaChevronRight className="w-3 h-3" />
          </button>
        </FadeIn>
      )}
    </div>
  );
}
