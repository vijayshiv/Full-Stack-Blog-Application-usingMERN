import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import api from "../config/api"; // Adjust path if necessary
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Comments.css";
import { FaEdit, FaTrash, FaSave, FaTimes, FaReply, FaChevronDown, FaChevronUp } from "react-icons/fa";

const Comments = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState("");
  const [userId, setUserId] = useState(null);
  
  // Reply functionality states
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedThreads, setExpandedThreads] = useState({});
  const [editReplyId, setEditReplyId] = useState(null);
  const [editReplyContent, setEditReplyContent] = useState("");

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("id");
    setUserId(storedUserId);
    
    const fetchComments = async () => {
      try {
        const response = await api.get(`/posts/comments/${postId}`);
        if (response.data.status === "success") {
          if (Array.isArray(response.data.data)) {
            // Process the comments to ensure consistent data structure
            const processedComments = response.data.data.map(comment => ({
              ...comment,
              parent_comment_id: comment.parent_comment_id || null,
              user_id: parseInt(comment.user_id) || comment.user_id,
              id: parseInt(comment.id) || comment.id
            }));
            setComments(processedComments);
          } else {
            toast.error("Failed to fetch comments");
          }
        } else {
          toast.error("Failed to fetch comments");
        }
      } catch (error) {
        toast.error("Failed to fetch comments");
      }
    };
    
    fetchComments();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    const storedName = sessionStorage.getItem("name");

    if (!token || !storedName) {
      toast.error("Please login to comment");
      return;
    }

    try {
      const response = await api.post(
        `/posts/comment/${postId}`,
        { content: newComment },
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.data.status === "success") {
        if (response.data.data.comment_id) {
          setComments((prevComments) => [
            ...prevComments,
            {
              comment_id: response.data.data.comment_id,
              content: newComment,
              createdTimestamp: response.data.data.createdTimestamp || new Date().toISOString(),
              fullname: storedName, // Use the actual name
              user_id: userId,
              id: userId, // Add this field to match the condition for edit/delete buttons
              parent_comment_id: null // Explicitly set to null for main comments
            },
          ]);
          setNewComment("");
          toast.success("Comment added successfully!");
        } else {
          toast.error("Invalid response structure");
        }
      } else {
        toast.error("Error adding comment");
      }
    } catch (error) {
      toast.error("Error adding comment");
    }
  };

  const handleEditComment = (commentId, content) => {
    setEditCommentId(commentId);
    setEditCommentContent(content);
  };

  const handleSaveEdit = async (commentId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.put(
        `/posts/comment/${commentId}`,
        { content: editCommentContent },
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.comment_id === commentId
              ? { ...comment, content: editCommentContent }
              : comment
          )
        );
        setEditCommentId(null);
        setEditCommentContent("");
      } else {
        toast.error("Error updating comment");
      }
    } catch (error) {
      toast.error("Error updating comment");
    }
  };

  const handleCancelEdit = () => {
    setEditCommentId(null);
    setEditCommentContent("");
  };

  const handleDeleteComment = async (commentId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.delete(`/posts/comment/${commentId}`, {
        headers: {
          token: token,
        },
      });
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.comment_id !== commentId)
        );
      } else {
        toast.error("Error deleting comment");
      }
    } catch (error) {
      toast.error("Error deleting comment");
    }
  };

  // Reply functionality handlers
  const handleReplySubmit = async (e, parentCommentId) => {
    e.preventDefault();
    const token = sessionStorage.getItem("token");
    const storedUserId = sessionStorage.getItem("id");
    const storedName = sessionStorage.getItem("name");

    if (!token || !storedName) {
      toast.error("Please login to reply");
      return;
    }

    if (!replyContent.trim()) {
      toast.error("Reply cannot be empty");
      return;
    }

    try {
      const response = await api.post(
        `/posts/comment/${postId}`,
        { 
          content: replyContent,
          parentCommentId: parentCommentId 
        },
        {
          headers: {
            token: token,
          },
        }
      );
      
      if (response.data.status === "success") {
        const newReply = {
          comment_id: response.data.data.comment_id,
          content: replyContent,
          createdTimestamp: new Date().toISOString(), // Use current timestamp for proper ordering
          fullname: storedName,
          user_id: parseInt(storedUserId),
          id: parseInt(storedUserId),
          parent_comment_id: parseInt(parentCommentId)
        };

        // Add the new reply and let the groupComments function handle the sorting
        setComments((prevComments) => [...prevComments, newReply]);
        
        setReplyContent("");
        setReplyToCommentId(null);
        
        // Auto-expand the thread to show the new reply
        setExpandedThreads(prev => ({
          ...prev,
          [parentCommentId]: true
        }));
        
        toast.success("Reply added successfully!");
      } else {
        toast.error("Error adding reply");
      }
    } catch (error) {
      toast.error("Error adding reply");
    }
  };

  const handleReplyEdit = async (replyId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.put(
        `/posts/comment/${replyId}`,
        { content: editReplyContent },
        {
          headers: {
            token: token,
          },
        }
      );
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.comment_id === replyId
              ? { ...comment, content: editReplyContent }
              : comment
          )
        );
        setEditReplyId(null);
        setEditReplyContent("");
      } else {
        toast.error("Error updating reply");
      }
    } catch (error) {
      toast.error("Error updating reply");
    }
  };

  const handleReplyDelete = async (replyId) => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      toast.error("User not authenticated");
      return;
    }

    try {
      const response = await api.delete(`/posts/comment/${replyId}`, {
        headers: {
          token: token,
        },
      });
      if (response.data.status === "success") {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.comment_id !== replyId)
        );
      } else {
        toast.error("Error deleting reply");
      }
    } catch (error) {
      toast.error("Error deleting reply");
    }
  };

  const toggleThread = (commentId) => {
    setExpandedThreads(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  };

  const startReply = (commentId) => {
    setReplyToCommentId(commentId);
    setReplyContent("");
  };

  const cancelReply = () => {
    setReplyToCommentId(null);
    setReplyContent("");
  };

  // Helper function to group comments and replies (memoized)
  const { mainComments, repliesMap } = useMemo(() => {
    const mainComments = [];
    const repliesMap = {};
    
    // First pass: separate main comments and build replies map
    comments.forEach(comment => {
      // Check if this is a main comment (no parent)
      const hasParent = comment.parent_comment_id && 
                       comment.parent_comment_id !== null && 
                       comment.parent_comment_id !== 'null' &&
                       comment.parent_comment_id !== undefined &&
                       comment.parent_comment_id !== 0;
      
      if (!hasParent) {
        // This is a main comment
        mainComments.push(comment);
      } else {
        // This is a reply
        const parentId = comment.parent_comment_id.toString();
        if (!repliesMap[parentId]) {
          repliesMap[parentId] = [];
        }
        repliesMap[parentId].push(comment);
      }
    });
    
    // Sort main comments by creation date (newest first for main comments)
    mainComments.sort((a, b) => new Date(b.createdTimestamp) - new Date(a.createdTimestamp));
    
    // Sort replies by creation date (oldest first for replies within each thread)
    Object.keys(repliesMap).forEach(parentId => {
      repliesMap[parentId].sort((a, b) => {
        const dateA = new Date(a.createdTimestamp);
        const dateB = new Date(b.createdTimestamp);
        return dateA - dateB;
      });
    });
    
    return { mainComments, repliesMap };
  }, [comments]);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-white/20 p-2 
                    hover:shadow-lg transition-all duration-500 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-1 mb-2">
        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full 
                        flex items-center justify-center text-white font-bold shadow-lg text-xs">
          💬
        </div>
        <h2 className="text-sm font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
          Comments ({mainComments.length})
        </h2>
      </div>

      {/* Comment Input Form */}
      <form onSubmit={handleCommentSubmit} className="mb-2 animate-slide-up delay-300">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-2 border border-blue-100">
          <div className="flex flex-col sm:flex-row gap-1">
            <div className="flex-1">
              <textarea
                className="w-full px-2 py-1 border border-gray-200 rounded-md resize-none
                           focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100
                           transition-all duration-300 bg-white placeholder-gray-400 text-xs"
                rows="1"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
              />
            </div>
            <button
              type="submit"
              className="px-2 py-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                         rounded-md hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 
                         transition-all duration-300 shadow-md hover:shadow-lg font-medium text-xs
                         self-start sm:self-end"
            >
              Post
            </button>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-2">
        {mainComments.map((comment, index) => {
          const replies = repliesMap[comment.comment_id.toString()] || [];
          const isThreadExpanded = expandedThreads[comment.comment_id];
          
          return (
            <div key={comment.comment_id} 
                 className="animate-slide-up" 
                 style={{ animationDelay: `${(index + 1) * 100}ms` }}>
              {/* Main Comment */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-2 
                              hover:shadow-md transition-all duration-300">
                {editCommentId === comment.comment_id ? (
                  <div className="space-y-1">
                    <textarea
                      className="w-full p-1 border border-gray-200 rounded-md resize-none
                                 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100
                                 transition-all duration-300 text-xs"
                      rows="1"
                      value={editCommentContent}
                      onChange={(e) => setEditCommentContent(e.target.value)}
                    />
                    <div className="flex justify-end space-x-1">
                      <button
                        onClick={() => handleSaveEdit(comment.comment_id)}
                        className="px-1 py-0.5 bg-gradient-to-r from-green-500 to-green-600 text-white 
                                   rounded-md hover:from-green-600 hover:to-green-700 
                                   transform hover:scale-105 transition-all duration-300 
                                   shadow-sm flex items-center space-x-0.5 text-xs"
                      >
                        <FaSave size={8} />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-1 py-0.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white 
                                   rounded-md hover:from-gray-600 hover:to-gray-700 
                                   transform hover:scale-105 transition-all duration-300 
                                   shadow-sm flex items-center space-x-0.5 text-xs"
                      >
                        <FaTimes size={8} />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {/* Comment Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-1">
                        <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full 
                                        flex items-center justify-center text-white font-bold shadow-sm text-xs">
                          {comment.fullname.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-left">
                          <p className="text-gray-800 font-semibold text-xs text-left">{comment.fullname}</p>
                          <p className="text-gray-600 text-xs text-left">
                            {new Date(comment.createdTimestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {parseInt(userId) === parseInt(comment.id) && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditComment(comment.comment_id, comment.content)}
                            className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 
                                       rounded-md transition-all duration-300 transform hover:scale-110"
                            title="Edit comment"
                          >
                            <FaEdit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.comment_id)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 
                                       rounded-md transition-all duration-300 transform hover:scale-110"
                            title="Delete comment"
                          >
                            <FaTrash size={12} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Comment Content - moved to right */}
                    <p className="text-gray-700 leading-relaxed text-xs text-right pr-2">{comment.content}</p>

                    {/* Comment Footer */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startReply(comment.comment_id)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 
                                     px-1 py-0.5 rounded-sm hover:bg-blue-50 transition-all duration-300 
                                     transform hover:scale-105"
                        >
                          <FaReply size={8} />
                          <span className="font-medium text-xs">Reply</span>
                        </button>
                        
                        {replies.length > 0 && (
                          <button
                            onClick={() => toggleThread(comment.comment_id)}
                            className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 
                                       px-1 py-0.5 rounded-sm hover:bg-gray-50 transition-all duration-300 
                                       transform hover:scale-105"
                          >
                            {isThreadExpanded ? (
                              <>
                                <FaChevronUp size={8} />
                                <span className="text-xs">Hide {replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
                              </>
                            ) : (
                              <>
                                <FaChevronDown size={8} />
                                <span className="text-xs">Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                {replyToCommentId === comment.comment_id && (
                  <div className="mt-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg 
                                  border-l-2 border-blue-400 animate-slide-up">
                    <form onSubmit={(e) => handleReplySubmit(e, comment.comment_id)}>
                      <textarea
                        className="w-full px-2 py-1 border border-gray-200 rounded-md resize-none
                                   focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100
                                   transition-all duration-300 bg-white placeholder-gray-400 text-xs"
                        rows="1"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write your reply..."
                      />
                      <div className="flex justify-end mt-1 space-x-1">
                        <button
                          type="button"
                          onClick={cancelReply}
                          className="px-2 py-0.5 bg-gray-500 text-white rounded-md 
                                     hover:bg-gray-600 transform hover:scale-105 
                                     transition-all duration-300 shadow-sm text-xs"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-2 py-0.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                                     rounded-md hover:from-blue-600 hover:to-blue-700 
                                     transform hover:scale-105 transition-all duration-300 shadow-sm text-xs"
                        >
                          Reply
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>

              {/* Replies Thread */}
              {replies.length > 0 && isThreadExpanded && (
                <div className="ml-4 mt-2 space-y-2 animate-slide-up delay-300">
                  <div className="bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-lg p-2 
                                  border-l-2 border-blue-300">
                    {replies.map((reply, replyIndex) => (
                      <div key={reply.comment_id} 
                           className="bg-white rounded-md shadow-sm p-2 mb-2 last:mb-0
                                      hover:shadow-md transition-all duration-300
                                      animate-slide-up"
                           style={{ animationDelay: `${replyIndex * 100}ms` }}>
                        {editReplyId === reply.comment_id ? (
                          <div className="space-y-1">
                            <textarea
                              className="w-full p-1 border border-gray-200 rounded-md resize-none
                                         focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100
                                         transition-all duration-300 text-xs"
                              rows="1"
                              value={editReplyContent}
                              onChange={(e) => setEditReplyContent(e.target.value)}
                            />
                            <div className="flex justify-end space-x-1">
                              <button
                                onClick={() => handleReplyEdit(reply.comment_id)}
                                className="px-1 py-0.5 bg-gradient-to-r from-green-500 to-green-600 text-white 
                                           rounded-md hover:from-green-600 hover:to-green-700 
                                           transform hover:scale-105 transition-all duration-300 
                                           shadow-sm flex items-center space-x-0.5 text-xs"
                              >
                                <FaSave size={8} />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => {
                                  setEditReplyId(null);
                                  setEditReplyContent("");
                                }}
                                className="px-1 py-0.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white 
                                           rounded-md hover:from-gray-600 hover:to-gray-700 
                                           transform hover:scale-105 transition-all duration-300 
                                           shadow-sm flex items-center space-x-0.5 text-xs"
                              >
                                <FaTimes size={8} />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {/* Reply Header */}
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-1">
                                <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full 
                                                flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                  {reply.fullname.charAt(0).toUpperCase()}
                                </div>
                                <div className="text-left">
                                  <p className="font-medium text-gray-800 text-xs text-left">{reply.fullname}</p>
                                  <p className="text-xs text-gray-500 text-left">
                                    {new Date(reply.createdTimestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              
                              {parseInt(userId) === parseInt(reply.id) && (
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditReplyId(reply.comment_id);
                                      setEditReplyContent(reply.content);
                                    }}
                                    className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 
                                               rounded-md transition-all duration-300 transform hover:scale-110"
                                    title="Edit reply"
                                  >
                                    <FaEdit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleReplyDelete(reply.comment_id)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 
                                               rounded-md transition-all duration-300 transform hover:scale-110"
                                    title="Delete reply"
                                  >
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Reply Content - right aligned */}
                            <p className="text-gray-700 text-xs leading-relaxed text-right pr-2">{reply.content}</p>

                            {/* Reply Footer */}
                            <div className="flex justify-start">
                              <button
                                onClick={() => startReply(comment.comment_id)}
                                className="flex items-center space-x-0.5 text-blue-600 hover:text-blue-800 
                                           px-1 py-0.5 rounded-sm hover:bg-blue-50 transition-all duration-300 
                                           transform hover:scale-105"
                              >
                                <FaReply size={8} />
                                <span className="text-xs font-medium">Reply</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {mainComments.length === 0 && (
        <div className="text-center py-6 animate-fade-in">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">No comments yet</h3>
          <p className="text-gray-500 text-xs">Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};

Comments.propTypes = {
  postId: PropTypes.string.isRequired
};

export default Comments;
