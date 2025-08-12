// import { useState, useEffect, useCallback } from "react";
// import axios from "axios";
// import { Link, useLocation } from "react-router-dom";
// import { useMediaQuery } from "react-responsive";
// import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes, FaSpinner } from "react-icons/fa";
// import { Brain } from "lucide-react";
// import baseURL from "../config/apiURL";
// import { aiAPI } from "../config/aiApi";
// import { PageLoader, SpinnerLoader, PostSkeleton } from "../components/Loader";
// import { FadeIn, SlideInUp, StaggeredList, HoverScale } from "../components/Animations";

// export default function Home() {
//   const [posts, setPosts] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchResults, setSearchResults] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [postsPerPage] = useState(6);
//   const [isSemanticSearch, setIsSemanticSearch] = useState(false);
//   const [isPageLoading, setIsPageLoading] = useState(true);
//   const [isPostsLoading, setIsPostsLoading] = useState(false);
//   const location = useLocation();
//   const category = new URLSearchParams(location.search).get("cat");

//   const isMobile = useMediaQuery({ maxWidth: 768 });
//   const isMediumOrAbove = useMediaQuery({ minWidth: 769 });

//   // Search function definition
//   const performSearch = useCallback(async (term) => {
//     try {
//       setIsSearching(true);
//       console.log(`🔍 ${isSemanticSearch ? 'Semantic' : 'Regular'} searching for: "${term}"`);
      
//       if (isSemanticSearch) {
//         // Use AI semantic search
//         const response = await aiAPI.semanticSearch(term, 10);
//         if (response.status === 'success') {
//           // Transform semantic search results to match post structure
//           const transformedResults = response.data.results?.map(result => {
//             // Handle blog posts differently from external sources
//             if (result.source === 'blog') {
//               return {
//                 post_id: result.id,
//                 title: result.title,
//                 content: result.content,
//                 category: result.category,
//                 user_name: result.author,
//                 img: result.image,
//                 date: result.date,
//                 score: result.relevance_score,
//                 source: 'blog',
//                 isExternal: false
//               };
//             } else {
//               // Handle external sources (Wikipedia, Stack Overflow) - these should not be clickable as blog posts
//               return {
//                 post_id: `external-${result.id || Math.random()}`,
//                 title: result.title || 'External Result',
//                 content: `Source: ${result.source}\n${result.content || 'Click the link below to view the full content.'}`,
//                 category: result.tags?.join(', ') || result.topic || result.source,
//                 user_name: result.source === 'stackoverflow' ? 'Stack Overflow' : 'Wikipedia',
//                 img: null,
//                 date: new Date().toISOString(),
//                 score: result.relevance_score,
//                 source: result.source,
//                 external_url: result.url,
//                 isExternal: true
//               };
//             }
//           }) || [];
          
//           console.log("🔍 Transformed semantic search results:", transformedResults);
//           setSearchResults(transformedResults);
//           setPosts([]); // Clear regular posts when showing search results
//         } else {
//           setSearchResults([]);
//         }
//       } else {
//         // Use regular search
//         const url = `${baseURL}/posts/search?q=${encodeURIComponent(term)}`;
//         const res = await axios.get(url);
        
//         console.log("🔍 Search response:", res.data);
        
//         if (res.data.status === "success") {
//           const searchData = res.data.data;
//           setSearchResults(searchData);
//           setPosts([]); // Clear regular posts when showing search results
//         } else {
//           setSearchResults([]);
//         }
//       }
//     } catch (error) {
//       console.error("Error searching posts:", error);
//       setSearchResults([]);
//     } finally {
//       setIsSearching(false);
//     }
//   }, [isSemanticSearch]);

//   const fetchAllPosts = useCallback(async () => {
//     try {
//       setIsPostsLoading(true);
//       const url = `${baseURL}/posts/all`;
//       const res = await axios.get(url);
//       if (res.data.status === "success") {
//         const fetchedPosts = res.data.data;
//         setPosts(shuffleArray(fetchedPosts));
//         setSearchResults([]);
//       }
//     } catch (error) {
//       console.log("Error fetching posts:", error);
//     } finally {
//       setIsPostsLoading(false);
//       setIsPageLoading(false);
//     }
//   }, []);

//   const fetchPostsByCategory = useCallback(async (cat) => {
//     try {
//       setIsPostsLoading(true);
//       const url = `${baseURL}/posts/by-category/${cat}`;
//       const res = await axios.get(url);
//       if (res.data.status === "success") {
//         const fetchedPosts = res.data.data;
//         setPosts(shuffleArray(fetchedPosts));
//         setSearchResults([]);
//       }
//     } catch (error) {
//       console.log("Error fetching posts:", error);
//     } finally {
//       setIsPostsLoading(false);
//       setIsPageLoading(false);
//     }
//   }, []);

//   const shuffleArray = (array) => {
//     let currentIndex = array.length,
//       randomIndex;
//     while (currentIndex !== 0) {
//       randomIndex = Math.floor(Math.random() * currentIndex);
//       currentIndex--;
//       [array[currentIndex], array[randomIndex]] = [
//         array[randomIndex],
//         array[currentIndex],
//       ];
//     }
//     return array;
//   };

//   // Debounced search function
//   useEffect(() => {
//     if (!searchTerm.trim()) {
//       return;
//     }

//     const searchTimeout = setTimeout(() => {
//       console.log("🔍 Triggering search for:", searchTerm);
//       performSearch(searchTerm);
//     }, 500);

//     return () => clearTimeout(searchTimeout);
//   }, [searchTerm, performSearch]);

//   useEffect(() => {
//     if (!searchTerm && category) {
//       fetchPostsByCategory(category);
//     } else if (!searchTerm && !category) {
//       fetchAllPosts();
//     }
//   }, [category, searchTerm, fetchAllPosts, fetchPostsByCategory]);

//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchTerm(value);
//     setCurrentPage(1); // Reset to page 1 on new search
//   };

//   const clearSearch = () => {
//     setSearchTerm("");
//     setSearchResults([]);
//     setCurrentPage(1);
//     fetchAllPosts();
//   };

//   // Determine which posts to display
//   const postsToDisplay = searchTerm.trim() ? searchResults : posts;

//   const indexOfLastPost = currentPage * postsPerPage;
//   const indexOfFirstPost = indexOfLastPost - postsPerPage;
//   const currentDisplayPosts = postsToDisplay.slice(indexOfFirstPost, indexOfLastPost);

//   const paginate = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     window.scrollTo(0, 0);
//   };

//   const renderPosts = () => {
//     if (isPostsLoading) {
//       return (
//         <FadeIn className="px-4">
//           <div className="grid gap-6 max-w-7xl mx-auto">
//             {Array.from({ length: 6 }).map((_, index) => (
//               <PostSkeleton key={index} />
//             ))}
//           </div>
//         </FadeIn>
//       );
//     }

//     if (isSearching) {
//       return (
//         <FadeIn className="flex justify-center py-8">
//           <div className="flex items-center space-x-3">
//             <SpinnerLoader size="medium" color="blue" />
//             <div className="text-gray-600">{isSemanticSearch ? "AI Searching..." : "Searching..."}</div>
//           </div>
//         </FadeIn>
//       );
//     }

//     if (searchTerm && postsToDisplay.length === 0) {
//       return (
//         <SlideInUp className="flex justify-center py-8">
//           <div className="text-gray-600">No posts found for &quot;{searchTerm}&quot;</div>
//         </SlideInUp>
//       );
//     }

//     return (
//       <StaggeredList className="max-w-7xl mx-auto px-4">
//         {currentDisplayPosts.map((post, index) => {
//           const truncateContent = (content, maxLength) => {
//             const div = document.createElement("div");
//             div.innerHTML = content;
//             let text = div.textContent || div.innerText || "";
//             text = text.trim();
//             return text.length > maxLength
//               ? `${text.substring(0, maxLength)}...`
//               : text;
//           };

//           const flexDirection = isMediumOrAbove
//             ? index % 2 === 0
//               ? "row"
//               : "row-reverse"
//             : "column";
          
//           // Determine button alignment based on layout
//           const isEvenPost = index % 2 === 0;
//           const buttonAlignment = isMediumOrAbove 
//             ? isEvenPost 
//               ? "justify-end" // Image left, button right
//               : "justify-start" // Image right, button left
//             : "justify-center"; // Mobile center

//           return (
//             <HoverScale
//               key={post.post_id}
//               className={`flex flex-col md:flex-row text-xl font-sans bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 ${
//                 isMobile ? "flex-col my-8" : "my-8"
//               } overflow-hidden border border-gray-100`}
//               style={{ flexDirection: flexDirection }}
//             >
//               {/* Image Section with 3D Effects */}
//               <div className={`${isMediumOrAbove ? "flex-shrink-0" : "w-full"} relative`}>
//                 {post.isExternal || !post.img ? (
//                   <div className={`${
//                     isMediumOrAbove
//                       ? "h-[350px] w-[350px] flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
//                       : "h-48 w-full flex items-center justify-center bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300"
//                   } relative overflow-hidden group`}>
//                     {/* 3D Background Effect */}
//                     <div className="absolute inset-0 bg-gradient-to-tr from-blue-400/10 via-transparent to-purple-400/10"></div>
//                     <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/5 to-purple-400/5 transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
                    
//                     <div className="text-center p-6 relative z-10">
//                       <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">🌐</div>
//                       <div className="text-lg font-semibold text-gray-700">
//                         {post.source === 'stackoverflow' ? 'Stack Overflow' : 
//                          post.source === 'wikipedia' ? 'Wikipedia' : 'External Source'}
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="relative group overflow-hidden">
//                     {/* 3D Shadow layers */}
//                     <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-all duration-500 opacity-60"></div>
//                     <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/15 via-purple-500/15 to-pink-500/15 rounded-xl transform rotate-1 group-hover:rotate-2 transition-all duration-500"></div>
                    
//                     {/* Main Image */}
//                     <img
//                       className={`${
//                         isMediumOrAbove
//                           ? "h-[350px] w-[350px] object-cover"
//                           : "h-48 w-full object-cover"
//                       } rounded-lg transition-all duration-500 group-hover:scale-105 relative z-10 shadow-lg`}
//                       src={`${baseURL}/images/${post.img}`}
//                       alt={post.title}
//                     />
                    
//                     {/* 3D Highlight Effect */}
//                     <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg z-20"></div>
//                   </div>
//                 )}
//               </div>

//               {/* Content Section */}
//               <div
//                 className={`${
//                   isMobile
//                     ? "text-center px-6 py-6"
//                     : "flex flex-col justify-between flex-grow px-8 py-6"
//                 } ${
//                   isMobile
//                     ? "text-sm"
//                     : "text-lg"
//                 }`}
//               >
//                 <div>
//                   <h2 className={`${
//                     isMobile ? "text-xl" : "text-3xl"
//                   } font-bold mb-4 text-gray-800 leading-tight hover:text-gray-600 transition-colors duration-300`}>
//                     {post.title}
//                   </h2>
//                   <p className={`${
//                     isMobile ? "text-sm" : "text-base"
//                   } text-gray-600 mb-6 leading-relaxed`}>
//                     {truncateContent(post.content, isMobile ? 100 : 180)}
//                   </p>
//                   <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
//                     <span className="font-medium text-gray-700">{post.user_name}</span>
//                     <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
//                     <span>{new Date(post.date).toLocaleDateString()}</span>
//                     <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
//                     <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-xs font-medium">
//                       {post.category}
//                     </span>
//                   </div>
//                 </div>
                
//                 <div className={`flex ${buttonAlignment}`}>
//                   {post.isExternal && post.external_url ? (
//                     <a href={post.external_url} target="_blank" rel="noopener noreferrer">
//                       <button
//                         className={`${
//                           isMobile
//                             ? "px-5 py-3 text-sm"
//                             : "px-8 py-4 text-base"
//                         } bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl font-medium flex items-center space-x-2`}
//                       >
//                         <span>View Source</span>
//                         <span>🔗</span>
//                       </button>
//                     </a>
//                   ) : (
//                     <Link to={`/post/${post.post_id}`}>
//                       <button
//                         className={`${
//                           isMobile
//                             ? "px-5 py-3 text-sm"
//                             : "px-8 py-4 text-base"
//                         } bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white rounded-xl hover:from-gray-900 hover:via-black hover:to-gray-800 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg hover:shadow-xl font-medium`}
//                       >
//                         Read More
//                       </button>
//                     </Link>
//                   )}
//                 </div>
//               </div>
//             </HoverScale>
//           );
//         })}
//       </StaggeredList>
//     );
//   };

//   // Show page loader on initial load
//   if (isPageLoading) {
//     return <PageLoader message="Loading your feed..." />;
//   }

//   const pageNumbers = [];
//   for (let i = 1; i <= Math.ceil(postsToDisplay.length / postsPerPage); i++) {
//     pageNumbers.push(i);
//   }

//   const handlePrevClick = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handleNextClick = () => {
//     if (currentPage < Math.ceil(postsToDisplay.length / postsPerPage)) {
//       setCurrentPage(currentPage + 1);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   return (
//     <FadeIn className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
//       {/* Search Section */}
//       <SlideInUp className="p-6 flex flex-col items-center">
//         <div className="relative w-[95%] md:w-1/2 max-w-lg">
//           <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
//             <FaSearch className="text-gray-400" />
//           </div>
//           <input
//             type="text"
//             placeholder={isSemanticSearch ? "AI Semantic Search..." : "Search by title, category, or content..."}
//             value={searchTerm}
//             onChange={handleSearchChange}
//             className={`w-full pl-12 pr-24 py-4 border-2 rounded-xl shadow-lg focus:outline-none transition-all duration-300 bg-white ${
//               isSemanticSearch 
//                 ? 'focus:border-green-500 border-green-300 focus:shadow-green-200' 
//                 : 'focus:border-blue-500 border-gray-200 focus:shadow-blue-200'
//             } focus:shadow-xl text-lg`}
//           />
//           <div className="absolute inset-y-0 right-0 flex items-center pr-4 space-x-2">
//             {isSearching && (
//               <FaSpinner className="animate-spin text-gray-400" />
//             )}
//             <button
//               onClick={() => setIsSemanticSearch(!isSemanticSearch)}
//               className={`p-2 rounded-lg transition-all duration-300 ${
//                 isSemanticSearch 
//                   ? 'text-green-600 hover:text-green-700 bg-green-50 shadow-md' 
//                   : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
//               }`}
//               title={isSemanticSearch ? "Switch to Regular Search" : "Switch to AI Semantic Search"}
//             >
//               <Brain className="w-5 h-5" />
//             </button>
//             {searchTerm && (
//               <button
//                 onClick={clearSearch}
//                 className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded transition-colors duration-200"
//               >
//                 <FaTimes />
//               </button>
//             )}
//           </div>
//         </div>
//         {searchTerm && (
//           <FadeIn className="mt-4 text-base text-gray-600 text-center">
//             {isSearching 
//               ? (isSemanticSearch ? "AI Searching..." : "Searching...") 
//               : `Found ${postsToDisplay.length} results ${isSemanticSearch ? '(AI Search)' : ''}`
//             }
//           </FadeIn>
//         )}
//       </SlideInUp>
      
//       {/* Posts Section */}
//       <div className="pb-8">
//         {renderPosts()}
//       </div>

//       {/* Pagination */}
//       {postsToDisplay.length > postsPerPage && (
//         <FadeIn className="flex justify-center items-center pb-8 space-x-2">
//           <button
//             onClick={handlePrevClick}
//             className={`p-3 rounded-xl focus:outline-none bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 ${
//               currentPage === 1 ? "cursor-not-allowed opacity-50" : "hover:scale-105"
//             }`}
//             disabled={currentPage === 1}
//           >
//             <FaChevronLeft className="w-4 h-4" />
//           </button>
          
//           {pageNumbers.map((number) => (
//             <button
//               key={number}
//               className={`px-4 py-3 rounded-xl focus:outline-none transition-all duration-300 font-medium ${
//                 number === currentPage 
//                   ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105" 
//                   : "bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl hover:scale-105"
//               }`}
//               onClick={() => paginate(number)}
//             >
//               {number}
//             </button>
//           ))}
          
//           <button
//             onClick={handleNextClick}
//             className={`p-3 rounded-xl focus:outline-none bg-white text-gray-700 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all duration-300 ${
//               currentPage === Math.ceil(postsToDisplay.length / postsPerPage)
//                 ? "cursor-not-allowed opacity-50"
//                 : "hover:scale-105"
//             }`}
//             disabled={currentPage === Math.ceil(postsToDisplay.length / postsPerPage)}
//           >
//             <FaChevronRight className="w-4 h-4" />
//           </button>
//         </FadeIn>
//       )}
//     </FadeIn>
//   );
// }
