import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaVideo } from "react-icons/fa";
import DOMPurify from "dompurify";
import baseURL from "../config/apiURL";
import api from "../config/api";
import Suggestions from "../components/Suggestions";
import LikeButton from "../components/LikeButton";
import Comments from "../components/Comments";
import MeetingRequestModal from "../components/MeetingRequestModal";
import SummarizationModal from "../components/SummarizationModal";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isSummarizationModalOpen, setIsSummarizationModalOpen] = useState(false);

  const currentUserId = sessionStorage.getItem('id');
  const isOwnPost = post && currentUserId && parseInt(currentUserId) === parseInt(post.user_id);

  const fetchSuggestions = useCallback(async (category, currentPostId) => {
    currentPostId = parseInt(id);
    try {
      const response = await api.get(`/posts/by-category/${category}`);
      if (response.data.status === "success") {
        const filteredSuggestions = response.data.data.filter(
          (item) => item.post_id !== currentPostId
        );
        setSuggestions(shuffleArray(filteredSuggestions).slice(0, 4));
      } else {
        toast.error("Failed to fetch suggestions");
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      toast.error("Failed to fetch suggestions");
    }
  }, [id]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/posts/post/${id}`);
        if (response.data.status === "success") {
          const fetchedPost = response.data.data[0];
          setPost(fetchedPost);
          fetchSuggestions(fetchedPost.category, fetchedPost.post_id);
        } else {
          toast.error("Failed to fetch post");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(error.message);
      }
    };

    fetchPost();
    window.scrollTo(0, 0);
  }, [id, fetchSuggestions]);

  const shuffleArray = (array) => {
    return array.sort(() => Math.random() - 0.5);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 text-center text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-6 text-center">Loading...</div>
    );
  }

  return (
    <>
      <ToastContainer />
      <style>
        {`
          .post-content ul {
            list-style-type: disc;
            padding-left: 40px;
            margin-left: 0;
          }

          .post-content ol {
            list-style-type: none;
            counter-reset: list-counter;
            padding-left: 40px;
            margin-left: 0;
          }

          .post-content ol li {
            counter-increment: list-counter;
            position: relative;
            padding-left: 1.5em;
          }

          .post-content ol li::before {
            content: counter(list-counter) ". ";
            font-weight: bold;
            position: absolute;
            left: 0;
          }

          .post-content h1 {
            font-size: 1.25rem;
            color: #1f1e1e;
            margin-top: 1em;
            margin-bottom: 0.5em;
          }

          .post-content h2 {
            font-size: 1rem;
            color: #1f1e1e;
            margin-top: 0.75em;
            margin-bottom: 0.5em;
          }

          .post-content h3 {
            font-size: 0.875rem;
            color: #1f1e1e;
            margin-top: 0.5em;
            margin-bottom: 0.5em;
          }

          .post-content p {
            margin: 0.5em 0;
            line-height: 1.6;
          }

          .post-content strong, .post-content b {
            font-weight: bold;
          }

          .post-content em, .post-content i {
            font-style: italic;
          }

          .post-content a {
            color: #3182ce;
            text-decoration: underline;
          }

          .post-content a:hover {
            color: #2c5282;
          }

          @media (min-width: 768px) {
            .post-content h1 {
              font-size: 2rem;
            }

            .post-content h2 {
              font-size: 1.6rem;
            }

            .post-content h3 {
              font-size: 1.4rem;
            }
          }

          @media (min-width: 1024px) {
            .post-content h1 {
              font-size: 2.2rem;
            }

            .post-content h2 {
              font-size: 1.9rem;
            }

            .post-content h3 {
              font-size: 1.4rem;
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="container mx-auto px-4 py-4 relative z-10 max-w-4xl">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Main Content */}
            <div className="lg:w-3/4">
              {/* Enhanced Title Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-4 
                              animate-fade-in hover:shadow-xl transition-all duration-500">
                <h1 className="font-bold text-lg sm:text-xl lg:text-3xl 
                               bg-gradient-to-r from-slate-800 via-blue-800 to-purple-900 bg-clip-text text-transparent 
                               mb-3 leading-tight font-serif animate-slide-up">
                  {post.title}
                </h1>
                
                {/* Author and Category Info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center 
                                border-t border-gray-200 pt-3 animate-slide-up delay-300">
                  <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full 
                                    flex items-center justify-center text-white font-bold shadow-lg text-sm">
                      {post.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-gray-800 font-semibold text-sm text-left">
                        {post.user_name.charAt(0).toUpperCase() + post.user_name.slice(1).toLowerCase()}
                      </p>
                      <p className="text-gray-600 text-xs text-left">Author</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500/10 to-purple-600/10 
                                     text-blue-700 rounded-full font-medium capitalize border border-blue-200 text-sm">
                      {post.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Enhanced Content Section */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 
                              overflow-hidden animate-fade-in delay-500 hover:shadow-xl transition-all duration-500">
                
                {/* Content with Image */}
                <div className="p-4">
                  {/* Image floated to the left - full size */}
                  <img
                    className="float-left max-w-xs object-cover rounded-lg mr-4 mb-4 shadow-md 
                               transition-transform duration-500 hover:scale-105"
                    src={`${baseURL}/images/${post.img}`}
                    alt={post.title}
                  />
                  
                  <div
                    className="post-content text-gray-800 leading-relaxed animate-slide-up delay-700"
                    style={{
                      textAlign: "justify",
                      fontSize: "0.9rem",
                      lineHeight: "1.6"
                    }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(post.content),
                    }}
                  />

                  {/* Enhanced Action Buttons */}
                  <div className="clear-both flex flex-col sm:flex-row justify-between items-center mt-4 pt-4 
                                  border-t border-gray-200 animate-slide-up delay-900">
                    <div className="mb-2 sm:mb-0">
                      <LikeButton postId={id} />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      {/* Summarize Button */}
                      <button
                        onClick={() => setIsSummarizationModalOpen(true)}
                        className="group flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 
                                   text-white rounded-lg hover:from-amber-600 hover:to-orange-700 
                                   transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-xs"
                        title="Get AI-powered summary of this post"
                      >
                        <span>📝</span>
                        <span className="font-medium">Summarize</span>
                      </button>
                      
                      {/* Meeting Request Button */}
                      {!isOwnPost && currentUserId && (
                        <button
                          onClick={() => setIsMeetingModalOpen(true)}
                          className="group flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 
                                     text-white rounded-lg hover:from-blue-600 hover:to-blue-700 
                                     transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl text-xs"
                          title="Request a video meeting with the author"
                        >
                          <FaVideo className="group-hover:rotate-12 transition-transform duration-300" size={12} />
                          <span className="font-medium">Meeting</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Comments Section */}
              <div className="mt-4 animate-fade-in delay-1000">
                <Comments postId={id} />
              </div>
            </div>

            {/* Enhanced Sidebar */}
            <div className="lg:w-1/4 animate-fade-in delay-1200">
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 
                              p-3 hover:shadow-xl transition-all duration-500 sticky top-8">
                <Suggestions suggestions={suggestions} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Meeting Request Modal */}
      <MeetingRequestModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        authorName={post?.user_name || ''}
        authorId={post?.user_id || 0}
        postId={id}
        postTitle={post?.title || ''}
      />

      {/* Summarization Modal */}
      <SummarizationModal
        isOpen={isSummarizationModalOpen}
        onClose={() => setIsSummarizationModalOpen(false)}
        content={post?.content || ''}
        postTitle={post?.title || ''}
      />
    </>
  );
};

export default Post;
