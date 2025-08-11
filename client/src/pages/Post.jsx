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

      <div className="container mx-auto mt-16 px-4">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-3/4">
            <h1 className="font-bold text-3xl sm:text-3xl lg:text-5xl text-blue-900 mb-8 leading-tight font-serif">
              &quot;{post.title}&quot;
            </h1>
            <div className="clearfix">
              <img
                className="float-left mr-10 mb-5 max-w-[55%] rounded-md shadow-md object-cover cursor-pointer"
                src={`${baseURL}/images/${post.img}`}
                alt={post.title}
              />
              <div
                className="post-content mt-4"
                style={{
                  textAlign: "justify",
                  fontSize: "1rem",
                }}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(post.content),
                }}
              />
            </div>
            <div className="flex justify-between items-center sm:text-[4px] md:text-lg lg:text-xl mt-16">
              <LikeButton postId={id} />
              <div className="md:text-xl sm:text-xs capitalize text-right">
                <p>
                  <span className="capitalize font-bold md:text-xl ">
                    Category:{" "}
                  </span>
                  {post.category}
                </p>
                <div className="mt-2 flex flex-col items-end">
                  <p className="mb-2">
                    <span className="capitalize font-bold md:text-xl sm:text-sm">
                      Posted by:{" "}
                    </span>
                    {post.user_name}
                  </p>
                  
                  {/* Action Buttons Container */}
                  <div className="flex flex-col sm:flex-row gap-2 items-end">
                    {/* Summarize Button - Available for all users */}
                    <button
                      onClick={() => setIsSummarizationModalOpen(true)}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors duration-200 shadow-md hover:shadow-lg"
                      title="Get AI-powered summary of this post (200 words)"
                    >
                      📝 Summarize Post
                    </button>
                    
                    {/* Meeting Request Button - Only for other users */}
                    {!isOwnPost && currentUserId && (
                      <button
                        onClick={() => setIsMeetingModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm flex items-center transition-colors duration-200 shadow-md hover:shadow-lg"
                        title="Request a video meeting with the author"
                      >
                        <FaVideo className="mr-2" size={14} />
                        Request Meeting
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <Comments postId={id} />
          </div>
          <div className="lg:w-1/4 lg:ml-12 mt-8 lg:mt-0">
            <Suggestions suggestions={suggestions} />
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
